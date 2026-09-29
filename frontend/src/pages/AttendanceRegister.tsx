import React, { useEffect, useState } from 'react';
import { attendanceService, AttendanceFilterParams } from '../services/attendanceService';
import { workerService } from '../services/workerService';
import { worksiteService } from '../services/worksiteService';
import { Attendance, Worker, Worksite, AttendanceStatus } from '../types';
import { ClipboardList, Filter, Search, Calendar, Trash2, Edit2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AttendanceRegister: React.FC = () => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [worksites, setWorksites] = useState<Worksite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<AttendanceFilterParams>({
    startDate: '',
    endDate: '',
    workerId: undefined,
    worksiteId: undefined,
    status: undefined,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [aData, wData, sData] = await Promise.all([
        attendanceService.getAll(filters),
        workerService.getAll(),
        worksiteService.getAll(),
      ]);
      setAttendance(aData);
      setWorkers(wData);
      setWorksites(sData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch attendance register');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      workerId: undefined,
      worksiteId: undefined,
      status: undefined,
    });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) return;
    try {
      await attendanceService.delete(id);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete attendance record');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daily Attendance Register</h1>
          <p className="text-slate-500 text-sm mt-1">
            Complete attendance log book with daily wages, overtime breakdown, and status records.
          </p>
        </div>
        <Link
          to="/attendance/new"
          className="inline-flex items-center px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-sm transition-colors"
        >
          <ClipboardList className="h-4 w-4 mr-2" />
          Log Attendance
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
          <Filter className="h-4 w-4 text-sky-600" />
          <span>Filter Register Logs</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">From Date</label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">To Date</label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
            />
          </div>

          {/* Worker Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Worker</label>
            <select
              value={filters.workerId || ''}
              onChange={(e) => setFilters({ ...filters, workerId: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
            >
              <option value="">All Workers</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Worksite Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Worksite</label>
            <select
              value={filters.worksiteId || ''}
              onChange={(e) => setFilters({ ...filters, worksiteId: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
            >
              <option value="">All Worksites</option>
              {worksites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) =>
                setFilters({ ...filters, status: (e.target.value as AttendanceStatus) || undefined })
              }
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
            >
              <option value="">All Statuses</option>
              <option value="PRESENT">PRESENT</option>
              <option value="HALF_DAY">HALF DAY</option>
              <option value="ABSENT">ABSENT</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleClearFilters}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Register Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm">Loading attendance register...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600 text-sm">{error}</div>
        ) : attendance.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No attendance records found for the selected period/filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/70 text-xs font-semibold uppercase text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Worker</th>
                  <th className="px-4 py-3.5">Worksite</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Hours</th>
                  <th className="px-4 py-3.5">OT Hours</th>
                  <th className="px-4 py-3.5">Regular Pay</th>
                  <th className="px-4 py-3.5">OT Pay</th>
                  <th className="px-4 py-3.5 text-right">Total Pay</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                      {att.attendanceDate}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      <Link to={`/workers/${att.workerId}`} className="hover:text-sky-600">
                        {att.workerName}
                      </Link>
                      <span className="block text-[11px] font-mono text-slate-400">{att.workerCode}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">{att.worksiteName}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
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
                    <td className="px-4 py-3.5 font-medium">{att.hoursWorked}h</td>
                    <td className="px-4 py-3.5 font-medium text-sky-600">{att.overtimeHours}h</td>
                    <td className="px-4 py-3.5">₹{att.regularPay}</td>
                    <td className="px-4 py-3.5 text-sky-600">₹{att.overtimePay}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                      ₹{att.totalPay.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(att.id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete Record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
