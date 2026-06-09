const BASE_URL = 'http://localhost:3000/api/v1';

function getHeaders() {
  const token = localStorage.getItem('wavo_access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = 'An error occurred';
    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch {
      // Ignore
    }
    throw new Error(message);
  }

  // Return empty object for 204 or no content responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export interface User {
  id: string;
  email: string;
  role: string;
  businessId: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Customer {
  id: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  company?: string;
  source: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  title: string;
  stage: string;
  estimatedValue: number;
  leadScore?: number;
  customerId: string;
  customer: {
    fullName: string;
    mobileNumber: string;
    email?: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  dueDate: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  customerId: string;
  customer?: {
    fullName: string;
    email: string | null;
  };
  createdAt: string;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  transactionReference?: string;
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED';
  receivedAt?: string;
  createdAt: string;
  invoice?: {
    invoiceNumber: string;
    amount: number;
  };
}

export interface WhatsappTemplate {
  id: string;
  name: string;
  category: 'WELCOME' | 'FOLLOW_UP' | 'PAYMENT_REMINDER' | 'APPOINTMENT_REMINDER' | 'PROMOTIONS';
  bodyText: string;
  languageCode: string;
  metaStatus: string;
  createdAt: string;
}

export interface WhatsappCampaign {
  id: string;
  templateId?: string;
  name: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  scheduledAt?: string;
  recipientCount: number;
  createdAt: string;
  template?: {
    name: string;
    category: string;
  };
}

export interface BillingLimits {
  plan: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
  status: string;
  billingCycleEnd?: string;
  maxCustomers: number;
  maxUsers: number;
  name: string;
}

export interface AIScoreResponse {
  leadId: string;
  score: number;
}

export interface AIOutreachResponse {
  content: string;
}

export interface AISuggestionsResponse {
  suggestions: string[];
}

export interface AISummaryResponse {
  summary: string;
}

export const api = {
  // Authentication
  async login(email: string, password_hash: string): Promise<LoginResponse> {
    const data = await request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: password_hash }),
    });
    localStorage.setItem('wavo_access_token', data.accessToken);
    localStorage.setItem('wavo_user', JSON.stringify(data.user));
    return data;
  },

  logout() {
    localStorage.removeItem('wavo_access_token');
    localStorage.removeItem('wavo_user');
  },

  getUser(): User | null {
    const user = localStorage.getItem('wavo_user');
    return user ? JSON.parse(user) : null;
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    const res = await request<{ data: Customer[] }>('/customers');
    return res.data;
  },

  async createCustomer(dto: { fullName: string; mobileNumber: string; email?: string; company?: string; notes?: string }): Promise<Customer> {
    return request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  // Leads
  async getLeads(): Promise<Lead[]> {
    return request<Lead[]>('/leads');
  },

  async createLead(dto: { customerId: string; title: string; estimatedValue: number }): Promise<Lead> {
    return request<Lead>('/leads', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  async updateLeadStage(leadId: string, stage: string): Promise<Lead> {
    return request<Lead>(`/leads/${leadId}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage }),
    });
  },

  // Tasks
  async getTasks(): Promise<Task[]> {
    return request<Task[]>('/tasks/my-tasks');
  },

  async createTask(dto: { title: string; description?: string; dueDate?: string; priority?: string }): Promise<Task> {
    return request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  // Invoices & Payments Ledger
  async getInvoices(): Promise<Invoice[]> {
    return request<Invoice[]>('/invoices');
  },

  async createInvoice(dto: { customerId: string; invoiceNumber: string; amount: number; tax?: number; dueDate: string }): Promise<Invoice> {
    return request<Invoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  async updateInvoiceStatus(id: string, status: string): Promise<Invoice> {
    return request<Invoice>(`/invoices/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async getRevenueStats(): Promise<{ paid: number; pending: number; overdue: number }> {
    return request<{ paid: number; pending: number; overdue: number }>('/invoices/stats');
  },

  async getPayments(): Promise<Payment[]> {
    return request<Payment[]>('/payments');
  },

  async recordPayment(dto: { invoiceId: string; amount: number; paymentMethod: string; transactionReference?: string }): Promise<Payment> {
    return request<Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  // WhatsApp
  async getTemplates(): Promise<WhatsappTemplate[]> {
    return request<WhatsappTemplate[]>('/whatsapp/templates');
  },

  async createTemplate(dto: { name: string; category: string; bodyText: string; languageCode?: string }): Promise<WhatsappTemplate> {
    return request<WhatsappTemplate>('/whatsapp/templates', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  async getCampaigns(): Promise<WhatsappCampaign[]> {
    return request<WhatsappCampaign[]>('/whatsapp/campaigns');
  },

  async createCampaign(dto: { name: string; templateId: string; recipientCount: number; scheduledAt?: string }): Promise<WhatsappCampaign> {
    return request<WhatsappCampaign>('/whatsapp/campaigns', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  // AI Cognitive Extensions
  async scoreLead(leadId: string): Promise<AIScoreResponse> {
    return request<AIScoreResponse>(`/ai/score-lead/${leadId}`, {
      method: 'POST',
    });
  },

  async generateOutreach(dto: { customerName: string; businessName: string; details: string; tone: string }): Promise<AIOutreachResponse> {
    return request<AIOutreachResponse>('/ai/generate-outreach', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  async suggestReplies(message: string): Promise<AISuggestionsResponse> {
    return request<AISuggestionsResponse>(`/ai/reply-suggestions?message=${encodeURIComponent(message)}`);
  },

  async summarizeTimeline(customerId: string): Promise<AISummaryResponse> {
    return request<AISummaryResponse>(`/ai/summarize-timeline/${customerId}`);
  },

  // Billing Limits
  async getBillingLimits(): Promise<BillingLimits> {
    return request<BillingLimits>('/billing/limits');
  }
};
