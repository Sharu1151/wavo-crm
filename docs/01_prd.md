# Product Requirements Document (PRD) - Wavo CRM

## 1. Executive Summary
**Product Name:** Wavo CRM  
**Tagline:** Turn Conversations Into Customers  
**Target Market:** Small and Medium-Sized Businesses (SMBs), Freelancers, Service Providers, Sales Teams, Clinics, retail, and Real Estate Agents.  
**Product Vision:** Wavo CRM bridges the gap between conversational messaging (specifically WhatsApp) and traditional CRM capabilities. It allows SMBs to manage their customer pipelines, automate follow-ups, broadcast templated messages, score leads with AI, and track business revenue directly from a consolidated Web/Mobile app, scaling business operations without enterprise-level complexity.

---

## 2. Target Users & User Personas

### 2.1 User Personas
*   **The Busy Owner (e.g., Sarah, Real Estate Agent):** Needs to quickly log leads from WhatsApp, schedule follow-up reminders, and get automated suggestions for replies so she doesn't lose deals while on the move.
*   **The Clinic Administrator (e.g., David, Dental Clinic Manager):** Sends appointment confirmation templates, monitors customer history (timeline), and issues payment invoices.
*   **The Support Agent (e.g., Priya, Retail Support):** Uses quick replies, responds to customer inquiries, and updates tags or ticket statuses to escalate issues to managers.
*   **The Super Admin (Wavo Internal SaaS Operations):** Oversees the platform's subscriptions, monitors aggregate business registration metrics, resolves support tickets, and views system audits.

### 2.2 User Roles & Permissions Matrix
Wavo CRM supports Role-Based Access Control (RBAC) to ensure security and compliance:

| Role | Description | Permissions |
| :--- | :--- | :--- |
| **Super Admin** | Wavo platform owner | Full system access, platform billing, global business management, global audit logs. |
| **Business Owner** | Subscribed tenant owner | Full access to their business account, subscription billing, team management, integrations. |
| **Manager** | Operations/Sales manager | Team task assignments, lead allocation, sales pipeline management, customer records, reports. |
| **Sales Executive** | Frontline sales representative | Customer/Lead management (assigned only), pipeline tracking, sending follow-ups, invoice creation. |
| **Support Executive** | Frontline customer support | View customer timeline, send WhatsApp templates, answer quick replies, resolve tasks. |
| **Staff User** | General worker / Read-only | View assigned customers/tasks, log timeline activities, edit own profile details. |

---

## 3. Core Modules & Product Features

### 3.1 Authentication & Session Management
*   **Authentication Options:** Email/password login, Phone + OTP login (vital for WhatsApp-centric workflows), Google OAuth 2.0.
*   **Key Features:**
    *   Secure JWT-based session tokens.
    *   Password reset via secure email tokens.
    *   Multi-device active session listing and remote logout capabilities.
    *   Auto-refreshing tokens for a seamless mobile/desktop transition.

### 3.2 Business Profile & Multi-Tenancy
*   **Multi-Tenancy:** Each business is an isolated tenant. Data leakage between businesses is prevented at the database query level.
*   **Settings:** Business Name, Type (e.g., Real Estate, Clinic), Address, GST/Tax Number, Logo, Contact Details, Time Zone, and Operating Hours.

### 3.3 Customer Management
*   **Central Customer Repository:** Store Full Name, Mobile Number (with country code), Email, Address, Company, Source (e.g., WhatsApp, Reference, Website), Status (Active, Inactive, Blocked).
*   **Interactive Timeline:** A running log of all activities associated with a customer: call notes, sent WhatsApp templates, task completions, stage shifts, and payments.
*   **Segmentation:** Add tags (e.g., "VIP", "Hot Lead", "Inquiry") and custom rich text notes to profiles.

### 3.4 Lead & Pipeline Management
*   **Lead Pipeline:** A visual Kanban style pipeline mapping the progress of leads through pre-defined stages:
    *   `New` $\rightarrow$ `Contacted` $\rightarrow$ `Interested` $\rightarrow$ `Proposal Sent` $\rightarrow$ `Negotiation` $\rightarrow$ `Won` / `Lost`.
