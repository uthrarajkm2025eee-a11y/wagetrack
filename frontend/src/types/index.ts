export type AttendanceStatus = 'PRESENT' | 'HALF_DAY' | 'ABSENT';
export type PaymentMethod = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'OTHER';

export interface Worker {
  id: number;
  workerCode: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  standardDailyWage: number;
  standardWorkHours: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkerFormData {
  workerCode: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  standardDailyWage: number;
  standardWorkHours: number;
  active?: boolean;
}

export interface Worksite {
  id: number;
  worksiteCode: string;
  name: string;
  location: string;
  description?: string;
  active: boolean;
  activeWorkersCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorksiteFormData {
  worksiteCode: string;
  name: string;
  location: string;
  description?: string;
  active?: boolean;
}

export interface Attendance {
  id: number;
  workerId: number;
  workerCode?: string;
  workerName?: string;
  standardDailyWage?: number;
  worksiteId: number;
  worksiteCode?: string;
  worksiteName?: string;
  attendanceDate: string;
  status: AttendanceStatus;
  hoursWorked: number;
  overtimeHours: number;
  regularPay: number;
  overtimePay: number;
  totalPay: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceFormData {
  workerId: number;
  worksiteId: number;
  attendanceDate: string;
  status: AttendanceStatus;
  hoursWorked: number;
  regularPayOverride?: number;
  notes?: string;
}

export interface PaymentRecord {
  id: number;
  workerId: number;
  workerCode?: string;
  workerName?: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  weekStartDate: string;
  weekEndDate: string;
  notes?: string;
  createdAt?: string;
}

export interface PaymentFormData {
  workerId: number;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  weekStartDate: string;
  weekEndDate: string;
  notes?: string;
}

export interface WeeklySummary {
  workerId: number;
  workerName: string;
  workerCode: string;
  weekStart: string;
  weekEnd: string;
  totalWorkingDays: number;
  presentDays: number;
  halfDays: number;
  absentDays: number;
  totalRegularPay: number;
  totalOvertimeHours: number;
  totalOvertimePay: number;
  grossPayable: number;
  amountPaid: number;
  remainingPayable: number;
}

export interface DashboardSummary {
  totalWorkers: number;
  activeWorkers: number;
  activeWorksites: number;
  todaysAttendanceCount: number;
  todaysPayableWages: number;
  weeklyPayableAmount: number;
  pendingPayments: number;
  recentPayments: PaymentRecord[];
  recentAttendance: Attendance[];
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
