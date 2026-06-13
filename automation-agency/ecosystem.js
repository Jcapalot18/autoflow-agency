'use strict';

/**
 * AutoFlow Agency — Agent Ecosystem
 *
 * Central registry for all outreach agents.
 * Each agent registers its ID, description, schedule, and target niches here.
 * Call `startAll()` to boot every enabled agent's built-in scheduler.
 *
 * Usage:
 *   node ecosystem.js               — start all enabled agents
 *   node agents/<name>.js           — run a single agent standalone
 */

require('dotenv').config();

// ── AGENT REGISTRY ────────────────────────────────────────────────────────────

const AGENT_REGISTRY = {
  'autoflow-outreach-agent': {
    name:        'AutoFlow Outreach Agent',
    description: 'Cold email outreach to small business owners — 15/day at 10am with day-3 and day-7 follow-ups',
    module:      './agents/autoflow-outreach-agent',
    schedule:    '0 10 * * *',
    targets:     ['marketing_agency', 'ecommerce', 'local_service', 'coach_consultant'],
    enabled:     true,
  },
};

// ── RUNNER ────────────────────────────────────────────────────────────────────

function startAll() {
  const enabled = Object.entries(AGENT_REGISTRY).filter(([, cfg]) => cfg.enabled);
  console.log(`[ecosystem] Booting ${enabled.length} agent(s)...`);

  for (const [id, cfg] of enabled) {
    try {
      const agent = require(cfg.module);
      agent.startScheduler();
      console.log(`[ecosystem] ✓ ${cfg.name} (${id})`);
    } catch (err) {
      console.error(`[ecosystem] ✗ Failed to start ${id}:`, err.message);
    }
  }
}

module.exports = { AGENT_REGISTRY, startAll };

if (require.main === module) {
  startAll();
}
