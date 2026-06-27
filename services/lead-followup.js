// Lead Follow-Up Automation — #1 Highest Demand Service
// Industries: Real estate, roofing, HVAC, solar, insurance, home services
// Price: $1,500-$3,000 build + $297-$497/mo retainer
// Sales cycle: 3-7 days (fastest close — pain is immediate and demo-able)

export const SERVICE_ID = 'lead-followup';
export const SERVICE_NAME = 'Lead Follow-Up Automation';

// ── Email Sequences ────────────────────────────────────────────────

export const sequences = {

  // Sequence 1: New inbound lead (from form fill, ad click, referral)
  inbound_lead: {
    name: 'Inbound Lead Response',
    trigger: 'new_lead_received',
    steps: [
      {
        step: 1,
        delay_minutes: 2,
        channel: 'email',
        subject: 'Hey {{first_name}} — quick question about {{service}}',
        body: `Hi {{first_name}},

Thanks for reaching out about {{service}}. I'm {{owner_name}} and I wanted to follow up personally.

Quick question before we schedule anything: are you looking to get this done in the next 30 days, or are you still in the early research phase?

Either way is completely fine — I just want to make sure I send you the right info.

{{owner_name}}
{{business_name}}
{{phone}}`,
        goal: 'qualify timeline',
      },
      {
        step: 2,
        delay_hours: 24,
        channel: 'sms',
        body: `Hi {{first_name}}, this is {{owner_name}} from {{business_name}}. Did you get my email about {{service}}? Happy to answer any questions — just reply here or call {{phone}}.`,
        condition: 'no_reply_to_step_1',
      },
      {
        step: 3,
        delay_hours: 72,
        channel: 'email',
        subject: 'Re: {{service}} — still interested?',
        body: `Hi {{first_name}},

I sent a message a couple days ago and wanted to check in one more time.

I know things get busy. If you're still thinking about {{service}}, I'd love to spend 15 minutes on a call to see if we're a good fit.

You can grab a time here: {{calendar_link}}

If the timing isn't right, no worries at all — just let me know and I'll close out your file.

{{owner_name}}`,
        condition: 'no_reply_to_step_1_or_2',
      },
      {
        step: 4,
        delay_days: 7,
        channel: 'email',
        subject: 'Last follow-up from {{business_name}}',
        body: `Hi {{first_name}},

This will be my last message so I don't clog your inbox.

If {{service}} is still on your radar at any point, feel free to reach back out — I'll make time for you.

Here's the link to book a call whenever the timing works: {{calendar_link}}

Best,
{{owner_name}}
{{business_name}}`,
        condition: 'no_reply_to_previous_steps',
      },
    ],
  },

  // Sequence 2: Cold outbound lead (prospected, not opted in)
  cold_outbound: {
    name: 'Cold Outbound Sequence',
    trigger: 'new_prospect_sourced',
    steps: [
      {
        step: 1,
        delay_minutes: 0,
        channel: 'email',
        subject: 'Quick question, {{first_name}}',
        body: `Hi {{first_name}},

I was looking at {{business_name}} online and noticed {{personalized_pain_point}}.

We help {{industry}} businesses {{value_proposition}}. {{case_study_one_liner}}.

Would it be worth a quick 15-minute call to see if we can do the same for you?

{{sender_name}}
{{agency_name}}`,
        goal: 'open a conversation',
      },
      {
        step: 2,
        delay_days: 3,
        channel: 'email',
        subject: 'Re: Quick question, {{first_name}}',
        body: `Hi {{first_name}},

Wanted to bump this up since I know inboxes get full.

For context on what we do: {{two_sentence_proof_point}}.

Is this something worth 10 minutes of your time?

{{sender_name}}`,
        condition: 'no_reply',
      },
      {
        step: 3,
        delay_days: 7,
        channel: 'email',
        subject: 'One last thing, {{first_name}}',
        body: `Hi {{first_name}},

I'll keep this short. We helped a {{industry}} business in {{city}} {{specific_result}} in the first 30 days.

If that's interesting, here's a link to see how it works: {{case_study_link}}

If now's not the right time, totally understand — just say the word and I'll take you off my list.

{{sender_name}}`,
        condition: 'no_reply',
      },
    ],
  },

  // Sequence 3: Re-engagement for old/dead leads
  reengagement: {
    name: 'Dead Lead Reactivation',
    trigger: 'lead_inactive_60_days',
    steps: [
      {
        step: 1,
        delay_minutes: 0,
        channel: 'email',
        subject: '{{first_name}}, are you still looking for {{service}}?',
        body: `Hi {{first_name}},

We spoke a while back about {{service}} and I wanted to check in.

A lot has changed on our end — {{new_offer_or_update}}. A few spots just opened up for {{current_month}}.

If the timing is better now, I'd love to reconnect. Here's my calendar: {{calendar_link}}

{{owner_name}}`,
      },
      {
        step: 2,
        delay_days: 4,
        channel: 'sms',
        body: `Hey {{first_name}}, {{owner_name}} here from {{business_name}}. Sent you an email a few days ago — did it land? Happy to chat if the timing's better now. {{calendar_link}}`,
        condition: 'no_reply',
      },
    ],
  },
};

// ── Automation Logic ──────────────────────────────────────────────

export function getNextStep(lead, sequence) {
  const seq = sequences[sequence];
  if (!seq) throw new Error(`Unknown sequence: ${sequence}`);
  const completedSteps = lead.completedSteps || [];
  return seq.steps.find(s => !completedSteps.includes(s.step)) || null;
}

export function renderTemplate(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `[${key}]`);
}

export function buildLeadPayload(lead, step, variables) {
  return {
    lead_id: lead.id,
    step: step.step,
    sequence: lead.sequence,
    channel: step.channel,
    subject: step.subject ? renderTemplate(step.subject, variables) : undefined,
    body: renderTemplate(step.body, variables),
    scheduled_at: new Date(Date.now() + (step.delay_minutes || 0) * 60000 +
                           (step.delay_hours || 0) * 3600000 +
                           (step.delay_days || 0) * 86400000),
  };
}

// ── Industry Targeting ────────────────────────────────────────────

export const industryConfigs = {
  real_estate: {
    pain_point: 'most agents lose 60-70% of leads just by following up too slow',
    value_prop: 'automatically follow up within 2 minutes, 24/7',
    avg_deal_value: 9000,
    target_titles: ['Realtor', 'Real Estate Agent', 'Broker', 'Property Manager'],
  },
  hvac: {
    pain_point: 'seasonal leads go cold within hours if not contacted fast',
    value_prop: 'respond to every service request automatically, even at midnight',
    avg_deal_value: 3500,
    target_titles: ['Owner', 'Operations Manager', 'Service Manager'],
  },
  roofing: {
    pain_point: 'storm season generates 10x leads but only 20% get followed up with',
    value_prop: 'contact every storm lead within 5 minutes automatically',
    avg_deal_value: 12000,
    target_titles: ['Owner', 'Sales Manager', 'Estimator'],
  },
  solar: {
    pain_point: 'solar leads have a 48-hour decision window that most reps miss',
    value_prop: 'nurture leads automatically across a 14-day sequence',
    avg_deal_value: 25000,
    target_titles: ['Owner', 'Sales Director', 'Lead Manager'],
  },
  insurance: {
    pain_point: 'agents manually follow up with hundreds of quote requests per week',
    value_prop: 'automate quote follow-up across email and SMS',
    avg_deal_value: 1800,
    target_titles: ['Agent', 'Broker', 'Agency Owner'],
  },
};
