// Customer Retention & Win-Back Automation — #5 Highest Demand Service
// Industries: E-commerce, SaaS, salons, restaurants, gyms, local services
// Price: $1,500-$2,500 build + $297-$497/mo retainer
// Sales cycle: 7-14 days (easy ROI: retaining existing customers costs 5x less than acquiring new ones)

export const SERVICE_ID = 'customer-retention';
export const SERVICE_NAME = 'Customer Retention & Win-Back';

export const sequences = {

  // Sequence 1: Win-back campaign for lapsed customers
  winback: {
    name: 'Lapsed Customer Win-Back',
    trigger: 'customer_inactive_days_threshold',
    steps: [
      {
        step: 1,
        delay_minutes: 0,
        channel: 'email',
        subject: '{{first_name}}, we miss you at {{business_name}}',
        body: `Hi {{first_name}},

We noticed it's been a while since we've seen you — {{days_since_last_visit}} days to be exact.

We've made some updates since your last visit that I think you'll love:
{{new_offerings_or_improvements}}

To make it easy to come back, here's {{winback_offer}} just for you.

{{cta_button_text}}: {{offer_link}}

This offer is good through {{offer_expiry}}.

We'd love to have you back,
{{owner_name}}
{{business_name}}`,
      },
      {
        step: 2,
        delay_days: 7,
        channel: 'email',
        condition: 'not_returned',
        subject: 'Your {{winback_offer}} expires soon, {{first_name}}',
        body: `Hi {{first_name}},

Just a heads up — the offer I sent last week expires in {{days_remaining}} days.

{{reminder_of_offer}}

Claim it here before it's gone: {{offer_link}}

{{owner_name}}`,
      },
      {
        step: 3,
        delay_days: 7,
        channel: 'sms',
        condition: 'not_returned',
        body: `{{first_name}}, last chance — your {{discount_amount}} off at {{business_name}} expires today. Use it here: {{offer_link}}`,
      },
      {
        step: 4,
        delay_days: 30,
        channel: 'email',
        condition: 'not_returned',
        subject: 'We haven\'t given up on you, {{first_name}}',
        body: `Hi {{first_name}},

I know the timing might not have been right before, but we haven't forgotten about you.

We're still here whenever you're ready, and we've got {{new_promotion_or_update}} that I think you'll want to see.

Check it out: {{link}}

No pressure — just wanted you to know we'd love to have you back.

{{owner_name}}`,
      },
    ],
  },

  // Sequence 2: Loyalty follow-up for active customers
  loyalty: {
    name: 'Loyalty & VIP Nurture',
    trigger: 'customer_reached_loyalty_threshold',
    steps: [
      {
        step: 1,
        delay_minutes: 0,
        channel: 'email',
        subject: '🏆 You\'re now a VIP, {{first_name}}',
        body: `Hi {{first_name}},

You've been an amazing customer and I wanted to take a moment to say thank you personally.

You've {{loyalty_milestone}} with us, which puts you in our top customers.

As a thank you, here's what you now get as a VIP:
✓ {{vip_perk_1}}
✓ {{vip_perk_2}}
✓ {{vip_perk_3}}

Your VIP access starts today: {{vip_portal_link}}

Thank you for your loyalty,
{{owner_name}}
{{business_name}}`,
      },
      {
        step: 2,
        delay_days: 30,
        channel: 'email',
        subject: 'VIP Early Access: {{upcoming_offer}}',
        body: `Hi {{first_name}},

As a VIP member, you get first access to {{upcoming_offer}} before we open it to the public.

Here are the details:
{{offer_details}}

Your exclusive link (valid for 48 hours): {{vip_link}}

After that, it goes to our general list.

{{owner_name}}`,
      },
    ],
  },

  // Sequence 3: Birthday & anniversary
  birthday_anniversary: {
    name: 'Birthday & Anniversary Campaigns',
    trigger: 'birthday_or_anniversary_minus_7_days',
    steps: [
      {
        step: 1,
        delay: 'birthday_minus_3_days',
        channel: 'email',
        subject: '🎂 Your birthday gift from {{business_name}}, {{first_name}}',
        body: `Hi {{first_name}},

Your birthday is coming up and we wanted to celebrate with you!

Here's a gift from us: {{birthday_offer}}

{{birthday_offer_details}}

Use it at any time during your birthday month: {{birthday_offer_link}}

Happy early birthday!
{{business_name}}`,
      },
      {
        step: 2,
        delay: 'customer_anniversary_date',
        channel: 'sms',
        body: `Happy anniversary, {{first_name}}! 🎉 It's been {{years_as_customer}} year(s) since you first came to {{business_name}}. Here's a little thank you: {{anniversary_offer_link}}`,
      },
    ],
  },

  // Sequence 4: Post-purchase nurture (prevent churn/returns)
  post_purchase: {
    name: 'Post-Purchase Nurture',
    trigger: 'purchase_completed',
    steps: [
      {
        step: 1,
        delay_days: 3,
        channel: 'email',
        subject: 'How\'s {{product_purchased}} working for you, {{first_name}}?',
        body: `Hi {{first_name}},

It's been a few days since you got {{product_purchased}} and I wanted to check in.

Here are a few tips to get the most out of it:
{{product_tips}}

If you have any questions or run into any issues, just reply to this email. I'm here.

{{owner_name}}`,
      },
      {
        step: 2,
        delay_days: 14,
        channel: 'email',
        subject: 'Quick check-in on {{product_purchased}}',
        body: `Hi {{first_name}},

Just checking in — how are things going with {{product_purchased}}?

Customers who've gotten the most out of it usually {{success_tip}}.

Also — customers who love {{product_purchased}} usually also love {{complementary_product}}. Might be worth a look: {{product_link}}

{{owner_name}}`,
      },
      {
        step: 3,
        delay_days: 30,
        channel: 'email',
        subject: 'It\'s been a month — here\'s what {{first_name}} should know',
        body: `Hi {{first_name}},

One month in with {{product_purchased}}!

{{monthly_check_in_content}}

Anything we can help with? Just reply here.

And if you've had a good experience, we'd really appreciate a quick review: {{review_link}}

{{owner_name}}`,
      },
    ],
  },
};

export const industryConfigs = {
  ecommerce: {
    winback_trigger_days: 60,
    loyalty_threshold: '3 purchases or $500 spent',
    top_win_back_offer: '20% off + free shipping',
  },
  salon: {
    winback_trigger_days: 45,
    loyalty_threshold: '10 visits',
    top_win_back_offer: '50% off next service',
  },
  gym: {
    winback_trigger_days: 21,
    loyalty_threshold: '6 months membership',
    top_win_back_offer: 'free personal training session',
  },
  restaurant: {
    winback_trigger_days: 30,
    loyalty_threshold: '10 visits or $500 spent',
    top_win_back_offer: 'free appetizer or dessert',
  },
};

export function renderTemplate(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `[${key}]`);
}
