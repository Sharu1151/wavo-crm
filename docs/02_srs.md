# Software Requirements Specification (SRS) - Wavo CRM

## 1. Introduction
This Software Requirements Specification (SRS) document details the complete functional, performance, security, and interface specifications for Wavo CRM, a multi-tenant SaaS WhatsApp CRM platform.

---

## 2. Overall Description

### 2.1 System Architecture Overview
Wavo CRM is structured as a decoupled three-tier system:
1.  **Presentation Layer (Frontend):** A cross-platform Flutter application supporting responsive layouts (Web, iOS, Android, Desktop) built using Material 3 UI design principles, with the BLoC pattern managing local application states.
2.  **Application Layer (Backend):** A modular NestJS REST API framework deployed on AWS, managing business logic, session control, user access permissions (RBAC), background event queues (Redis + BullMQ), and third-party integrations (WhatsApp, Stripe, LLM providers).
3.  **Data Layer (Database & Cache):** A PostgreSQL relational database for transactional records (using Prisma ORM) and a Redis key-value store for session caching, token blacklisting, and background job queueing.

```
+-------------------------------------------------------------+
|                        FLUTTER APP                          |
|  [Auth UI]    [Pipeline Kanban]   [WhatsApp UI]  [Reports]   |
+------------------------------+------------------------------+
                               | REST API / HTTPS
                               v
+-------------------------------------------------------------+
|                        NESTJS BACKEND                       |
|  [Auth/RBAC]   [Business]  [CRM Core]   [WhatsApp]  [AI Service] |
+--------+---------------------+-------------------+----------+
         |                     |                   |
         v Prisma ORM          v Redis Client      v REST APIs
+-------------------+ +------------------+ +------------------+
|    POSTGRESQL     | |      REDIS       | | Third-Party APIs |
| (Multi-tenant DB) | | (Queue / Cache)  | | WhatsApp/Stripe  |
+-------------------+ +------------------+ +------------------+
```

### 2.2 System Constrains & Assumptions
*   **WhatsApp API:** Requires official integration with the Meta WhatsApp Business Cloud API. Standard rules on messaging templates, user opt-in, and payload limits apply.
*   **Data Isolation:** Enforced at the application level via custom interceptors/guards appending `business_id` filters to all transactional queries.
*   **Offline Support:** Flutter app will employ local caching (Hive or Isar database) for offline reading of customer records, but edits require active synchronization with the NestJS gateway.

---

## 3. Functional Requirements

### 3.1 Authentication & Registration (AR)
*   **AR-1: Account Creation:** Users can register as a new Business Owner. This establishes a new `Business` tenant record and assigns the user the `Business Owner` role.
*   **AR-2: OTP Validation:** Registration/Login can verify mobile phone numbers using an SMS Gateway (e.g., Twilio) generating temporary 6-digit OTP codes stored in Redis with a 5-minute TTL.
*   **AR-3: Social Authentication:** Supports Google Sign-In, returning OAuth identity payload verified on the backend, generating a custom JWT.
*   **AR-4: Session Management:** Backend issues access tokens (JWT, short lifetime: 15m) and refresh tokens (stored securely in client storage and database, lifetime: 30d).

### 3.2 Customer Management (CM)
*   **CM-1: Add/Edit Customer:** Fields validated: Mobile Number must be in E.164 format, Email must pass standard regex checks.
*   **CM-2: Timeline Tracking:** Any change in lead stage, payment invoice status, or follow-up logs must write an immutable history record to the `audit_logs` or `customer_timeline` table.
*   **CM-3: Tags:** Multiple strings can be attached to customer records, enabling flexible indexing and custom filtering.

### 3.3 Lead & Pipeline Management (LM)
*   **LM-1: Kanban Matrix:** The UI must display leads in columns matching their respective pipeline stages. Drag-and-drop actions update the stage on the database.
*   **LM-2: Lead Source Capture:** An open webhook API `/api/v1/leads/webhook` accepts JSON payloads from third-party lead sources and auto-assigns them based on round-robin business rules.

### 3.4 WhatsApp Helper & Broadcasting (WH)
*   **WH-1: Meta Template Sync:** Background cron schedules fetch approved templates from Meta WhatsApp Business Manager and store them in the local database.
*   **WH-2: Broadcasting Queue:** Broadcast campaigns to 100+ customers must not block HTTP threads. Messages are pushed to Redis-based BullMQ queues and throttled to respect WhatsApp's daily messaging quotas.
*   **WH-3: Variable Merging:** Message text templates support curly-brace fields (e.g., `Hello {{1}}, your invoice {{2}} is ready`), populated dynamically from customer data.

### 3.5 AI Core Integrations (AI)
*   **AI-1: Lead Scoring:** Runs asynchronously when a lead is created or updated. Factors in source, tags, and response frequency to generate a score (0 to 100).
*   **AI-2: Message Recommendation:** Processes recent 5 messages from the customer timeline, calls Gemini/OpenAI models with structured prompt parameters, and returns suggested actions and draft responses.

### 3.6 Invoicing & Billing (IB)
*   **IB-1: Invoice Number Generation:** Auto-incremented sequence unique per business tenant (e.g., `INV-2026-0001`).
*   **IB-2: Auto Reminder:** Invoices matching overdue date trigger automatic notification dispatch via WhatsApp or email.

---

## 4. Non-Functional Requirements

### 4.1 Security & Data Isolation
*   **JWT Access:** All endpoints (except auth and webhooks) require a valid `Bearer <Token>` in the authorization header.
*   **Encryption:** Database password fields hashed with `bcrypt` (work factor: 10). Sensitive third-party API keys (e.g., Meta WhatsApp tokens, Stripe credentials) stored encrypted using AES-256-GCM.
*   **Auditing:** System logs any high-risk mutations (billing changes, role updates, data exports) in `AuditLogs` referencing the user ID, business ID, IP address, and payload diff.

### 4.2 Performance & Reliability
*   **Response Time:** 95% of read API requests must return in less than 250ms under typical conditions.
*   **Availability:** 99.9% uptime SLA for SaaS services, leveraging multi-AZ AWS deployments.
*   **Database Indexes:** Indexes forced on foreign keys and compound keys containing `business_id` and search terms (like customer phone, email, and lead stage).

### 4.3 Accessibility & Localization
*   **Localization:** Flutter UI supports standard internationalization (`intl` library) localizing English, Spanish, and Arabic (RTL support).
*   **Accessibility:** Proper screen reader tags (`Semantics` widgets in Flutter) and high-contrast styling conforming to WCAG 2.1 AA guidelines.

---

## 5. External Interface Requirements

### 5.1 Third-Party API Integrations
1.  **WhatsApp Business Cloud API:** Integrates via official REST interfaces. Handles incoming webhooks containing customer replies, delivery statuses (`sent`, `delivered`, `read`).
2.  **Stripe API / Razorpay:** Webhook endpoints process subscription activation, renewal, card failures, and invoice closures.
3.  **LLM Providers:** Uses Vertex AI or OpenAI API via structured JSON schemas for generating consistent output structures.
4.  **SendGrid / Mailgun:** For business and subscription system emails (OTP logins, reset tokens, invoice copies).
