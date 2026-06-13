'use strict';

const { createClient } = require('@supabase/supabase-js');

/*
  Required Supabase table — run once in your Supabase SQL editor:

  create table outreach_contacts (
    id                 uuid primary key default gen_random_uuid(),
    email              text unique not null,
    first_name         text,
    business_name      text,
    niche              text,
    agent_id           text,
    initial_sent_at    timestamptz,
    followup3_sent_at  timestamptz,
    followup7_sent_at  timestamptz,
    status             text default 'contacted',
    created_at         timestamptz default now()
  );
*/

let _client;

function getClient() {
  if (_client) return _client;
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment');
  }
  _client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  return _client;
}

async function hasBeenContacted(email) {
  const { data } = await getClient()
    .from('outreach_contacts')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  return data !== null;
}

async function markContacted(contact, agentId) {
  const { error } = await getClient().from('outreach_contacts').insert({
    email:           contact.email,
    first_name:      contact.first_name,
    business_name:   contact.business_name,
    niche:           contact.niche,
    agent_id:        agentId,
    initial_sent_at: new Date().toISOString(),
    status:          'contacted',
  });
  if (error) throw error;
}

async function markFollowUpSent(email, day) {
  const field = day === 3 ? 'followup3_sent_at' : 'followup7_sent_at';
  const { error } = await getClient()
    .from('outreach_contacts')
    .update({ [field]: new Date().toISOString() })
    .eq('email', email);
  if (error) throw error;
}

// Returns contacts whose initial email was sent exactly `day` days ago (±12h window).
async function getFollowUpCandidates(day) {
  const pivot = new Date();
  pivot.setDate(pivot.getDate() - day);

  const from = new Date(pivot.getTime() - 12 * 60 * 60 * 1000).toISOString();
  const to   = new Date(pivot.getTime() + 12 * 60 * 60 * 1000).toISOString();

  const followUpField = day === 3 ? 'followup3_sent_at' : 'followup7_sent_at';

  const { data, error } = await getClient()
    .from('outreach_contacts')
    .select('*')
    .gte('initial_sent_at', from)
    .lte('initial_sent_at', to)
    .is(followUpField, null);

  if (error) throw error;
  return data || [];
}

module.exports = { hasBeenContacted, markContacted, markFollowUpSent, getFollowUpCandidates };
