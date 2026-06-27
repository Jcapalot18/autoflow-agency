// CRM Automation — #6 Highest Demand Service
// Industries: Real estate, agencies, B2B services, consultants, solar, insurance
// Price: $2,000-$5,000 build + $397-$797/mo retainer
// Sales cycle: 10-21 days (higher ticket, longer deliberation)

export const SERVICE_ID = 'crm-automation';
export const SERVICE_NAME = 'CRM Automation';

// ── Pipeline Stage Configurations ────────────────────────────────

export const pipelineStages = {
  new_lead:         { order: 1, label: 'New Lead',          color: '#6B7280', auto_actions: ['assign_owner', 'send_intro_email', 'create_followup_task'] },
  contacted:        { order: 2, label: 'Contacted',         color: '#3B82F6', auto_actions: ['log_contact_attempt', 'schedule_followup'] },
  qualified:        { order: 3, label: 'Qualified',         color: '#8B5CF6', auto_actions: ['send_proposal_template', 'notify_sales_rep'] },
  proposal_sent:    { order: 4, label: 'Proposal Sent',     color: '#F59E0B', auto_actions: ['start_proposal_followup_sequence', 'set_close_date'] },
  negotiation:      { order: 5, label: 'Negotiation',       color: '#EF4444', auto_actions: ['notify_manager', 'log_objections'] },
  closed_won:       { order: 6, label: 'Closed Won',        color: '#10B981', auto_actions: ['send_welcome_sequence', 'create_onboarding_task', 'update_revenue_dashboard'] },
  closed_lost:      { order: 7, label: 'Closed Lost',       color: '#374151', auto_actions: ['log_lost_reason', 'start_nurture_sequence', 'schedule_recontact_90_days'] },
};

// ── Automated Workflows ───────────────────────────────────────────

export const workflows = {

  // Workflow 1: New lead intake
  new_lead_intake: {
    name: 'New Lead Intake',
    trigger: 'lead_created',
    steps: [
      { action: 'assign_lead_score', params: { model: 'source_industry_size' } },
      { action: 'assign_to_rep', params: { method: 'round_robin' } },
      { action: 'create_task', params: { title: 'Call {{first_name}} at {{company}}', due: '1_business_day' } },
      { action: 'send_email', params: { template: 'intro_from_rep' } },
      { action: 'add_to_sequence', params: { sequence: 'new_lead_nurture' } },
    ],
  },

  // Workflow 2: Stage change automations
  stage_change: {
    name: 'Stage Change Automation',
    trigger: 'deal_stage_updated',
    conditions_and_actions: {
      contacted: [
        { action: 'send_email', params: { template: 'initial_outreach_confirmation' } },
        { action: 'schedule_followup_call', params: { days: 3 } },
      ],
      qualified: [
        { action: 'notify_slack', params: { channel: '#sales', message: '🎯 New qualified lead: {{company}} — {{deal_value}}' } },
        { action: 'create_task', params: { title: 'Send proposal to {{first_name}}', due: '2_business_days' } },
      ],
      proposal_sent: [
        { action: 'start_sequence', params: { id: 'proposal_followup' } },
        { action: 'set_reminder', params: { days: 5, message: 'Follow up on proposal with {{first_name}}' } },
      ],
      closed_won: [
        { action: 'send_email', params: { template: 'closed_won_welcome' } },
        { action: 'create_task', params: { title: 'Kick off onboarding for {{company}}', due: '1_business_day' } },
        { action: 'update_field', params: { field: 'customer_since', value: 'today' } },
        { action: 'send_slack', params: { channel: '#wins', message: '🏆 New client: {{company}} — {{deal_value}}' } },
      ],
      closed_lost: [
        { action: 'send_email', params: { template: 'lost_deal_feedback_request' } },
        { action: 'tag_contact', params: { tag: 'lost_{{current_month_year}}' } },
        { action: 'schedule_recontact', params: { days: 90, note: 'Nurture sequence complete — re-engage' } },
      ],
    },
  },

  // Workflow 3: Inactivity detection
  deal_stagnation: {
    name: 'Stagnant Deal Alert',
    trigger: 'deal_no_activity_days',
    thresholds: { new_lead: 2, contacted: 5, qualified: 7, proposal_sent: 5 },
    actions: [
      { action: 'notify_rep', params: { message: 'Deal with {{company}} has been inactive for {{days}} days' } },
      { action: 'create_task', params: { title: 'Re-engage {{first_name}} at {{company}}', due: 'today' } },
    ],
  },
};

