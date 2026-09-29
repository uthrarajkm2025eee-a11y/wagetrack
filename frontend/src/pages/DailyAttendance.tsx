import React, { useEffect, useState } from 'react';
import { workerService } from '../services/workerService';
import { worksiteService } from '../services/worksiteService';
import { attendanceService } from '../services/attendanceService';
import { Worker, Worksite, AttendanceFormData, AttendanceStatus } from '../types';
import { CalendarCheck, AlertCircle, CheckCircle2, Clock, IndianRupee, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DailyAttendance: React.FC = () => {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [worksites, setWorksites] = useState<Worksite[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<AttendanceFormData>({
    workerId: 0,
    worksiteId: 0,
    attendanceDate: new Date().toISOString().split('T')[0],
    status: 'PRESENT',
    hoursWorked: 8,
    notes: '',
  });

  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [wList, sList] = await Promise.all([
          workerService.getAll(),
          worksiteService.getAll(),
        ]);
        const activeWorkers = wList.filter((w) => w.active);
        const activeSites = sList.filter((s) => s.active);

        setWorkers(activeWorkers);
        setWorksites(activeSites);

        if (activeWorkers.length > 0) {
          setFormData((prev) => ({ ...prev, workerId: activeWorkers[0].id }));
          setSelectedWorker(activeWorkers[0]);
        }
        if (activeSites.length > 0) {
          setFormData((prev) => ({ ...prev, worksiteId: activeSites[0].id }));
        }
      } catch (err: any) {
        setError('Failed to load workers or worksites for attendance logging.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleWorkerChange = (workerId: number) => {
    const worker = workers.find((w) => w.id === workerId) || null;
    setSelectedWorker(worker);
    const defaultHours = worker ? worker.standardWorkHours : 8;
    setFormData((prev) => ({
      ...prev,
      workerId,
      hoursWorked: prev.status === 'ABSENT' ? 0 : prev.status === 'HALF_DAY' ? defaultHours / 2 : defaultHours,
    }));
  };

  const handleStatusChange = (status: AttendanceStatus) => {
    let hours = formData.hoursWorked;
    const stdHours = selectedWorker ? selectedWorker.standardWorkHours : 8;

    if (status === 'ABSENT') {
      hours = 0;
    } else if (status === 'HALF_DAY') {
      hours = stdHours / 2;
    } else if (status === 'PRESENT' && (hours === 0 || hours === stdHours / 2)) {
      hours = stdHours;
    }

    setFormData((prev) => ({
      ...prev,
      status,
      hoursWorked: hours,
    }));
  };

  // Preview wage calculations based on business rules
  const calculatePreview = () => {
    if (!selectedWorker) return { regularPay: 0, overtimeHours: 0, overtimePay: 0, totalPay: 0 };

    const dailyWage = selectedWorker.standardDailyWage;
    const stdHours = selectedWorker.standardWorkHours || 8;
    const hourlyWage = dailyWage / stdHours;
    const multiplier = 1.5;

    let regularPay = 0;
    let overtimeHours = 0;
    let overtimePay = 0;

    if (formData.status === 'PRESENT') {
      regularPay = dailyWage;
      if (formData.hoursWorked > 8) {
        overtimeHours = formData.hoursWorked - 8;
        overtimePay = hourlyWage * multiplier * overtimeHours;
      }
    } else if (formData.status === 'HALF_DAY') {
      regularPay = dailyWage * 0.5;
      if (formData.hoursWorked > 8) {
        overtimeHours = formData.hoursWorked - 8;
        overtimePay = hourlyWage * multiplier * overtimeHours;
      }
    } else {
      regularPay = 0;
      overtimeHours = 0;
      overtimePay = 0;
    }

    return {
      regularPay,
      overtimeHours,
      overtimePay,
      totalPay: regularPay + overtimePay,
    };
  };

  const preview = calculatePreview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!formData.workerId) {
      setError('Please select a worker.');
      return;
    }
    if (!formData.worksiteId) {
      setError('Please select a worksite.');
      return;
    }

    try {
      setSubmitting(true);
      const recorded = await attendanceService.create(formData);
      setSuccessMsg(
        `Attendance successfully logged for ${recorded.workerName}! Calculated wage: ₹${recorded.totalPay}`
      );
      // Reset form status slightly
    } catch (err: any) {
      setError(err.message || 'Failed to record attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-500 text-sm">Loading attendance logger...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daily Attendance Logger</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Record daily worker presence, log overtime, and generate immediate verified wage calculations.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Attendance Log Error</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2.5 text-emerald-600 shrink-0" />
              <span className="font-medium">{successMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/attendance')}
              className="text-xs font-semibold px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 ml-4"
            >
              View Register
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Attendance Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Attendance Date *
            </label>
            <input
              type="date"
              value={formData.attendanceDate}
              onChange={(e) => setFormData({ ...formData, attendanceDate: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              required
            />
          </div>

          {/* Worksite */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Worksite Location *
            </label>
            <select
              value={formData.worksiteId}
              onChange={(e) => setFormData({ ...formData, worksiteId: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              required
            >
              {worksites.length === 0 ? (
                <option value="">No active worksites found</option>
              ) : (
                worksites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.worksiteCode})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Worker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Worker Name *
            </label>
            <select
              value={formData.workerId}
              onChange={(e) => handleWorkerChange(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              required
            >
              {workers.length === 0 ? (
                <option value="">No active workers found</option>
              ) : (
                workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.fullName} ({w.workerCode}) — ₹{w.standardDailyWage}/day
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Status Radio Buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
            Attendance Status *
          </label>
          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => handleStatusChange('PRESENT')}
              className={`p-4 rounded-xl border text-center transition-all ${
                formData.status === 'PRESENT'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 font-bold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
              }`}
            >
              <div className="text-base">PRESENT</div>
              <div className="text-xs text-slate-500 mt-1 font-normal">Full Daily Wage (100%)</div>
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('HALF_DAY')}
              className={`p-4 rounded-xl border text-center transition-all ${
                formData.status === 'HALF_DAY'
                  ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20 font-bold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
              }`}
            >
              <div className="text-base">HALF DAY</div>
              <div className="text-xs text-slate-500 mt-1 font-normal">Exactly 50% Daily Wage</div>
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('ABSENT')}
              className={`p-4 rounded-xl border text-center transition-all ${
                formData.status === 'ABSENT'
                  ? 'bg-slate-100 border-slate-400 text-slate-900 ring-2 ring-slate-400/20 font-bold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
              }`}
            >
              <div className="text-base">ABSENT</div>
              <div className="text-xs text-slate-500 mt-1 font-normal">Zero Wage (₹0)</div>
            </button>
          </div>
        </div>

        {/* Hours Worked */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Total Hours Worked *
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              disabled={formData.status === 'ABSENT'}
              value={formData.hoursWorked}
              onChange={(e) => setFormData({ ...formData, hoursWorked: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold disabled:bg-slate-100 disabled:opacity-60"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Standard workday: 8.0 hours. Hours over 8 count as overtime.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Notes / Work Details
            </label>
            <input
              type="text"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="e.g. Concrete pouring, Foundation excavation"
            />
          </div>
        </div>

        {/* Real-time Backend Wage Calculation Live Preview */}
        {selectedWorker && (
          <div className="p-5 bg-slate-900 text-white rounded-xl shadow-inner space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-sky-400" />
                <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                  Live Calculated Wage Breakdown
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">Rate: ₹{selectedWorker.standardDailyWage}/day</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="text-xs text-slate-400 block font-medium">Regular Pay</span>
                <span className="text-lg font-bold text-white">₹{preview.regularPay.toFixed(2)}</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="text-xs text-slate-400 block font-medium">Overtime Hours</span>
                <span className="text-lg font-bold text-sky-400">{preview.overtimeHours.toFixed(1)} hrs</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="text-xs text-slate-400 block font-medium">Overtime Pay (1.5x)</span>
                <span className="text-lg font-bold text-sky-400">₹{preview.overtimePay.toFixed(2)}</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-lg border border-emerald-500/50 bg-emerald-950/20">
                <span className="text-xs text-emerald-400 block font-medium">Total Wage Payable</span>
                <span className="text-xl font-extrabold text-emerald-400">₹{preview.totalPay.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/attendance')}
            className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 shadow-sm disabled:opacity-50"
          >
            {submitting ? 'Recording...' : 'Submit Attendance Record'}
          </button>
        </div>
      </form>
    </div>
  );
};
