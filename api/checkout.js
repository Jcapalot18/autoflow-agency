const Stripe = require('stripe');

const PACKAGES = {
  starter: {
    name: 'AutoFlow — Starter Package',
    description: '1 custom outreach agent · Google Maps lead sourcing · AI-personalized cold emails · 3-step follow-up sequence · Deployed to your server · Full source code · 30-day email support',
    amount: 150000,
  },
  pro: {
    name: 'AutoFlow — Pro Package',
    description: '3 custom outreach agents · Multi-city targeting · Auto-reply bot · Revenue dashboard · Ecosystem manager · Daily summary emails · 60-day support',
    amount: 300000,
  },
  custom: {
    name: 'AutoFlow — Custom Package',
    description: 'Unlimited agents · Full sales pipeline automation · CRM & tool integrations · Custom dashboard · AI phone & SMS agents · Ongoing maintenance · Dedicated support channel',
    amount: 500000,
  },
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pkg = (req.body && req.body.package) || '';
  const plan = PACKAGES[pkg];

  if (!plan) {
    return res.status(400).json({ error: 'Invalid package' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
  });

  const origin =
    req.headers['x-forwarded-host']
      ? `https://${req.headers['x-forwarded-host']}`
      : req.headers.origin || 'https://autoflow-agency.vercel.app';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: plan.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#packages`,
      metadata: { package: pkg },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
