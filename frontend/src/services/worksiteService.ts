import api from './api';
import { Worksite, WorksiteFormData } from '../types';

export const worksiteService = {
  getAll: async (): Promise<Worksite[]> => {
    const response = await api.get<Worksite[]>('/worksites');
    return response.data;
  },

  getById: async (id: number): Promise<Worksite> => {
    const response = await api.get<Worksite>(`/worksites/${id}`);
    return response.data;
  },

  create: async (data: WorksiteFormData): Promise<Worksite> => {
    const response = await api.post<Worksite>('/worksites', data);
    return response.data;
  },

  update: async (id: number, data: WorksiteFormData): Promise<Worksite> => {
    const response = await api.put<Worksite>(`/worksites/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/worksites/${id}`);
  },
};
