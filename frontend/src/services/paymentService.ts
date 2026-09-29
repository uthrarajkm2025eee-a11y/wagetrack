import api from './api';
import { PaymentFormData, PaymentRecord } from '../types';

export const paymentService = {
  getAll: async (): Promise<PaymentRecord[]> => {
    const response = await api.get<PaymentRecord[]>('/payments');
    return response.data;
  },

  getById: async (id: number): Promise<PaymentRecord> => {
    const response = await api.get<PaymentRecord>(`/payments/${id}`);
    return response.data;
  },

  getByWorker: async (workerId: number): Promise<PaymentRecord[]> => {
    const response = await api.get<PaymentRecord[]>(`/workers/${workerId}/payments`);
    return response.data;
  },

  create: async (data: PaymentFormData): Promise<PaymentRecord> => {
    const response = await api.post<PaymentRecord>('/payments', data);
    return response.data;
  },
};
