# Room Matching System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a hotel room matching portal for NRTF 3.0 attendees — login, browse roommate candidates, send/accept requests, admin management — all within the existing Next.js site on a separate branch.

**Architecture:** Supabase handles auth (email+password, invite flow) and Postgres DB. The portal lives at `/portal` and `/admin` within the existing Next.js App Router. Attendees are imported from Google Sheets by the admin, who sends invite emails via Supabase. The existing registration flow is untouched except for a single line added to the success screen.

**Tech Stack:** Next.js 14 App Router, TypeScript, Supabase (`@supabase/ssr`, `@supabase/supabase-js`), Tailwind CSS, existing site design tokens.

---

## File Map

**New files:**
- `app/portal/layout.tsx` — auth guard for all portal routes
- `app/portal/login/page.tsx` — attendee login
- `app/portal/page.tsx` — dashboard (status + roommate info)
- `app/portal/browse/page.tsx` — browse attendees, send requests
- `app/portal/requests/page.tsx` — inbox: accept/decline
- `app/admin/layout.tsx` — auth guard + role check
- `app/admin/login/page.tsx` — admin login
- `app/admin/page.tsx` — stats overview
- `app/admin/attendees/page.tsx` — import from Sheets, send invites
- `app/admin/rooms/page.tsx` — view rooms, assign numbers
- `app/api/portal/requests/route.ts` — POST: send request
- `app/api/portal/requests/[id]/route.ts` — PATCH: accept/decline
- `app/api/admin/import/route.ts` — POST: import from Sheets + invite
- `app/api/admin/rooms/[id]/route.ts` — PATCH: assign room number
- `lib/supabase/client.ts` — browser Supabase client
- `lib/supabase/server.ts` — server Supabase client (SSR)
- `middleware.ts` — session refresh on every request
- `types/portal.ts` — shared TypeScript types
- `supabase/migrations/001_room_matching.sql` — full DB schema

**Modified files:**
- `components/sections/Register.tsx` — add portal link to success state
- `package.json` — add `@supabase/ssr`, `@supabase/supabase-js`
- `.env.local` — add Supabase env vars (manual step)

---

## Task 1: Create branch and install dependencies

**Files:** `package.json`

- [ ] **Step 1: Create the feature branch**

```bash
git checkout -b feature/room-matching
```

- [ ] **Step 2: Install Supabase packages**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 3: Verify install**

```bash
npm list @supabase/supabase-js @supabase/ssr
```
Expected: both packages listed without errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install supabase dependencies for room matching"
```

---

## Task 2: Supabase project setup (manual)

**Files:** `.env.local`, `supabase/migrations/001_room_matching.sql`

- [ ] **Step 1: Create a Supabase project**

Go to https://supabase.com, create a new project called `nrtf3`. Wait for it to provision.

- [ ] **Step 2: Get credentials**

In the Supabase dashboard → Settings → API. Copy:
- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret, server-only)

- [ ] **Step 3: Add to `.env.local`**

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- [ ] **Step 4: Create the DB schema**

Create file `supabase/migrations/001_room_matching.sql`:

```sql
-- Profiles (linked to auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  email text not null unique,
  university text not null,
  bio text,
  is_looking boolean not null default true,
  created_at timestamptz not null default now()
);

-- Room requests
create type request_status as enum ('pending', 'accepted', 'declined');

create table public.room_requests (
  id uuid primary key default gen_random_uuid(),
  from_id uuid not null references public.profiles(id) on delete cascade,
  to_id uuid not null references public.profiles(id) on delete cascade,
  status request_status not null default 'pending',
  created_at timestamptz not null default now(),
  constraint no_self_request check (from_id <> to_id)
);

-- Rooms
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  room_number text,
  capacity int not null default 2 check (capacity in (2, 3)),
  created_at timestamptz not null default now()
);

