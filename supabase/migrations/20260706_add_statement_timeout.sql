-- Cap how long any single query is allowed to run for the roles PostgREST
-- uses to serve this project's API traffic (anon/authenticated for normal
-- requests, service_role for the send-blueprint Edge Function's DB calls).
-- Without this, a slow/runaway query (bad query plan, accidental full-table
-- scan, etc.) can hold a connection open indefinitely and exhaust the
-- connection pool for an otherwise low-traffic project. 8s is generous for
-- every query this app currently issues (simple indexed lookups/inserts on
-- `blueprints` and `twitter_outreach`).
alter role anon set statement_timeout = '8s';
alter role authenticated set statement_timeout = '8s';
alter role service_role set statement_timeout = '8s';
