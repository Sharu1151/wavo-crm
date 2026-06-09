# Revenue Model & Financial Projections - Wavo CRM

This document details Wavo CRM's pricing models, service usage costs, customer unit economics, and three-year SaaS revenue projections.

---

## 1. Subscription Tiers & Pricing Design

Wavo CRM operates a multi-tier Software-as-a-Service (SaaS) subscription model billing monthly or annually (offering a 20% discount).

| Tier | Monthly Price | Target User | Feature Set Included |
| :--- | :--- | :--- | :--- |
| **Free Plan** | $0 | Freelancers, Side hustlers | Max 50 customer profiles, basic task list, 1 team member, standard support. |
| **Pro Plan** | $29 / month | Growing service reps | Unlimited customer profiles, 3 team members, full reporting dashboard, 5 custom templates. |
| **Business Plan** | $79 / month | Dedicated sales teams | Up to 15 team members, campaign broadcasts, full AI suite (scoring, suggestions, summaries). |
| **Enterprise Plan** | Custom Quote | Large multi-agent hubs | Unlimited team members, custom SLA, dedicated server deployments, API access. |

---

## 2. Unit Economics & Cost Breakdown
To maintain healthy gross margins (> 78%), the subscription pricing factors in three utility costs:

```
+--------------------------------------------------------------+
|                    WAVO CRM SUBSCRIPTION REVENUE             |
+------------------------------+-------------------------------+
                               |
            +------------------+------------------+
            | (Gross Margin: 80%)                 | (Infrastructure Costs: 20%)
            v                                     v
+-----------------------+             +-----------------------+
|  Net Profit Margin    |             |  WhatsApp Cloud API   |
|  (R&D, Sales, Profit) |             |  AI Model Calls (LLM) |
|                       |             |  Cloud Server Hosting |
+-----------------------+             +-----------------------+
```

1.  **WhatsApp Messaging API Costs:** Incurred directly from Meta (Conversation-Based Pricing).
    *   *User-Initiated Conversational Costs:* Approx $0.008 per chat session (24h window).
    *   *Business-Initiated Template Costs:* Approx $0.014 per broadcast template.
    *   *Mitigation:* Pro and Business plans include a set threshold of free conversations (e.g., 1,000 monthly). Usage above this limit is billed to the customer's credit card.
2.  **AI Services (LLM Execution API):**
    *   *Cost Per Interaction:* Gemini Flash models cost approx $0.0001 per call (suggestions/scoring).
    *   *Usage Ceiling:* Business users are capped at 5,000 AI interactions per month before experiencing rate limits.
3.  **Server Infrastructure (AWS & Cache):**
    *   *Hosting Cost:* Managed at roughly $0.80 per active tenant monthly via ECS scale settings.

---

## 3. Three-Year SaaS Growth Projection

This projection models realistic growth curves based on a $40 customer acquisition cost (CAC) and a 3.5% monthly churn rate.

### 3.1 Projections Table

| Metric | Year 1 | Year 2 | Year 3 |
| :--- | :--- | :--- | :--- |
| **Active Businesses (Tenants)** | 1,200 | 8,500 | 45,000 |
| **Paying Subscribers (Pro/Biz)**| 480 (40%) | 3,825 (45%) | 22,500 (50%) |
| **Average Revenue Per User (ARPU)**| $45.00 | $48.00 | $52.00 |
| **Annual Recurring Revenue (ARR)**| $259,200.00 | $2,203,200.00 | $14,040,000.00 |
| **Infrastructure Gross Margin**| 82% | 85% | 88% |
| **Marketing CAC Reinvestment** | $19,200.00 | $133,800.00 | $748,000.00 |

---

## 4. Key SaaS Health Indicators

### 4.1 LTV to CAC Ratio Target
*   **Customer Lifetime Value (LTV):** An average subscriber on the Pro Plan ($29/month) remains active for 28 months (based on a 3.5% churn rate), representing an LTV of $812.00.
*   **Customer Acquisition Cost (CAC):** Targeted at $40.00 through content marketing and digital ads.
*   **LTV:CAC Ratio:** **20:1**. This ratio indicates highly profitable customer acquisition channels, allowing the business to aggressively reinvest capital into growth.

### 4.2 Payback Period
*   With a CAC of $40.00 and an average customer revenue of $45.00/month, the acquisition cost is recovered within the first month of signup.
