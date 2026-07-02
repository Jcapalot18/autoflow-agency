import { TwitterApi } from 'twitter-api-v2';
import Anthropic from '@anthropic-ai/sdk';
import cron from 'node-cron';
import 'dotenv/config';

// ── Clients ───────────────────────────────────────────────────────
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const twitter = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const MY_USER_ID = process.env.TWITTER_USER_ID;
const DB_URL = process.env.DB_URL;
const DB_KEY = process.env.DB_SERVICE_KEY;

// ── Search queries — rotated daily to maximize reach ─────────────
const SEARCH_QUERIES = [
  '"lead generation" problem -is:retweet lang:en -is:reply',
  '"cold outreach" struggling -is:retweet lang:en -is:reply',
  '"small business" "losing clients" -is:retweet lang:en -is:reply',
  '"follow up" leads manual -is:retweet lang:en -is:reply',
  '"business growth" automation -is:retweet lang:en -is:reply',
  '"need more clients" -is:retweet lang:en -is:reply',
  '"sales process" broken -is:retweet lang:en -is:reply',
  '"CRM" headache -is:retweet lang:en -is:reply',
];

// ── Supabase helpers (fetch-based, no SDK) ────────────────────────
async function dbGet(path, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${DB_URL}/rest/v1/${path}${qs ? '?' + qs : ''}`, {
    headers: {
      apikey: DB_KEY,
      Authorization: `Bearer ${DB_KEY}`,
    },
  });
  if (!res.ok) {
    console.error(`DB GET error ${res.status}:`, await res.text());
    return [];
  }
  return res.json();
}

async function dbInsert(table, data) {
  const res = await fetch(`${DB_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: DB_KEY,
      Authorization: `Bearer ${DB_KEY}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) console.error(`DB insert error ${res.status}:`, await res.text());
}

async function dbPatch(table, params, data) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${DB_URL}/rest/v1/${table}?${qs}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      apikey: DB_KEY,
      Authorization: `Bearer ${DB_KEY}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) console.error(`DB patch error ${res.status}:`, await res.text());
}

async function isAlreadyTracked(twitterUserId) {
  const rows = await dbGet('twitter_outreach', {
    twitter_user_id: `eq.${twitterUserId}`,
    select: 'id',
    limit: '1',
  });
  return Array.isArray(rows) && rows.length > 0;
}

// ── DM generation via claude-fable-5 ─────────────────────────────
async function generateDm(displayName, handle, recentTweets) {
  const tweetContext = recentTweets.length > 0
    ? recentTweets.map((t, i) => `${i + 1}. "${t}"`).join('\n')
    : '(no recent tweets available)';

  const msg = await anthropic.messages.create({
    model: 'claude-fable-5',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `You are Njiru, founder of AutoFlow — an AI automation agency that builds done-for-you lead follow-up and outreach systems for small businesses.

You just followed ${displayName} (@${handle}) on Twitter. You followed them because their tweets suggest they're dealing with business growth, outreach, or lead generation challenges.

Their recent tweets:
${tweetContext}

Write a SHORT, human Twitter DM (3-4 sentences max). Rules:
- Reference ONE specific thing from their tweets — make it clear you actually read them
- Don't pitch services — just offer a free custom automation blueprint for their business
- Sound like a real founder, not a marketing bot
- End with ONE easy yes/no question like "Want me to send one over?"
- No emojis, no exclamation spam, no "Hey [name]!" opener
- If their tweets give no useful context, write something specific to small business owners struggling with manual outreach

Output: Just the DM text. Nothing else. No quotes around it.`,
    }],
  });

  // claude-fable-5 returns thinking blocks — find the text block
  const textBlock = msg.content.find(b => b.type === 'text');
  return textBlock?.text?.trim() ?? '';
}

// ── Phase 1: Find and follow targets ─────────────────────────────
async function findAndFollowTargets() {
  const query = SEARCH_QUERIES[new Date().getDay() % SEARCH_QUERIES.length];
  console.log(`[follow] Searching: ${query}`);

  let searchResult;
  try {
    searchResult = await twitter.v2.search(query, {
      max_results: 10,
      'tweet.fields': ['author_id', 'text'],
      'user.fields': ['name', 'username', 'public_metrics'],
      expansions: ['author_id'],
    });
  } catch (err) {
    console.error('[follow] Twitter search error:', err.message);
    return;
  }

  const users = searchResult.includes?.users ?? [];
  console.log(`[follow] Found ${users.length} users from search`);

  let followed = 0;

  for (const user of users) {
    if (user.id === MY_USER_ID) continue;
    if (await isAlreadyTracked(user.id)) {
      console.log(`[follow] Already tracked @${user.username}, skipping`);
      continue;
    }

    try {
      await twitter.v2.follow(MY_USER_ID, user.id);
      await dbInsert('twitter_outreach', {
        twitter_user_id: user.id,
        twitter_handle: user.username,
        display_name: user.name,
        followed_at: new Date().toISOString(),
        status: 'followed',
      });
      followed++;
      console.log(`[follow] Followed @${user.username} (${user.name})`);
      await sleep(2500);
    } catch (err) {
      const code = err?.data?.status || err.status || '';
      if (code === 429) {
        console.warn('[follow] Rate limit hit — stopping follows for this run');
        break;
      }
      console.error(`[follow] Failed to follow @${user.username}:`, err.message);
    }
  }

  console.log(`[follow] Followed ${followed} new accounts`);
}

