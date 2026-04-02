# Registrations: Supabase Primary Storage + Admin Dashboard View

**Date:** 2026-04-02
**Status:** Approved

## Problem

Registrations currently go only to Google Sheets, which has concurrency issues (race condition on duplicate check, API quotas). The admin must manually import from Sheets into `pending_attendees` before seeing anyone, and all rich form data (phone, field, year, interests, events, IEEE info) is lost in that import. After confirming an attendee, the row is deleted — so there's no record of them in the dashboard after the invite is sent.

## Solution

Add a `registrations` table as the primary write target. Google Sheets becomes a fire-and-forget backup. The admin dashboard reads from `registrations` directly, showing all form submissions with status tracking.

---

## 1. Database

New migration: `supabase/migrations/003_registrations.sql`

```sql
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text not null,
  university text not null,
  field text not null,
  year text not null,
  interests jsonb not null default '[]',
  events jsonb not null default '[]',
  ieee_member text not null,
  ieee_id text not null default '',
  status text not null default 'registered' check (status in ('registered', 'invited')),
  registered_at timestamptz not null default now()
);

alter table public.registrations enable row level security;
-- No public access; all access via service role key only
```

The `unique` constraint on `email` is the concurrency safety net — concurrent inserts with the same email will have one succeed and one fail with Postgres error `23505`, caught in the API and returned as 409.

---

## 2. Registration API (`/api/register`)

**File:** `app/api/register/route.ts`

New flow:
1. Validate form fields (unchanged)
2. Check for duplicate email in `registrations` via Supabase service client
3. Insert full row into `registrations` — if `23505` unique violation, return 409
4. Return 201 to the user immediately
5. Fire-and-forget: append to Google Sheets asynchronously (do not await before responding; log errors but don't surface them to the user)

This eliminates the two sequential Sheets API calls that currently block the response and cause race conditions.

---

## 3. Confirm API (`/api/admin/attendees/[id]/confirm`)

**File:** `app/api/admin/attendees/[id]/confirm/route.ts`

Updated flow (lookup changes from `pending_attendees` to `registrations`):
1. Fetch registration by `id` from `registrations`
2. Send Supabase auth invite email
3. Insert into `profiles` (full_name, email, university)
4. Set `registrations.status = 'invited'` — **do not delete the row**

> `pending_attendees` is not touched in this flow. The "Confirmed" stat reads from `profiles` count. `pending_attendees` is only used by the legacy import path.

---

## 4. Admin Dashboard (`/admin/attendees`)

**File:** `app/admin/(app)/attendees/page.tsx`

### Stats row
Three cards:
- **Registered** — count of all rows in `registrations`
- **Invited** — count of `registrations` where `status = 'invited'`
- **Confirmed** — count of `profiles` (accepted invite, active user)

### Registrations table
Replaces the `pending_attendees` table visually. Reads from `registrations`, ordered by `registered_at` ascending.

Columns: Name | University | Email | Field | Year | IEEE | Status | Registered At | Action

- Status badge: `registered` (neutral) / `invited` (green)
- Action: "Confirm & Invite" button — hidden once status is `invited`

### Import section
Kept as-is. Used to flush any registrations already in Google Sheets before the new flow went live.

---

## 5. Data Flow Summary

```
User submits form
  → POST /api/register
    → Supabase: INSERT into registrations (primary, atomic)
    → Google Sheets: append row (async, fire-and-forget)
  ← 201 response

Admin views /admin/attendees
  → reads registrations table directly (no import needed)

Admin clicks "Confirm & Invite"
  → POST /api/admin/attendees/[id]/confirm
    → Supabase auth: inviteUserByEmail
    → INSERT into profiles
    → UPDATE registrations SET status = 'invited'
  ← row stays visible, status badge changes to "invited"
```

---

## 6. Error Handling

| Scenario | Behavior |
|----------|----------|
| Duplicate email (race condition) | DB unique constraint → 409 to user |
| Google Sheets quota exceeded | Logged server-side, registration still succeeds |
| Sheets API down | Same as above — fire-and-forget, no user impact |
| Invite already sent (re-confirm) | Supabase auth returns error → surfaced to admin |

---

## 7. What Is Not Changing

- `pending_attendees` table — kept, not migrated, not removed
- Import from Google Sheets button — kept for legacy data flush
- Registration form UI (`components/sections/Register.tsx`) — no changes
- Auth/invite email template — no changes
- Room matching flow — no changes
