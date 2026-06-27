import 'dotenv/config';
import fs from 'fs';
import path from 'path';

// ── Service Registry ─────────────────────────────────────────────
import * as LeadFollowup       from './services/lead-followup.js';
import * as ReputationMgmt     from './services/reputation-management.js';
import * as EmailMarketing     from './services/email-marketing.js';
import * as AppointmentBooking from './services/appointment-booking.js';
import * as CustomerRetention  from './services/customer-retention.js';
import * as CrmAutomation      from './services/crm-automation.js';
import * as HrHiring           from './services/hr-hiring.js';
import * as Reporting          from './services/reporting-dashboards.js';

const SERVICES = {
  'lead-followup':        LeadFollowup,
  'reputation-management': ReputationMgmt,
  'email-marketing':      EmailMarketing,
  'appointment-booking':  AppointmentBooking,
  'customer-retention':   CustomerRetention,
  'crm-automation':       CrmAutomation,
  'hr-hiring':            HrHiring,
  'reporting-dashboards': Reporting,
};

// ── Client Config Schema ─────────────────────────────────────────
// Each client needs this config to deploy any service:
//
// {
//   client_id: 'acme-roofing',
//   business_name: 'Acme Roofing',
//   owner_name: 'John Smith',
//   phone: '555-555-5555',
//   email: 'john@acmeroofing.com',
//   industry: 'roofing',
//   services: ['lead-followup', 'reputation-management'],
//   variables: {
//     calendar_link: 'https://cal.com/acme',
//     google_review_link: 'https://g.page/r/...',
//     // ...service-specific variables
//   }
// }

const STATE_FILE = path.resolve('agent-state.json');

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
  catch { return { clients: {}, deployments: [], logs: [] }; }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function log(message, level = 'info') {
  const entry = { ts: new Date().toISOString(), level, message };
  console.log(`[${entry.ts}] [${level.toUpperCase()}] ${message}`);
  return entry;
}

// ── Core: Deploy a service for a client ─────────────────────────

export async function deployService(clientConfig, serviceId) {
  const service = SERVICES[serviceId];
  if (!service) {
    throw new Error(`Unknown service: ${serviceId}. Available: ${Object.keys(SERVICES).join(', ')}`);
  }

  const state = loadState();

  log(`Deploying ${service.SERVICE_NAME} for ${clientConfig.business_name}`);

  const deployment = {
    id: `${clientConfig.client_id}-${serviceId}-${Date.now()}`,
    client_id: clientConfig.client_id,
    service_id: serviceId,
    service_name: service.SERVICE_NAME,
    business_name: clientConfig.business_name,
    deployed_at: new Date().toISOString(),
    status: 'active',
    sequences: Object.keys(service.sequences || {}),
    config: clientConfig,
  };

  // Validate required variables for this service
  const missing = validateServiceVariables(serviceId, clientConfig.variables || {});
  if (missing.length > 0) {
    deployment.status = 'needs_config';
    deployment.missing_variables = missing;
    log(`⚠️  Missing variables for ${service.SERVICE_NAME}: ${missing.join(', ')}`, 'warn');
  } else {
    deployment.status = 'active';
    log(`✅ ${service.SERVICE_NAME} deployed for ${clientConfig.business_name}`);
  }

  state.deployments = state.deployments.filter(d =>
    !(d.client_id === clientConfig.client_id && d.service_id === serviceId)
  );
  state.deployments.push(deployment);

  if (!state.clients[clientConfig.client_id]) {
    state.clients[clientConfig.client_id] = { ...clientConfig, onboarded_at: new Date().toISOString() };
  }
  state.clients[clientConfig.client_id].active_services = [
    ...new Set([...(state.clients[clientConfig.client_id].active_services || []), serviceId]),
  ];

  saveState(state);
  return deployment;
}

// ── Core: Onboard a new client with multiple services ────────────

export async function onboardClient(clientConfig) {
  log(`\n${'='.repeat(60)}`);
  log(`Onboarding new client: ${clientConfig.business_name}`);
  log(`Services requested: ${clientConfig.services.join(', ')}`);
  log('='.repeat(60));

  const results = [];
  for (const serviceId of clientConfig.services) {
    try {
      const result = await deployService(clientConfig, serviceId);
      results.push({ serviceId, status: result.status, deployment: result });
    } catch (err) {
      log(`Error deploying ${serviceId}: ${err.message}`, 'error');
      results.push({ serviceId, status: 'error', error: err.message });
    }
  }

  printOnboardingSummary(clientConfig, results);
  return results;
}

// ── Core: Get next automation step for a contact ─────────────────

export function getNextAction(clientId, serviceId, contactId, sequenceName) {
  const state = loadState();
  const deployment = state.deployments.find(
    d => d.client_id === clientId && d.service_id === serviceId && d.status === 'active'
  );
  if (!deployment) throw new Error(`No active ${serviceId} deployment for client ${clientId}`);

  const service = SERVICES[serviceId];
  const contactKey = `${clientId}:${serviceId}:${contactId}`;
  const contactState = state.contactStates?.[contactKey] || { completedSteps: [], sequence: sequenceName };

  const seq = service.sequences?.[sequenceName];
  if (!seq) throw new Error(`Unknown sequence: ${sequenceName} in ${serviceId}`);

  const nextStep = seq.steps.find(s => !contactState.completedSteps.includes(s.step));
  return nextStep || null;
}

// ── Core: Mark a step complete ───────────────────────────────────

