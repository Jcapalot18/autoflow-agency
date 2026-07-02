import 'dotenv/config';
import cron from 'node-cron';
import { TwitterApi } from 'twitter-api-v2';

// ── Config ────────────────────────────────────────────────────────
const LINKEDIN_TOKEN    = process.env.LINKEDIN_ACCESS_TOKEN;
const LINKEDIN_PERSON   = process.env.LINKEDIN_PERSON_URN;  // urn:li:person:XXXXX

function getTwitterClient() {
  if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET) return null;
  return new TwitterApi({
    appKey:       process.env.TWITTER_API_KEY,
    appSecret:    process.env.TWITTER_API_SECRET,
    accessToken:  process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });
}

// ── Week number helper — drives content rotation ──────────────────
function getISOWeek() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const w1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - w1.getTime()) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7);
}

// ── Posting cycle — 3 posts every 2 weeks: Mon W1, Wed W1, Mon W2 ──
// Odd ISO weeks are week 1 of the cycle (Monday + Wednesday post),
// even ISO weeks are week 2 (Monday only).
function isCycleWeek1() {
  return getISOWeek() % 2 === 1;
}

// ── Content Bank — 8 variations per day (8-week rotation) ─────────
const CONTENT = {

  // ── MONDAY 9am — CyberShield security ───────────────────────
  monday: {
    brand: 'CyberShield',
    hashtags: '#CyberSecurity #SmallBusiness #DataBreach #CyberShield #InfoSec',
    posts: [
      {
        hook: '43% of cyberattacks target small businesses.',
        body: `And most don't find out until it's too late.

Your competitors are getting hacked right now. Not because they're careless — because they think they're too small to be a target.

That's exactly what hackers count on.

CyberShield scans your entire attack surface in 60 seconds. Vulnerabilities. Exposed ports. Outdated SSL. Everything.`,
        cta: 'Drop SCAN in the comments and I\'ll show you how it works.',
      },
      {
        hook: 'A single data breach costs small businesses $164,000 on average.',
        body: `Most can't survive that.

Here's what we see every week: businesses running on expired SSL certs, open ports they didn't know existed, and admin panels exposed to the internet.

One scan. 60 seconds. You'll know exactly where you're vulnerable.

CyberShield was built for businesses that can't afford a security team but can't afford to get breached either.`,
        cta: 'Drop SCAN in the comments to see your risk score.',
      },
      {
        hook: 'Your website has vulnerabilities right now. You just don\'t know it yet.',
        body: `We scanned 500 small business websites last month.

92% had at least one critical vulnerability.

Expired SSL certificates. Open admin ports. Outdated server software. These aren't edge cases — they're the norm.

CyberShield finds them in 60 seconds and tells you exactly how to fix each one.`,
        cta: 'Drop SCAN in the comments — I\'ll show you yours.',
      },
      {
        hook: 'Hackers don\'t pick targets. They pick vulnerabilities.',
        body: `They scan thousands of websites per hour with automated tools. If yours has an open port, an expired cert, or an outdated CMS — you're already on their list.

The only question is when.

CyberShield runs the same scans hackers use, but gives YOU the results first. 60 seconds. Full vulnerability report. Actionable fixes.`,
        cta: 'Drop SCAN in the comments to check your site.',
      },
      {
        hook: '60% of small businesses close within 6 months of a cyberattack.',
        body: `Not because the attack itself is fatal. Because the downtime, data loss, and customer trust erosion add up faster than most owners realize.

The businesses that survive? They knew their vulnerabilities before attackers did.

CyberShield gives you a full security audit in 60 seconds. SSL status, open ports, outdated software, exposed admin panels — all of it.`,
        cta: 'Drop SCAN in the comments — find your blind spots before hackers do.',
      },
      {
        hook: 'Your SSL certificate expired 3 days ago. Did you notice?',
        body: `Probably not. Most business owners don't — until a customer sees the "Not Secure" warning and bounces.

Or worse, until an attacker uses that gap to intercept data.

Expired certs. Misconfigured headers. Open ports you forgot about. These are the things that turn a safe website into a target.

CyberShield monitors all of it and alerts you before it becomes a problem.`,
        cta: 'Drop SCAN in the comments to check your site\'s status.',
      },
      {
        hook: 'The average time to detect a data breach? 204 days.',
        body: `That's almost 7 months of hackers inside your systems. Reading emails. Downloading files. Stealing customer data.

Small businesses don't have the security teams that enterprises use to catch breaches early.

That's why we built CyberShield — continuous vulnerability monitoring that catches exposures the day they appear, not 7 months later.`,
        cta: 'Drop SCAN in the comments to see your exposure.',
      },
      {
        hook: 'You wouldn\'t leave your office door unlocked overnight. Why is your website different?',
        body: `Open ports are unlocked doors. Expired SSL is a broken window. An exposed admin panel is a sign that says "come on in."

Most small businesses have at least one of these right now. They just don't know it.

CyberShield checks for all of them. One scan. 60 seconds. Full vulnerability report with step-by-step fixes.`,
        cta: 'Drop SCAN in the comments — let\'s lock your doors.',
      },
    ],
  },

  // ── TUESDAY 11am — AutoFlow building in public ──────────────
  tuesday: {
    brand: 'AutoFlow',
    hashtags: '#AIAutomation #SmallBusiness #LeadGeneration #AutoFlow #Entrepreneur',
    posts: [
      {
        hook: 'We sent 500 personalized emails yesterday. Manually? Zero.',
        body: `Every single one was researched, written, and sent by our AI agent.

Each email referenced the prospect's company, recent news, and specific pain points. Not templates. Not mail merge. Actual personalization at scale.

The result? 34% open rate. 12% reply rate. From cold outreach.

That's what AutoFlow does — AI-powered lead generation that doesn't feel like spam.`,
        cta: 'Drop AUTO in the comments to see how it works.',
      },
      {
        hook: 'Your sales team is spending 6 hours a day on tasks AI can do in 6 minutes.',
        body: `Researching prospects. Writing emails. Following up. Updating CRM.

All of it can be automated — without losing the personal touch.

We built AutoFlow because we were tired of watching talented salespeople waste time on repetitive work.

Now one person with AutoFlow outperforms a team of 5 doing manual outreach.`,
        cta: 'Drop AUTO in the comments if you want to see the demo.',
      },
      {
        hook: 'We just hit 10,000 AI-generated emails sent. Here\'s what we learned.',
        body: `1. Personalization beats volume every time
2. The first line matters more than the subject line
3. AI follow-ups convert 3x better than human-written ones
4. Tuesday and Wednesday mornings get the highest reply rates

We're building AutoFlow to prove that AI outreach can outperform any manual process — without cutting corners on quality.`,
        cta: 'Drop AUTO in the comments — I\'ll add you to the early access list.',
      },
      {
        hook: 'One AI agent now does the work of an entire outbound sales team.',
        body: `2,400 personalized emails sent last month. 380 replies. 47 meetings booked.

The AI doesn't take breaks. Doesn't have bad days. Doesn't forget to follow up.

And every email sounds like a human wrote it — because the AI researches each prospect before writing.

This isn't the future. This is what AutoFlow shipped last week.`,
        cta: 'Drop AUTO in the comments to try it yourself.',
      },
      {
        hook: 'The #1 reason cold emails fail isn\'t your offer. It\'s your first line.',
        body: `"I hope this email finds you well" — deleted.
"I noticed your company" — deleted.
"Just following up" — deleted.

AI-generated first lines reference something specific: a recent blog post, a job listing, a product launch.

That's the difference between getting ignored and getting a reply. AutoFlow writes those lines at scale.`,
        cta: 'Drop AUTO in the comments to see AI-written examples.',
      },
      {
        hook: 'We A/B tested 50 cold email subject lines. The winner surprised us.',
        body: `It wasn't clever. It wasn't long. It wasn't personalized.

The highest-performing subject line was 3 words. Direct. No tricks.

The lesson? Prospects don't want to be impressed. They want to know why you're emailing.

AutoFlow tests subject lines automatically and adapts to what works for each industry.`,
        cta: 'Drop AUTO in the comments for the full results.',
      },
      {
        hook: 'Most businesses give up on a lead after 2 emails. The data says wait until 5.',
        body: `80% of deals close between the 5th and 12th touchpoint. Most salespeople stop at 2.

Not because they don't care — because manually following up with hundreds of prospects is exhausting.

AutoFlow sends intelligent follow-ups that reference previous conversations. Automatically. On the right schedule.`,
        cta: 'Drop AUTO in the comments if you\'re leaving deals on the table.',
      },
      {
        hook: 'Your CRM has 10,000 contacts. How many have you actually emailed this month?',
        body: `For most businesses, the answer is embarrassingly low.

Leads go cold. Follow-ups slip. Opportunities die in your pipeline.

AutoFlow connects to your CRM and re-engages cold leads with personalized outreach — automatically. No copying. No pasting. No forgetting.`,
        cta: 'Drop AUTO in the comments to wake up your pipeline.',
      },
    ],
  },

  // ── WEDNESDAY 12pm — AutoFlow results/automation ────────────
  wednesday: {
    brand: 'AutoFlow',
    hashtags: '#AIAutomation #SmallBusiness #LeadGeneration #AutoFlow #BuildingInPublic',
    posts: [
      {
        hook: 'Cold email is dead. AI-personalized outreach is not.',
        body: `The difference?

Generic: "Hi {first_name}, I noticed your company..."
AI-personalized: References their latest blog post, mentions a specific challenge in their industry, and proposes an exact solution.

One gets deleted. The other gets replied to.

AutoFlow reads your prospect's digital footprint and writes emails that feel like they came from someone who did 20 minutes of research.`,
        cta: 'Drop AUTO in the comments to see a real example.',
      },
      {
        hook: 'Our client booked 23 meetings last week. Their total time spent? 11 minutes.',
        body: `That's the setup time.

AutoFlow handled everything else:
- Found 200 qualified prospects
- Researched each company
- Wrote personalized outreach
- Sent emails at optimal times
- Handled follow-ups automatically

The business owner spent those 11 minutes reviewing and approving the campaign. That's it.`,
        cta: 'Drop AUTO in the comments if you want results like this.',
      },
      {
        hook: '3 automations every small business should be running right now.',
        body: `1. AI lead scoring — stop wasting time on bad-fit prospects
2. Personalized follow-up sequences — 80% of deals close after the 5th touchpoint
3. Meeting booking on autopilot — let the AI handle scheduling

Most businesses do none of these. The ones that do? They close 3x more deals with half the effort.

AutoFlow runs all three from one dashboard.`,
        cta: 'Drop AUTO in the comments to get started.',
      },
      {
        hook: 'Your competitors are using AI for outreach. You\'re still copying and pasting.',
        body: `Not a judgment. Just math.

Manual outreach: 30 emails/day, 2% reply rate = 0.6 replies
AI outreach: 500 emails/day, 12% reply rate = 60 replies

Same person. Same hours in the day. 100x the output.

The gap between businesses using AI and those that aren't is getting wider every week.`,
        cta: 'Drop AUTO in the comments — let\'s close that gap.',
      },
      {
        hook: 'We tracked every lead that replied to an AI-written email. Here\'s where they came from.',
        body: `Top 3 sources of high-quality replies:
1. LinkedIn profile research — referencing mutual connections or shared interests
2. Company news — funding rounds, product launches, new hires
3. Pain point matching — aligning your offer to their biggest challenge

Generic emails get generic results. AutoFlow personalizes all three automatically.`,
        cta: 'Drop AUTO in the comments to see your industry\'s results.',
      },
      {
        hook: 'The 5-minute setup that replaced 4 hours of daily prospecting.',
        body: `Step 1: Tell AutoFlow your ideal customer profile
Step 2: Set your outreach tone and offer
Step 3: Hit "launch"

That's it. The AI handles prospect research, email writing, sending, and follow-ups.

One client went from 10 emails a day to 300 — with better reply rates on the AI-written ones.`,
        cta: 'Drop AUTO in the comments to set up yours.',
      },
      {
        hook: 'Your best salesperson closes 20% of qualified leads. AI follows up with the other 80%.',
        body: `Most lost deals aren't bad fits. They're bad timing.

The prospect was busy. They meant to reply. They forgot.

AutoFlow sends perfectly timed follow-ups that feel natural — not pushy. And it does it for every single lead, not just the ones you remember.`,
        cta: 'Drop AUTO in the comments to stop leaving money on the table.',
      },
      {
        hook: 'We just launched multi-step campaigns in AutoFlow. The results are insane.',
        body: `Step 1: Personalized cold email (12% reply rate)
Step 2: Value-add follow-up 3 days later (8% reply rate)
Step 3: Social proof email day 7 (6% reply rate)
Step 4: Breakup email day 14 (4% reply rate)

Combined sequence reply rate: 26%.

All written by AI. All personalized per prospect. All automated.`,
        cta: 'Drop AUTO in the comments to try multi-step campaigns.',
      },
    ],
  },

  // ── THURSDAY 2pm — CyberShield breach/threat ────────────────
  thursday: {
    brand: 'CyberShield',
    hashtags: '#CyberSecurity #SmallBusiness #DataBreach #CyberShield #InfoSec',
    posts: [
      {
        hook: '11 billion records were leaked in data breaches last year.',
        body: `Your employees' emails are probably in there.

We checked 1,000 business email addresses last month. 73% appeared in at least one known breach.

That means passwords, personal data, and company information floating around the dark web.

CyberShield checks your team's emails against every known breach database and tells you exactly which accounts are compromised.`,
        cta: 'Drop SCAN in the comments to check your team.',
      },
      {
        hook: 'The #1 way hackers get into small businesses isn\'t what you think.',
        body: `It's not sophisticated malware.
It's not zero-day exploits.

It's reused passwords from old data breaches.

Your employee uses the same password for LinkedIn and your company VPN. LinkedIn gets breached. Now hackers have your VPN credentials.

CyberShield monitors for this automatically. When a breach hits, you know within hours — not months.`,
        cta: 'Drop SCAN in the comments — let\'s check your exposure.',
      },
      {
        hook: 'A new ransomware attack hits a small business every 11 seconds.',
        body: `The average downtime? 21 days.

Most of these attacks start with a known vulnerability that could have been patched weeks ago.

An expired SSL cert here. An open RDP port there. A server running outdated software.

CyberShield scans for all of this continuously. Not once a year during an audit — every single day.`,
        cta: 'Drop SCAN in the comments to see your vulnerabilities.',
      },
      {
        hook: 'Your business email was in a data breach. You just don\'t know it yet.',
        body: `We ran breach checks on 500 small business domains last quarter.

The results were alarming:
- 73% had at least one compromised email
- 31% had executive-level emails exposed
- 18% had passwords available in plaintext

The breach already happened. The question is whether you know about it.

CyberShield scans every known breach database in seconds.`,
        cta: 'Drop SCAN in the comments — I\'ll check yours free.',
      },
      {
        hook: 'The dark web has a price list. Your company\'s data might be on it.',
        body: `Credit card numbers: $5-$30
Login credentials: $1-$20
Full identity packages: $30-$100
Company database access: $500+

When your employees reuse passwords across personal and work accounts, one breach exposes everything.

CyberShield monitors breach databases in real time and alerts you the moment your team's data appears.`,
        cta: 'Drop SCAN in the comments — find out if you\'re already listed.',
      },
      {
        hook: 'Phishing attacks have increased 300% since 2020. Your team isn\'t ready.',
        body: `The emails look real. The domains look real. Even IT professionals get fooled.

The latest attacks use AI to generate phishing emails that perfectly mimic your vendors, your bank, even your CEO.

CyberShield includes security awareness training that teaches your team to spot these attacks — with real-world examples updated monthly.`,
        cta: 'Drop SCAN in the comments to test your team\'s readiness.',
      },
      {
        hook: 'One compromised employee account can expose your entire company.',
        body: `It starts with a leaked password from an old breach. The attacker logs in. Escalates access. Downloads client data.

By the time you notice, they've been inside for weeks.

This isn't a hypothetical. It happens to small businesses every day.

CyberShield catches it at step one — monitoring for leaked credentials before attackers can use them.`,
        cta: 'Drop SCAN in the comments to check your team\'s accounts.',
      },
      {
        hook: '90% of successful cyberattacks start with a single email.',
        body: `Not a sophisticated hack. Not a zero-day exploit.

A single email with a link that looks legitimate.

Your employee clicks it. Enters their credentials. Game over.

The best defense isn't a firewall — it's knowing which of your employees' credentials are already compromised and which accounts need password resets.

CyberShield scans for exactly this.`,
        cta: 'Drop SCAN in the comments to protect your team.',
      },
    ],
  },
};

