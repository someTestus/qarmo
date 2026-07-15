-- 00005_complete_profile_rpc.sql
-- Create database function for atomic profile completion

create or replace function public.complete_profile(user_id uuid)
returns jsonb
security definer
set search_path = public
language plpgsql as $$
declare
  ref_code text;
  code_ok boolean := false;
  already_completed timestamptz;
  existing_code text;
  referred_row record;
begin
  -- 1. Check if already completed (idempotency check)
  select profile_completed_at, referral_code 
  into already_completed, existing_code
  from public.profiles 
  where id = user_id;
  
  if already_completed is not null then
    return jsonb_build_object('success', true, 'referral_code', existing_code);
  end if;

  -- 2. Generate unique 6-char referral code (uppercase letters+digits, exclude 0/O/1/I)
  -- Safe chars: A-Z, 2-9 except O, I, 0, 1 -> ABCDEFGHJKLMNPQRSTUVWXYZ23456789 (32 chars)
  while not code_ok loop
    ref_code := '';
    for i in 1..6 loop
      ref_code := ref_code || substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', floor(random() * 32 + 1)::int, 1);
    end loop;
    
    -- Check uniqueness in profiles table
    select not exists(select 1 from public.profiles where referral_code = ref_code) into code_ok;
  end loop;

  -- 3. Set profile_completed_at = now(), referral_code = generated code
  update public.profiles
  set 
    profile_completed_at = now(),
    referral_code = ref_code
  where id = user_id;

  -- 4. Look up pending referral where referred_id = user_id
  select * into referred_row 
  from public.referrals 
  where referred_id = user_id and status = 'pending'
  for update; -- Lock the row to prevent race conditions

  if referred_row.id is not null then
    -- Check if referrer profile exists
    if exists (select 1 from public.profiles where id = referred_row.referrer_id) then
      -- Update referral status='awarded', points_awarded=50, awarded_at=now()
      update public.referrals
      set 
        status = 'awarded',
        points_awarded = 50,
        awarded_at = now()
      where id = referred_row.id;
    end if;
  end if;

  -- 5. Return success and code
  return jsonb_build_object('success', true, 'referral_code', ref_code);
end;
$$;