-- Room members
create table public.room_members (
  room_id uuid not null references public.rooms(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, profile_id)
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.room_requests enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;

-- Profiles: anyone authenticated can read, only own row to update
create policy "profiles: read all" on public.profiles for select using (auth.role() = 'authenticated');
create policy "profiles: update own" on public.profiles for update using (auth.uid() = id);

-- Room requests: read own (sent or received)
create policy "requests: read own" on public.room_requests for select
  using (auth.uid() = from_id or auth.uid() = to_id);
create policy "requests: insert own" on public.room_requests for insert
  with check (auth.uid() = from_id);
create policy "requests: update own received" on public.room_requests for update
  using (auth.uid() = to_id);

-- Rooms: authenticated can read
create policy "rooms: read all" on public.rooms for select using (auth.role() = 'authenticated');

-- Room members: authenticated can read
create policy "room_members: read all" on public.room_members for select using (auth.role() = 'authenticated');
```

- [ ] **Step 5: Run the migration in Supabase**

In Supabase dashboard → SQL Editor → paste the contents of `001_room_matching.sql` → Run.

Verify: go to Table Editor and confirm all 4 tables exist.

- [ ] **Step 6: Commit**

```bash
git add supabase/ .env.local
git commit -m "feat: add supabase schema for room matching"
```

Note: `.env.local` should be in `.gitignore` — verify it is before committing.

---

## Task 3: Supabase client helpers

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Create browser client** (`lib/supabase/client.ts`)

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Create server client** (`lib/supabase/server.ts`)

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

export function createServiceClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
```

- [ ] **Step 3: Create Next.js middleware** (`middleware.ts` in project root)

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();
  return supabaseResponse;
}

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*"],
};
```

- [ ] **Step 4: Create shared types** (`types/portal.ts`)

```typescript
export type Profile = {
  id: string;
  full_name: string;
  email: string;
  university: string;
  bio: string | null;
  is_looking: boolean;
  created_at: string;
};

export type RequestStatus = "pending" | "accepted" | "declined";

export type RoomRequest = {
  id: string;
  from_id: string;
  to_id: string;
  status: RequestStatus;
  created_at: string;
};

export type Room = {
  id: string;
  room_number: string | null;
  capacity: number;
  created_at: string;
};

export type RoomMember = {
  room_id: string;
  profile_id: string;
  joined_at: string;
};
```

- [ ] **Step 5: Commit**

```bash
git add lib/ middleware.ts types/
git commit -m "feat: add supabase client helpers and shared types"
```

---

## Task 4: Portal login page

**Files:**
- Create: `app/portal/login/page.tsx`

- [ ] **Step 1: Create the login page**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/portal");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--color-bg, #0a0f0d)" }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="NRTF" width={48} className="mx-auto mb-4" />
          <h1 className="font-display font-bold text-2xl text-nrtf-text">Room Matching Portal</h1>
          <p className="text-sm text-nrtf-muted/60 mt-1">Sign in with your registration email</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-nrtf-muted/60 mb-1.5 font-sans">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-transparent border border-[rgba(109,217,207,0.2)] rounded px-3 py-2 text-sm text-nrtf-text outline-none focus:border-[rgba(109,217,207,0.5)] font-sans"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-xs text-nrtf-muted/60 mb-1.5 font-sans">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-transparent border border-[rgba(109,217,207,0.2)] rounded px-3 py-2 text-sm text-nrtf-text outline-none focus:border-[rgba(109,217,207,0.5)] font-sans"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 font-sans">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-2.5 rounded font-sans text-sm font-medium transition-opacity disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #137c55, #6dd9cf)", color: "#fff" }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify it renders**

Run `npm run dev`, navigate to `http://localhost:3000/portal/login`. Confirm the form renders with no console errors.

- [ ] **Step 3: Commit**

```bash
git add app/portal/login/
git commit -m "feat: add portal login page"
```

---

## Task 5: Portal layout (auth guard)

**Files:**
- Create: `app/portal/layout.tsx`

- [ ] **Step 1: Create portal layout**

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/portal/login");

  return <>{children}</>;
}
```

- [ ] **Step 2: Test the guard**

With `npm run dev` running, navigate to `http://localhost:3000/portal` (not logged in). Confirm you are redirected to `/portal/login`.

- [ ] **Step 3: Commit**

```bash
git add app/portal/layout.tsx
git commit -m "feat: add portal auth guard layout"
```

---

## Task 6: Portal dashboard page

**Files:**
- Create: `app/portal/page.tsx`

