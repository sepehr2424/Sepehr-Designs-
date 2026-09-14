# Booking system — setup steps

This site now includes a real backend for the booking section
(`functions/api/availability.js`, `functions/api/book.js`). None of it will
work until you complete the steps below in your own accounts — I don't have
access to create these for you, and no keys are stored anywhere in this repo.

## 1. Supabase (database)

1. Create a project at supabase.com (free tier is enough for this volume).
2. Open the SQL editor and run:

```sql
create table bookings (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  start_time time not null,
  name text not null,
  email text not null,
  message text,
  created_at timestamptz not null default now(),
  unique (date, start_time)
);

alter table bookings enable row level security;
-- No policies are created on purpose: with RLS on and zero policies, the
-- public/anon key cannot read or write this table at all. Only the
-- service_role key (used exclusively inside the Cloudflare Function,
-- never sent to the browser) can touch it.
```

3. From Project Settings → API, copy:
   - **Project URL** → this is `SUPABASE_URL`
   - **service_role key** (NOT the anon/public key) → this is `SUPABASE_SERVICE_ROLE_KEY`

## 2. Resend (email notifications)

1. Create an account at resend.com using **sepehrrajaiyan@gmail.com**.
2. From the dashboard, create an API key → this is `RESEND_API_KEY`.
3. Important limitation: without verifying your own sending domain in Resend,
   the shared `onboarding@resend.dev` sender can only deliver to the email
   address your Resend account itself is registered with. Since bookings are
   configured to notify sepehrrajaiyan@gmail.com — the same address — this
   works out of the box. If you later want notifications sent to a different
   inbox, or a custom "from" address, you'll need to verify a domain in
   Resend first (Resend walks you through adding a couple of DNS records).

## 3. Cloudflare Pages (hosting + the backend functions)

1. Push this repo to GitHub (if not already).
2. In the Cloudflare dashboard: Workers & Pages → Create → Pages → Connect to
   Git → select this repo.
3. Build settings: no build command needed, output directory `/` (the repo
   root — `index.html` lives there and `functions/` is auto-detected).
4. Deploy. Cloudflare will serve the static site AND automatically turn
   `functions/api/availability.js` and `functions/api/book.js` into
   `/api/availability` and `/api/book` routes.
5. Add the three secrets so the Functions can reach Supabase and Resend,
   without ever putting them in code:

   ```
   npx wrangler pages secret put SUPABASE_URL --project-name <your-project-name>
   npx wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY --project-name <your-project-name>
   npx wrangler pages secret put RESEND_API_KEY --project-name <your-project-name>
   ```

   (Each command will prompt you to paste the value — nothing is typed on
   the command line itself, and none of it touches this repo.) You can also
   set these from the dashboard: your Pages project → Settings →
   Environment variables → add as "Secret" for the Production environment.
6. Redeploy once the secrets are set (Cloudflare picks them up on the next
   deployment).

## What's already handled in code

- Availability is computed live from Supabase (`functions/api/availability.js`) —
  every day, 12:00–18:00 Europe/Stockholm, 60-minute slots, already-booked and
  already-past times excluded.
- Double-booking is blocked at the database level: the `UNIQUE(date, start_time)`
  constraint means a second, simultaneous booking attempt for the same slot
  gets rejected by Postgres itself (surfaced to the visitor as "that time was
  just booked by someone else").
- On a successful booking, you get an email via Resend with the customer's
  name, email, date, time, and any message they left.
- Nothing sensitive is in frontend code — `script.js` only ever calls your
  own `/api/...` routes; the Supabase and Resend keys exist solely inside the
  Cloudflare Functions, read from the environment.

## Testing before you rely on it

Once deployed, open the live site, go to the booking section, pick a date/time,
and submit a real booking with your own email to confirm: the slot disappears
from availability afterward, and you receive the notification email.
