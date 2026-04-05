-- Add roommate preference fields
alter table public.registrations
  add column if not exists roommate1 text not null default '',
  add column if not exists roommate2 text not null default '';
