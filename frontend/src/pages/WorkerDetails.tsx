import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { workerService } from '../services/workerService';
import { attendanceService } from '../services/attendanceService';
import { paymentService } from '../services/paymentService';
import { payrollService } from '../services/payrollService';
import { Worker, Attendance, PaymentRecord, WeeklySummary } from '../types';
import { ArrowLeft, User, Phone, MapPin, IndianRupee, Clock, Calendar, CheckCircle2 } from 'lucide-react';

export const WorkerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const workerId = Number(id);

  const [worker, setWorker] = useState<Worker | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workerId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [wData, aData, pData, sData] = await Promise.all([
          workerService.getById(workerId),
          attendanceService.getByWorker(workerId),
          paymentService.getByWorker(workerId),
          payrollService.getWorkerWeeklySummary(workerId),
        ]);
        setWorker(wData);
        setAttendance(aData);
        setPayments(pData);
        setWeeklySummary(sData);
      } catch (err: any) {
        setError(err.message || 'Failed to load worker profile details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [workerId]);

  if (loading) {
    return <div className="py-12 text-center text-slate-500 text-sm">Loading worker profile...</div>;
  }

  if (error || !worker) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">
        <p className="font-semibold">{error || 'Worker not found'}</p>
        <Link to="/workers" className="mt-4 inline-flex items-center text-sm text-sky-600 hover:underline font-medium">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Workers Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/workers"
        className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Workers
      </Link>

      {/* Profile Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center font-bold text-2xl border-2 border-sky-200">
            {worker.fullName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-slate-900">{worker.fullName}</h1>
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                {worker.workerCode}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  worker.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {worker.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 font-medium">
              <span className="flex items-center">
                <Phone className="h-3.5 w-3.5 mr-1 text-slate-400" /> {worker.phoneNumber || 'No phone'}
              </span>
              <span className="flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400" /> {worker.address || 'No address specified'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-end justify-between w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
          <div className="text-left md:text-right">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Standard Daily Wage</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              ₹{worker.standardDailyWage.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-slate-500">/ {worker.standardWorkHours} hrs</span>
            </div>
          </div>
          <Link
            to={`/payroll?workerId=${worker.id}`}
            className="mt-2 inline-flex items-center px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs"
          >
            <IndianRupee className="h-3.5 w-3.5 mr-1.5" /> Settle Payroll Payment
          </Link>
        </div>
      </div>

      {/* Weekly Wage Summary Overview Card */}
      {weeklySummary && (
        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md border border-slate-800">
          <h2 className="text-base font-semibold text-sky-400 uppercase tracking-wider text-xs">
            Current Week Wage & Settlement Summary ({weeklySummary.weekStart} to {weeklySummary.weekEnd})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mt-4 text-center">
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-400 font-medium block">Working Days</span>
              <span className="text-xl font-bold text-white">{weeklySummary.totalWorkingDays}</span>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-400 font-medium block">Present / Half</span>
              <span className="text-xl font-bold text-emerald-400">
                {weeklySummary.presentDays} / {weeklySummary.halfDays}
              </span>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-400 font-medium block">Overtime Pay</span>
              <span className="text-xl font-bold text-sky-400">₹{weeklySummary.totalOvertimePay}</span>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-400 font-medium block">Gross Payable</span>
              <span className="text-xl font-bold text-white">₹{weeklySummary.grossPayable}</span>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-400 font-medium block">Already Paid</span>
              <span className="text-xl font-bold text-emerald-400">₹{weeklySummary.amountPaid}</span>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-lg border border-amber-500/40 bg-amber-950/20">
              <span className="text-xs text-amber-400 font-medium block">Outstanding Balance</span>
              <span className="text-xl font-bold text-amber-400">₹{weeklySummary.remainingPayable}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs / History Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance History */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-base">Attendance Log History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/70 text-xs font-semibold uppercase text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Worksite</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Daily Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">
                      No attendance records found for this worker.
                    </td>
                  </tr>
                ) : (
                  attendance.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">{att.attendanceDate}</td>
                      <td className="px-4 py-3">{att.worksiteName}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            att.status === 'PRESENT'
                              ? 'bg-emerald-50 text-emerald-700'
                              : att.status === 'HALF_DAY'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">₹{att.totalPay}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-base">Settled Payment History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/70 text-xs font-semibold uppercase text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Payment Date</th>
                  <th className="px-4 py-3">Method / Ref</th>
                  <th className="px-4 py-3">Week Period</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">
                      No payment records found for this worker.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">{p.paymentDate}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-800">{p.paymentMethod}</span>
                        {p.referenceNumber && (
                          <span className="block text-[11px] font-mono text-slate-400">{p.referenceNumber}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {p.weekStartDate} to {p.weekEndDate}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">₹{p.amount}</td>
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
