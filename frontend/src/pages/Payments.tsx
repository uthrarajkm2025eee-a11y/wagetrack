import React, { useEffect, useState } from 'react';
import { paymentService } from '../services/paymentService';
import { PaymentRecord } from '../types';
import { Receipt, Search, Filter, Calendar, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Payments: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getAll();
      setPayments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      (p.workerName && p.workerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.workerCode && p.workerCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.referenceNumber && p.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMethod = methodFilter === 'ALL' || p.paymentMethod === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const totalAmountPaid = filteredPayments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payment Settlement History</h1>
          <p className="text-slate-500 text-sm mt-1">
            Complete audit ledger of cash, UPI, and bank transfers paid to daily wage workers.
          </p>
        </div>
        <Link
          to="/payroll"
          className="inline-flex items-center px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-sm transition-colors"
        >
          <IndianRupee className="h-4 w-4 mr-2" />
          Process New Payment
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search worker, reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            >
              <option value="ALL">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="CASH">CASH</option>
              <option value="BANK_TRANSFER">BANK TRANSFER</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
            Total Filtered: <span className="text-emerald-700 font-bold">₹{totalAmountPaid.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Payments History Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm">Loading payment audit log...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600 text-sm">{error}</div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No payment settlements found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/70 text-xs font-semibold uppercase text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Payment Date</th>
                  <th className="px-5 py-3.5">Worker</th>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5">Reference No</th>
                  <th className="px-5 py-3.5">Week Period</th>
                  <th className="px-5 py-3.5">Notes</th>
                  <th className="px-5 py-3.5 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 font-medium text-slate-900 whitespace-nowrap">{p.paymentDate}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      <Link to={`/workers/${p.workerId}`} className="hover:text-sky-600">
                        {p.workerName}
                      </Link>
                      <span className="block text-[11px] font-mono text-slate-400">{p.workerCode}</span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{p.paymentMethod}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                      {p.referenceNumber || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {p.weekStartDate} to {p.weekEndDate}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 max-w-xs truncate">{p.notes || '—'}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-emerald-600">
                      ₹{p.amount.toLocaleString('en-IN')}
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
