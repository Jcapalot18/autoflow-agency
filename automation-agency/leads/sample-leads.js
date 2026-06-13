'use strict';

/**
 * Sample lead list for the AutoFlow Outreach Agent.
 *
 * In production, replace or extend this with:
 *   - A Google Maps scraper (use Apify's Google Maps actor or Outscraper)
 *   - An Apollo.io CSV export
 *   - Any CSV loaded with the `csv-parse` package
 *
 * Required fields per lead: email, first_name, business_name, niche
 * Valid niches: marketing_agency | ecommerce | local_service | coach_consultant
 */

const LEADS = [
  // ── Marketing Agencies ──────────────────────────────────────────────────
  { email: 'hello@brightpixelmedia.com',       first_name: 'Alex',    business_name: 'Bright Pixel Media',       niche: 'marketing_agency' },
  { email: 'info@growthlaunchagency.com',       first_name: 'Sarah',   business_name: 'GrowthLaunch Agency',      niche: 'marketing_agency' },
  { email: 'team@northstarmktg.com',            first_name: 'Mike',    business_name: 'North Star Marketing',     niche: 'marketing_agency' },
  { email: 'contact@elevatebrands.co',          first_name: 'Jordan',  business_name: 'Elevate Brands',           niche: 'marketing_agency' },
  { email: 'hello@pulsedigitalco.com',          first_name: 'Taylor',  business_name: 'Pulse Digital Co.',        niche: 'marketing_agency' },

  // ── E-commerce Stores ───────────────────────────────────────────────────
  { email: 'owner@urbanthreadco.com',           first_name: 'Marcus',  business_name: 'Urban Thread Co.',         niche: 'ecommerce' },
  { email: 'hello@peakgearoutlet.com',          first_name: 'Ashley',  business_name: 'Peak Gear Outlet',         niche: 'ecommerce' },
  { email: 'support@lunabeautyshop.com',        first_name: 'Priya',   business_name: 'Luna Beauty Shop',         niche: 'ecommerce' },
  { email: 'info@craftedhomeco.com',            first_name: 'Daniel',  business_name: 'Crafted Home Co.',         niche: 'ecommerce' },
  { email: 'hi@sunrisegearco.com',              first_name: 'Riley',   business_name: 'Sunrise Gear Co.',         niche: 'ecommerce' },

  // ── Local Service Businesses ────────────────────────────────────────────
  { email: 'info@precisionplumbingpros.com',    first_name: 'Dave',    business_name: 'Precision Plumbing Pros',  niche: 'local_service' },
  { email: 'hello@greenshieldlawn.com',         first_name: 'Chris',   business_name: 'GreenShield Lawn Care',    niche: 'local_service' },
  { email: 'book@velvetstudiohair.com',         first_name: 'Mia',     business_name: 'Velvet Studio Hair',       niche: 'local_service' },
  { email: 'quotes@apexroofingco.com',          first_name: 'Steve',   business_name: 'Apex Roofing Co.',         niche: 'local_service' },
  { email: 'info@cleanslatedetailing.com',      first_name: 'Tony',    business_name: 'Clean Slate Detailing',    niche: 'local_service' },

  // ── Coaches & Consultants ───────────────────────────────────────────────
  { email: 'hello@lauraholmescoach.com',        first_name: 'Laura',   business_name: 'Laura Holmes Coaching',    niche: 'coach_consultant' },
  { email: 'contact@brandonkellyconsulting.com',first_name: 'Brandon', business_name: 'Brandon Kelly Consulting', niche: 'coach_consultant' },
  { email: 'info@mindsetshiftcoaching.com',     first_name: 'Aisha',   business_name: 'Mindset Shift Coaching',   niche: 'coach_consultant' },
  { email: 'hello@revenuereadyconsulting.com',  first_name: 'Nathan',  business_name: 'Revenue Ready Consulting', niche: 'coach_consultant' },
  { email: 'team@clarityleadcoach.com',         first_name: 'Emma',    business_name: 'Clarity Lead Coaching',    niche: 'coach_consultant' },
];

module.exports = LEADS;
