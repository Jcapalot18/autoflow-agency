const ALLOWED_ORIGINS = new Set([
  'https://autoflow-agency-eight.vercel.app',
  'http://localhost:3000',
]);

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : ALLOWED_ORIGINS.values().next().value,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Hard caps on user-supplied text — these are forwarded straight into the
// Anthropic prompt and stored in the DB. Without a limit, a single request
// with a huge `name`/`industry` string would inflate Anthropic input-token
// cost and could blow past the model's context window with attacker-
// controlled data.
const MAX_NAME_LEN = 100;
const MAX_INDUSTRY_LEN = 60;
const MAX_EMAIL_LEN = 254; // RFC 5321 max mailbox length

function getClientIp(req: Request): string | null {
  // Supabase Edge Functions run behind a proxy — x-forwarded-for is the
  // standard way to get the real client IP. Take the first (client) hop.
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip');
}

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
  const data = getIndustryData(industry);

  const prompt = `You are AutoFlow — an AI automation agency. Generate a custom 1-page automation blueprint for ${name}, who runs a ${industry} business.

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

Keep it tight — specific, concrete, no fluff. Total length: 350–450 words.`;

  const aiResp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-fable-5',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const aiText = await aiResp.text();
  if (!aiResp.ok) {
    throw new Error(`Anthropic API error ${aiResp.status}: ${aiText}`);
  }

  const aiJson = JSON.parse(aiText);
  // claude-fable-5 returns thinking blocks before text blocks — find the text one
  const textBlock = aiJson.content?.find((c: { type: string }) => c.type === 'text');
  if (!textBlock?.text) {
    throw new Error(`Unexpected AI response: ${aiText.substring(0, 300)}`);
  }
  return textBlock.text as string;
}

// Reject if this email already submitted a request in the last 60 seconds —
// cheap abuse guard using the existing blueprints table (this function has
// no other rate limiting and would otherwise let anyone spam paid
// Anthropic + Resend calls at no cost to themselves).
async function wasRecentlySubmitted(email: string): Promise<boolean> {
  const dbUrl = Deno.env.get('DB_URL')!;
  const dbKey = Deno.env.get('DB_SERVICE_KEY')!;
  const since = new Date(Date.now() - 60 * 1000).toISOString();

  const resp = await fetch(
    `${dbUrl}/rest/v1/blueprints?email=eq.${encodeURIComponent(email)}&created_at=gte.${encodeURIComponent(since)}&select=id&limit=1`,
    { headers: { 'apikey': dbKey, 'Authorization': `Bearer ${dbKey}` } }
  );
  if (!resp.ok) return false; // fail open — don't block legitimate submissions on a check failure
  const rows = await resp.json();
  return Array.isArray(rows) && rows.length > 0;
}

// Reject if this IP has already made several requests in the last hour —
// closes the gap where an attacker rotates email addresses from one IP to
// get around the per-email guard above and still spam paid API calls.
async function ipRateLimited(ip: string | null): Promise<boolean> {
  if (!ip) return false; // no IP available — fail open, nothing to key on
  const dbUrl = Deno.env.get('DB_URL')!;
  const dbKey = Deno.env.get('DB_SERVICE_KEY')!;
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const IP_LIMIT_PER_HOUR = 5;

  const resp = await fetch(
    `${dbUrl}/rest/v1/blueprints?ip_address=eq.${encodeURIComponent(ip)}&created_at=gte.${encodeURIComponent(since)}&select=id&limit=${IP_LIMIT_PER_HOUR}`,
    { headers: { 'apikey': dbKey, 'Authorization': `Bearer ${dbKey}` } }
  );
  if (!resp.ok) return false; // fail open — don't block legitimate submissions on a check failure
  const rows = await resp.json();
  return Array.isArray(rows) && rows.length >= IP_LIMIT_PER_HOUR;
}

async function saveToDb(name: string, email: string, industry: string, blueprint: string, ip: string | null): Promise<void> {
  const dbUrl = Deno.env.get('DB_URL')!;
  const dbKey = Deno.env.get('DB_SERVICE_KEY')!;

  const dbResp = await fetch(`${dbUrl}/rest/v1/blueprints`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': dbKey,
      'Authorization': `Bearer ${dbKey}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ name, email, industry, blueprint_content: blueprint, ip_address: ip }),
  });

  if (!dbResp.ok) {
    const errText = await dbResp.text();
    console.error(`DB insert error ${dbResp.status}: ${errText}`);
  }
}

async function sendBlueprintEmail(name: string, email: string, industry: string, blueprint: string): Promise<void> {
  const escapedBlueprint = blueprint.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
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
      <pre style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; color: #e8eaf0; line-height: 1.75; white-space: pre-wrap; margin: 0;">${escapedBlueprint}</pre>
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
  const CORS = corsHeaders(req);

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

    if (
      !name || !email || !industry || !EMAIL_RE.test(email) ||
      typeof name !== 'string' || typeof industry !== 'string' || typeof email !== 'string' ||
      name.length > MAX_NAME_LEN || industry.length > MAX_INDUSTRY_LEN || email.length > MAX_EMAIL_LEN
    ) {
      return new Response(JSON.stringify({ error: 'A valid name, email, and industry are required' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const ip = getClientIp(req);

    if (await wasRecentlySubmitted(email)) {
      return new Response(JSON.stringify({ error: 'A blueprint was already requested for this email. Try again in a minute.' }), {
        status: 429, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    if (await ipRateLimited(ip)) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const blueprint = await generateBlueprint(name, industry);

    await saveToDb(name, email, industry, blueprint, ip);

    await sendBlueprintEmail(name, email, industry, blueprint);

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('send-blueprint error:', msg);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
