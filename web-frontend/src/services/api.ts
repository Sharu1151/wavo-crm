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
    return request<Customer[]>('/customers');
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
  }
};
