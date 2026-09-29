import api from './api';
import { Worker, WorkerFormData } from '../types';

export const workerService = {
  getAll: async (): Promise<Worker[]> => {
    const response = await api.get<Worker[]>('/workers');
    return response.data;
  },

  getById: async (id: number): Promise<Worker> => {
    const response = await api.get<Worker>(`/workers/${id}`);
    return response.data;
  },

  create: async (data: WorkerFormData): Promise<Worker> => {
    const response = await api.post<Worker>('/workers', data);
    return response.data;
  },

  update: async (id: number, data: WorkerFormData): Promise<Worker> => {
    const response = await api.put<Worker>(`/workers/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/workers/${id}`);
  },
};
