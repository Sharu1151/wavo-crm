# DevOps & Infrastructure Specification - Wavo CRM

This document details the cloud hosting topology, containerization patterns, CI/CD pipeline structures, and monitoring architecture for Wavo CRM, ensuring 100,000+ tenant scalability with high availability.

---

## 1. Network & Infrastructure Topology (AWS Cloud)
The system is deployed within a highly secure AWS Virtual Private Cloud (VPC) spanned across multiple Availability Zones (AZs).

```
+-----------------------------------------------------------------------------------+
|                                     AWS VPC                                       |
|                                                                                   |
|  [Internet Gateway]                                                               |
|        |                                                                          |
|        v                                                                          |
|  [Application Load Balancer (ALB)] <--- SSL Terminated (AWS Certificate Manager)  |
|        |                                                                          |
|  +-----+----------------------------------+------------------------------------+  |
|  |     | Public Subnet (AZ-A)             | Public Subnet (AZ-B)               |  |
|  |     v                                  |                                    |  |
|  |  [NAT Gateway A]                       | [NAT Gateway B]                    |  |
|  +-----+----------------------------------+------------------------------------+  |
|        |                                  |                                    |  |
|  +-----+----------------------------------+------------------------------------+  |
|  |     v Private Subnet (AZ-A)            v Private Subnet (AZ-B)              |  |
|  |  [ECS Fargate Task - NestJS API]   [ECS Fargate Task - NestJS API]          |  |
|  |  [ECS Fargate Task - Queue Worker] [ECS Fargate Task - Queue Worker]        |  |
|  +-----+----------------------------------+------------------------------------+  |
|        |                                  |                                    |  |
|  +-----+----------------------------------+------------------------------------+  |
|  |     v Database Subnet (AZ-A)           v Database Subnet (AZ-B)             |  |
|  |  [RDS PostgreSQL - Primary]  ------->  [RDS PostgreSQL - Read Replica]      |  |
|  |  [ElastiCache Redis - Primary] ------>  [ElastiCache Redis - Replica]        |  |
|  +----------------------------------------+------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

### 1.1 Infrastructure Components
*   **Application Load Balancer (ALB):** Routes inbound traffic securely, handles SSL certificates via AWS Certificate Manager (ACM), and blocks bad IPs using AWS WAF.
*   **AWS ECS (Elastic Container Service) with Fargate:** Serverless container execution. Eliminates EC2 server management.
    *   *API Service Container:* Handles stateless REST API transactions.
    *   *Worker Container:* Runs the background queue process (BullMQ consumers).
*   **Amazon RDS PostgreSQL (Multi-AZ):** Automates active-passive database replication between zones, enabling automatic recovery under failure.
*   **Amazon ElastiCache (Redis):** Manages message brokers, session states, and query result caching.

---

## 2. Containerization (Docker Architecture)
The backend container is optimized using a multi-stage Docker build to reduce image sizes to < 150MB.

*   **Stage 1 (Build):** Compiles NestJS typescript files, generates Prisma Client assets, and builds packages.
*   **Stage 2 (Production):** Installs production dependencies and copies built assets, minimizing vulnerabilities by running under a non-root user.

---

## 3. Continuous Integration & Deployment (CI/CD)
The deployment is automated using **GitHub Actions** workflows mapping branches to environment pipelines.

```
+------------------+     +-------------------+     +------------------+
|   Code Commit    | --> | Run Linter & Test | --> | Build Docker     |
|   (main branch)  |     | (Vitest / Flutter)|     | Image & Push ECR |
+------------------+     +-------------------+     +--------+---------+
                                                            |
+------------------+     +-------------------+              |
|  Complete App    | <-- | ECS Task Definition | <----------+
|  Zero-Downtime   |     | Update (Fargate)  |
+------------------+     +-------------------+
```

### 3.1 Pipeline Stages
1.  **Linter & Code Health:** Checks formatting guidelines and runs backend/frontend test suites.
2.  **Docker Registry Push:** Builds production images and labels them with git commit SHAs, pushing them to AWS Elastic Container Registry (ECR).
3.  **Task Revision Deployment:** Creates a new task definition on AWS ECS and triggers a rolling update, keeping old containers running until new containers pass health checks (Zero-Downtime).

---

## 4. Monitoring & Telemetry Strategy
*   **Application Logs:** NestJS uses `Winston` logging, writing JSON formatting directly to standard out, captured by AWS CloudWatch Logs.
*   **Application Metrics:** Custom metrics exposed via Prometheus formats on `/metrics` endpoint.
*   **Performance Monitoring:** Sentry tracks errors on both Flutter and NestJS. Datadog captures request tracing (APM) and container stats.
*   **Alerting Thresholds:** Immediate alerts (Slack/PagerDuty) are dispatched if:
    *   API success rate falls below 99.5%.
    *   P95 response latency exceeds 500ms.
    *   ECS CPU/Memory utilization exceeds 85% for 5 minutes.
    *   Database connection pools are exhausted.
