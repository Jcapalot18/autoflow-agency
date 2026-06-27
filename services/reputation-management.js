// Reputation Management Automation — #2 Highest Demand Service
// Industries: Restaurants, dental/medical, home services, auto repair, salons
// Price: $1,500-$2,500 build + $297-$497/mo retainer
// Sales cycle: 3-5 days (pain is visible on Google Maps before the call)

export const SERVICE_ID = 'reputation-management';
export const SERVICE_NAME = 'Reputation & Review Management';

// ── Email/SMS Sequences ───────────────────────────────────────────

export const sequences = {

  // Sequence 1: Post-service review request
  review_request: {
    name: 'Post-Service Review Request',
    trigger: 'job_completed_or_visit_ended',
    steps: [
      {
        step: 1,
        delay_hours: 2,
        channel: 'sms',
        body: `Hi {{first_name}}! Thanks for choosing {{business_name}} today. How did everything go? Reply with a number 1-10 and we'll make sure you're taken care of.`,
        goal: 'internal satisfaction score before asking for public review',
      },
      {
        step: 2,
        delay_hours: 1,
        channel: 'sms',
        condition: 'score_8_or_above',
        body: `Awesome, so glad to hear it! If you have 60 seconds, an honest Google review would mean the world to us — it helps other families find us: {{google_review_link}}

Thanks again, {{first_name}}! 🙏`,
      },
      {
        step: 3,
        delay_hours: 1,
        channel: 'sms',
        condition: 'score_7_or_below',
        body: `Thanks for letting us know, {{first_name}}. We take every experience seriously. Can I have someone call you today to make it right? Just reply YES and I'll have {{owner_name}} call you within the hour.`,
        goal: 'intercept unhappy customers before they leave a bad review',
      },
      {
        step: 4,
        delay_days: 3,
        channel: 'email',
        condition: 'no_reply_to_step_1',
        subject: 'How was your experience with {{business_name}}?',
        body: `Hi {{first_name}},

Thank you for choosing {{business_name}}! We hope everything went well.

If you have a moment, we'd love to hear about your experience. It only takes 60 seconds:

👉 Leave us a Google review: {{google_review_link}}

Your feedback helps us serve our community better — and helps other people find us when they need {{service_type}}.

Thank you,
{{owner_name}}
{{business_name}}
{{phone}}`,
      },
    ],
  },

  // Sequence 2: Negative review response workflow
  negative_review_response: {
    name: 'Negative Review Alert & Response',
    trigger: 'new_review_below_4_stars',
    steps: [
      {
        step: 1,
        delay_minutes: 5,
        channel: 'email',
        recipient: 'business_owner',
        subject: '⚠️ New {{star_count}}-star review on Google — action needed',
        body: `New review just posted on your Google listing:

Reviewer: {{reviewer_name}}
Rating: {{star_count}} ⭐
Posted: {{review_date}}

Review text:
"{{review_text}}"

Suggested response (review and personalize before posting):
---
Hi {{reviewer_name}},

Thank you for taking the time to share your experience. I'm {{owner_name}}, the owner of {{business_name}}, and I want to personally apologize that we didn't meet your expectations.

{{personalized_response_based_on_review}}

I'd love the opportunity to make this right. Please reach out to me directly at {{owner_email}} or {{phone}} so I can take care of you personally.

{{owner_name}}
{{business_name}}
---

Post this response on Google within 24 hours for best results.
Respond here: {{google_reviews_link}}`,
      },
      {
        step: 2,
        delay_hours: 4,
        channel: 'sms',
        recipient: 'business_owner',
        condition: 'no_response_posted',
        body: `Reminder: A {{star_count}}-star Google review from {{reviewer_name}} needs a response. Responding within 24 hours can turn this around. Login: {{google_reviews_link}}`,
      },
    ],
  },

  // Sequence 3: Monthly review push (for clients with <4.5 star average)
  review_push_campaign: {
    name: 'Monthly Review Boost Campaign',
    trigger: 'monthly_scheduled',
    steps: [
      {
        step: 1,
        delay_minutes: 0,
        channel: 'email',
        subject: '{{first_name}}, you helped us — can we ask one small favor?',
        body: `Hi {{first_name}},

You came in to see us {{days_since_visit}} days ago and we've been thinking about you since.

If we did a good job, would you mind taking 60 seconds to leave us a Google review? It genuinely helps our small business more than you know.

Here's the link: {{google_review_link}}

And if anything wasn't perfect, just reply to this email — I want to know personally.

Thank you,
{{owner_name}}
{{business_name}}`,
      },
    ],
  },

  // Sequence 4: Win unhappy customer back before they churn/review
  recovery_sequence: {
    name: 'Unhappy Customer Recovery',
    trigger: 'low_satisfaction_score_received',
    steps: [
      {
        step: 1,
        delay_minutes: 30,
        channel: 'call_scheduled',
        recipient: 'business_owner',
        note: 'Schedule owner callback within 1 hour of bad score',
      },
      {
        step: 2,
        delay_hours: 2,
        channel: 'sms',
        condition: 'no_owner_callback_made',
        body: `Hi {{first_name}}, this is {{owner_name}} from {{business_name}}. I heard your experience wasn't what you expected and I want to personally make it right. Can I call you at {{customer_phone}} in the next hour? Or reply here.`,
      },
      {
        step: 3,
        delay_days: 2,
        channel: 'email',
        condition: 'issue_unresolved',
        subject: 'Still thinking about your experience at {{business_name}}',
        body: `Hi {{first_name}},

I know I reached out a couple days ago and I don't want to bother you — but I genuinely want to make sure you leave our business happy.

Here's what I'd like to offer: {{recovery_offer}}.

No strings attached. Just reply to this email or call {{phone}} and we'll take care of it.

{{owner_name}}`,
      },
    ],
  },
};

// ── Review Platform Configs ───────────────────────────────────────

export const platforms = {
  google: {
    name: 'Google Business Profile',
    review_url_template: 'https://g.page/r/{{place_id}}/review',
    monitoring_api: 'google_my_business_api',
    weight: 0.7,
  },
  yelp: {
    name: 'Yelp',
    monitoring_api: 'yelp_fusion_api',
    weight: 0.2,
  },
  facebook: {
    name: 'Facebook',
    monitoring_api: 'facebook_graph_api',
    weight: 0.1,
  },
};

// ── Industry Configs ──────────────────────────────────────────────

export const industryConfigs = {
  restaurant: {
    trigger_event: 'meal_completed',
    delay_hours: 1,
    recovery_offer: 'a complimentary dessert on your next visit',
    avg_reviews_needed: 50,
  },
  dental: {
    trigger_event: 'appointment_completed',
    delay_hours: 3,
    recovery_offer: 'a complimentary cleaning at your next visit',
    avg_reviews_needed: 30,
  },
  hvac: {
    trigger_event: 'job_closed',
    delay_hours: 2,
    recovery_offer: 'a free filter replacement on your next service call',
    avg_reviews_needed: 20,
  },
  auto_repair: {
    trigger_event: 'vehicle_picked_up',
    delay_hours: 2,
    recovery_offer: 'a free oil change on your next visit',
    avg_reviews_needed: 40,
  },
  salon: {
    trigger_event: 'appointment_completed',
    delay_hours: 1,
    recovery_offer: '20% off your next appointment',
    avg_reviews_needed: 25,
  },
};

export function renderTemplate(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `[${key}]`);
}
