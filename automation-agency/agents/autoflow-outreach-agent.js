'use strict';

/**
 * AutoFlow Outreach Agent
 *
 * Targets small business owners who don't have automation:
 *   - Marketing agencies
 *   - E-commerce stores
 *   - Local service businesses (plumbers, contractors, salons)
 *   - Coaches and consultants
 *
 * Schedule : 15 emails/day at 10:00am
 * Follow-ups: day 3 and day 7 after initial send
 * Dedup     : Supabase `outreach_contacts` table (email unique constraint)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const schedule = require('node-schedule');
const { hasBeenContacted, markContacted, markFollowUpSent, getFollowUpCandidates } = require('../lib/supabase');
const { sendEmail } = require('../lib/mailer');
const LEADS = require('../leads/sample-leads');

// ── CONFIG ────────────────────────────────────────────────────────────────────

const AGENT_ID     = 'autoflow-outreach-agent';
const DAILY_LIMIT  = 15;
const SEND_HOUR    = 10;
const SEND_DELAY_MS = 3000; // pause between sends to avoid spam triggers

const AUTOFLOW_URL    = 'https://autoflow-agency-eight.vercel.app';
const CYBERSHIELD_URL = 'https://cybrshieldtech.com';

// ── EMAIL TEMPLATES ───────────────────────────────────────────────────────────

const NICHE_TASK = {
  marketing_agency:  'chasing client approvals and sending reports manually',
  ecommerce:         'managing abandoned-cart emails and post-purchase follow-ups manually',
  local_service:     'scheduling appointments and following up on quotes by hand',
  coach_consultant:  'onboarding clients and running follow-up sequences manually',
};

function buildInitialEmail({ first_name, business_name, niche }) {
  const task = NICHE_TASK[niche] || 'handling follow-ups and outreach manually';

  return {
    subject: `100+ emails/day, automated — want this for ${business_name}?`,
    html: `
<p>Hi ${first_name},</p>

<p>I built a system that automatically sends 100+ personalized emails per day — and keeps following up — without me touching it.</p>

<p>I used that exact system to build <a href="${CYBERSHIELD_URL}">CyberShield</a>, a cybersecurity SaaS, in 14 days flat. The AI agent handled all the outreach, follow-ups, and lead qualification while I focused on building the product.</p>

<p>A lot of ${niche.replace('_', ' ')} businesses are still ${task}. That's exactly what I'd automate for ${business_name}.</p>

<p><strong>What's the most repetitive task eating your time right now?</strong></p>

<p>I'll get on a free 15-minute call and map out exactly what I'd build — no pitch, just a plan.<br>
<a href="${AUTOFLOW_URL}">${AUTOFLOW_URL}</a></p>

<p>— Jason<br>AutoFlow Agency</p>
    `.trim(),
  };
}

function buildFollowUp3Email({ first_name, business_name }) {
  return {
    subject: `Re: AI automation for ${business_name}`,
    html: `
<p>Hi ${first_name},</p>

<p>Wanted to follow up in case my last email got buried.</p>

<p>Short version: I build AI agents that handle your outreach, follow-ups, and client communication automatically. I used one to launch <a href="${CYBERSHIELD_URL}">CyberShield</a> in 14 days — the agent found leads, sent emails, and followed up while I built the product.</p>

<p>If you're spending time on anything repetitive at ${business_name}, I can probably automate it.</p>

<p>Free 15-min call, no commitment:<br>
<a href="${AUTOFLOW_URL}">${AUTOFLOW_URL}</a></p>

<p>— Jason<br>AutoFlow Agency</p>
    `.trim(),
  };
}

function buildFollowUp7Email({ first_name, business_name }) {
  return {
    subject: `Last note — ${business_name} automation`,
    html: `
<p>Hi ${first_name},</p>

<p>Last one from me — I don't want to clutter your inbox.</p>

<p>If you ever want to see what I'd build for ${business_name}, the 15-min call is free and there's no pressure.</p>

<p>Proof it works: <a href="${CYBERSHIELD_URL}">CyberShield</a> — a cybersecurity SaaS built in 14 days using the same system I'd build for you.</p>

<p><a href="${AUTOFLOW_URL}">Book a free 15-min call →</a></p>

<p>— Jason<br>AutoFlow Agency</p>
    `.trim(),
  };
}

// ── CORE RUNS ─────────────────────────────────────────────────────────────────

async function runInitialOutreach() {
  console.log(`[${AGENT_ID}] Daily outreach starting — limit: ${DAILY_LIMIT}`);
  let sent = 0;

  for (const lead of LEADS) {
    if (sent >= DAILY_LIMIT) break;

    const already = await hasBeenContacted(lead.email);
    if (already) continue;

    try {
      const { subject, html } = buildInitialEmail(lead);
      await sendEmail({ to: lead.email, subject, html });
      await markContacted(lead, AGENT_ID);
      sent++;
      console.log(`[${AGENT_ID}] ✓ Initial → ${lead.email} (${sent}/${DAILY_LIMIT})`);
      await sleep(SEND_DELAY_MS);
    } catch (err) {
      console.error(`[${AGENT_ID}] ✗ Initial failed → ${lead.email}:`, err.message);
    }
  }

  console.log(`[${AGENT_ID}] Daily outreach done — ${sent} sent`);
}

async function runFollowUps(day) {
  const candidates = await getFollowUpCandidates(day);
  console.log(`[${AGENT_ID}] Day-${day} follow-ups — ${candidates.length} candidate(s)`);

  for (const contact of candidates) {
    const builder = day === 3 ? buildFollowUp3Email : buildFollowUp7Email;
    try {
      const { subject, html } = builder(contact);
      await sendEmail({ to: contact.email, subject, html });
      await markFollowUpSent(contact.email, day);
      console.log(`[${AGENT_ID}] ✓ Day-${day} follow-up → ${contact.email}`);
      await sleep(SEND_DELAY_MS);
    } catch (err) {
      console.error(`[${AGENT_ID}] ✗ Day-${day} follow-up failed → ${contact.email}:`, err.message);
    }
  }
}

// ── SCHEDULER ─────────────────────────────────────────────────────────────────

function startScheduler() {
  // Fire every day at SEND_HOUR:00 — initial batch + both follow-up checks in one pass
  schedule.scheduleJob(`0 ${SEND_HOUR} * * *`, async () => {
    await runInitialOutreach();
    await runFollowUps(3);
    await runFollowUps(7);
  });

  console.log(`[${AGENT_ID}] Scheduler active — fires daily at ${SEND_HOUR}:00am`);
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── EXPORTS (consumed by ecosystem.js) ───────────────────────────────────────

module.exports = {
  id: AGENT_ID,
  runInitialOutreach,
  runFollowUps,
  startScheduler,
};

// Standalone execution
if (require.main === module) {
  startScheduler();
}
