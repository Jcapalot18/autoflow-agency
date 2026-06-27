// Appointment Booking Automation — #4 Highest Demand Service
// Industries: Medical, dental, salons, real estate, coaches, HVAC, auto repair
// Price: $1,000-$2,000 build + $197-$297/mo retainer
// Sales cycle: 5-10 days

export const SERVICE_ID = 'appointment-booking';
export const SERVICE_NAME = 'Appointment Booking Automation';

export const sequences = {

  // Sequence 1: Booking confirmation + reminder stack
  booking_reminders: {
    name: 'Appointment Confirmation & Reminders',
    trigger: 'appointment_booked',
    steps: [
      {
        step: 1,
        delay_minutes: 0,
        channel: 'email',
        subject: 'Confirmed: Your appointment with {{business_name}} — {{appointment_date}}',
        body: `Hi {{first_name}},

Your appointment is confirmed! Here are the details:

📅 Date: {{appointment_date}}
⏰ Time: {{appointment_time}}
📍 Location: {{business_address}}
👤 With: {{staff_name}}
📋 Service: {{service_type}}

What to bring / prepare:
{{preparation_notes}}

Need to reschedule? No problem:
👉 {{reschedule_link}}

See you soon,
{{business_name}}
{{phone}}`,
      },
      {
        step: 2,
        delay_minutes: 0,
        channel: 'sms',
        body: `Hi {{first_name}}! ✅ Confirmed with {{business_name}} on {{appointment_date}} at {{appointment_time}}. Add to calendar: {{calendar_link}} | Reschedule: {{reschedule_link}}`,
      },
      {
        step: 3,
        delay: 'appointment_minus_24_hours',
        channel: 'sms',
        body: `Reminder: You have an appointment with {{business_name}} tomorrow at {{appointment_time}}.

📍 {{business_address}}

Reply CONFIRM to confirm or CANCEL to cancel.`,
      },
      {
        step: 4,
        delay: 'appointment_minus_2_hours',
        channel: 'sms',
        condition: 'appointment_confirmed',
        body: `See you soon, {{first_name}}! Your appointment at {{business_name}} is in 2 hours at {{appointment_time}}.

Need directions? {{directions_link}}`,
      },
    ],
  },

  // Sequence 2: No-show recovery
  noshow_recovery: {
    name: 'No-Show Recovery Sequence',
    trigger: 'appointment_missed',
    steps: [
      {
        step: 1,
        delay_minutes: 30,
        channel: 'sms',
        body: `Hi {{first_name}}, we missed you at {{business_name}} today! Life happens — let's get you rescheduled: {{reschedule_link}}

Or call us at {{phone}}.`,
      },
      {
        step: 2,
        delay_hours: 24,
        channel: 'email',
        condition: 'not_rescheduled',
        subject: 'We missed you — ready to reschedule, {{first_name}}?',
        body: `Hi {{first_name}},

You had an appointment with us yesterday that you weren't able to make. No worries at all — we know things come up!

We still have time available and would love to get you in. Here are a few open spots:

{{available_slots}}

Or pick any time that works for you: {{reschedule_link}}

See you soon,
{{business_name}}`,
      },
      {
        step: 3,
        delay_days: 5,
        channel: 'email',
        condition: 'not_rescheduled',
        subject: 'Still here when you\'re ready, {{first_name}}',
        body: `Hi {{first_name}},

Just a friendly check-in — we still have your spot reserved and would love to see you.

Whenever you're ready: {{reschedule_link}}

{{owner_name}}
{{business_name}}`,
      },
    ],
  },

  // Sequence 3: Rebooking / retention after completed appointment
  rebooking: {
    name: 'Post-Appointment Rebooking',
    trigger: 'appointment_completed',
    steps: [
      {
        step: 1,
        delay_hours: 4,
        channel: 'sms',
        body: `Hi {{first_name}}, thanks for coming in today! How did everything go? Reply 1-10.`,
      },
      {
        step: 2,
        delay_days: 14,
        channel: 'sms',
        condition: 'no_future_appointment_booked',
        body: `Hi {{first_name}}! It's been a couple weeks since your visit to {{business_name}}. Time to book your next appointment? We have openings this week: {{booking_link}}`,
      },
      {
        step: 3,
        delay_days: 30,
        channel: 'email',
        condition: 'no_future_appointment_booked',
        subject: 'Time for your next {{service_type}} appointment?',
        body: `Hi {{first_name}},

Based on your last visit on {{last_appointment_date}}, it might be time to schedule your next {{service_type}}.

{{rebooking_reason}}

Here's a link to book whenever works best for you:
{{booking_link}}

See you soon,
{{business_name}}`,
      },
    ],
  },

  // Sequence 4: Waitlist notification
  waitlist: {
    name: 'Cancellation Slot Notification',
    trigger: 'appointment_cancelled_slot_opened',
    steps: [
      {
        step: 1,
        delay_minutes: 5,
        channel: 'sms',
        body: `Good news, {{first_name}}! A spot just opened up at {{business_name}} on {{available_date}} at {{available_time}}. Want it? Reply YES to claim it before someone else does.`,
      },
      {
        step: 2,
        delay_minutes: 30,
        channel: 'email',
        condition: 'no_reply',
        subject: 'Slot still available — {{available_date}} at {{available_time}}',
        body: `Hi {{first_name}},

You're on our waitlist and a spot just opened up:

📅 {{available_date}} at {{available_time}}

This usually fills within a few hours. Claim it here: {{claim_slot_link}}

{{business_name}}`,
      },
    ],
  },
};

export const industryConfigs = {
  medical: {
    reminder_hours: [48, 24, 2],
    cancellation_policy: '24-hour notice required',
    rebooking_days: 90,
  },
  salon: {
    reminder_hours: [24, 2],
    cancellation_policy: '12-hour notice required',
    rebooking_days: 42,
  },
  dental: {
    reminder_hours: [72, 24, 2],
    cancellation_policy: '48-hour notice required',
    rebooking_days: 180,
  },
  coach: {
    reminder_hours: [24, 1],
    cancellation_policy: '24-hour notice required',
    rebooking_days: 30,
  },
};

export function renderTemplate(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `[${key}]`);
}
