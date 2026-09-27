# NRTF 3.0 conference website

Website for National Re-Tech Fusion 3.0, the IEEE PES × PELS student congress held 1–3 May 2026 in Sousse, Tunisia. The public site now serves as an archive of the program, organizers, and partners. Registration is closed; `POST /api/register` returns HTTP 410.

[View the website](https://nrtf-three.vercel.app/)

## Engineering work

- Built the public event experience with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.
- Implemented multi-step registration with server-side validation, duplicate prevention, rate limiting, transactional email, Supabase storage, and a Google Sheets backup during the event.
- Built protected organizer and attendee flows, including room matching with relational tables and Row-Level Security policies.
- Used versioned Supabase SQL migrations and deployed the site on Vercel.

The registration form has been removed from the public site. Its historical code remains available in Git history for reference, but the current registration endpoint does not accept submissions.

## Run locally

```bash
npm ci
npm run dev
```

The archive homepage can be viewed without private credentials. Organizer and attendee features require the Supabase and email settings used for the event. Keep real credentials in `.env.local` or your deployment platform, never in Git. See `.env.example` for placeholder configuration.

## Project structure

- `app/` — pages, API routes, organizer and attendee flows
- `components/` — sections, layout, and interface components
- `lib/` — Supabase and email helpers
- `supabase/migrations/` — database schema changes and policies
- `public/` — event graphics and other assets