// ── Week-based post selection ─────────────────────────────────────
// Uses ISO week number so each week automatically gets a different
// post variation. With 8 posts per day, content repeats every 8 weeks.
function pickPost(day) {
  const week = getISOWeek();
  const posts = CONTENT[day].posts;
  const idx = (week - 1) % posts.length;
  return { ...posts[idx], brand: CONTENT[day].brand, hashtags: CONTENT[day].hashtags };
}

// ── LinkedIn Posting ──────────────────────────────────────────────
async function postToLinkedIn(text) {
  if (!LINKEDIN_TOKEN || !LINKEDIN_PERSON) {
    console.log('[LinkedIn] Skipped — LINKEDIN_ACCESS_TOKEN or LINKEDIN_PERSON_URN not set');
    return null;
  }

  try {
    const postBody = {
      author: LINKEDIN_PERSON,
      commentary: text,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: 'PUBLISHED',
    };

    const res = await fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINKEDIN_TOKEN}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': '202401',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(postBody),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`LinkedIn post failed (${res.status}): ${err}`);
    }

    const postId = res.headers.get('x-restli-id') || 'unknown';
    console.log(`[LinkedIn] Posted successfully — ID: ${postId}`);
    return postId;
  } catch (err) {
    console.error('[LinkedIn] Error:', err.message);
    return null;
  }
}

