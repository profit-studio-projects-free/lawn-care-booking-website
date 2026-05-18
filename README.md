# Verdant — Premium Lawn Care Booking Platform

Production-ready booking website + admin dashboard for a premium lawn care service. Built with React, TypeScript, Vite, Tailwind CSS, and Supabase.

## Stack
- React 18 + TypeScript + Vite
- Tailwind CSS (custom premium lawn-care design system)
- Supabase (Auth + database)
- date-fns, lucide-react

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Supabase in `.env` (already scaffolded):
   ```
   VITE_SUPABASE_URL=PASTE_YOUR_SUPABASE_URL_HERE
   VITE_SUPABASE_ANON_KEY=PASTE_YOUR_PUBLISHABLE_KEY_HERE
   ```

3. Make sure your Supabase project has these tables: `services`, `appointments`, `business_hours`, `blocked_dates`, `business_settings`, `admin_users`.

4. Run the dev server:
   ```bash
   npm run dev
   ```

## Routes
- `#/` – Public lawn care website (services, booking, etc.)
- `#/admin` – Service team admin dashboard (Supabase Auth required + `admin_users.user_id` row)

## Admin access

Admin access is granted only when the authenticated `auth.user.id` exists as a row in `admin_users.user_id`. Email is **never** used to authorize.

## Where things live

- `src/lib/supabase.ts` – Supabase client (env-driven)
- `src/utils/availability.ts` – Slot generation (hours, duration, interval, notice, blocks, overlap)
- `src/utils/serviceImages.ts` – Replaceable image URL map
- `src/components/public/*` – Public site (Navbar, Hero, Services, About, Booking, Footer)
- `src/components/admin/*` – Admin dashboard (Auth, Sidebar, pages)
