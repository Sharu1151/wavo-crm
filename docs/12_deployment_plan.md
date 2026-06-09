# Deployment & Release Plan - Wavo CRM

This document describes the environment strategies, zero-downtime container deployments, database migration protocols, and domain configurations for Wavo CRM.

---

## 1. Environment Configurations
Wavo CRM is divided into three isolated environments:

| Environment | Purpose | Infrastructure | Release Frequency |
| :--- | :--- | :--- | :--- |
| **Development** | Sandbox testing for developers. | Shared single container instance, Local PostgreSQL. | Continuous integration on push. |
| **Staging** | Production-mirror testing. QA validation. | Dedicated ECS Fargate (2 tasks), Multi-AZ RDS Postgres, Redis. | Automatic release when merging to `staging` branch. |
| **Production** | Live tenant environment. | Multi-AZ ECS Fargate (Auto-scaling), Multi-AZ RDS, Redis cluster. | Manual approval of release candidates from `main` branch. |

---

## 2. Zero-Downtime Release Strategy (Blue-Green)
To ensure continuous availability, particularly for real-time WhatsApp inbound hooks, deployments use a rolling blue-green style orchestrated by AWS ECS:

```
                  +--------------------------+
                  |  Load Balancer (ALB)     |
                  +------------+-------------+
                               |
            +------------------+------------------+
            | (Active: 100%)                      | (Active: 0%)
            v                                     v
+-----------------------+             +-----------------------+
|  Blue Target Group    |             |  Green Target Group   |
|  (Existing Task v1.0) |             |  (New Tasks v1.1)     |
+-----------------------+             +-----------+-----------+
                                                  | Run health check
                                                  v
                                      +-----------------------+
                                      |  Pass: Shift Traffic  |
                                      |  Fail: Rollback Image |
                                      +-----------------------+
```

1.  **Deployment Initialization:** A new container image is pushed to AWS ECR.
2.  **Container Spin-up:** AWS ECS launches new task instances (Green Group) using the updated container definition. Old instances (Blue Group) continue serving active user requests.
3.  **Health Verification:** The ALB polls the `/health` endpoint of the Green Group containers. The endpoint checks:
    *   PostgreSQL connectivity.
    *   Redis connection status.
    *   Meta WhatsApp webhook endpoint responsiveness.
4.  **Traffic Shifting:** Once health checks pass for 30 consecutive seconds, ALB begins routing requests to the Green Group and initiates a graceful connection draining sequence (5 minutes) on the Blue Group.
5.  **Clean Up:** Once connection draining is completed, the old Blue tasks are stopped.

---

## 3. Database Migration & Schema Compatibility
Schema changes are managed using **Prisma Migrations** and follow strict backward-compatibility rules:
*   **Dual-Phase Schema Design:** Columns are never renamed or deleted in a single release.
    *   *Step 1:* Add new column/table, deploy backend logic that writes to both old and new tables.
    *   *Step 2:* Run a background data migration script to backfill existing records.
    *   *Step 3:* Deploy backend logic reading only from the new table, then drop the old database column in a separate migration.
*   **Rollback Protocol:** If a migration fails halfway, the deployment is aborted. Prisma migrations run inside transactional blocks, allowing automatic rollback on syntax failures.

---

## 4. Domain Management and Edge Routing
*   **Domain Name System (DNS):** Handled via Amazon Route 53 with low latency routing.
*   **Static Asset Caching:** CloudFront CDN routes static resources (assets, web app bundles, icons) directly from S3, caching them at edge locations worldwide to reduce load times.
*   **SSL Certificates:** Automatically renewed SSL certificates provisioned via AWS Certificate Manager (ACM).

---

## 5. Post-Deployment Verification Checklist
Immediately after a production deployment, the QA lead runs automated checks:
- [ ] Verify HTTP `/health` returns status `200 OK`.
- [ ] Confirm active connections on PostgreSQL and Redis instances.
- [ ] Verify test user login (OTP verify) and API token issuance.
- [ ] Send test WhatsApp template to verification number, check logs for delivery status update.
- [ ] Generate a test PDF invoice and verify S3 storage write.
- [ ] Monitor CPU/Memory scaling metrics for 15 minutes.