// ── Email Templates ───────────────────────────────────────────────

export const emailTemplates = {

  intro_from_rep: {
    subject: '{{first_name}}, quick intro from {{rep_name}} at {{agency_name}}',
    body: `Hi {{first_name}},

I'm {{rep_name}} and I've been assigned to your account at {{agency_name}}.

I see you came to us through {{lead_source}} — I'd love to learn more about what you're looking for.

I have {{available_time_1}} or {{available_time_2}} available for a 20-minute intro call. Does either work?

If those don't work, here's my calendar: {{calendar_link}}

{{rep_name}}
{{rep_title}} — {{agency_name}}
{{rep_phone}}`,
  },

  proposal_followup_day3: {
    subject: 'Re: Proposal for {{company}} — any questions?',
    body: `Hi {{first_name}},

I sent over the proposal for {{company}} a few days ago and wanted to check in.

Did everything make sense? Any questions about the scope, timeline, or pricing?

I'm happy to jump on a quick call to walk through it together: {{calendar_link}}

{{rep_name}}`,
  },

  closed_won_welcome: {
    subject: 'Welcome to {{agency_name}}, {{first_name}}!',
    body: `Hi {{first_name}},

Welcome aboard! We're thrilled to be working with {{company}}.

Here's what happens next:
1. {{onboarding_step_1}}
2. {{onboarding_step_2}}
3. {{onboarding_step_3}}

Your dedicated point of contact is {{rep_name}} ({{rep_email}} / {{rep_phone}}).

We'll have your first check-in scheduled within {{checkin_days}} business days.

Looking forward to it,
{{owner_name}}
{{agency_name}}`,
  },

  lost_deal_feedback_request: {
    subject: 'Quick question before I close your file, {{first_name}}',
    body: `Hi {{first_name}},

I understand the timing or fit wasn't right, and I respect that completely.

One quick question: was there something specific we could have done differently? Pricing, scope, timing?

Your honest answer helps us get better — and it takes 60 seconds.

Either way, I hope we get the chance to work together down the road.

{{rep_name}}`,
  },
};

// ── Contact Management ────────────────────────────────────────────

export const contactFields = [
  'first_name', 'last_name', 'email', 'phone', 'company',
  'industry', 'city', 'state', 'lead_source', 'assigned_rep',
  'lead_score', 'lifecycle_stage', 'deal_value', 'close_date',
  'last_contacted', 'tags', 'notes', 'custom_fields',
];

export const leadScoringRules = {
  source: { referral: 30, inbound: 25, cold_outbound: 10, paid_ad: 20 },
  company_size: { enterprise: 40, mid_market: 25, small_business: 15 },
  engagement: { opened_email: 5, clicked_link: 10, booked_call: 30, replied: 20 },
  industry_fit: { ideal: 20, good: 10, neutral: 0, poor: -10 },
};

export function calculateLeadScore(lead) {
  let score = 0;
  score += leadScoringRules.source[lead.source] || 0;
  score += leadScoringRules.company_size[lead.size] || 0;
  score += (lead.engagements || []).reduce((s, e) => s + (leadScoringRules.engagement[e] || 0), 0);
  score += leadScoringRules.industry_fit[lead.fit] || 0;
  return Math.min(100, score);
}

export function renderTemplate(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `[${key}]`);
}
