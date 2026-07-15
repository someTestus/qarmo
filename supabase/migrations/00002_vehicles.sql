-- 00002_vehicles.sql
-- Create vehicles table linked to profiles

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('auto_driver', 'delivery_executive')),
  vehicle_type text not null check (vehicle_type in ('auto', 'bike', 'scooter', 'bicycle')),
  registration_number text,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.vehicles enable row level security;

-- Create RLS Policies
create policy "Owners can select their own vehicles"
  on public.vehicles
  for select
  using (auth.uid() = owner_id);

create policy "Owners can insert their own vehicles"
  on public.vehicles
  for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update their own vehicles"
  on public.vehicles
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owners can delete their own vehicles"
  on public.vehicles
  for delete
  using (auth.uid() = owner_id);
