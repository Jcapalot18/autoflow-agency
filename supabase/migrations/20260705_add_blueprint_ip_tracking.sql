-- Add IP address tracking to blueprints so the send-blueprint edge function
-- can rate-limit by IP in addition to the existing per-email guard. This
-- closes a cost-abuse gap: an attacker rotating email addresses from a
-- single IP could previously bypass the 60s per-email resubmission check
-- and spam paid Anthropic + Resend calls at no cost to themselves.
alter table blueprints add column if not exists ip_address text;

create index if not exists blueprints_ip_created_idx on blueprints (ip_address, created_at desc);
