import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import { DashboardSummary } from '../types';
import {
  Users,
  Building2,
  CalendarCheck,
  IndianRupee,
  AlertCircle,
  TrendingUp,
  Receipt,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await dashboardService.getSummary();
      setData(summary);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium">Loading WageTrack metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 border border-red-200 text-red-800">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
          <div className="flex-1">
            <h3 className="text-base font-semibold">Unable to connect to WageTrack Server</h3>
            <p className="text-sm mt-1 text-red-700">{error}</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold shadow-xs"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Chart data simulation from metrics
  const chartData = [
    { name: "Today's Wage", amount: data?.todaysPayableWages || 0 },
    { name: 'Weekly Wage', amount: data?.weeklyPayableAmount || 0 },
    { name: 'Pending Balance', amount: data?.pendingPayments || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Workforce Executive Overview</h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time daily attendance, overtime calculations, and weekly payroll metrics.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/attendance/new"
            className="inline-flex items-center px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-sm transition-colors"
          >
            <CalendarCheck className="h-4 w-4 mr-2" />
            Log Attendance
          </Link>
          <Link
            to="/payroll"
            className="inline-flex items-center px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-colors"
          >
            <IndianRupee className="h-4 w-4 mr-2" />
            Weekly Payroll
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Workers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Workers</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{data?.activeWorkers || 0}</span>
            <span className="text-xs text-slate-500 font-medium">Out of {data?.totalWorkers || 0} total</span>
          </div>
        </div>

        {/* Card 2: Active Worksites */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Worksites</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{data?.activeWorksites || 0}</span>
            <span className="text-xs text-emerald-600 font-medium flex items-center">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Active
            </span>
          </div>
        </div>

        {/* Card 3: Today's Attendance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Attendance</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{data?.todaysAttendanceCount || 0}</span>
            <span className="text-xs text-slate-500 font-medium">Logged today</span>
          </div>
        </div>

        {/* Card 4: Pending Payments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Weekly Balance</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              ₹{(data?.pendingPayments || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded">
              Outstanding
            </span>
          </div>
        </div>
      </div>

      {/* Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Wage & Financial Distribution</h2>
              <p className="text-xs text-slate-500">Breakdown of calculated wages and pending weekly settlements</p>
            </div>
            <TrendingUp className="h-5 w-5 text-sky-600" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Bar dataKey="amount" fill="#0284c7" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats Summary Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-4">Financial Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                <span className="text-sm text-slate-600">Today's Total Payable</span>
                <span className="font-semibold text-slate-900">
                  ₹{(data?.todaysPayableWages || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                <span className="text-sm text-slate-600">Current Week Gross Wage</span>
                <span className="font-semibold text-slate-900">
                  ₹{(data?.weeklyPayableAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                <span className="text-sm text-slate-600">Total Pending Settlement</span>
                <span className="font-semibold text-amber-600">
                  ₹{(data?.pendingPayments || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              to="/payroll"
              className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-slate-300 shadow-2xs rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              View Full Payroll Breakdown
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-base">Today's Attendance Logs</h3>
            <Link to="/attendance" className="text-xs font-semibold text-sky-600 hover:text-sky-700">
              View All Register &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/70 text-xs font-semibold uppercase text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Worker</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Hours</th>
                  <th className="px-4 py-3 text-right">Total Wage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!data?.recentAttendance || data.recentAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">
                      No attendance logged for today yet.
                    </td>
                  </tr>
                ) : (
                  data.recentAttendance.slice(0, 5).map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">{att.workerName}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            att.status === 'PRESENT'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : att.status === 'HALF_DAY'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{att.hoursWorked}h</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        ₹{att.totalPay.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-base">Recent Wage Payments</h3>
            <Link to="/payments" className="text-xs font-semibold text-sky-600 hover:text-sky-700">
              View Payment History &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/70 text-xs font-semibold uppercase text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Worker</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!data?.recentPayments || data.recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">
                      No payment settlements recorded yet.
                    </td>
                  </tr>
                ) : (
                  data.recentPayments.slice(0, 5).map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">{pay.workerName}</td>
                      <td className="px-4 py-3 font-medium text-slate-600">{pay.paymentMethod}</td>
                      <td className="px-4 py-3">{pay.paymentDate}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                        ₹{pay.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
