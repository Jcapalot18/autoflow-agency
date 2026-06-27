// HR & Hiring Automation — #7 Highest Demand Service
// Industries: Healthcare, restaurants, construction, staffing agencies, retail, logistics
// Price: $2,000-$4,000 build + $397-$597/mo retainer
// Sales cycle: 14-30 days (budget approval needed, but urgent pain during hiring surges)

export const SERVICE_ID = 'hr-hiring';
export const SERVICE_NAME = 'HR & Hiring Automation';

export const sequences = {

  // Sequence 1: Job application acknowledgment + screening
  application_intake: {
    name: 'Application Received + Initial Screen',
    trigger: 'new_job_application',
    steps: [
      {
        step: 1,
        delay_minutes: 5,
        channel: 'email',
        subject: 'We received your application for {{job_title}}, {{first_name}}',
        body: `Hi {{first_name}},

Thank you for applying for the {{job_title}} position at {{company_name}}.

We've received your application and our team is reviewing it now. Here's what to expect:

📋 Step 1: Application review ({{review_timeframe}})
📞 Step 2: Phone screen ({{phone_screen_timeframe}})
👥 Step 3: Interview with the team
✅ Step 4: Decision and offer

We'll be in touch soon. In the meantime, feel free to learn more about us: {{company_about_link}}

{{hiring_manager_name}}
{{company_name}} Hiring Team`,
      },
      {
        step: 2,
        delay_hours: 1,
        channel: 'email',
        subject: 'One quick question, {{first_name}} — {{job_title}} at {{company_name}}',
        body: `Hi {{first_name}},

Before we schedule anything, I have a few quick screening questions to make sure this role is a great fit for you:

1. {{screening_question_1}}
2. {{screening_question_2}}
3. {{screening_question_3}}

Just reply to this email with your answers — should take less than 5 minutes.

{{hiring_manager_name}}`,
      },
    ],
  },

  // Sequence 2: Candidate outreach (sourced candidates, not inbound)
  candidate_outreach: {
    name: 'Sourced Candidate Outreach',
    trigger: 'candidate_added_to_pipeline',
    steps: [
      {
        step: 1,
        delay_minutes: 0,
        channel: 'email',
        subject: '{{first_name}}, quick question about your career',
        body: `Hi {{first_name}},

I came across your profile and was impressed by {{personalized_observation}}.

We're hiring a {{job_title}} at {{company_name}} and I think it could be a strong fit for where you're headed.

Quick overview of the role:
• {{role_highlight_1}}
• {{role_highlight_2}}
• {{compensation_range}}

Is this something worth 15 minutes to explore? Here's a link to the full job description: {{jd_link}}

{{recruiter_name}}
{{company_name}}`,
      },
      {
        step: 2,
        delay_days: 3,
        channel: 'email',
        condition: 'no_reply',
        subject: 'Re: {{job_title}} at {{company_name}}',
        body: `Hi {{first_name}},

Bumping this up — I know things get busy.

We're moving quickly on this role and I didn't want you to miss the window if there was interest.

Is this worth a 15-minute chat? {{calendar_link}}

{{recruiter_name}}`,
      },
      {
        step: 3,
        delay_days: 5,
        channel: 'email',
        condition: 'no_reply',
        subject: 'Last reach out — {{job_title}}',
        body: `Hi {{first_name}},

I won't keep filling your inbox. Last note on this.

If the timing is ever right, we'd love to connect. Here's the job description in case you ever want to revisit it: {{jd_link}}

{{recruiter_name}}`,
      },
    ],
  },

  // Sequence 3: Interview scheduling
  interview_scheduling: {
    name: 'Interview Scheduling & Reminders',
    trigger: 'candidate_moved_to_interview_stage',
    steps: [
      {
        step: 1,
        delay_minutes: 0,
        channel: 'email',
        subject: 'Great news, {{first_name}} — you\'re moving to the next round',
        body: `Hi {{first_name}},

Great news — we'd like to move forward with an interview for the {{job_title}} position!

Here are a few times that work on our end:
{{available_slots}}

Or pick any time here: {{scheduling_link}}

Interview format: {{interview_format}}
Duration: {{interview_duration}}
Who you'll meet: {{interviewers}}
{{video_link_or_address}}

Anything you need before then, just reply here.

{{hiring_manager_name}}`,
      },
      {
        step: 2,
        delay: 'interview_minus_24_hours',
        channel: 'email',
        subject: 'See you tomorrow, {{first_name}} — interview reminder',
        body: `Hi {{first_name}},

Quick reminder about your interview tomorrow:

📅 {{interview_date}} at {{interview_time}}
👤 With: {{interviewers}}
📍 {{location_or_video_link}}

A few things to know:
{{preparation_notes}}

See you tomorrow!
{{hiring_manager_name}}`,
      },
      {
        step: 3,
        delay: 'interview_minus_1_hour',
        channel: 'sms',
        body: `Hi {{first_name}}, your interview with {{company_name}} starts in 1 hour. Join link: {{video_link}} — good luck! 🎯`,
      },
    ],
  },

  // Sequence 4: Post-interview follow-up
  post_interview: {
    name: 'Post-Interview Follow-Up',
    trigger: 'interview_completed',
    steps: [
      {
        step: 1,
        delay_hours: 2,
        channel: 'email',
        subject: 'Thank you, {{first_name}} — next steps for {{job_title}}',
        body: `Hi {{first_name}},

Thank you for taking the time to interview with us today. It was great to learn more about your background.

Here's what to expect next:
{{next_steps_description}}

Timeline: We'll be in touch by {{decision_date}}.

In the meantime, please don't hesitate to reach out if you have any questions.

{{hiring_manager_name}}
{{company_name}}`,
      },
      {
        step: 2,
        delay: 'decision_date_minus_1_day',
        channel: 'email',
        condition: 'no_decision_sent',
        subject: 'Update on {{job_title}} position, {{first_name}}',
        body: `Hi {{first_name}},

I wanted to reach out because I know you're waiting to hear from us on the {{job_title}} role.

We're still in the process of making our final decision and I expect to have an update for you by {{updated_date}}.

Thank you for your patience — I appreciate it.

{{hiring_manager_name}}`,
      },
    ],
  },

  // Sequence 5: Offer and onboarding
  offer_and_onboarding: {
    name: 'Offer Letter & Onboarding',
    trigger: 'candidate_selected',
    steps: [
      {
        step: 1,
        delay_minutes: 0,
        channel: 'email',
        subject: '🎉 Offer Letter — {{job_title}} at {{company_name}}',
        body: `Hi {{first_name}},

We're thrilled to offer you the {{job_title}} position at {{company_name}}!

Here are the details:
• Start date: {{start_date}}
• Compensation: {{compensation}}
• Benefits: {{benefits_summary}}
• Reporting to: {{manager_name}}

Please review the attached offer letter and sign by {{offer_expiry_date}}.

Sign here: {{offer_signing_link}}

We're so excited to have you join the team. Welcome aboard!

{{hiring_manager_name}}
{{company_name}}`,
      },
      {
        step: 2,
        delay: 'start_date_minus_7_days',
        channel: 'email',
        subject: 'Getting ready for your first day, {{first_name}}',
        body: `Hi {{first_name}},

One week until your start date! Here's everything you need to know:

📅 Start date: {{start_date}}
⏰ First day start time: {{start_time}}
📍 Where to go: {{first_day_location}}
👤 Who to ask for: {{first_day_contact}}

Before your first day, please complete:
{{pre_onboarding_checklist}}

Any questions? Reply here or call {{hr_phone}}.

See you on {{start_date}}!
{{hiring_manager_name}}`,
      },
    ],
  },
};

export const jobBoardIntegrations = ['LinkedIn', 'Indeed', 'ZipRecruiter', 'Workable', 'Greenhouse'];

export function renderTemplate(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `[${key}]`);
}
