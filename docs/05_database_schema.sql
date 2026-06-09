-- Wavo CRM PostgreSQL Database Schema DDL Script
-- Target Database: PostgreSQL 14+
-- Architecture: Multi-Tenant isolated by business_id references

-- Enable UUID extension for secure, non-sequential IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

---------------------------------------------------------
-- 1. ENUMS AND CUSTOM TYPES
---------------------------------------------------------

CREATE TYPE user_role_name AS ENUM (
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'MANAGER',
  'SALES_EXECUTIVE',
  'SUPPORT_EXECUTIVE',
  'STAFF_USER'
);

CREATE TYPE lead_stage AS ENUM (
  'NEW',
  'CONTACTED',
  'INTERESTED',
  'PROPOSAL_SENT',
  'NEGOTIATION',
  'WON',
  'LOST'
);

CREATE TYPE reminder_type AS ENUM (
  'CALL',
  'WHATSAPP',
  'MEETING',
  'EMAIL'
);

CREATE TYPE follow_up_status AS ENUM (
  'PENDING',
  'COMPLETED',
  'RESCHEDULED',
  'CANCELLED'
);

CREATE TYPE task_priority AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH'
);

CREATE TYPE task_status AS ENUM (
  'TODO',
  'IN_PROGRESS',
  'BLOCKED',
  'DONE'
);

CREATE TYPE invoice_status AS ENUM (
  'DRAFT',
  'SENT',
  'PAID',
  'OVERDUE',
  'CANCELLED'
);

CREATE TYPE payment_status AS ENUM (
  'PENDING',
  'SUCCESSFUL',
  'FAILED',
  'REFUNDED'
);

CREATE TYPE subscription_plan_type AS ENUM (
  'FREE',
  'PRO',
  'BUSINESS',
  'ENTERPRISE'
);

CREATE TYPE subscription_status AS ENUM (
  'ACTIVE',
  'TRIALING',
  'PAST_DUE',
  'CANCELED',
  'UNPAID'
);

CREATE TYPE template_category AS ENUM (
  'WELCOME',
  'FOLLOW_UP',
  'PAYMENT_REMINDER',
  'APPOINTMENT_REMINDER',
  'PROMOTIONS'
);

CREATE TYPE campaign_status AS ENUM (
  'DRAFT',
  'SCHEDULED',
  'PROCESSING',
  'COMPLETED',
  'FAILED'
);

---------------------------------------------------------
-- 2. TABLE SCHEMAS
---------------------------------------------------------

-- 2.1 Businesses (Tenant Metadata)
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  business_type VARCHAR(100),
  address TEXT,
  logo_url VARCHAR(255),
  gst_number VARCHAR(15) UNIQUE,
  phone VARCHAR(20),
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.2 Roles and Permissions
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name user_role_name UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'leads:create', 'billing:view'
  description TEXT
);

CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 2.3 Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(150) UNIQUE,
  phone_number VARCHAR(30) UNIQUE,
  password_hash VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  avatar_url VARCHAR(255),
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL, -- Null implies SuperAdmin
  role_id UUID REFERENCES roles(id) ON DELETE RESTRICT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.4 Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  mobile_number VARCHAR(30) NOT NULL, -- Format E.164
  email VARCHAR(150),
  address TEXT,
  company VARCHAR(150),
  source VARCHAR(100) DEFAULT 'Direct',
  status VARCHAR(50) DEFAULT 'Active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_business_mobile UNIQUE (business_id, mobile_number)
);

-- 2.5 Customer Tags
CREATE TABLE customer_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  tag_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_customer_tag UNIQUE (customer_id, tag_name)
);

-- 2.6 Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  stage lead_stage NOT NULL DEFAULT 'NEW',
  assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  estimated_value NUMERIC(12, 2) DEFAULT 0.00,
  lead_score INT CHECK (lead_score >= 0 AND lead_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.7 Follow-Ups
CREATE TABLE follow_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type reminder_type NOT NULL DEFAULT 'CALL',
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status follow_up_status NOT NULL DEFAULT 'PENDING',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.8 Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  priority task_priority NOT NULL DEFAULT 'MEDIUM',
  status task_status NOT NULL DEFAULT 'TODO',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.9 Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  invoice_number VARCHAR(100) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  tax NUMERIC(12, 2) DEFAULT 0.00,
  due_date DATE NOT NULL,
  status invoice_status NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_business_invoice_number UNIQUE (business_id, invoice_number)
);

-- 2.10 Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  payment_method VARCHAR(50) NOT NULL, -- e.g., 'Stripe', 'Bank_Transfer', 'Cash'
  transaction_reference VARCHAR(150),
  amount NUMERIC(12, 2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'PENDING',
  received_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.11 Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.12 Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
  plan_type subscription_plan_type NOT NULL DEFAULT 'FREE',
  status subscription_status NOT NULL DEFAULT 'ACTIVE',
  billing_cycle_start TIMESTAMP WITH TIME ZONE NOT NULL,
  billing_cycle_end TIMESTAMP WITH TIME ZONE NOT NULL,
  stripe_subscription_id VARCHAR(150),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.13 WhatsApp Templates
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  category template_category NOT NULL DEFAULT 'WELCOME',
  body_text TEXT NOT NULL, -- e.g., "Hello {{1}}, code is {{2}}"
  language_code VARCHAR(10) DEFAULT 'en',
  meta_status VARCHAR(50) DEFAULT 'APPROVED', -- Status synchronized from Meta APIs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_business_template_name UNIQUE (business_id, name)
);

-- 2.14 Campaigns (WhatsApp Broadcast campaigns)
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  name VARCHAR(150) NOT NULL,
  status campaign_status NOT NULL DEFAULT 'DRAFT',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  recipient_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2.15 Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- e.g. 'delete_customer', 'update_role'
  target_table VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  payload_before JSONB DEFAULT '{}'::jsonb,
  payload_after JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------------
-- 3. INDEXES FOR PERFORMANCE OPTIMIZATION
---------------------------------------------------------

-- Composite indexes for business tenant filtering (multi-tenant boundary queries)
CREATE INDEX idx_customers_business ON customers(business_id);
CREATE INDEX idx_leads_business ON leads(business_id);
CREATE INDEX idx_leads_assigned ON leads(assigned_to_user_id);
CREATE INDEX idx_follow_ups_business_scheduled ON follow_ups(business_id, scheduled_at) WHERE status = 'PENDING';
CREATE INDEX idx_tasks_assigned_due ON tasks(assigned_to_user_id, due_date) WHERE status != 'DONE';
CREATE INDEX idx_invoices_business_status ON invoices(business_id, status);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = FALSE;

-- Text indexing for customer lookup speed
CREATE INDEX idx_customers_search ON customers(mobile_number, email);
CREATE INDEX idx_customer_tags_search ON customer_tags(tag_name);

---------------------------------------------------------
-- 4. DATABASE TRIGGERS (Auto-Updating timestamps)
---------------------------------------------------------

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_businesses_modtime BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_customers_modtime BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_leads_modtime BEFORE UPDATE ON leads FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_follow_ups_modtime BEFORE UPDATE ON follow_ups FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_tasks_modtime BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_invoices_modtime BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_subscriptions_modtime BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_templates_modtime BEFORE UPDATE ON templates FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_campaigns_modtime BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
