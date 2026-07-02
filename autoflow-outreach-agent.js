import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Industry ROI data — used to ground email copy in real numbers ──
const INDUSTRY_ROI = {
  'real estate':      { pain: 'slow lead follow-up losing listings to faster agents', roi: '3–5 extra listings/month from the same lead volume', avg_deal: '$8,000–$15,000 commission' },
  'dental':           { pain: 'appointment no-shows and empty chairs', roi: '30–40% fewer no-shows, $3,000–$8,000/month recovered', avg_deal: '$400 average appointment value' },
  'insurance':        { pain: 'manually chasing referrals and renewals', roi: '2x renewal retention, $4,000–$10,000/month in saved premiums', avg_deal: '$600 avg annual premium' },
  'law firm':         { pain: 'slow intake process losing cases to firms that respond faster', roi: '40–60% more retained consultations from existing inquiries', avg_deal: '$5,000–$25,000 per case' },
  'roofing':          { pain: 'chasing estimates that go cold', roi: '25–35% higher close rate on estimates already sent', avg_deal: '$12,000–$18,000 per roof' },
  'accounting':       { pain: 'tax season capacity wasted on admin and low-value clients', roi: 'filter and close 2–3 high-value clients/month on autopilot', avg_deal: '$4,000–$12,000 annual engagement' },
  'mortgage':         { pain: 'lost leads who went cold between pre-qual and offer', roi: 'recover 20–30% of leads that previously fell through', avg_deal: '$3,000–$6,000 origination fee' },
  'staffing':         { pain: 'losing candidates to faster-moving competitors', roi: '40% faster fill time, $2,000–$8,000 more placements/month', avg_deal: '$3,500 per placement' },
  'ecommerce':        { pain: 'abandoned carts and one-time buyers who never come back', roi: '15–25% cart recovery, 2x repeat purchase rate', avg_deal: 'depends on AOV' },
  'saas':             { pain: 'trial-to-paid conversion below 15%', roi: '8–12 point improvement in trial conversion with the right nurture', avg_deal: '$200–$1,000 ACV' },
  'gym':              { pain: 'leads who inquire once and never book a tour', roi: '35–50% more tour bookings from existing inbound traffic', avg_deal: '$600–$1,200 annual membership' },
  'restaurant':       { pain: 'no system to bring past customers back', roi: '20–30% increase in repeat visits via automated re-engagement', avg_deal: '$45–$80 per visit' },
  default:            { pain: 'slow manual follow-up losing deals to faster competitors', roi: 'recover 20–40% of leads that currently fall through the cracks', avg_deal: 'varies by business' },
};

function getIndustryROI(industry) {
  const key = Object.keys(INDUSTRY_ROI).find(k => industry.toLowerCase().includes(k)) || 'default';
  return INDUSTRY_ROI[key];
}

// ── Prompt builder ────────────────────────────────────────────────
function buildPrompt({ businessName, city, industry, website, additionalContext }) {
  const roi = getIndustryROI(industry);

  return `You are an expert cold email copywriter for AutoFlow — an AI automation agency that builds done-for-you lead follow-up and outreach systems for small businesses.

Write ONE cold outreach email for the following prospect:

Business: ${businessName}
Location: ${city}
Industry: ${industry}
Website: ${website || 'not provided'}
${additionalContext ? `Additional context: ${additionalContext}` : ''}

Industry context:
- Core pain: ${roi.pain}
- ROI we deliver: ${roi.roi}
- Their avg deal value: ${roi.avg_deal}

RULES — follow every one:
1. Subject line: 6–9 words max. Curiosity or outcome-driven. NO "I", NO "we", NO "AutoFlow". Examples: "3 more listings from leads you already have" or "How dental practices fill no-show slots same day". Make it specific to their industry or business name.
2. Opening sentence: Reference something REAL about their business or industry. NOT "I came across your website." NOT "I hope this finds you well." Start with an observation, a stat, or a pattern you've noticed in their space.
3. Body (3–5 short paragraphs): Lead with the cost of inaction (what they're losing right now). Name the specific mechanism (the automation system). Show the ROI with numbers. Keep each paragraph to 2–3 sentences max.
4. CTA: ONE ask. Make it low-friction (reply, not a call booking). Make it feel like a question, not a pitch. Examples: "Worth a 2-minute look?" or "Want me to show you exactly what it would do for ${businessName}?"
5. Signature: From "Njiru" — AutoFlow (no last name, no title)
6. NO bullet lists. NO headers. Flowing paragraphs only.
7. Total length: 120–180 words including subject.

Return your response in EXACTLY this format:
SUBJECT: [subject line here]
---
[email body here]`;
}

