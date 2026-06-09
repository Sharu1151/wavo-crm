# Wavo CRM - Turn Conversations Into Customers

Wavo CRM is a modern, premium multi-tenant Customer Relationship Management (CRM) application. It features a dark-themed glassmorphic user interface (Obsidian Design System) that provides business administrators with pipeline sales trackers, billing ledgers, WhatsApp template marketing dispatchers, and cognitive AI extensions.

---

## 🛠️ Technology Stack

- **Backend Gateway**: NestJS API with TypeScript.
- **ORM & Database**: Prisma ORM, PostgreSQL Database, and Redis for scheduler background logging.
- **Frontend SPA**: React (Vite) with TypeScript.
- **Styling system**: Raw CSS with custom Obsidian glassmorphic style tokens and micro-animations.
- **Documentation**: Swagger API UI.

---

## 📋 Prerequisites & Requirements

Before starting the project, ensure you have the following installed on your system:

1. **Node.js** (v18.0.0 or higher recommended)
2. **PostgreSQL Database** (running locally on port `5432` or via external service)
3. **Redis Server** (running locally on port `6379`)
4. **Git**

---

## 🚀 Setup & Installation Guide

Follow these steps sequentially to set up and run both servers locally.

### 1. Database Configuration
Create a database in your PostgreSQL instance (e.g. named `wavo_crm_db`).
In the [backend/.env](file:///f:/Wavo/backend/.env) file, configure your PostgreSQL and Redis access URIs:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/wavo_crm_db?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="super-secret-jwt-key"
ALLOWED_ORIGINS="http://localhost:3001"
```

### 2. Apply Relational Prisma Migrations
In your terminal, navigate to the `backend/` directory and run migrations to create the database schemas:
```bash
cd backend
npx prisma migrate dev --name init
```

### 3. Seed Database Records
Seed the database with default workspace parameters, roles, and a test administrator account:
```bash
npm run seed
```
*This seeds a default admin account:*
* **Email**: `owner@wavo.com`
* **Password**: `password123`

### 4. Run the NestJS Backend Server
Start the backend API gateway:
```bash
npm run start:dev
```
- The backend mounts API gateways at **`http://localhost:3000/api/v1`**.
- Swagger Interactive Documentation is available at **`http://localhost:3000/api-docs`**.

### 5. Run the Vite React Frontend
In a new terminal window, navigate to the `web-frontend/` directory, install packages, and launch the Vite server:
```bash
cd web-frontend
npm install
npm run dev
```
- The React application will boot up at **`http://localhost:3001`**.

---

## 💡 Feature Walkthrough & Demo Guide

Log in to the web dashboard at `http://localhost:3001` using the seeded developer account parameters by clicking **Autofill Credentials** on the login screen.

### 📊 Dashboard & Revenue Trends
- Review high-level indicators showing customer registration counts, pipelines, tasks, and monthly revenue.
- The trend chart renders custom SVG pathing mapping MRR metrics dynamically.

### 👥 Customer Repository
- Navigate to **Customers** in the sidebar to review contact databases.
- Click **Add Customer** to register a new customer profile.
- All customer listings are validated for duplicate mobile numbers.

### 📋 Kanban Pipeline Board
- Navigate to **Leads (Kanban)** to view the sales funnel.
- Drag card elements between stages (`NEW` ➔ `WON`). Dropping cards automatically fires API endpoints in the background to sync deal stage metrics.

### 💳 Invoices & Payments Ledger
- Navigate to **Invoices** to track outstanding MRR flow.
- Click **Create Invoice** to select a customer and generate custom billings with tax variables.
- Settle open invoice items by clicking **Record Payment**, filling out payment method details (Credit Card, Bank Transfer, WhatsApp Pay), and submitting. This automatically updates statuses to **Paid**.

### 💬 WhatsApp Campaigns & Templates
- Navigate to **WA Helper** in the sidebar.
- Create approved content templates with variable indicators (`{{1}}`).
- Click **Dispatch Campaign** to queue or broadcast mock template alerts to customer contacts. Broadcast history and reach metrics update automatically.

### 🧠 AI Intelligence Workspace
- Navigate to **AI Insights** to explore simulated cognitive extensions:
  - **Lead Scoring**: Predict closing rates on pipeline deals using radial ring gauges.
  - **Outreach Creator**: Generate friendly, formal, or urgent pitch copy based on deal details.
  - **Reply Suggestions**: Input incoming inquiry texts to obtain 3 quick click-to-copy reply suggestions.
  - **Timeline Summaries**: Retrieve custom timelines and summarize client profile logs into an executive paragraph.

### ⚙️ Workspace Settings & Quotas
- Navigate to **Settings** in the sidebar.
- Monitor subscriber seat quotas and registered customer limit progress bars based on the active multi-tenant plan.
- Warning banners alert team leaders if database quotas are approaching system limitations.
