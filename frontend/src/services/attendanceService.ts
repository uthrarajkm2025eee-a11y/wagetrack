import api from './api';
import { Attendance, AttendanceFormData, AttendanceStatus } from '../types';

export interface AttendanceFilterParams {
  startDate?: string;
  endDate?: string;
  workerId?: number;
  worksiteId?: number;
  status?: AttendanceStatus;
}

export const attendanceService = {
  getAll: async (params?: AttendanceFilterParams): Promise<Attendance[]> => {
    const response = await api.get<Attendance[]>('/attendance', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Attendance> => {
    const response = await api.get<Attendance>(`/attendance/${id}`);
    return response.data;
  },

  getByWorker: async (workerId: number): Promise<Attendance[]> => {
    const response = await api.get<Attendance[]>(`/workers/${workerId}/attendance`);
    return response.data;
  },

  getByWorksite: async (worksiteId: number): Promise<Attendance[]> => {
    const response = await api.get<Attendance[]>(`/worksites/${worksiteId}/attendance`);
    return response.data;
  },

  create: async (data: AttendanceFormData): Promise<Attendance> => {
    const response = await api.post<Attendance>('/attendance', data);
    return response.data;
  },

  update: async (id: number, data: AttendanceFormData): Promise<Attendance> => {
    const response = await api.put<Attendance>(`/attendance/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/attendance/${id}`);
  },
};
