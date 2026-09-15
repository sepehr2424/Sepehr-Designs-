-- Premium property viewing booking platform schema
-- Run this in the Supabase SQL editor for a fresh project.

create extension if not exists "pgcrypto";

-- =========================================================
-- Tables
-- =========================================================

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_minutes integer not null default 30,
  price numeric(10, 2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  service_id uuid not null references services(id),
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists business_hours (
  id uuid primary key default gen_random_uuid(),
  weekday integer not null unique check (weekday between 0 and 6),
  is_open boolean not null default true,
  start_time time not null default '09:00',
  end_time time not null default '17:00'
);

create table if not exists blocked_dates (
  id uuid primary key default gen_random_uuid(),
  blocked_date date not null unique,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists business_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null default 'Meridian Property Group',
  business_email text not null default 'viewings@meridianproperty.com',
  business_phone text not null default '+1 (555) 010-2200',
  business_address text not null default '400 Harbor View Avenue, Suite 12, Riverside District',
  slot_interval_minutes integer not null default 30,
  booking_notice_hours integer not null default 4,
  created_at timestamptz not null default now()
);

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists appointments_date_idx on appointments (appointment_date);
create index if not exists appointments_service_idx on appointments (service_id);

-- =========================================================
-- Row Level Security
-- =========================================================

alter table services enable row level security;
alter table appointments enable row level security;
alter table business_hours enable row level security;
alter table blocked_dates enable row level security;
alter table business_settings enable row level security;
alter table admin_users enable row level security;

-- Helper: is the current auth user an admin?
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from admin_users where user_id = auth.uid()
  );
$$;

-- services: public can read active services, admins can read/write everything
create policy "public read active services" on services
  for select using (is_active = true or is_admin());

create policy "admins manage services" on services
  for insert with check (is_admin());
create policy "admins update services" on services
  for update using (is_admin());
create policy "admins delete services" on services
  for delete using (is_admin());

-- appointments: public can INSERT only (no public select). Admins can read/update.
-- NOTE: there is deliberately no public SELECT policy on appointments — PII
-- (name/email/phone/notes) must never be readable by anon. Availability for
-- the public booking flow is served instead by the get_booked_intervals()
-- function below, which is SECURITY DEFINER and returns only start/end times.
create policy "public can create appointments" on appointments
  for insert with check (true);

create policy "admins read appointments" on appointments
  for select using (is_admin());
create policy "admins update appointments" on appointments
  for update using (is_admin());
create policy "admins delete appointments" on appointments
  for delete using (is_admin());

-- business_hours: public read (needed for availability calc), admin write
create policy "public read business hours" on business_hours
  for select using (true);
create policy "admins write business hours" on business_hours
  for insert with check (is_admin());
create policy "admins update business hours" on business_hours
  for update using (is_admin());
create policy "admins delete business hours" on business_hours
  for delete using (is_admin());

-- blocked_dates: public read (needed for availability calc), admin write
create policy "public read blocked dates" on blocked_dates
  for select using (true);
create policy "admins write blocked dates" on blocked_dates
  for insert with check (is_admin());
create policy "admins update blocked dates" on blocked_dates
  for update using (is_admin());
create policy "admins delete blocked dates" on blocked_dates
  for delete using (is_admin());

-- business_settings: public read (needed for site + booking rules), admin write
create policy "public read business settings" on business_settings
  for select using (true);
create policy "admins write business settings" on business_settings
  for insert with check (is_admin());
create policy "admins update business settings" on business_settings
  for update using (is_admin());

-- admin_users: only admins may read the admin list; no public access.
create policy "admins read admin_users" on admin_users
  for select using (is_admin());

-- =========================================================
-- Public availability RPC
-- =========================================================
-- Returns only the time ranges already booked on a given date (no PII),
-- so the public booking flow can skip overlapping slots without ever
-- reading appointments directly.

create or replace function get_booked_intervals(p_date date)
returns table (start_time time, end_time time)
language sql
security definer
set search_path = public
stable
as $$
  select start_time, end_time
  from appointments
  where appointment_date = p_date
    and status <> 'cancelled';
$$;

grant execute on function is_admin() to anon, authenticated;
grant execute on function get_booked_intervals(date) to anon, authenticated;

-- =========================================================
-- Seed data
-- =========================================================

insert into business_settings (business_name, business_email, business_phone, business_address, slot_interval_minutes, booking_notice_hours)
values ('Meridian Property Group', 'viewings@meridianproperty.com', '+1 (555) 010-2200', '400 Harbor View Avenue, Suite 12, Riverside District', 30, 4)
on conflict do nothing;

insert into business_hours (weekday, is_open, start_time, end_time) values
  (0, false, '09:00', '17:00'),
  (1, true, '09:00', '18:00'),
  (2, true, '09:00', '18:00'),
  (3, true, '09:00', '18:00'),
  (4, true, '09:00', '18:00'),
  (5, true, '09:00', '19:00'),
  (6, true, '10:00', '16:00')
on conflict (weekday) do nothing;

insert into services (name, description, duration_minutes, price, is_active) values
  ('Apartment Viewing', 'A guided walkthrough of a listed apartment with a member of our viewing team, covering layout, amenities, and building details.', 30, 0, true),
  ('House Viewing', 'An in-person tour of a listed house, including interior rooms, outdoor space, and neighborhood context.', 45, 0, true),
  ('Luxury Property Viewing', 'An extended private viewing for premium listings, with dedicated time to explore finishes, staging, and standout features.', 60, 75, true),
  ('Rental Property Viewing', 'A straightforward viewing appointment for renters evaluating a listed rental unit.', 30, 0, true),
  ('Investment Property Viewing', 'A viewing tailored for investment buyers, including a walkthrough plus a short consultation on property condition and layout.', 45, 50, true),
  ('Virtual Property Tour', 'A live, guided virtual tour of a property conducted over video call with one of our coordinators.', 30, 0, true)
on conflict do nothing;
