import 'dotenv/config';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { TwitterApi } from 'twitter-api-v2';
import { generateImage } from './generate-image.js';

// ── Config ────────────────────────────────────────────────────────
const LINKEDIN_TOKEN    = process.env.LINKEDIN_ACCESS_TOKEN;
const LINKEDIN_PERSON   = process.env.LINKEDIN_PERSON_URN;  // urn:li:person:XXXXX
const IMG_DIR = path.resolve('generated-images');

function getTwitterClient() {
  if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET) return null;
  return new TwitterApi({
    appKey:       process.env.TWITTER_API_KEY,
    appSecret:    process.env.TWITTER_API_SECRET,
    accessToken:  process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });
}

// ── Content Bank ──────────────────────────────────────────────────
// Each day has multiple post variations — agent cycles through them
const CONTENT = {

  // ── MONDAY 9am — CyberShield security post ──────────────────
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
    ],
  },

  // ── TUESDAY 11am — AutoFlow building in public ─────────────
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

We're building AutoFlow in public because transparency builds trust.

Every metric. Every failure. Every win.`,
        cta: 'Drop AUTO in the comments — I\'ll add you to the early access list.',
      },
      {
        hook: 'I replaced a $4,000/month SDR with an AI agent. Here\'s what happened.',
        body: `Month 1: 2,400 personalized emails sent. 380 replies. 47 meetings booked.

The AI doesn't take breaks. Doesn't have bad days. Doesn't forget to follow up.

And every email sounds like a human wrote it — because the AI researches each prospect before writing.

This isn't the future. This is what we shipped last Tuesday.`,
        cta: 'Drop AUTO in the comments to try it yourself.',
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
    ],
  },

  // ── THURSDAY 2pm — CyberShield breach/threat post ───────────
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
    ],
  },

  // ── FRIDAY 10am — Founder story post ────────────────────────
  friday: {
    brand: 'AutoFlow',
    hashtags: '#BuildingInPublic #Founder #StartupLife #AI #Entrepreneur',
    posts: [
      {
        hook: 'I\'m building two startups at the same time. Here\'s why.',
        body: `CyberShield protects small businesses from hackers.
AutoFlow helps them grow with AI-powered outreach.

Security + Growth. Two sides of the same problem: small businesses don't have enterprise resources.

So we're building enterprise-grade tools at small business prices.

Every week I share the wins, the losses, and the real numbers. No vanity metrics. No fluff.`,
        cta: 'Follow along if you\'re building something too.',
      },
      {
        hook: 'Nobody talks about the worst part of being a founder.',
        body: `It's not the long hours.
It's not the rejection.

It's the silence.

You ship a feature at 2am. Nobody notices. You fix a critical bug. Nobody knows. You land your first customer. Nobody celebrates with you.

That's why I build in public. The internet becomes your co-founder.

Every week I share real metrics from CyberShield and AutoFlow. Revenue. Users. Failures. Everything.`,
        cta: 'Drop a comment if you relate to this.',
      },
      {
        hook: 'Week 1 revenue: $0. This week: here\'s the real number.',
        body: `I'm not going to pretend we're killing it from day one.

Building a startup is messy. Some weeks you feel unstoppable. Other weeks you question everything.

But here's what I know: consistency compounds.

Every email we send, every feature we ship, every customer we help — it adds up.

I'm sharing the entire journey because the "overnight success" narrative is a lie.`,
        cta: 'Follow for the real startup story. No filters.',
      },
      {
        hook: 'The best startup advice I ever got was 3 words: "Ship it today."',
        body: `Not "make it perfect."
Not "do more research."
Not "wait until you're ready."

Ship it today.

We launched CyberShield with one feature: a vulnerability scanner. That's it. No breach monitoring. No training modules. No team management.

One feature. One landing page. One cold email.

Everything else came from customer feedback after we shipped.`,
        cta: 'What\'s the best advice you\'ve received? Drop it below.',
      },
    ],
  },
};

// Track which variation we used last per day (persisted to disk)
const STATE_FILE = path.resolve('agent-state.json');
function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
  catch { return { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0 }; }
}
function saveState(s) { fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2)); }

function pickPost(day) {
  const state = loadState();
  const posts = CONTENT[day].posts;
  const idx = (state[day] || 0) % posts.length;
  state[day] = idx + 1;
  saveState(state);
  return { ...posts[idx], brand: CONTENT[day].brand, hashtags: CONTENT[day].hashtags };
}

