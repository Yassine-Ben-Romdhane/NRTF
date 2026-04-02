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
-- No public RLS policies; access only via service role key
