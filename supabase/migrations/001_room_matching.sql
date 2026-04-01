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
