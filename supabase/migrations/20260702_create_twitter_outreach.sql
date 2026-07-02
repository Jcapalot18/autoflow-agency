create table if not exists twitter_outreach (
  id              uuid        primary key default gen_random_uuid(),
  twitter_user_id text        not null unique,
  twitter_handle  text        not null,
  display_name    text,
  followed_at     timestamptz,
  dm_sent_at      timestamptz,
  dm_content      text,
  recent_tweets   text,
  status          text        not null default 'followed',
  error_message   text,
  created_at      timestamptz not null default now()
);

create index if not exists twitter_outreach_status_idx    on twitter_outreach (status);
create index if not exists twitter_outreach_followed_idx  on twitter_outreach (followed_at desc);

alter table twitter_outreach enable row level security;
