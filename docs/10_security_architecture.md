# Security & Compliance Specification - Wavo CRM

Wavo CRM implements enterprise-grade security protocols designed to prevent data leakage, shield client contact information, and fulfill regulatory compliance standards.

---

## 1. Authentication Security & Lifecycle

### 1.1 JSON Web Tokens (JWT) Management
*   **Access Token:** Valid for 15 minutes. Holds minimal non-sensitive identity metadata (User ID, Role, Tenant/Business ID).
*   **Refresh Token:** Valid for 30 days. Stored inside PostgreSQL with SHA-256 hashing. Can be manually revoked by the user (by clearing sessions) or automatically invalidated upon role updates.
*   **Token Transport:** On Web, tokens are stored inside secure, HTTP-only, SameSite=Strict cookies to block Cross-Site Scripting (XSS) extraction. On Mobile, stored securely inside iOS Keychain and Android Keystore.

### 1.2 Authentication Security Policies
*   **Brute-Force Protection:** Rate limiting enforced via Redis. If a phone number or IP address requests OTP codes or enters incorrect passwords more than 5 times in 10 minutes, the account is locked for 1 hour.
*   **Session Isolation:** If a single account registers active logins from more than 3 distinct physical devices, older sessions are automatically terminated.

---

## 2. Cryptographic Storage & Transit Encryption

### 2.1 Encryption in Transit
*   All web traffic is forced over HTTPS using **TLS 1.3** protocols. Weak cipher suites are disabled at the Application Load Balancer.

### 2.2 Encryption at Rest
*   **AWS RDS Storage Volume Encryption:** Entire PostgreSQL physical disks are encrypted using AWS Key Management Service (KMS) with customer-managed keys (AES-256).
*   **Field-Level Envelope Encryption:** Sensitive credentials, such as WhatsApp Meta access tokens, SMTP passwords, and external payment integration keys, are encrypted before being saved. The app uses an encryption service utilizing AES-256-GCM, utilizing keys rotated yearly.

---

## 3. Strict Multi-Tenant Isolation Boundaries
To prevent cross-tenant data leaks, Wavo CRM implements security boundaries at three layers:

```
+-------------------------------------------------------------+
| APPLICATION ROUTER  | Validates JWT, extracts Business ID   |
+------------------------------+------------------------------+
                               | Attaches business_id to context
                               v
+-------------------------------------------------------------+
|   CONTROLLER / GUARD | Rejects requests mismatched with     |
|                      | path parameter IDs                   |
+------------------------------+------------------------------+
                               | Passes business_id to service
                               v
+-------------------------------------------------------------+
|    DATABASE QUERY    | Prisma Client Middleware automatically|
|                      | appends business_id where clauses    |
+-------------------------------------------------------------+
```

1.  **Network Layer:** Single database deployment with logical isolation (schema filtering index).
2.  **Logic Layer:** Every repository layer query is appended with a `where: { businessId: req.businessId }` filter.
3.  **Validation Layer:** If a user requests a record by UUID (e.g. `/leads/31b67d5e...`), the query will return a 404 error if that record exists but does not belong to the user's business ID, blocking validation attacks.

---

## 4. Audit Logging & High-Risk Event Tracking
A dedicated `AuditLogs` table monitors mutations of high importance. Write permissions to this table are denied to standard APIs; insertions can only occur through database trigger procedures or custom backend services.
*   **Captured Events:** User password changes, privilege escalation (e.g., manager upgrading staff user to manager), data exports (CSV exports of customers), changes to business bank details, and billing tier updates.
*   **Record Structure:** Contains timestamp, user ID, business ID, action key, IP address, and JSON diff payloads showing before and after changes (omitting passwords or tokens).

---

## 5. Database Backup and Disaster Recovery (DR)
*   **Automated Backups:** Daily logical database dumps stored inside encrypted AWS S3 buckets configured with Object Lock to prevent write alterations (immutable backups).
*   **Point-in-Time Recovery (PITR):** PostgreSQL Write-Ahead Logs (WAL) are shipped to S3 every 5 minutes, enabling database restores to any second within the past 35 days.
*   **Disaster Recovery SLA:**
    *   **Recovery Point Objective (RPO):** Maximum data loss of 5 minutes.
    *   **Recovery Time Objective (RTO):** System restored and running under alternative backup servers in less than 2 hours.