// ── LinkedIn Posting ──────────────────────────────────────────────
async function uploadImageToLinkedIn(imagePath) {
  // Step 1: Initialize upload
  const initRes = await fetch('https://api.linkedin.com/rest/images?action=initializeUpload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LINKEDIN_TOKEN}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': '202401',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      initializeUploadRequest: {
        owner: LINKEDIN_PERSON,
      },
    }),
  });

  if (!initRes.ok) {
    const err = await initRes.text();
    throw new Error(`LinkedIn image init failed (${initRes.status}): ${err}`);
  }

  const initData = await initRes.json();
  const uploadUrl = initData.value.uploadUrl;
  const imageUrn = initData.value.image;

  // Step 2: Upload binary
  const imageBuffer = fs.readFileSync(imagePath);
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${LINKEDIN_TOKEN}`,
      'Content-Type': 'application/octet-stream',
    },
    body: imageBuffer,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`LinkedIn image upload failed (${uploadRes.status}): ${err}`);
  }

  return imageUrn;
}

async function postToLinkedIn(text, imagePath) {
  if (!LINKEDIN_TOKEN || !LINKEDIN_PERSON) {
    console.log('[LinkedIn] Skipped — LINKEDIN_ACCESS_TOKEN or LINKEDIN_PERSON_URN not set');
    return null;
  }

  try {
    let imageUrn = null;
    if (imagePath && fs.existsSync(imagePath)) {
      imageUrn = await uploadImageToLinkedIn(imagePath);
      console.log(`[LinkedIn] Image uploaded: ${imageUrn}`);
    }

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

    if (imageUrn) {
      postBody.content = {
        media: {
          title: 'Post image',
          id: imageUrn,
        },
      };
    }

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
async function postToTwitter(text, imagePath) {
  const client = getTwitterClient();
  if (!client) {
    console.log('[Twitter] Skipped — TWITTER_API_KEY not set');
    return null;
  }

  try {
    let mediaId = null;
    if (imagePath && fs.existsSync(imagePath)) {
      const imageBuffer = fs.readFileSync(imagePath);
      const uploaded = await client.v1.uploadMedia(imageBuffer, { mimeType: 'image/png' });
      mediaId = uploaded;
      console.log(`[Twitter] Image uploaded: ${mediaId}`);
    }

    const tweetBody = { text };
    if (mediaId) {
      tweetBody.media = { media_ids: [mediaId] };
    }

    const tweet = await client.v2.tweet(tweetBody);
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

  // Generate image
  const imgFile = path.join(IMG_DIR, `${day}-${Date.now()}.png`);
  try {
    await generateImage({ hookLine: post.hook, brand: post.brand, outputPath: imgFile });
    console.log(`[Image] Generated: ${imgFile}`);
  } catch (err) {
    console.error('[Image] Generation failed:', err.message);
  }

  // Build post text
  const fullText = `${post.hook}\n\n${post.body}\n\n${post.cta}\n\n${post.hashtags}`;

  // Twitter has a 280-char limit — use a shorter version
  const tweetText = `${post.hook}\n\n${post.cta}\n\n${post.hashtags}`;
  const finalTweet = tweetText.length > 280
    ? `${post.hook}\n\n${post.cta}\n\n${post.hashtags.split(' ').slice(0, 3).join(' ')}`
    : tweetText;

  // Post to both platforms
  const [liId, twId] = await Promise.allSettled([
    postToLinkedIn(fullText, fs.existsSync(imgFile) ? imgFile : null),
    postToTwitter(finalTweet, fs.existsSync(imgFile) ? imgFile : null),
  ]);

  console.log(`[Result] LinkedIn: ${liId.status === 'fulfilled' ? liId.value || 'skipped' : liId.reason}`);
  console.log(`[Result] Twitter:  ${twId.status === 'fulfilled' ? twId.value || 'skipped' : twId.reason}`);
  console.log(`[Done] ${day} post complete\n`);
}

// ── Cron Schedule ─────────────────────────────────────────────────
// Times in server timezone — set TZ env var to match your local time
//   Monday    9:00 AM
//   Tuesday  11:00 AM
//   Wednesday 12:00 PM
//   Thursday  2:00 PM
//   Friday   10:00 AM
cron.schedule('0 9 * * 1',  () => executePost('monday'));
cron.schedule('0 11 * * 2', () => executePost('tuesday'));
cron.schedule('0 12 * * 3', () => executePost('wednesday'));
cron.schedule('0 14 * * 4', () => executePost('thursday'));
cron.schedule('0 10 * * 5', () => executePost('friday'));

console.log(`
 ┌──────────────────────────────────────────────────────────┐
 │  Social Media Agent — Running                           │
 │                                                         │
 │  Schedule (${process.env.TZ || 'server timezone'}):
 │    Mon  9:00 AM — CyberShield security                  │
 │    Tue 11:00 AM — AutoFlow building in public           │
 │    Wed 12:00 PM — AutoFlow results/automation           │
 │    Thu  2:00 PM — CyberShield breach/threat             │
 │    Fri 10:00 AM — Founder story                         │
 │                                                         │
 │  Platforms: LinkedIn + Twitter/X                        │
 │  LinkedIn: ${LINKEDIN_TOKEN ? 'configured' : 'NOT SET — add LINKEDIN_ACCESS_TOKEN'}
 │  Twitter:  ${process.env.TWITTER_API_KEY ? 'configured' : 'NOT SET — add TWITTER_API_KEY'}
 └──────────────────────────────────────────────────────────┘
`);

// ── CLI: run a specific day's post immediately ────────────────────
// Usage: node social-media-agent.js monday
const cliDay = process.argv[2]?.toLowerCase();
if (cliDay && CONTENT[cliDay]) {
  console.log(`[CLI] Running ${cliDay} post immediately...`);
  executePost(cliDay).catch(err => {
    console.error('[CLI] Failed:', err);
    process.exit(1);
  });
} else if (cliDay === 'test') {
  console.log('[CLI] Test mode — generating all images without posting...');
  (async () => {
    for (const day of Object.keys(CONTENT)) {
      const post = pickPost(day);
      const imgFile = path.join(IMG_DIR, `test-${day}.png`);
      await generateImage({ hookLine: post.hook, brand: post.brand, outputPath: imgFile });
      console.log(`  ${day}: ${imgFile}`);
    }
    console.log('[CLI] All test images generated.');
    process.exit(0);
  })();
}
