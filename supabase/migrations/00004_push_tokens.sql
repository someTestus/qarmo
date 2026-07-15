-- 00004_push_tokens.sql
-- Create push_tokens table

create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  expo_token text not null,
  platform text not null check (platform in ('ios', 'android')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_user_expo_token unique (user_id, expo_token)
);

-- Enable RLS
alter table public.push_tokens enable row level security;

-- Create RLS Policies
create policy "Users can manage their own push tokens"
  on public.push_tokens
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create automatic update trigger for updated_at
create or replace function public.handle_update_timestamp()
returns trigger
security definer
set search_path = public
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_push_token_updated
  before update on public.push_tokens
  for each row execute procedure public.handle_update_timestamp();
