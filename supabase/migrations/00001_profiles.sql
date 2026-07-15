-- 00001_profiles.sql
-- Create profiles table linked to auth.users

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  phone text not null unique,
  full_name text,
  photo_url text,
  roles text[] not null default '{}',
  city text,
  referral_code text unique,
  profile_completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create RLS Policies
create policy "Users can select their own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Create a trigger function to auto-create a profile on user sign up
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql as $$
begin
  insert into public.profiles (id, phone, roles)
  values (
    new.id,
    coalesce(new.phone, ''),
    array[]::text[]
  );
  return new;
end;
$$;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
