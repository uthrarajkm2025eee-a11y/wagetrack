import React, { useEffect, useState } from 'react';
import { payrollService } from '../services/payrollService';
import { workerService } from '../services/workerService';
import { paymentService } from '../services/paymentService';
import { Worker, WeeklySummary, PaymentFormData, PaymentMethod } from '../types';
import { Modal } from '../components/Modal';
import { IndianRupee, Calendar, AlertCircle, CheckCircle2, CreditCard, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const WeeklyPayroll: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialWorkerId = searchParams.get('workerId') ? Number(searchParams.get('workerId')) : undefined;

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | undefined>(initialWorkerId);

  // Helper to compute Monday to Sunday of current week
  const getWeekRange = () => {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diffToMonday));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0],
    };
  };

  const defaultRange = getWeekRange();
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);

  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([]);
  const [activeSummary, setActiveSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Record Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    workerId: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    amount: 0,
    paymentMethod: 'UPI',
    referenceNumber: '',
    weekStartDate: '',
    weekEndDate: '',
    notes: '',
  });
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const data = await workerService.getAll();
        setWorkers(data.filter((w) => w.active));
        if (!selectedWorkerId && data.length > 0) {
          setSelectedWorkerId(data[0].id);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchWorkers();
  }, []);

  const fetchSummaries = async () => {
    try {
      setLoading(true);
      setError(null);
      const summaries = await payrollService.getAllWeeklySummaries(startDate, endDate);
      setWeeklySummaries(summaries);

      if (selectedWorkerId) {
        const found = summaries.find((s) => s.workerId === selectedWorkerId);
        setActiveSummary(found || null);
      } else if (summaries.length > 0) {
        setActiveSummary(summaries[0]);
        setSelectedWorkerId(summaries[0].workerId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weekly payroll summaries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, [startDate, endDate]);

  useEffect(() => {
    if (selectedWorkerId && weeklySummaries.length > 0) {
      const found = weeklySummaries.find((s) => s.workerId === selectedWorkerId);
      setActiveSummary(found || null);
    }
  }, [selectedWorkerId, weeklySummaries]);

  const handleOpenPaymentModal = (summary: WeeklySummary) => {
    setPaymentForm({
      workerId: summary.workerId,
      paymentDate: new Date().toISOString().split('T')[0],
      amount: summary.remainingPayable,
      paymentMethod: 'UPI',
      referenceNumber: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      weekStartDate: summary.weekStart,
      weekEndDate: summary.weekEnd,
      notes: `Weekly settlement for ${summary.workerName}`,
    });
    setPaymentError(null);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    if (paymentForm.amount <= 0) {
      setPaymentError('Payment amount must be greater than 0');
      return;
    }

    try {
      setSubmittingPayment(true);
      const record = await paymentService.create(paymentForm);
      setSuccessMessage(`Payment of ₹${record.amount} successfully recorded for ${record.workerName}!`);
      setIsPaymentModalOpen(false);
      fetchSummaries();
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to record payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Weekly Payroll & Settlements</h1>
          <p className="text-slate-500 text-sm mt-1">
            Calculate weekly gross payable wages, deduct recorded payments, and process outstanding balances.
          </p>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Calendar className="h-5 w-5 text-sky-600" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Payroll Week Period:</span>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
          />
          <ArrowRight className="h-4 w-4 text-slate-400" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
          />
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-xs font-bold text-emerald-800 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Worker Payroll Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm">Calculating weekly payroll...</div>
      ) : error ? (
        <div className="p-6 text-center text-red-600 text-sm">{error}</div>
      ) : weeklySummaries.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm">
          No active worker summaries found for this week period.
        </div>
      ) : (
        <div className="space-y-6">
          {weeklySummaries.map((summary) => (
            <div
              key={summary.workerId}
              className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6 hover:border-slate-300 transition-colors"
            >
              {/* Worker & Week Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-bold text-slate-900">{summary.workerName}</h2>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                      {summary.workerCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Payroll period: <span className="font-semibold text-slate-700">{summary.weekStart}</span> to{' '}
                    <span className="font-semibold text-slate-700">{summary.weekEnd}</span>
                  </p>
                </div>

                <div>
                  <button
                    onClick={() => handleOpenPaymentModal(summary)}
                    disabled={summary.remainingPayable <= 0}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <IndianRupee className="h-4 w-4 mr-1.5" />
                    {summary.remainingPayable <= 0 ? 'Settled in Full' : 'Record Payment'}
                  </button>
                </div>
              </div>

              {/* Attendance & Wage Calculation Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium block">Days Present</span>
                  <span className="text-lg font-bold text-slate-900">{summary.presentDays}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium block">Half Days</span>
                  <span className="text-lg font-bold text-amber-600">{summary.halfDays}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium block">Days Absent</span>
                  <span className="text-lg font-bold text-slate-500">{summary.absentDays}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium block">Regular Pay</span>
                  <span className="text-lg font-bold text-slate-900">₹{summary.totalRegularPay}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium block">OT Hours / Pay</span>
                  <span className="text-lg font-bold text-sky-600">
                    {summary.totalOvertimeHours}h / ₹{summary.totalOvertimePay}
                  </span>
                </div>
                <div className="bg-sky-50 p-3 rounded-lg border border-sky-100">
                  <span className="text-xs text-sky-700 font-medium block">Gross Payable</span>
                  <span className="text-lg font-bold text-sky-900">₹{summary.grossPayable}</span>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 col-span-2 sm:col-span-1">
                  <span className="text-xs text-amber-800 font-medium block">Remaining Balance</span>
                  <span className="text-xl font-extrabold text-amber-700">₹{summary.remainingPayable}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Worker Wage Settlement"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          {paymentError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
              <span>{paymentError}</span>
            </div>
          )}

          <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-xs text-sky-900">
            Payment for <span className="font-bold">{activeSummary?.workerName}</span> ({activeSummary?.weekStart} to{' '}
            {activeSummary?.weekEnd}). Outstanding payable balance: ₹{activeSummary?.remainingPayable}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
              Payment Amount (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              max={activeSummary?.remainingPayable}
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                Payment Date *
              </label>
              <input
                type="date"
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                Payment Method *
              </label>
              <select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as PaymentMethod })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                required
              >
                <option value="UPI">UPI</option>
                <option value="CASH">CASH</option>
                <option value="BANK_TRANSFER">BANK TRANSFER</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
              Transaction / Reference Number
            </label>
            <input
              type="text"
              value={paymentForm.referenceNumber || ''}
              onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
              placeholder="e.g. UPI123456789"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
              Notes
            </label>
            <input
              type="text"
              value={paymentForm.notes || ''}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              placeholder="e.g. Weekly settlement via GPay"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingPayment}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {submittingPayment ? 'Processing...' : 'Confirm & Record Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
