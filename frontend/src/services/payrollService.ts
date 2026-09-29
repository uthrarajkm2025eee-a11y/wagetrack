import api from './api';
import { WeeklySummary } from '../types';

export const payrollService = {
  getWorkerWeeklySummary: async (workerId: number, startDate?: string, endDate?: string): Promise<WeeklySummary> => {
    const response = await api.get<WeeklySummary>(`/workers/${workerId}/weekly-summary`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getAllWeeklySummaries: async (startDate?: string, endDate?: string): Promise<WeeklySummary[]> => {
    const response = await api.get<WeeklySummary[]>('/weekly-summaries', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