- [ ] **Step 1: Create the dashboard**

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function PortalDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  // Load profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Check if already in a room
  const { data: membership } = await supabase
    .from("room_members")
    .select("room_id, rooms(room_number, capacity)")
    .eq("profile_id", user.id)
    .single();

  // Load roommates if matched
  let roommates: { full_name: string; university: string }[] = [];
  if (membership) {
    const { data } = await supabase
      .from("room_members")
      .select("profiles(full_name, university)")
      .eq("room_id", (membership as any).room_id)
      .neq("profile_id", user.id);
    roommates = (data ?? []).map((d: any) => d.profiles);
  }

  // Count pending incoming requests
  const { count: pendingCount } = await supabase
    .from("room_requests")
    .select("*", { count: "exact", head: true })
    .eq("to_id", user.id)
    .eq("status", "pending");

  async function signOut() {
    "use server";
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect("/portal/login");
  }

  return (
    <main className="min-h-screen px-8 py-12 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="NRTF" width={36} />
          <span className="font-display font-bold text-lg gradient-text">Room Matching</span>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-xs text-nrtf-muted/50 hover:text-nrtf-muted transition-colors font-sans">
            Sign out
          </button>
        </form>
      </div>

      <h1 className="font-display font-bold text-3xl text-nrtf-text mb-1">
        Welcome, {profile?.full_name?.split(" ")[0] ?? "Attendee"}
      </h1>
      <p className="text-sm text-nrtf-muted/60 font-sans mb-8">{profile?.university}</p>

      {membership ? (
        <div className="border border-[rgba(109,217,207,0.2)] rounded-lg p-6 mb-6">
          <div className="text-xs font-sans text-nrtf-muted/50 mb-3 uppercase tracking-wider">Your Room</div>
          {(membership as any).rooms?.room_number ? (
            <div className="text-2xl font-display font-bold gradient-text mb-4">
              Room {(membership as any).rooms.room_number}
            </div>
          ) : (
            <div className="text-sm text-nrtf-muted/50 font-sans mb-4">Room number will be assigned by the organizers.</div>
          )}
          <div className="text-xs text-nrtf-muted/50 font-sans mb-2">Roommates</div>
          {roommates.length === 0 ? (
            <p className="text-sm text-nrtf-muted/40 font-sans">No other roommates yet.</p>
          ) : (
            roommates.map(r => (
              <div key={r.full_name} className="text-sm text-nrtf-text font-sans">
                {r.full_name} · <span className="text-nrtf-muted/50">{r.university}</span>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="border border-[rgba(109,217,207,0.1)] rounded-lg p-6 mb-6 text-sm text-nrtf-muted/60 font-sans">
          You haven&apos;t been matched yet. Browse attendees to find a roommate.
        </div>
      )}

      <div className="flex gap-4">
        <Link href="/portal/browse"
          className="flex-1 text-center py-2.5 rounded font-sans text-sm font-medium border border-[rgba(109,217,207,0.2)] text-nrtf-text hover:border-[rgba(109,217,207,0.5)] transition-colors">
          Browse Attendees
        </Link>
        <Link href="/portal/requests"
          className="flex-1 text-center py-2.5 rounded font-sans text-sm font-medium border border-[rgba(109,217,207,0.2)] text-nrtf-text hover:border-[rgba(109,217,207,0.5)] transition-colors relative">
          Requests
          {(pendingCount ?? 0) > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
              style={{ background: "#137c55", color: "#fff" }}>
              {pendingCount}
            </span>
          )}
        </Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/portal/page.tsx
git commit -m "feat: add portal dashboard"
```

---

## Task 7: Portal browse page

**Files:**
- Create: `app/portal/browse/page.tsx`

- [ ] **Step 1: Create the browse page**

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import RequestButton from "./RequestButton";

export default async function BrowsePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  // Check if current user is already in a full room
  const { data: myMembership } = await supabase
    .from("room_members")
    .select("room_id, rooms(capacity)")
    .eq("profile_id", user.id)
    .single();

  // Get rooms that are full (member count >= capacity)
  const { data: fullRoomMembers } = await supabase
    .from("room_members")
    .select("profile_id, room_id");

  const roomCounts: Record<string, number> = {};
  (fullRoomMembers ?? []).forEach(({ room_id }: any) => {
    roomCounts[room_id] = (roomCounts[room_id] ?? 0) + 1;
  });

  const fullRoomProfileIds = new Set(
    (fullRoomMembers ?? [])
      .filter(({ room_id }: any) => roomCounts[room_id] >= 3)
      .map(({ profile_id }: any) => profile_id)
  );

  // Get IDs we've already sent a request to (pending or accepted)
  const { data: sentRequests } = await supabase
    .from("room_requests")
    .select("to_id, status")
    .eq("from_id", user.id)
    .in("status", ["pending", "accepted"]);

  const alreadyRequestedIds = new Set((sentRequests ?? []).map((r: any) => r.to_id));

  // Fetch attendees who are looking
  const { data: attendees } = await supabase
    .from("profiles")
    .select("id, full_name, university, bio, is_looking")
    .eq("is_looking", true)
    .neq("id", user.id);

  const available = (attendees ?? []).filter(
    (a: any) => !fullRoomProfileIds.has(a.id) && !alreadyRequestedIds.has(a.id)
  );

  return (
    <main className="min-h-screen px-8 py-12 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/portal" className="text-xs text-nrtf-muted/50 hover:text-nrtf-muted font-sans">← Back</Link>
        <h1 className="font-display font-bold text-2xl text-nrtf-text">Find a Roommate</h1>
      </div>

      {myMembership && (
        <div className="mb-6 p-4 rounded border border-[rgba(109,217,207,0.15)] text-sm text-nrtf-muted/60 font-sans">
          You&apos;re already matched. You can still browse to add a 3rd roommate if your room allows it.
        </div>
      )}

      {available.length === 0 ? (
        <p className="text-sm text-nrtf-muted/50 font-sans">No attendees available to match right now.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {available.map((attendee: any) => (
            <div key={attendee.id}
              className="border border-[rgba(109,217,207,0.12)] rounded-lg p-5 flex items-start justify-between gap-4">
              <div>
                <div className="font-sans font-medium text-nrtf-text text-sm">{attendee.full_name}</div>
                <div className="text-xs text-nrtf-muted/50 font-sans mt-0.5">{attendee.university}</div>
                {attendee.bio && (
                  <div className="text-xs text-nrtf-muted/60 font-sans mt-2 max-w-xs">{attendee.bio}</div>
                )}
              </div>
              <RequestButton toId={attendee.id} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Create the client RequestButton component** (`app/portal/browse/RequestButton.tsx`)

```tsx
"use client";

import { useState } from "react";

export default function RequestButton({ toId }: { toId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  async function sendRequest() {
    setStatus("loading");
    const res = await fetch("/api/portal/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_id: toId }),
    });

    if (res.ok) {
      setStatus("sent");
    } else {
      setStatus("error");
    }
  }

  if (status === "sent") return (
    <span className="text-xs text-nrtf-muted/50 font-sans py-2">Request sent</span>
  );

  return (
    <button
      onClick={sendRequest}
      disabled={status === "loading"}
      className="shrink-0 px-4 py-2 rounded text-xs font-sans font-medium disabled:opacity-50 transition-opacity"
      style={{ background: "linear-gradient(135deg, #137c55, #6dd9cf)", color: "#fff" }}
    >
      {status === "loading" ? "Sending…" : status === "error" ? "Failed — retry" : "Send Request"}
    </button>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/portal/browse/
git commit -m "feat: add portal browse page with request button"
```

---

## Task 8: API — send roommate request

**Files:**
- Create: `app/api/portal/requests/route.ts`

- [ ] **Step 1: Create the POST handler**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { to_id } = await req.json();
  if (!to_id) return NextResponse.json({ error: "to_id required" }, { status: 400 });
  if (to_id === user.id) return NextResponse.json({ error: "Cannot request yourself" }, { status: 400 });

  // Check for duplicate
  const { data: existing } = await supabase
    .from("room_requests")
    .select("id")
    .eq("from_id", user.id)
    .eq("to_id", to_id)
    .in("status", ["pending", "accepted"])
    .single();

  if (existing) return NextResponse.json({ error: "Request already exists" }, { status: 409 });

  const { error } = await supabase
    .from("room_requests")
    .insert({ from_id: user.id, to_id });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true }, { status: 201 });
}
```

- [ ] **Step 2: Test with curl**

With the dev server running and a logged-in session cookie, verify the endpoint responds (actual test will be done in the E2E task).

- [ ] **Step 3: Commit**

```bash
git add app/api/portal/requests/
git commit -m "feat: add send roommate request API"
```

---

## Task 9: Portal requests inbox page + accept/decline API

**Files:**
- Create: `app/portal/requests/page.tsx`
- Create: `app/api/portal/requests/[id]/route.ts`

- [ ] **Step 1: Create the accept/decline API** (`app/api/portal/requests/[id]/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action } = await req.json(); // "accept" | "decline"
  if (!["accept", "decline"].includes(action)) {
    return NextResponse.json({ error: "action must be accept or decline" }, { status: 400 });
  }

  // Verify this request is addressed to the current user
  const { data: request } = await supabase
    .from("room_requests")
    .select("*")
    .eq("id", params.id)
    .eq("to_id", user.id)
    .eq("status", "pending")
    .single();

  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  if (action === "decline") {
    await supabase.from("room_requests").update({ status: "declined" }).eq("id", params.id);
    return NextResponse.json({ success: true });
  }

  // Accept: update request status, create room, add both members
  await supabase.from("room_requests").update({ status: "accepted" }).eq("id", params.id);

  // Check if the requester is already in a room with space
  const { data: existingMembership } = await supabase
    .from("room_members")
    .select("room_id, rooms(capacity)")
    .eq("profile_id", request.from_id)
    .single();

  let roomId: string;

  if (existingMembership) {
    // Add the accepter to the existing room
    roomId = (existingMembership as any).room_id;
    await supabase.from("room_members").insert({ room_id: roomId, profile_id: user.id });
  } else {
    // Create a new room
    const { data: newRoom } = await supabase
      .from("rooms")
      .insert({ capacity: 2 })
      .select()
      .single();
    roomId = newRoom!.id;
    await supabase.from("room_members").insert([
      { room_id: roomId, profile_id: request.from_id },
      { room_id: roomId, profile_id: user.id },
    ]);
  }

  return NextResponse.json({ success: true, room_id: roomId });
}
```

- [ ] **Step 2: Create the requests inbox page** (`app/portal/requests/page.tsx`)

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ActionButtons from "./ActionButtons";

export default async function RequestsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const { data: requests } = await supabase
    .from("room_requests")
    .select("id, status, created_at, from_id, profiles!room_requests_from_id_fkey(full_name, university, bio)")
    .eq("to_id", user.id)
    .order("created_at", { ascending: false });

  const pending = (requests ?? []).filter((r: any) => r.status === "pending");
  const past = (requests ?? []).filter((r: any) => r.status !== "pending");

  return (
    <main className="min-h-screen px-8 py-12 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/portal" className="text-xs text-nrtf-muted/50 hover:text-nrtf-muted font-sans">← Back</Link>
        <h1 className="font-display font-bold text-2xl text-nrtf-text">Roommate Requests</h1>
      </div>

      <h2 className="text-xs font-sans uppercase tracking-wider text-nrtf-muted/50 mb-4">Pending</h2>
      {pending.length === 0 ? (
        <p className="text-sm text-nrtf-muted/40 font-sans mb-8">No pending requests.</p>
      ) : (
        <div className="flex flex-col gap-4 mb-8">
          {pending.map((r: any) => (
            <div key={r.id} className="border border-[rgba(109,217,207,0.15)] rounded-lg p-5 flex items-start justify-between gap-4">
              <div>
                <div className="font-sans font-medium text-nrtf-text text-sm">{r.profiles.full_name}</div>
                <div className="text-xs text-nrtf-muted/50 font-sans mt-0.5">{r.profiles.university}</div>
                {r.profiles.bio && (
                  <div className="text-xs text-nrtf-muted/60 font-sans mt-2 max-w-xs">{r.profiles.bio}</div>
                )}
              </div>
              <ActionButtons requestId={r.id} />
            </div>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <>
          <h2 className="text-xs font-sans uppercase tracking-wider text-nrtf-muted/50 mb-4">Past</h2>
          <div className="flex flex-col gap-3">
            {past.map((r: any) => (
              <div key={r.id} className="border border-[rgba(255,255,255,0.05)] rounded-lg p-4 flex items-center justify-between">
                <div className="text-sm font-sans text-nrtf-muted/60">{r.profiles.full_name}</div>
                <span className={`text-xs font-sans px-2 py-0.5 rounded ${r.status === "accepted" ? "text-green-400" : "text-nrtf-muted/40"}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Create ActionButtons client component** (`app/portal/requests/ActionButtons.tsx`)

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ActionButtons({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);

  async function act(action: "accept" | "decline") {
    setLoading(action);
    await fetch(`/api/portal/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    router.refresh();
  }

  return (
    <div className="flex gap-2 shrink-0">
      <button
        onClick={() => act("accept")}
        disabled={!!loading}
        className="px-3 py-1.5 rounded text-xs font-sans font-medium disabled:opacity-50 transition-opacity"
        style={{ background: "linear-gradient(135deg, #137c55, #6dd9cf)", color: "#fff" }}
      >
        {loading === "accept" ? "…" : "Accept"}
      </button>
      <button
        onClick={() => act("decline")}
        disabled={!!loading}
        className="px-3 py-1.5 rounded text-xs font-sans font-medium border border-[rgba(255,255,255,0.1)] text-nrtf-muted/60 disabled:opacity-50 transition-opacity"
      >
        {loading === "decline" ? "…" : "Decline"}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/portal/requests/ app/api/portal/requests/
git commit -m "feat: add requests inbox page and accept/decline API"
```

---

## Task 10: Admin login + layout

**Files:**
- Create: `app/admin/login/page.tsx`
- Create: `app/admin/layout.tsx`

- [ ] **Step 1: Create admin login page** (`app/admin/login/page.tsx`)

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) { setError(error.message); setLoading(false); return; }

    // Check admin role
    const role = data.user?.app_metadata?.role;
    if (role !== "admin") {
      await supabase.auth.signOut();
      setError("Access denied. Admin accounts only.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--color-bg, #0a0f0d)" }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="NRTF" width={48} className="mx-auto mb-4" />
          <h1 className="font-display font-bold text-2xl text-nrtf-text">Admin Panel</h1>
          <p className="text-sm text-nrtf-muted/60 mt-1">Organizers only</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full bg-transparent border border-[rgba(109,217,207,0.2)] rounded px-3 py-2 text-sm text-nrtf-text outline-none focus:border-[rgba(109,217,207,0.5)] font-sans"
            placeholder="admin@email.com" />
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
            className="w-full bg-transparent border border-[rgba(109,217,207,0.2)] rounded px-3 py-2 text-sm text-nrtf-text outline-none focus:border-[rgba(109,217,207,0.5)] font-sans"
            placeholder="••••••••" />
          {error && <p className="text-xs text-red-400 font-sans">{error}</p>}
          <button type="submit" disabled={loading}
            className="mt-2 py-2.5 rounded font-sans text-sm font-medium disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #137c55, #6dd9cf)", color: "#fff" }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Create admin layout with role guard** (`app/admin/layout.tsx`)

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");
  if (user.app_metadata?.role !== "admin") redirect("/admin/login");

  return <>{children}</>;
}
```

- [ ] **Step 3: Set up an admin user in Supabase**

In Supabase dashboard → Authentication → Users → "Invite user" or create manually.
Then in the SQL editor, set the role:

```sql
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
where email = 'your-admin@email.com';
```

- [ ] **Step 4: Commit**

```bash
git add app/admin/login/ app/admin/layout.tsx
git commit -m "feat: add admin login and role-gated layout"
```

---

## Task 11: Admin attendees page + import API

**Files:**
- Create: `app/admin/attendees/page.tsx`
- Create: `app/api/admin/import/route.ts`
- Create: `app/admin/page.tsx`

- [ ] **Step 1: Create admin overview page** (`app/admin/page.tsx`)

```tsx
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminOverview() {
  const supabase = createClient();

  const { count: totalProfiles } = await supabase
    .from("profiles").select("*", { count: "exact", head: true });

  const { count: matchedCount } = await supabase
    .from("room_members").select("profile_id", { count: "exact", head: true });

  const { count: pendingCount } = await supabase
    .from("room_requests").select("*", { count: "exact", head: true }).eq("status", "pending");

  const unmatched = (totalProfiles ?? 0) - (matchedCount ?? 0);

  return (
    <main className="min-h-screen px-8 py-12 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="NRTF" width={36} />
          <span className="font-display font-bold text-lg gradient-text">Admin Panel</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Total Attendees", value: totalProfiles ?? 0 },
          { label: "Matched", value: matchedCount ?? 0 },
          { label: "Pending Requests", value: pendingCount ?? 0 },
        ].map(stat => (
          <div key={stat.label} className="border border-[rgba(109,217,207,0.12)] rounded-lg p-5">
            <div className="text-2xl font-display font-bold gradient-text">{stat.value}</div>
            <div className="text-xs text-nrtf-muted/50 font-sans mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <Link href="/admin/attendees"
          className="flex-1 text-center py-2.5 rounded font-sans text-sm border border-[rgba(109,217,207,0.2)] text-nrtf-text hover:border-[rgba(109,217,207,0.5)] transition-colors">
          Manage Attendees
        </Link>
        <Link href="/admin/rooms"
          className="flex-1 text-center py-2.5 rounded font-sans text-sm border border-[rgba(109,217,207,0.2)] text-nrtf-text hover:border-[rgba(109,217,207,0.5)] transition-colors">
          Manage Rooms
        </Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Create the import API** (`app/api/admin/import/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { google } from "googleapis";

function getSheets() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  return google.sheets({ version: "v4", auth });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) return NextResponse.json({ error: "Missing GOOGLE_SHEET_ID" }, { status: 500 });

  const sheets = getSheets();
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "A2:K",
  });

  const rows = result.data.values ?? [];
  const serviceClient = createServiceClient();

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const [full_name, email, , university] = row;
    if (!email || !full_name) continue;

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists in profiles
    const { data: existing } = await serviceClient
      .from("profiles")
      .select("id")
      .eq("email", normalizedEmail)
      .single();

    if (existing) { skipped++; continue; }

    // Create Supabase auth user and send invite
    const { data: inviteData, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(
      normalizedEmail,
      { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/portal` }
    );

    if (inviteError) { errors.push(`${normalizedEmail}: ${inviteError.message}`); continue; }

    // Create profile row
    await serviceClient.from("profiles").insert({
      id: inviteData.user.id,
      full_name: full_name.trim(),
      email: normalizedEmail,
      university: university?.trim() ?? "",
    });

    imported++;
  }

  return NextResponse.json({ imported, skipped, errors });
}
```

- [ ] **Step 3: Add `NEXT_PUBLIC_SITE_URL` to `.env.local`**

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

(Change to your real domain in production.)

- [ ] **Step 4: Create admin attendees page** (`app/admin/attendees/page.tsx`)

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminAttendeesPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);

  async function runImport() {
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/admin/import", { method: "POST" });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <main className="min-h-screen px-8 py-12 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-xs text-nrtf-muted/50 hover:text-nrtf-muted font-sans">← Back</Link>
        <h1 className="font-display font-bold text-2xl text-nrtf-text">Attendees</h1>
      </div>

      <div className="border border-[rgba(109,217,207,0.12)] rounded-lg p-6 mb-6">
        <h2 className="font-sans font-medium text-nrtf-text text-sm mb-2">Import from Google Sheet</h2>
        <p className="text-xs text-nrtf-muted/50 font-sans mb-4">
          Pulls all registrations, creates accounts, and sends invite emails. Already-imported attendees are skipped.
        </p>
        <button onClick={runImport} disabled={loading}
          className="px-5 py-2 rounded font-sans text-sm font-medium disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #137c55, #6dd9cf)", color: "#fff" }}>
          {loading ? "Importing…" : "Run Import"}
        </button>
      </div>

      {result && (
        <div className="border border-[rgba(109,217,207,0.12)] rounded-lg p-5 text-sm font-sans">
          <div className="text-nrtf-text mb-1">✓ Imported: <strong>{result.imported}</strong></div>
          <div className="text-nrtf-muted/50 mb-1">Skipped (already exists): {result.skipped}</div>
          {result.errors.length > 0 && (
            <div className="mt-3">
              <div className="text-red-400 text-xs mb-1">Errors:</div>
              {result.errors.map(e => <div key={e} className="text-xs text-red-300">{e}</div>)}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add app/admin/ app/api/admin/import/
git commit -m "feat: add admin overview, attendees page, and import API"
```

---

## Task 12: Admin rooms page + assign API

**Files:**
- Create: `app/admin/rooms/page.tsx`
- Create: `app/api/admin/rooms/[id]/route.ts`

- [ ] **Step 1: Create assign room number API** (`app/api/admin/rooms/[id]/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { room_number, capacity } = await req.json();
  const updates: Record<string, unknown> = {};
  if (room_number !== undefined) updates.room_number = room_number;
  if (capacity !== undefined) updates.capacity = capacity;

  const { error } = await supabase.from("rooms").update(updates).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Create admin rooms page** (`app/admin/rooms/page.tsx`)

```tsx
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import RoomEditor from "./RoomEditor";

export default async function AdminRoomsPage() {
  const supabase = createClient();

  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, room_number, capacity, created_at")
    .order("created_at");

  const { data: members } = await supabase
    .from("room_members")
    .select("room_id, profiles(full_name, university)");

  const membersByRoom: Record<string, { full_name: string; university: string }[]> = {};
  (members ?? []).forEach((m: any) => {
    if (!membersByRoom[m.room_id]) membersByRoom[m.room_id] = [];
    membersByRoom[m.room_id].push(m.profiles);
  });

  return (
    <main className="min-h-screen px-8 py-12 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-xs text-nrtf-muted/50 hover:text-nrtf-muted font-sans">← Back</Link>
        <h1 className="font-display font-bold text-2xl text-nrtf-text">Rooms ({rooms?.length ?? 0})</h1>
      </div>

      {(!rooms || rooms.length === 0) ? (
        <p className="text-sm text-nrtf-muted/50 font-sans">No rooms yet. They are created when attendees accept requests.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {rooms.map((room: any) => (
            <div key={room.id} className="border border-[rgba(109,217,207,0.12)] rounded-lg p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="text-xs text-nrtf-muted/50 font-sans mb-1">Room</div>
                  <div className="font-display font-bold text-lg gradient-text">
                    {room.room_number ?? "Unassigned"}
                  </div>
                </div>
                <RoomEditor roomId={room.id} currentNumber={room.room_number} currentCapacity={room.capacity} />
              </div>
              <div className="text-xs text-nrtf-muted/50 font-sans mb-2">
                Members ({membersByRoom[room.id]?.length ?? 0}/{room.capacity})
              </div>
              {(membersByRoom[room.id] ?? []).map(m => (
                <div key={m.full_name} className="text-sm text-nrtf-text font-sans">
                  {m.full_name} · <span className="text-nrtf-muted/50">{m.university}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Create RoomEditor client component** (`app/admin/rooms/RoomEditor.tsx`)

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RoomEditor({
  roomId, currentNumber, currentCapacity
}: { roomId: string; currentNumber: string | null; currentCapacity: number }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [number, setNumber] = useState(currentNumber ?? "");
  const [capacity, setCapacity] = useState(currentCapacity);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/rooms/${roomId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room_number: number || null, capacity }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) return (
    <button onClick={() => setEditing(true)}
      className="text-xs text-nrtf-muted/50 hover:text-nrtf-muted font-sans border border-[rgba(255,255,255,0.08)] px-3 py-1 rounded transition-colors">
      Edit
    </button>
  );

  return (
    <div className="flex items-center gap-2">
      <input value={number} onChange={e => setNumber(e.target.value)}
        placeholder="Room #"
        className="w-20 bg-transparent border border-[rgba(109,217,207,0.2)] rounded px-2 py-1 text-xs text-nrtf-text font-sans outline-none" />
      <select value={capacity} onChange={e => setCapacity(Number(e.target.value))}
        className="bg-transparent border border-[rgba(109,217,207,0.2)] rounded px-2 py-1 text-xs text-nrtf-text font-sans outline-none">
        <option value={2}>2 people</option>
        <option value={3}>3 people</option>
      </select>
      <button onClick={save} disabled={saving}
        className="text-xs px-3 py-1 rounded font-sans disabled:opacity-50"
        style={{ background: "#137c55", color: "#fff" }}>
        {saving ? "…" : "Save"}
      </button>
      <button onClick={() => setEditing(false)} className="text-xs text-nrtf-muted/50 font-sans">Cancel</button>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/admin/rooms/ app/api/admin/rooms/
git commit -m "feat: add admin rooms page and room number assignment API"
```

---

## Task 13: Registration success page integration

**Files:**
- Modify: `components/sections/Register.tsx`

- [ ] **Step 1: Read the current success state** (lines 100–110 in Register.tsx)

The success block currently shows:
```tsx
<h3>You're registered!</h3>
<p className="...">{message}</p>
```

- [ ] **Step 2: Add portal link to the success state**

Find this block in `components/sections/Register.tsx`:
```tsx
<h3 className="font-display font-bold text-2xl text-nrtf-text">You&apos;re registered!</h3>
<p className="text-nrtf-muted/70 max-w-sm">{message}</p>
```

Replace with:
```tsx
<h3 className="font-display font-bold text-2xl text-nrtf-text">You&apos;re registered!</h3>
<p className="text-nrtf-muted/70 max-w-sm">{message}</p>
<p className="text-nrtf-muted/50 text-xs max-w-sm mt-2 font-sans">
  Once you receive your invite email, you can find a roommate at{" "}
  <a href="/portal" className="underline hover:text-nrtf-light transition-colors">/portal</a>.
</p>
```

- [ ] **Step 3: Verify it renders**

Submit the registration form in dev mode (or mock `status = "success"`) and confirm the portal link appears under the confirmation message.

- [ ] **Step 4: Commit**

```bash
git add components/sections/Register.tsx
git commit -m "feat: add room matching portal link to registration success screen"
```

---

## Task 14: End-to-end smoke test

**Files:** No new files — manual verification steps.

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify unauthenticated redirects**

Navigate to `http://localhost:3000/portal` — should redirect to `/portal/login`.
Navigate to `http://localhost:3000/admin` — should redirect to `/admin/login`.

- [ ] **Step 3: Admin import flow**

1. Log in at `/admin/login` with your admin credentials.
2. Go to `/admin/attendees` → click "Run Import".
3. Confirm the result shows imported count and no errors.
4. Check Supabase Authentication dashboard — new users should appear.

- [ ] **Step 4: Attendee invite flow**

1. Check the email inbox for one of the imported attendees.
2. Click the invite link → set a password → confirm redirect to `/portal`.
3. Dashboard should show name and university.

- [ ] **Step 5: Roommate request flow**

1. Log in as Attendee A.
2. Go to `/portal/browse` — confirm other attendees appear.
3. Send a request to Attendee B.
4. Log in as Attendee B → go to `/portal/requests` — confirm request appears.
5. Accept the request.
6. Both A and B's dashboards should now show the matched state.

- [ ] **Step 6: Admin room assignment**

1. Log in as admin → go to `/admin/rooms`.
2. Confirm the room created by the accept is listed.
3. Click "Edit" → assign a room number → save.
4. Log back in as Attendee A → confirm room number is shown on dashboard.

- [ ] **Step 7: Final commit**

```bash
git add .
git commit -m "feat: room matching system complete — portal, admin, and invite flow"
```
