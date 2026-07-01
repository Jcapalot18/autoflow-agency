-- AutoFlow blueprint lead capture table
create table if not exists blueprints (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  industry      text not null,
  blueprint_content text,
  created_at    timestamptz not null default now()
);

-- Index for looking up by email
create index if not exists blueprints_email_idx on blueprints (email);

-- Index for reporting by industry
create index if not exists blueprints_industry_idx on blueprints (industry);

-- RLS: service key bypasses this; anon users cannot read
alter table blueprints enable row level security;
