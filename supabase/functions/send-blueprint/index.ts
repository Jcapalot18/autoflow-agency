import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.55.0';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const INDUSTRY_ROI: Record<string, { pain: string; roi: string; systems: string[] }> = {
  'Real Estate': {
    pain: 'losing listings to agents who respond faster',
    roi: '3–5 extra listings/month from the same lead volume',
    systems: ['Lead Follow-Up (2-minute auto-response)', 'CRM Automation (auto-tag and score leads)', 'Email Marketing (past client re-engagement)', 'Reputation Management (auto-request Google reviews after close)'],
  },
  'Dental / Medical': {
    pain: 'no-shows and empty appointment slots costing $400+ per chair hour',
    roi: '30–40% fewer no-shows, $3,000–$8,000/month recovered',
    systems: ['Appointment Reminders (24h + 2h SMS/email)', 'Review Automation (post-visit Google review request)', 'Lead Follow-Up (new patient inquiry response in 2 min)', 'Win-Back (re-engage patients who haven\'t been in 12+ months)'],
  },
  'Insurance': {
    pain: 'manually chasing renewals and referrals — most are late or missed',
    roi: '2x renewal retention rate, $4,000–$10,000/month saved from prevented lapses',
    systems: ['Renewal Reminder Sequence (90/60/30/7 day drip)', 'Referral Ask Automation (automated ask at day 45)', 'Lead Follow-Up (quote request response in 2 min)', 'CRM Automation (auto-tag by policy type and renewal date)'],
  },
  'Law Firm': {
    pain: 'slow intake losing cases to firms that respond within 5 minutes',
    roi: '40–60% more retained consultations from the same inquiry volume',
    systems: ['Lead Follow-Up (2-minute intake response)', 'Consultation Booking Automation (confirm + reminder sequence)', 'Email Nurture (educate and qualify before consult)', 'CRM Automation (case type tagging and pipeline tracking)'],
  },
  'Roofing / Contractors': {
    pain: 'estimates going cold — most homeowners hire whoever follows up first',
    roi: '25–35% higher close rate on estimates already sent',
    systems: ['Estimate Follow-Up (day 1/3/7 automated follow-up)', 'Lead Response (new inquiry response in 2 min)', 'Reputation Automation (review request after project complete)', 'Seasonal Re-Engagement (winter prep, spring check-up campaigns)'],
  },
  'Accounting / CPA': {
    pain: 'tax season bottlenecks from chasing documents and following up on proposals',
    roi: 'filter and close 2–3 high-value clients/month without manual outreach',
    systems: ['Lead Follow-Up (prospect response automation)', 'Document Request Sequences (automated reminders)', 'Client Retention (quarterly check-in automation)', 'Referral Ask (automated ask at post-tax-season high point)'],
  },
  'Mortgage': {
    pain: 'leads going cold between pre-qual and offer — competitors close them first',
    roi: 'recover 20–30% of leads that previously fell through',
    systems: ['Lead Response (rate inquiry response in 2 min)', 'Pre-Approval Nurture (weekly market update drip)', 'Referral Automation (post-close referral ask to realtor + buyer)', 'CRM Tagging (auto-segment by loan type and stage)'],
  },
  'Staffing / Recruiting': {
    pain: 'losing candidates to faster-moving agencies — top candidates accept within 48 hours',
    roi: '40% faster fill time, $2,000–$8,000 more placements/month',
    systems: ['Candidate Follow-Up (application acknowledgement + next steps in 5 min)', 'Client Lead Automation (new job order follow-up sequence)', 'Placement Confirmation Sequence (day 1/7/30 check-in)', 'Talent Re-Engagement (re-engage placed candidates at 6 months)'],
  },
  'E-commerce': {
    pain: 'abandoned carts and one-time buyers who never come back',
    roi: '15–25% cart recovery, 2x repeat purchase rate',
    systems: ['Abandoned Cart Recovery (30 min / 24h / 72h sequence)', 'Post-Purchase Win-Back (day 30/60/90 re-engagement)', 'VIP Loyalty Sequence (top 10% buyer program)', 'Browse Abandonment (viewed but didn\'t add to cart)'],
  },
  'SaaS / Software': {
    pain: 'trial users churning before they experience the core value moment',
    roi: '8–12 point improvement in trial-to-paid conversion',
    systems: ['Trial Onboarding Drip (value-focused day 1/3/7/14)', 'Feature Adoption Sequence (trigger on non-usage at day 5)', 'Churn Risk Intervention (auto-flag and outreach at low usage)', 'Win-Back Automation (3-step sequence for cancelled accounts)'],
  },
  'Gym / Fitness': {
    pain: 'leads who inquire once and never book a tour or trial',
    roi: '35–50% more tour bookings from existing inbound traffic',
    systems: ['Lead Response (inquiry to tour booking in 2 min)', 'Trial Member Nurture (day 1/3/7/14 check-in sequence)', 'Membership Win-Back (cancelled member 30/60/90 day sequence)', 'Referral Ask (automated member referral program)'],
  },
  'Restaurant / Hospitality': {
    pain: 'no system to bring past customers back — most guests only visit once',
    roi: '20–30% increase in repeat visits via automated re-engagement',
    systems: ['Birthday/Anniversary Campaign (automated SMS/email offer)', 'Win-Back Campaign (customers who haven\'t visited in 60 days)', 'Review Automation (post-visit Google/Yelp review request)', 'VIP Program (top spenders auto-enrolled in loyalty offers)'],
  },
};