// ── Phase 2: DM users who followed back ──────────────────────────
async function dmFollowBacks() {
  console.log('[dm] Checking for follow-backs...');

  // Fetch our current followers
  let followers = [];
  try {
    const res = await twitter.v2.followers(MY_USER_ID, {
      max_results: 1000,
      'user.fields': ['name', 'username'],
    });
    followers = res.data ?? [];
  } catch (err) {
    console.error('[dm] Error fetching followers:', err.message);
    return;
  }

  const followerIdSet = new Set(followers.map(f => f.id));
  console.log(`[dm] ${followerIdSet.size} current followers`);

  // Get everyone we've followed but not yet DM'd
  const pending = await dbGet('twitter_outreach', {
    status: 'eq.followed',
    select: 'id,twitter_user_id,twitter_handle,display_name',
    limit: '50',
  });

  if (!Array.isArray(pending) || pending.length === 0) {
    console.log('[dm] No pending follow-backs');
    return;
  }

  let sent = 0;

  for (const record of pending) {
    if (!followerIdSet.has(record.twitter_user_id)) continue;

    // They followed back — grab their recent tweets for context
    let recentTweets = [];
    try {
      const timeline = await twitter.v2.userTimeline(record.twitter_user_id, {
        max_results: 5,
        'tweet.fields': ['text'],
        exclude: ['retweets', 'replies'],
      });
      const tweetData = timeline.tweets ?? timeline.data?.data ?? [];
      recentTweets = tweetData.map(t => t.text).filter(Boolean);
    } catch (err) {
      console.warn(`[dm] Could not fetch tweets for @${record.twitter_handle}:`, err.message);
    }

    const dm = await generateDm(record.display_name, record.twitter_handle, recentTweets);
    if (!dm) {
      console.error(`[dm] Empty DM generated for @${record.twitter_handle}`);
      continue;
    }

    try {
      await twitter.v2.sendDmToParticipant(record.twitter_user_id, { text: dm });
      await dbPatch(
        'twitter_outreach',
        { twitter_user_id: `eq.${record.twitter_user_id}` },
        {
          dm_sent_at: new Date().toISOString(),
          dm_content: dm,
          recent_tweets: recentTweets.join('\n---\n'),
          status: 'dm_sent',
        },
      );
      sent++;
      console.log(`[dm] Sent to @${record.twitter_handle}`);
      await sleep(3000);
    } catch (err) {
      const code = err?.data?.status || err.status || '';
      if (code === 429) {
        console.warn('[dm] Rate limit hit — stopping DMs for this run');
        break;
      }
      const errMsg = err.message || String(err);
      console.error(`[dm] Failed DM to @${record.twitter_handle}:`, errMsg);
      await dbPatch(
        'twitter_outreach',
        { twitter_user_id: `eq.${record.twitter_user_id}` },
        { status: 'error', error_message: errMsg },
      );
    }
  }

  console.log(`[dm] Sent ${sent} DMs`);
}

// ── Main run ──────────────────────────────────────────────────────
async function run() {
  console.log(`\n[agent] === Twitter DM Agent run — ${new Date().toISOString()} ===`);
  await findAndFollowTargets();
  await sleep(5000);
  await dmFollowBacks();
  console.log('[agent] === Run complete ===\n');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Entry point ───────────────────────────────────────────────────
// Usage:
//   node twitter-dm-agent.js          → schedule daily at 10am
//   node twitter-dm-agent.js run      → run once immediately
//
// Required Twitter API access: Basic tier ($100/mo) or above.
// Needed scopes: tweet.read, users.read, follows.write, dm.write, offline.access
const arg = process.argv[2];

if (arg === 'run') {
  run().catch(err => {
    console.error('[agent] Fatal error:', err);
    process.exit(1);
  });
} else {
  const TZ = process.env.TZ || 'America/New_York';
  cron.schedule('0 10 * * *', () => {
    console.log('[cron] Daily trigger fired');
    run().catch(console.error);
  }, { timezone: TZ });

  console.log(`[agent] Twitter DM agent scheduled — runs daily at 10:00 AM (${TZ})`);
  console.log('[agent] To run immediately: node twitter-dm-agent.js run');
}
