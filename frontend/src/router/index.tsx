import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../layouts/Layout';
import { Dashboard } from '../pages/Dashboard';
import { Workers } from '../pages/Workers';
import { WorkerDetails } from '../pages/WorkerDetails';
import { Worksites } from '../pages/Worksites';
import { DailyAttendance } from '../pages/DailyAttendance';
import { AttendanceRegister } from '../pages/AttendanceRegister';
import { WeeklyPayroll } from '../pages/WeeklyPayroll';
import { Payments } from '../pages/Payments';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'workers', element: <Workers /> },
      { path: 'workers/:id', element: <WorkerDetails /> },
      { path: 'worksites', element: <Worksites /> },
      { path: 'attendance', element: <AttendanceRegister /> },
      { path: 'attendance/new', element: <DailyAttendance /> },
      { path: 'payroll', element: <WeeklyPayroll /> },
      { path: 'payments', element: <Payments /> },
    ],
  },
]);
