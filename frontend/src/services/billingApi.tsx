import { axiosInstance } from './axiosConfig';

export interface Invoice {
  id: number;
  tenantId: number;
  tenantName: string;
  invoiceId: string;
  amount: number;
  status: string;
  dueDate: string;
  paidDate: string | null;
  paymentId: string | null;
  receiptUrl?: string;
  createdAt?: string;
}

export interface BillingDashboardData {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  overduePayments: number;
  invoices: Invoice[];
}

export interface CreateInvoicePayload {
  tenantId: number;
  invoiceId?: string;
  amount: number;
  status: string;
  dueDate: string;
  paidDate?: string | null;
  paymentId?: string;
  receiptUrl?: string;
}

export interface TenantOption {
  id: number;
  name: string;
}

export const billingApi = {
  getDashboardData: async (): Promise<BillingDashboardData> => {
    const response = await axiosInstance.get('api/Billing/dashboard');
    return response.data;
  },

  createInvoice: async (payload: CreateInvoicePayload): Promise<Invoice> => {
    const response = await axiosInstance.post('api/Billing/invoice', payload);
    return response.data;
  },

  updateInvoice: async (id: number, payload: CreateInvoicePayload): Promise<void> => {
    await axiosInstance.put(`api/Billing/invoice/${id}`, payload);
  },

  deleteInvoice: async (id: number): Promise<void> => {
    await axiosInstance.delete(`api/Billing/invoice/${id}`);
  },

  getTenants: async (): Promise<TenantOption[]> => {
    const response = await axiosInstance.get('api/Billing/tenants');
    return response.data;
  }
};
