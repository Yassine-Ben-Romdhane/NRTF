-- Add new fields for updated registration form
alter table public.registrations
  add column if not exists fac_or_org text not null default '',
  add column if not exists participant_type text not null default 'student' check (participant_type in ('student', 'professional')),
  add column if not exists cin text not null default '',
  add column if not exists birthday date,
  add column if not exists accommodation text not null default '' check (accommodation in ('', 'single', 'double', 'triple')),
  add column if not exists facebook_link text not null default '',
  add column if not exists bus text not null default 'no' check (bus in ('yes', 'no')),
  add column if not exists bus_city text not null default '',
  add column if not exists hackathon text not null default 'no' check (hackathon in ('yes', 'no')),
  add column if not exists team_name text not null default '',
  add column if not exists team_leader text not null default '',
  add column if not exists team_members text not null default '';
