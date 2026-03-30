# Room Matching System — Design Spec

**Date:** 2026-03-31
**Branch:** `feature/room-matching`
**Status:** Approved

---

## Overview

A hotel room matching portal for NRTF 3.0 attendees, built inside the existing Next.js website. Attendees browse other participants and send roommate requests. Accepted requests form a room group (2–3 people). Admins manage attendee accounts and assign hotel room numbers.

---

## Stack

- **Framework:** Next.js 14 (App Router), TypeScript — existing
- **Auth + DB:** Supabase (Postgres + Supabase Auth)
- **Existing backend:** Google Sheets (registration data — unchanged)
- **Deployment:** Separate git branch `feature/room-matching`, not merged to main until ready

---

## Data Model

### `profiles`
Linked 1:1 to Supabase auth users. Populated when admin imports attendees from Google Sheet.

| Column | Type | Notes |
|---|---|---|
| id | uuid | = auth.users.id |
| full_name | text | from registration |
| email | text | unique, from registration |
| university | text | from registration |
| bio | text | nullable, attendee writes this |
| is_looking | boolean | default true — visible in browse list |
| created_at | timestamptz | |

### `room_requests`
Tracks all roommate requests between attendees.

| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| from_id | uuid | FK → profiles.id |
| to_id | uuid | FK → profiles.id |
| status | enum | pending / accepted / declined |
| created_at | timestamptz | |

### `rooms`
Created when a request is accepted.

| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| room_number | text | nullable — admin assigns later |
| capacity | int | 2 or 3 |
| created_at | timestamptz | |

### `room_members`
Join table linking profiles to rooms.

| Column | Type | Notes |
|---|---|---|
| room_id | uuid | FK → rooms.id |
| profile_id | uuid | FK → profiles.id |
| joined_at | timestamptz | |

---

## Room Matching Logic

- When attendee A accepts a request from B → a `rooms` row is created (capacity = 2 initially), both added to `room_members`.
- A matched attendee can still receive one more request if their room has capacity < 3.
- Once capacity is reached, the attendee is removed from the browse list.
- A room's capacity can be upgraded to 3 by the admin.

---

## Routes

### Attendee Portal (`/portal`)

| Route | Description |
|---|---|
| `/portal/login` | Email + password login |
| `/portal` | Dashboard: match status, roommate info, room number (if assigned) |
| `/portal/browse` | Browse attendees who are looking — send requests |
| `/portal/requests` | Incoming requests inbox — accept or decline |

`portal/layout.tsx` — server-side auth guard, redirects to `/portal/login` if no session.

### Admin Panel (`/admin`)

| Route | Description |
|---|---|
| `/admin/login` | Admin login |
| `/admin` | Overview: stats (matched, unmatched, pending) |
| `/admin/attendees` | Import from Google Sheet, send invite emails |
| `/admin/rooms` | View all rooms, assign room numbers, manually move members |

`admin/layout.tsx` — auth guard + role check (custom claim `role: admin` in Supabase user metadata).

### API Routes

| Route | Method | Description |
|---|---|---|
| `/api/portal/requests` | POST | Send a roommate request |
| `/api/portal/requests/[id]` | PATCH | Accept or decline a request |
| `/api/admin/import` | POST | Pull from Google Sheet → create Supabase users → send invites |
| `/api/admin/rooms/[id]` | PATCH | Assign room number or adjust capacity |

---

## Auth Strategy

- **Supabase Auth** with email + password.
- Sessions handled via cookies (SSR-compatible using `@supabase/ssr`).
- On registration success page: attendee sees a note — *"Once you receive your invite email, you can set up your room at nrtf.com/portal"*.
- Admin triggers invite email batch from `/admin/attendees` — Supabase sends magic link to set password.
- Admin role: stored as `{ role: "admin" }` in Supabase `user_metadata`. Checked server-side in `admin/layout.tsx`.

---

## Entry Point (Registration Flow Integration)

The existing registration form and API (`/api/register`) are **unchanged**. The only change is on the registration **success state** — a line is added pointing to the portal once invite emails go out.

---

## Error Handling

- Duplicate requests: API checks for existing pending/accepted request before inserting.
- Already matched (full room): browse list filters out attendees whose room is at capacity.
- Unauthenticated access: layout guards redirect server-side — no client-side flicker.
- Admin import: duplicate emails are skipped (already have an account), reported back to admin.

---

## Out of Scope

- Real-time notifications (no websockets — page refresh to check new requests)
- Password reset flow (Supabase handles this natively)
- Mobile app
- Payment or room booking (hotel handles that separately)