// ── Parse the model output ────────────────────────────────────────
function parseEmailOutput(text) {
  const lines = text.trim().split('\n');
  const subjectLine = lines.find(l => l.startsWith('SUBJECT:'));
  const subject = subjectLine ? subjectLine.replace('SUBJECT:', '').trim() : '';
  const dividerIdx = lines.findIndex(l => l.trim() === '---');
  const body = dividerIdx !== -1
    ? lines.slice(dividerIdx + 1).join('\n').trim()
    : lines.filter(l => !l.startsWith('SUBJECT:')).join('\n').trim();

  return { subject, body };
}

// ── Core: Generate a single outreach email ────────────────────────
export async function generateOutreachEmail({ businessName, city, industry, website = '', additionalContext = '' }) {
  const message = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 900,
    temperature: 0.85,
    messages: [{
      role: 'user',
      content: buildPrompt({ businessName, city, industry, website, additionalContext }),
    }],
  });

  const raw = message.content[0].text;
  const { subject, body } = parseEmailOutput(raw);

  return {
    subject,
    body,
    to_business: businessName,
    city,
    industry,
    input_tokens: message.usage.input_tokens,
    output_tokens: message.usage.output_tokens,
  };
}

// ── Batch: Generate emails for a list of prospects ────────────────
export async function generateBatch(prospects, { concurrency = 3, delayMs = 800 } = {}) {
  const results = [];
  const chunks = [];

  for (let i = 0; i < prospects.length; i += concurrency) {
    chunks.push(prospects.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    const chunkResults = await Promise.all(chunk.map(p => generateOutreachEmail(p)));
    results.push(...chunkResults);

    if (delayMs > 0 && chunks.indexOf(chunk) < chunks.length - 1) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  return results;
}

// ── Subject line variants: A/B test 3 angles ─────────────────────
export async function generateSubjectVariants({ businessName, city, industry }) {
  const roi = getIndustryROI(industry);

  const message = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 300,
    temperature: 0.95,
    messages: [{
      role: 'user',
      content: `Write 3 cold email subject lines for ${businessName} (${industry}, ${city}).

Their core pain: ${roi.pain}
ROI angle: ${roi.roi}

Each subject must be 6–9 words. Write 3 different angles:
1. Outcome-focused (what they gain)
2. Pain-focused (what they're losing)
3. Curiosity/pattern-interrupt

Return ONLY the 3 subject lines, one per line, numbered 1–3. No explanation.`,
    }],
  });

  return message.content[0].text
    .trim()
    .split('\n')
    .filter(l => l.trim())
    .map(l => l.replace(/^\d+\.\s*/, '').trim());
}

// ── CLI runner ────────────────────────────────────────────────────
if (process.argv[1].endsWith('autoflow-outreach-agent.js')) {
  const command = process.argv[2] || 'demo';

  if (command === 'demo') {
    console.log('\nAutoFlow Outreach Agent — claude-opus-4-8\n' + '─'.repeat(50));

    const demos = [
      { businessName: 'Dallas Real Estate Group', city: 'Dallas, TX', industry: 'real estate', website: 'dallasrealtygroup.com' },
      { businessName: 'Bright Smile Dental', city: 'Austin, TX', industry: 'dental' },
      { businessName: 'Apex Insurance Partners', city: 'Phoenix, AZ', industry: 'insurance' },
    ];

    for (const prospect of demos) {
      try {
        console.log(`\nGenerating email for ${prospect.businessName}...`);
        const email = await generateOutreachEmail(prospect);
        console.log(`\nSUBJECT: ${email.subject}`);
        console.log('─'.repeat(50));
        console.log(email.body);
        console.log(`\n[Tokens: ${email.input_tokens} in / ${email.output_tokens} out]`);
        console.log('─'.repeat(50));
      } catch (err) {
        console.error(`Error for ${prospect.businessName}: ${err.message}`);
      }
    }
  }

  if (command === 'subjects') {
    const industry = process.argv[3] || 'real estate';
    const businessName = process.argv[4] || 'Example Business';
    const city = process.argv[5] || 'Dallas, TX';

    console.log(`\nSubject line variants for ${businessName} (${industry}):\n`);
    const variants = await generateSubjectVariants({ businessName, city, industry });
    variants.forEach((v, i) => console.log(`  ${i + 1}. ${v}`));
    console.log();
  }
}