function getIndustryData(industry: string) {
  return INDUSTRY_ROI[industry] || {
    pain: 'manual follow-up losing deals to faster competitors',
    roi: 'recover 20–40% of leads that fall through the cracks',
    systems: ['Lead Follow-Up Automation', 'Email Marketing Automation', 'CRM Automation', 'Reputation Management'],
  };
}

async function generateBlueprint(name: string, industry: string): Promise<string> {
  const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });
  const data = getIndustryData(industry);

  const message = await client.messages.create({
    model: 'claude-fable-5',
    max_tokens: 1200,
    messages: [{
      role: 'user',
      content: `You are AutoFlow — an AI automation agency. Generate a custom 1-page automation blueprint for ${name}, who runs a ${industry} business.

Industry pain: ${data.pain}
Expected ROI: ${data.roi}
Top automation systems for this industry: ${data.systems.join(', ')}

Write the blueprint as a professional plain-text document with these sections:

AUTOFLOW AUTOMATION BLUEPRINT
${industry} — Custom Build for ${name}

THE #1 THING COSTING YOUR BUSINESS RIGHT NOW:
[2–3 sentences on the specific dollar cost of ${data.pain}. Be specific and concrete.]

THE 4 AUTOMATIONS WE'D BUILD FOR YOU:
[List the 4 systems from above, one per line. For each: System Name — one sentence on what it does and what it saves/generates for a ${industry} business specifically.]

WHAT HAPPENS IN THE FIRST 30 DAYS:
[Week 1: what gets built. Week 2: what goes live. Week 3-4: what results appear. Be specific to ${industry}.]

THE ROI MATH:
[Show the specific math. E.g., if X leads/month at Y% conversion improvement = Z extra revenue. Ground it in ${data.roi}.]

YOUR NEXT STEP:
Reply to this email with "Let's build it" and we'll schedule a 30-minute build call. No pitch. We'll spec out exactly what we'd build for ${name} and give you a fixed quote.

— Njiru, AutoFlow

Keep it tight — specific, concrete, no fluff. Total length: 350–450 words.`,
    }],
  });

  return (message.content[0] as { type: string; text: string }).text;
}

async function sendBlueprintEmail(name: string, email: string, industry: string, blueprint: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    },
    body: JSON.stringify({
      from: 'AutoFlow <njirus@cybrshieldtech.com>',
      to: [email],
      subject: `Your free ${industry} automation blueprint`,
      text: `Hi ${name},\n\nHere's the custom automation blueprint you requested.\n\n${blueprint}\n\n---\nAutoFlow — AI Automation Agency\nhttps://autoflow-agency-eight.vercel.app`,
      html: `<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #080b12; color: #e8eaf0; padding: 0;">
  <div style="background: #0d1120; border-bottom: 2px solid #FF6B00; padding: 24px 32px;">
    <p style="font-size: 22px; font-weight: 800; color: #fff; margin: 0;">Auto<span style="color: #FF6B00;">Flow</span></p>
    <p style="color: #8892a4; font-size: 13px; margin: 4px 0 0;">AI Automation Agency</p>
  </div>
  <div style="padding: 32px;">
    <p style="color: #e8eaf0; font-size: 15px; margin: 0 0 24px;">Hi ${name},</p>
    <p style="color: #e8eaf0; font-size: 15px; margin: 0 0 24px;">Here's the custom automation blueprint for your ${industry} business.</p>
    <div style="background: #0d1120; border: 1px solid rgba(255,107,0,0.25); border-radius: 12px; padding: 28px 32px; margin-bottom: 24px;">
      <pre style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; color: #e8eaf0; line-height: 1.75; white-space: pre-wrap; margin: 0;">${blueprint.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </div>
    <p style="color: #8892a4; font-size: 13px; line-height: 1.7; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; margin: 0;">
      AutoFlow — AI Automation Agency<br>
      Powered by CyberShield Tech<br>
      <a href="https://autoflow-agency-eight.vercel.app" style="color: #FF6B00;">autoflow-agency-eight.vercel.app</a>
    </p>
  </div>
</div>`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { name, email, industry } = await req.json();

    if (!name || !email || !industry) {
      return new Response(JSON.stringify({ error: 'name, email, and industry are required' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const blueprint = await generateBlueprint(name, industry);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_KEY')!,
    );

    const { error: dbError } = await supabase.from('blueprints').insert({
      name,
      email,
      industry,
      blueprint_content: blueprint,
      created_at: new Date().toISOString(),
    });

    if (dbError) console.error('DB insert error:', dbError.message);

    await sendBlueprintEmail(name, email, industry, blueprint);

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('send-blueprint error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
