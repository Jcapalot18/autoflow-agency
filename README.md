# AutoFlow Agency

Marketing site + lead-capture backend for AutoFlow, deployed on Vercel with a
Supabase Edge Function (`send-blueprint`) handling the "free automation
blueprint" form, and a couple of Node scripts for outreach/social automation.

## Local setup

```
npm install
```

`npm install` runs the `prepare` script, which points git at the versioned
hooks in `.githooks/` for this clone (`git config core.hooksPath .githooks`).
That's all that's needed to enable them — no extra tooling required.

## Pre-commit secret scan

`.githooks/pre-commit` blocks a commit if any staged addition looks like a
live credential (Stripe secret key, AWS access key, PEM private key, raw
JWT, Slack/GitHub tokens, etc.). It's a lightweight grep-based backstop, not
a replacement for keeping real secrets out of the repo in the first place —
this exists because a live Stripe key was previously found sitting unstaged
in this repo.

It runs automatically on `git commit` once you've run `npm install` (see
above). If it blocks a legitimate commit, move the flagged value into an
untracked `.env` file rather than bypassing the hook; if it's a false
positive on non-secret content, adjust the patterns in
`.githooks/pre-commit`.

To confirm it's active in your clone:

```
git config --get core.hooksPath   # should print .githooks
```

## Environment variables

See `.env.example` for the full list (Anthropic, Supabase, Twitter/LinkedIn,
Resend). Real values live in an untracked `.env` — never commit it.
