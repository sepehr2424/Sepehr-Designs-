# Meridian Property Group — Property Viewing Booking Platform

A premium property viewing booking website with a real booking system and a
secure admin dashboard, built with React, TypeScript, Vite, and Supabase.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- Supabase (Postgres, Auth, Row Level Security)
- react-router-dom

## Getting started

### 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then open the SQL
editor and run the migration in [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql).
It creates every table (`services`, `appointments`, `business_hours`,
`blocked_dates`, `business_settings`, `admin_users`), sets up Row Level
Security policies, adds the `get_booked_intervals()` availability function,
and seeds starter services/hours/settings.

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your project's credentials
(Project Settings → API):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Create your admin user

1. In the Supabase dashboard, go to **Authentication → Users** and create a
   user with an email/password (this is who signs in to `/admin`).
2. In the **Table Editor**, open `admin_users` and insert a row with
   `user_id` set to that user's UUID (shown in the Authentication users
   list). This is what grants dashboard access — access is controlled
   entirely by `admin_users.user_id`, never by email.

### 4. Install and run

```bash
npm install
npm run dev
```

- Public site: `http://localhost:5173/`
- Admin dashboard: `http://localhost:5173/admin`

## How booking availability works

Available time slots are computed client-side from `business_hours`,
`services.duration_minutes`, `business_settings.slot_interval_minutes`,
`business_settings.booking_notice_hours`, and `blocked_dates` — see
[`src/lib/availability.ts`](./src/lib/availability.ts).

Because the public `anon` role has no SELECT policy on `appointments` (to
protect client names, emails, and phone numbers), already-booked times are
checked via a `SECURITY DEFINER` Postgres function, `get_booked_intervals(date)`,
which returns only start/end times for a given day — no personal data. The
public booking form itself only ever `INSERT`s into `appointments`; it never
reads appointments back, and the success screen is rendered from the data
already in the form.

## Admin access model

- Admin auth uses Supabase Auth (`supabase.auth.signInWithPassword`).
- After sign-in, the app checks whether `auth.uid()` exists in
  `admin_users.user_id` (via `maybeSingle()`), never by email.
- Sessions persist normally through Supabase's client-side session storage;
  the app never manually clears sessions or signs users out other than via
  the explicit "Sign out" button.

## Project structure

```
src/
  components/
    ui/         shared design-system primitives (Button, Modal, Field, ...)
    public/     marketing site sections (Navbar, Hero, Services, About, Footer)
    booking/    the 4-step booking flow + availability calendar
    admin/      shared admin UI (PageHeader, StatCard, Card, ...)
  pages/
    admin/      admin dashboard pages + auth gate
    PublicHome.tsx
  hooks/        Supabase data-fetching hooks (public + admin)
  lib/          supabase client, database types, availability engine, images
  context/      AdminAuthProvider
supabase/
  migrations/0001_init.sql   full schema, RLS policies, seed data
```