// ── Twitter/X Posting ─────────────────────────────────────────────
async function postToTwitter(text) {
  const client = getTwitterClient();
  if (!client) {
    console.log('[Twitter] Skipped — TWITTER_API_KEY not set');
    return null;
  }

  try {
    const tweet = await client.v2.tweet({ text });
    console.log(`[Twitter] Posted successfully — ID: ${tweet.data.id}`);
    return tweet.data.id;
  } catch (err) {
    console.error('[Twitter] Error:', err.message || err);
    return null;
  }
}

// ── Main Post Function ────────────────────────────────────────────
async function executePost(day) {
  const post = pickPost(day);
  const ts = new Date().toISOString();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[${ts}] Posting: ${day.toUpperCase()} — ${post.brand}`);
  console.log(`Hook: ${post.hook}`);
  console.log('='.repeat(60));

  const fullText = `${post.hook}\n\n${post.body}\n\n${post.cta}\n\n${post.hashtags}`;

  const tweetText = `${post.hook}\n\n${post.cta}\n\n${post.hashtags}`;
  const finalTweet = tweetText.length > 280
    ? `${post.hook}\n\n${post.cta}\n\n${post.hashtags.split(' ').slice(0, 3).join(' ')}`
    : tweetText;

  const [liId, twId] = await Promise.allSettled([
    postToLinkedIn(fullText),
    postToTwitter(finalTweet),
  ]);

  console.log(`[Result] LinkedIn: ${liId.status === 'fulfilled' ? liId.value || 'skipped' : liId.reason}`);
  console.log(`[Result] Twitter:  ${twId.status === 'fulfilled' ? twId.value || 'skipped' : twId.reason}`);
  console.log(`[Done] ${day} post complete\n`);
}

// ── Test Mode ─────────────────────────────────────────────────────
async function runTestMode() {
  const week = getISOWeek();
  const days = isCycleWeek1() ? ['monday', 'wednesday'] : ['monday'];
  console.log(`Running test mode — generating ${days.length} post(s) (week ${week}, variation ${((week - 1) % 8) + 1}/8, cycle week ${isCycleWeek1() ? 1 : 2})\n`);
  const labels = {
    monday: 'Mon  9am — CyberShield security',
    wednesday: 'Wed 12pm — AutoFlow results/automation',
  };
  for (const day of days) {
    const post = pickPost(day);

    const fullText = `${post.hook}\n\n${post.body}\n\n${post.cta}`;
    console.log(`\n--- ${day.toUpperCase()} (${labels[day]}) ---`);
    console.log(fullText);
    console.log(`Hashtags: ${post.hashtags}`);
  }
  console.log('Done!');
}

// ── CLI entry point — checked BEFORE cron registration ────────────
// Usage: node social-media-agent.js test
//        node social-media-agent.js monday
const args = process.argv.slice(2);
if (args[0] === 'test') {
  runTestMode().then(() => process.exit(0)).catch(console.error);
} else if (args[0] && CONTENT[args[0].toLowerCase()]) {
  console.log(`[CLI] Running ${args[0]} post immediately...`);
  executePost(args[0].toLowerCase()).catch(err => {
    console.error('[CLI] Failed:', err);
    process.exit(1);
  });
} else {
  // ── Daemon mode — register cron schedules ─────────────────────
  // 3 posts every 2 weeks: Mon Week 1, Wed Week 1, Mon Week 2.
  cron.schedule('0 9 * * 1', () => executePost('monday'));
  cron.schedule('0 12 * * 3', () => {
    if (isCycleWeek1()) {
      executePost('wednesday');
    } else {
      console.log('[Schedule] Skipping Wednesday post — week 2 of the 2-week cycle');
    }
  });

  console.log(`
 ┌──────────────────────────────────────────────────────────┐
 │  Social Media Agent — Running (3 posts / 2 weeks)        │
 │                                                         │
 │  Schedule (${process.env.TZ || 'server timezone'}):
 │    Mon  9:00 AM — CyberShield security (every week)      │
 │    Wed 12:00 PM — AutoFlow results/automation (week 1 only)│
 │                                                         │
 │  Rotation: 8 variations/day (week ${getISOWeek()}, slot ${((getISOWeek() - 1) % 8) + 1}/8, cycle week ${isCycleWeek1() ? 1 : 2})
 │  Platforms: LinkedIn + Twitter/X                        │
 │  LinkedIn: ${LINKEDIN_TOKEN ? 'configured' : 'NOT SET — add LINKEDIN_ACCESS_TOKEN'}
 │  Twitter:  ${process.env.TWITTER_API_KEY ? 'configured' : 'NOT SET — add TWITTER_API_KEY'}
 └──────────────────────────────────────────────────────────┘
`);
}
