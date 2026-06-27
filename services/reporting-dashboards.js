// Reporting & Dashboard Automation — #8 (Best upsell service)
// Industries: All — sold as an add-on to any automation package
// Price: $500-$1,500 setup + $97-$197/mo (best sold bundled)
// Sales cycle: Sold as upsell during initial engagement (fastest close)

export const SERVICE_ID = 'reporting-dashboards';
export const SERVICE_NAME = 'Reporting & Performance Dashboards';

// ── Report Templates ──────────────────────────────────────────────

export const reportTemplates = {

  // Report 1: Weekly business performance email
  weekly_performance: {
    name: 'Weekly Business Performance Report',
    schedule: 'monday_7am',
    recipient: 'business_owner',
    subject: '📊 Weekly Report — {{business_name}} — Week of {{week_start_date}}',
    sections: [
      {
        title: 'Revenue This Week',
        metrics: ['total_revenue', 'revenue_vs_last_week_pct', 'revenue_vs_goal_pct'],
        template: `💰 Revenue: ${{total_revenue}}
{{revenue_trend_arrow}} {{revenue_vs_last_week_pct}}% vs last week
{{goal_status}}: {{revenue_vs_goal_pct}}% of weekly goal`,
      },
      {
        title: 'Leads & Pipeline',
        metrics: ['new_leads', 'leads_contacted', 'appointments_booked', 'deals_closed'],
        template: `🎯 New leads: {{new_leads}}
📞 Contacted: {{leads_contacted}} ({{contact_rate}}%)
📅 Appointments booked: {{appointments_booked}}
✅ Deals closed: {{deals_closed}}`,
      },
      {
        title: 'Customer Activity',
        metrics: ['new_customers', 'returning_customers', 'churned_customers', 'avg_order_value'],
        template: `👤 New customers: {{new_customers}}
🔁 Returning customers: {{returning_customers}}
📉 Churned: {{churned_customers}}
💵 Avg order value: ${{avg_order_value}}`,
      },
      {
        title: 'Top Action Items',
        metrics: ['stagnant_leads', 'unanswered_reviews', 'overdue_followups'],
        template: `⚠️ Stagnant leads to follow up: {{stagnant_leads}}
⭐ Reviews needing response: {{unanswered_reviews}}
🔔 Overdue follow-ups: {{overdue_followups}}`,
      },
    ],
    footer: `Full dashboard: {{dashboard_link}}
Report generated: {{generated_at}} | AutoFlow — {{agency_name}}`,
  },

  // Report 2: Lead source tracking report
  lead_source_report: {
    name: 'Lead Source Attribution Report',
    schedule: 'monthly_first_monday',
    recipient: 'business_owner',
    subject: '📈 Lead Source Report — {{month_year}} — {{business_name}}',
    sections: [
      {
        title: 'Lead Volume by Source',
        template: `{{#each lead_sources}}
{{source_name}}: {{lead_count}} leads ({{pct}}% of total)
  → {{converted_count}} converted ({{conversion_rate}}%)
  → Est. revenue: ${{revenue_attributed}}
{{/each}}

Best performing source: {{top_source}}
Worst performing source: {{bottom_source}}
Cost per lead by source: {{cpl_breakdown}}`,
      },
      {
        title: 'Conversion Funnel',
        template: `Total leads: {{total_leads}}
↓ Contacted: {{contacted}} ({{contact_rate}}%)
↓ Qualified: {{qualified}} ({{qualify_rate}}%)
↓ Proposal sent: {{proposals}} ({{proposal_rate}}%)
↓ Closed: {{closed}} ({{close_rate}}%)

Average sales cycle: {{avg_days_to_close}} days
Average deal value: ${{avg_deal_value}}`,
      },
    ],
  },

  // Report 3: Revenue attribution summary
  revenue_attribution: {
    name: 'Revenue Attribution Summary',
    schedule: 'monthly_last_day',
    recipient: ['business_owner', 'finance_contact'],
    subject: '💼 Revenue Report — {{month_year}} — {{business_name}}',
    sections: [
      {
        title: 'Monthly Revenue Summary',
        template: `Total revenue: ${{total_revenue}}
  New customer revenue: ${{new_customer_revenue}} ({{new_pct}}%)
  Returning customer revenue: ${{returning_revenue}} ({{returning_pct}}%)

MRR (if subscription): ${{mrr}}
MRR growth: {{mrr_growth_pct}}%

Revenue by service/product:
{{#each products}}
  {{product_name}}: ${{revenue}} ({{pct}}%)
{{/each}}`,
      },
      {
        title: 'YTD vs Goal',
        template: `YTD revenue: ${{ytd_revenue}}
Annual goal: ${{annual_goal}}
% of goal reached: {{goal_pct}}%
Projected year-end: ${{projected_year_end}}
On track: {{on_track_indicator}}`,
      },
      {
        title: 'Top Customers This Month',
        template: `{{#each top_customers}}
{{rank}}. {{customer_name}} — ${{spent}}
{{/each}}`,
      },
    ],
  },

  // Report 4: Daily ops digest (for active campaigns)
  daily_ops_digest: {
    name: 'Daily Operations Digest',
    schedule: 'daily_8am_weekdays',
    recipient: 'business_owner',
    subject: '☀️ Daily Digest — {{business_name}} — {{today_date}}',
    sections: [
      {
        title: "Yesterday's Activity",
        template: `Emails sent: {{emails_sent}} | Opens: {{email_opens}} ({{open_rate}}%) | Replies: {{replies}}
New leads: {{new_leads}} | Calls booked: {{calls_booked}}
Revenue collected: ${{revenue_yesterday}}`,
      },
      {
        title: "Today's Queue",
        template: `Follow-ups due today: {{followups_due}}
Appointments scheduled: {{appointments_today}}
Proposals expiring: {{proposals_expiring}}`,
      },
    ],
  },
};

// ── Dashboard Widget Configs ──────────────────────────────────────

export const dashboardWidgets = [
  { id: 'revenue_chart',    type: 'line_chart', label: 'Revenue (30d)',        data_source: 'transactions' },
  { id: 'leads_funnel',     type: 'funnel',     label: 'Lead Pipeline',        data_source: 'crm_stages' },
  { id: 'email_stats',      type: 'metric_row', label: 'Email Performance',    data_source: 'email_campaigns' },
  { id: 'review_score',     type: 'gauge',      label: 'Avg Review Rating',    data_source: 'review_platforms' },
  { id: 'appointments',     type: 'calendar',   label: 'Upcoming Appointments',data_source: 'booking_system' },
  { id: 'top_lead_sources', type: 'pie_chart',  label: 'Lead Sources',         data_source: 'lead_attribution' },
  { id: 'response_time',    type: 'metric',     label: 'Avg Lead Response Time',data_source: 'crm_activity' },
  { id: 'churn_rate',       type: 'metric',     label: 'Customer Churn Rate',  data_source: 'customer_lifecycle' },
];

// ── Report Delivery ───────────────────────────────────────────────

export function buildReport(templateId, data) {
  const template = reportTemplates[templateId];
  if (!template) throw new Error(`Unknown report template: ${templateId}`);
  return {
    subject: renderTemplate(template.subject, data),
    sections: template.sections.map(s => ({
      title: s.title,
      content: renderTemplate(s.template, data),
    })),
    footer: template.footer ? renderTemplate(template.footer, data) : '',
  };
}

export function renderTemplate(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `[${key}]`);
}