export function markStepComplete(clientId, serviceId, contactId, stepNumber) {
  const state = loadState();
  const contactKey = `${clientId}:${serviceId}:${contactId}`;
  if (!state.contactStates) state.contactStates = {};
  if (!state.contactStates[contactKey]) state.contactStates[contactKey] = { completedSteps: [] };
  if (!state.contactStates[contactKey].completedSteps.includes(stepNumber)) {
    state.contactStates[contactKey].completedSteps.push(stepNumber);
  }
  saveState(state);
}

// ── Core: Render a template with client + contact variables ──────

export function renderMessage(clientId, serviceId, sequenceName, stepNumber, contactVariables) {
  const state = loadState();
  const client = state.clients[clientId];
  if (!client) throw new Error(`Client not found: ${clientId}`);

  const service = SERVICES[serviceId];
  const seq = service.sequences?.[sequenceName];
  if (!seq) throw new Error(`Unknown sequence: ${sequenceName}`);

  const step = seq.steps.find(s => s.step === stepNumber);
  if (!step) throw new Error(`Step ${stepNumber} not found in ${sequenceName}`);

  const variables = { ...client.variables, ...client, ...contactVariables };
  const rendered = { ...step };

  if (step.subject) rendered.subject = applyTemplate(step.subject, variables);
  if (step.body)    rendered.body    = applyTemplate(step.body, variables);

  return rendered;
}

// ── Validation ───────────────────────────────────────────────────

const REQUIRED_VARIABLES = {
  'lead-followup':        ['business_name', 'owner_name', 'phone', 'calendar_link'],
  'reputation-management':['business_name', 'owner_name', 'phone', 'google_review_link'],
  'email-marketing':      ['business_name', 'owner_name', 'website'],
  'appointment-booking':  ['business_name', 'phone', 'reschedule_link', 'booking_link'],
  'customer-retention':   ['business_name', 'owner_name'],
  'crm-automation':       ['agency_name', 'rep_name', 'calendar_link'],
  'hr-hiring':            ['company_name', 'hiring_manager_name'],
  'reporting-dashboards': ['business_name', 'dashboard_link'],
};

function validateServiceVariables(serviceId, variables) {
  const required = REQUIRED_VARIABLES[serviceId] || [];
  return required.filter(v => !variables[v] && !variables[v.replace(/_/g, '')]);
}

// ── Utilities ────────────────────────────────────────────────────

function applyTemplate(str, vars) {
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `[${key}]`);
}

function printOnboardingSummary(client, results) {
  console.log('\n' + '─'.repeat(60));
  console.log(`✅ Onboarding complete: ${client.business_name}`);
  console.log('─'.repeat(60));
  results.forEach(r => {
    const icon = r.status === 'active' ? '✅' : r.status === 'needs_config' ? '⚠️ ' : '❌';
    console.log(`${icon} ${r.serviceId}: ${r.status}`);
  });
  console.log('─'.repeat(60) + '\n');
}

// ── List / Status Commands ───────────────────────────────────────

export function listClients() {
  const { clients, deployments } = loadState();
  return Object.entries(clients).map(([id, c]) => ({
    id,
    business_name: c.business_name,
    active_services: c.active_services || [],
    active_deployments: deployments.filter(d => d.client_id === id && d.status === 'active').length,
  }));
}

export function getClientStatus(clientId) {
  const state = loadState();
  const client = state.clients[clientId];
  if (!client) return null;
  const deployments = state.deployments.filter(d => d.client_id === clientId);
  return { client, deployments };
}

export function listServices() {
  return Object.entries(SERVICES).map(([id, s]) => ({
    id,
    name: s.SERVICE_NAME,
    sequences: Object.keys(s.sequences || {}),
  }));
}

// ── CLI Runner ───────────────────────────────────────────────────

if (process.argv[1] === new URL(import.meta.url).pathname.replace(/\\/g, '/') ||
    process.argv[1].endsWith('master-agent.js')) {
  const command = process.argv[2];

  switch (command) {
    case 'list-services': {
      console.log('\nAvailable AutoFlow Services:\n');
      listServices().forEach(s => {
        console.log(`  ${s.id}`);
        console.log(`    Name: ${s.name}`);
        console.log(`    Sequences: ${s.sequences.join(', ')}\n`);
      });
      break;
    }
    case 'list-clients': {
      const clients = listClients();
      if (clients.length === 0) {
        console.log('No clients onboarded yet.');
      } else {
        console.log('\nOnboarded Clients:\n');
        clients.forEach(c => {
          console.log(`  ${c.business_name} (${c.id})`);
          console.log(`    Services: ${c.active_services.join(', ') || 'none'}`);
          console.log(`    Active deployments: ${c.active_deployments}\n`);
        });
      }
      break;
    }
    case 'demo': {
      // Demo: onboard a sample client
      await onboardClient({
        client_id: 'demo-roofing-co',
        business_name: 'Peak Roofing Co.',
        owner_name: 'Mike Torres',
        phone: '214-555-0192',
        email: 'mike@peakroofing.com',
        industry: 'roofing',
        services: ['lead-followup', 'reputation-management', 'reporting-dashboards'],
        variables: {
          calendar_link: 'https://cal.com/peakroofing',
          google_review_link: 'https://g.page/r/DEMO_PLACE_ID/review',
          dashboard_link: 'https://dashboard.autoflow.agency/demo-roofing-co',
          website: 'https://peakroofing.com',
        },
      });
      break;
    }
    default:
      console.log(`
AutoFlow Master Agent

Commands:
  node master-agent.js list-services     List all available service templates
  node master-agent.js list-clients      List all onboarded clients
  node master-agent.js demo              Demo: onboard a sample client

Programmatic usage:
  import { onboardClient, deployService, getNextAction } from './master-agent.js';
`);
  }
}
