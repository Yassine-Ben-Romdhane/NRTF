create table public.pending_attendees (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  university text not null,
  imported_at timestamptz not null default now()
);