*   **Lead Capture:** APIs and Webhooks to capture leads automatically from website forms, Facebook Lead Ads, or inbound WhatsApp messages.
*   **Lead Scoring (AI-powered):** Predicts deal conversion probability based on past interactions, response speed, and customer profile details.

### 3.5 Follow-Up & Task Management
*   **Follow-Up Scheduling:** Setup reminders with a designated Type (`Call`, `WhatsApp`, `Meeting`, `Email`), Date & Time, and customizable description.
*   **Follow-Up History & Notes:** Document outcome of follow-up (e.g., "Customer busy, called back later") and trigger automated rescheduling.
*   **Task Management:** Assign tasks to teammates with priority indicators (`Low`, `Medium`, `High`), due dates, status updates, and comments thread.

### 3.6 WhatsApp Helper & Broadcasting
*   **Message Templates:** Create, review, and store pre-approved WhatsApp templates categorized by:
    *   `Welcome`, `Follow-Up`, `Payment Reminder`, `Appointment Reminder`, `Promotions`.
*   **Quick Replies:** Keyword-triggered shortcuts for support executives (e.g., `/pricing` outputs the standard pricing breakdown).
*   **Campaign Broadcasts:** Send bulk template messages to segmented lists of customers while respecting API rate limits and opt-out regulations to avoid spam blocks.

### 3.7 AI Module (Cognitive CRM Extensions)
*   **AI Reply Suggestion:** Reads inbound customer message and proposes 3 quick-replies.
*   **AI Message Generation:** Generates professional outreach text based on custom bullet points and chosen tone (Formal, Friendly, Urgent).
*   **AI Customer Summary:** Summarizes customer timeline history into a brief paragraph for sales reps before calls.
*   **AI Sales Insights:** Analyzes team activity logs, conversion speed, and pipeline distribution to offer strategic growth tips.

### 3.8 Payment & Invoice Tracking
*   **Invoice Ledger:** Record Invoice Number, Customer reference, Gross Amount, Tax (GST), Due Date, and Status (`Draft`, `Sent`, `Paid`, `Overdue`, `Cancelled`).
*   **Payment Ledger:** Links to invoices, recording Payment Method, Transaction Reference ID, and Received Date.
*   **Revenue Reports:** Visual tracking of Monthly Recurring Revenue (MRR), Outstanding/Pending receivables, and conversion analytics.

### 3.9 Reports & Dashboard Analytics
*   **High-Level Widgets:** Total Active Customers, Active Leads Count, Pending Follow-Ups (Overdue vs Today), Monthly Revenue, and Lead Conversion Rate.
*   **Visualizations:**
    *   **Revenue Chart:** Monthly sales bar charts and cohort curves.
    *   **Lead Funnel:** Visual drop-offs at each pipeline stage.
    *   **Follow-up Performance:** Success rates of tasks and calls per rep.
    *   **Customer Growth:** Line charts mapping new sign-ups over time.

### 3.10 Subscription Management (SaaS Tiers)

| Feature | Free Plan | Pro Plan | Business Plan | Enterprise Plan |
| :--- | :--- | :--- | :--- | :--- |
| **Active Customers** | Max 50 | Unlimited | Unlimited | Unlimited |
| **Team Users** | 1 User | Up to 3 Users | Up to 15 Users | Unlimited |
| **WhatsApp Templates**| Basic templates | Custom + Quick Replies | Campaign Broadcasts | Custom Integrations |
| **AI Features** | None | Basic suggestions | Full AI Suite (Scoring) | Custom SLA / Models |
| **Analytics** | Basic widgets | Advanced dashboards | Team Performance | Custom Analytics |
| **Monthly Pricing** | $0 | $29 / month | $79 / month | Custom Contract |

---

## 4. Non-Functional & System Requirements
*   **User Interface:** Sleek, modern Material 3 theme. Similar to Zoho and Linear (dark mode preference, clean margins, fast load times < 1.5s).
*   **Scalability:** Must support up to 100,000 active businesses, translating to roughly 20-30 million customer records and 500 requests per second (RPS) peak load.
*   **Data Isolation:** Strict tenant-key-based indexing (`business_id` columns in all tables) enforced programmatically or through database views.
*   **Security:** OWASP top 10 compliance, AES-256 field encryption for sensitive customer tokens, and bcrypt password hashing.
