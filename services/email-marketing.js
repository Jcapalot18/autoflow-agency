// Email Marketing Automation — #3 Highest Demand Service
// Industries: E-commerce, coaches, consultants, agencies, SaaS, local service businesses
// Price: $1,500-$2,500 build + $297-$497/mo retainer
// Sales cycle: 5-10 days (understood value, easy ROI math)

export const SERVICE_ID = 'email-marketing';
export const SERVICE_NAME = 'Email Marketing Automation';

// ── Email Sequences ────────────────────────────────────────────────

export const sequences = {

  // Sequence 1: Welcome / Nurture series for new subscribers
  welcome_series: {
    name: 'New Subscriber Welcome Series',
    trigger: 'new_email_subscriber',
    steps: [
      {
        step: 1,
        delay_minutes: 5,
        channel: 'email',
        subject: 'Welcome to {{business_name}} — here\'s what to expect',
        body: `Hi {{first_name}},

Welcome! I'm {{owner_name}}, {{founder_title}} of {{business_name}}.

You signed up because {{reason_they_opted_in}}. Here's exactly what I'm going to send you:

• {{value_promise_1}}
• {{value_promise_2}}
• {{value_promise_3}}

First email lands {{next_email_timing}}. Talk soon.

{{owner_name}}

P.S. — {{ps_line}}`,
      },
      {
        step: 2,
        delay_days: 2,
        channel: 'email',
        subject: 'The #1 thing holding {{industry}} businesses back',
        body: `Hi {{first_name}},

Most {{industry}} businesses struggle with {{core_problem}}.

Here's why:

{{problem_explanation_paragraph}}

The businesses that get past this do one thing differently: {{solution_teaser}}.

Tomorrow I'll show you exactly how it works.

{{owner_name}}`,
      },
      {
        step: 3,
        delay_days: 2,
        channel: 'email',
        subject: 'How {{reference_business}} solved {{core_problem}}',
        body: `Hi {{first_name}},

{{case_study_business}} was dealing with the same problem.

Here's what they were doing: {{before_state}}.

Here's what changed: {{solution_applied}}.

And here's what happened: {{result_with_numbers}}.

The full breakdown is here if you want to see the details: {{case_study_link}}

{{owner_name}}`,
      },
      {
        step: 4,
        delay_days: 3,
        channel: 'email',
        subject: '{{first_name}}, is this right for you?',
        body: `Hi {{first_name}},

Not everyone I work with is the right fit, so let me be honest with you.

This is a good fit if:
✓ {{qualifier_1}}
✓ {{qualifier_2}}
✓ {{qualifier_3}}

This is NOT a good fit if:
✗ {{disqualifier_1}}
✗ {{disqualifier_2}}

If you're in the first group and want to explore working together, here's how to get started: {{cta_link}}

{{owner_name}}`,
      },
      {
        step: 5,
        delay_days: 4,
        channel: 'email',
        subject: 'Last email in this series — quick ask',
        body: `Hi {{first_name}},

This is the last email in my intro series.

Going forward I'll send {{send_frequency}} with {{ongoing_value_promise}}.

One quick favor — hit reply and let me know: what's the #1 challenge you're dealing with in your {{industry}} business right now?

I read every reply and use them to write better content for you.

{{owner_name}}`,
      },
    ],
  },

  // Sequence 2: Newsletter system (weekly broadcast)
  weekly_newsletter: {
    name: 'Weekly Newsletter',
    trigger: 'weekly_scheduled',
    schedule: 'tuesday_9am',
    template: {
      subject: '{{this_week_topic}} — {{business_name}} Weekly',
      body: `Hi {{first_name}},

**{{hook_line}}**

{{main_content_block}}

---

**Quick tip this week:** {{tip_of_the_week}}

---

**What we've been up to:**
{{business_update_optional}}

See you next week,
{{owner_name}}

---
You're receiving this because you signed up at {{website}}. {{unsubscribe_link}}`,
    },
  },

  // Sequence 3: Product/service launch drip
  launch_sequence: {
    name: 'Launch / Promotion Sequence',
    trigger: 'launch_date_minus_7_days',
    steps: [
      {
        step: 1,
        delay_days: 0,
        channel: 'email',
        subject: 'Something\'s coming {{first_name}}...',
        body: `Hi {{first_name}},

I've been working on something for a while now and I'm almost ready to share it.

It's called {{product_name}} and it's designed to help {{target_audience}} {{core_benefit}}.

I'll tell you more in a few days, but if you want to get on the early access list, just reply to this email with "I'm in."

{{owner_name}}`,
      },
      {
        step: 2,
        delay_days: 3,
        channel: 'email',
        subject: 'The problem {{product_name}} solves',
        body: `Hi {{first_name}},

A few days ago I hinted at something big. Here's the full story.

{{problem_story}}

That's exactly why I built {{product_name}}.

Here's what it does: {{product_description}}

We open the doors on {{launch_date}}. Reply "NOTIFY" if you want to be first to know.

{{owner_name}}`,
      },
      {
        step: 3,
        delay_days: 3,
        channel: 'email',
        subject: '🚀 {{product_name}} is LIVE — {{early_bird_offer}}',
        body: `Hi {{first_name}},

It's here. {{product_name}} is officially live.

For the next {{offer_duration}}, you can get access at {{early_bird_price}} (normally {{regular_price}}).

Here's everything you get:
{{feature_list}}

Get access here: {{checkout_link}}

This offer closes {{offer_end_date}}.

{{owner_name}}`,
      },
      {
        step: 4,
        delay_days: 2,
        channel: 'email',
        subject: '48 hours left — {{product_name}}',
        body: `Hi {{first_name}},

Quick heads up — the {{early_bird_offer}} for {{product_name}} closes in 48 hours.

After that, the price goes up to {{regular_price}}.

If you've been on the fence, here's what I'd ask: {{decision_making_question}}.

Get in before the deadline: {{checkout_link}}

{{owner_name}}`,
      },
      {
        step: 5,
        delay_days: 2,
        channel: 'email',
        subject: 'Last chance — closes tonight',
        body: `Hi {{first_name}},

Tonight at midnight, the {{early_bird_offer}} for {{product_name}} closes.

After that, it's {{regular_price}}.

{{urgency_paragraph}}

Last chance to get in: {{checkout_link}}

{{owner_name}}`,
      },
    ],
  },

  // Sequence 4: Abandoned cart / inquiry recovery
  abandoned_recovery: {
    name: 'Abandoned Inquiry Recovery',
    trigger: 'form_started_not_submitted_or_cart_abandoned',
    steps: [
      {
        step: 1,
        delay_minutes: 30,
        channel: 'email',
        subject: 'You left something behind, {{first_name}}',
        body: `Hi {{first_name}},

I noticed you started {{action_taken}} but didn't finish.

Did something come up? Or did you have a question I can help with?

Here's where you left off: {{resume_link}}

If there's something stopping you, just reply and let me know. I respond to every email personally.

{{owner_name}}`,
      },
      {
        step: 2,
        delay_hours: 23,
        channel: 'email',
        condition: 'no_conversion',
        subject: 'Still thinking about {{product_or_service}}?',
        body: `Hi {{first_name}},

Yesterday you took a look at {{product_or_service}} but didn't pull the trigger.

If it's a question about whether it's right for you, here are the most common things people ask:

Q: {{faq_1_question}}
A: {{faq_1_answer}}

Q: {{faq_2_question}}
A: {{faq_2_answer}}

If you want to talk through it: {{calendar_link}}

{{owner_name}}`,
      },
      {
        step: 3,
        delay_days: 5,
        channel: 'email',
        condition: 'no_conversion',
        subject: 'One last thing about {{product_or_service}}',
        body: `Hi {{first_name}},

I'll keep this short.

If you're still thinking about {{product_or_service}}, here's a small incentive to make the decision easier: {{special_offer}}.

This is only available until {{offer_expiry}}.

Claim it here: {{special_offer_link}}

{{owner_name}}`,
      },
    ],
  },

  // Sequence 5: Re-engagement for cold subscribers
  reengagement: {
    name: 'Cold Subscriber Re-engagement',
    trigger: 'subscriber_inactive_90_days',
    steps: [
      {
        step: 1,
        delay_minutes: 0,
        channel: 'email',
        subject: 'Are we breaking up, {{first_name}}?',
        body: `Hi {{first_name}},

I noticed you haven't opened one of my emails in a while.

That's okay — life gets busy. But I wanted to check in before I stop sending to you.

Are you still interested in {{topic_they_subscribed_for}}? Just click below:

👍 Yes, keep me on the list: {{stay_subscribed_link}}
👋 No thanks, unsubscribe me: {{unsubscribe_link}}

If I don't hear from you in {{days_before_removal}} days, I'll remove you automatically. No hard feelings!

{{owner_name}}`,
      },
      {
        step: 2,
        delay_days: 7,
        channel: 'email',
        condition: 'no_click',
        subject: 'This is goodbye, {{first_name}}',
        body: `Hi {{first_name}},

Since I haven't heard from you, I'm removing you from my list today.

If you ever want to come back, you can always re-subscribe here: {{resubscribe_link}}

Take care,
{{owner_name}}`,
        action_on_send: 'unsubscribe_contact',
      },
    ],
  },
};

export function renderTemplate(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `[${key}]`);
}

export const industryConfigs = {
  ecommerce: {
    newsletter_day: 'tuesday',
    abandoned_cart_delay_minutes: 15,
    typical_list_size: 5000,
    open_rate_benchmark: 0.22,
  },
  coaching: {
    newsletter_day: 'thursday',
    abandoned_cart_delay_minutes: 30,
    typical_list_size: 2000,
    open_rate_benchmark: 0.35,
  },
  local_service: {
    newsletter_day: 'wednesday',
    abandoned_cart_delay_minutes: 60,
    typical_list_size: 500,
    open_rate_benchmark: 0.40,
  },
  saas: {
    newsletter_day: 'tuesday',
    abandoned_cart_delay_minutes: 20,
    typical_list_size: 3000,
    open_rate_benchmark: 0.28,
  },
};
