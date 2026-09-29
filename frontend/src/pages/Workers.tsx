import React, { useEffect, useState } from 'react';
import { workerService } from '../services/workerService';
import { Worker, WorkerFormData } from '../types';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Users, UserPlus, Search, Eye, Edit2, Trash2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Workers: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [formData, setFormData] = useState<WorkerFormData>({
    workerCode: '',
    fullName: '',
    phoneNumber: '',
    address: '',
    standardDailyWage: 800,
    standardWorkHours: 8,
    active: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete/Deactivate Confirmation State
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workerService.getAll();
      setWorkers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch workers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingWorker(null);
    setFormData({
      workerCode: `WKR-${Math.floor(100 + Math.random() * 900)}`,
      fullName: '',
      phoneNumber: '',
      address: '',
      standardDailyWage: 800,
      standardWorkHours: 8,
      active: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (worker: Worker) => {
    setEditingWorker(worker);
    setFormData({
      workerCode: worker.workerCode,
      fullName: worker.fullName,
      phoneNumber: worker.phoneNumber || '',
      address: worker.address || '',
      standardDailyWage: worker.standardDailyWage,
      standardWorkHours: worker.standardWorkHours,
      active: worker.active,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.workerCode.trim()) {
      setFormError('Worker code is required');
      return;
    }
    if (!formData.fullName.trim()) {
      setFormError('Full name is required');
      return;
    }
    if (formData.standardDailyWage <= 0) {
      setFormError('Standard daily wage must be greater than 0');
      return;
    }
    if (formData.standardWorkHours <= 0) {
      setFormError('Standard work hours must be greater than 0');
      return;
    }

    try {
      setSubmitting(true);
      if (editingWorker) {
        await workerService.update(editingWorker.id, formData);
      } else {
        await workerService.create(formData);
      }
      setIsModalOpen(false);
      fetchWorkers();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save worker details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      setSubmitting(true);
      await workerService.delete(deletingId);
      setDeletingId(null);
      fetchWorkers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete worker');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      worker.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.workerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (worker.phoneNumber && worker.phoneNumber.includes(searchTerm));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && worker.active) ||
      (statusFilter === 'INACTIVE' && !worker.active);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Worker Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage daily wage labourers, daily rates, and status.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-sm transition-colors"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Worker
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, code, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 font-medium"
          >
            <option value="ALL">All Workers</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Workers Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm">Loading workers directory...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600 text-sm">{error}</div>
        ) : filteredWorkers.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No workers found matching your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/70 text-xs font-semibold uppercase text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Worker Code</th>
                  <th className="px-5 py-3.5">Full Name</th>
                  <th className="px-5 py-3.5">Phone Number</th>
                  <th className="px-5 py-3.5">Daily Wage</th>
                  <th className="px-5 py-3.5">Std Hours</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWorkers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-700">
                      {worker.workerCode}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      <Link to={`/workers/${worker.id}`} className="hover:text-sky-600 transition-colors">
                        {worker.fullName}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{worker.phoneNumber || '—'}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      ₹{worker.standardDailyWage.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5">{worker.standardWorkHours} hrs</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          worker.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {worker.active ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" /> Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <Link
                        to={`/workers/${worker.id}`}
                        className="inline-flex items-center p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors"
                        title="View Worker Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleOpenEditModal(worker)}
                        className="inline-flex items-center p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                        title="Edit Worker"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(worker.id)}
                        className="inline-flex items-center p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Worker"
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

      {/* Add / Edit Worker Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWorker ? 'Edit Worker Information' : 'Register New Daily Wage Worker'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                Worker Code *
              </label>
              <input
                type="text"
                value={formData.workerCode}
                onChange={(e) => setFormData({ ...formData, workerCode: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                placeholder="e.g. Ramesh Singh"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                placeholder="10-digit mobile"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                Standard Daily Wage (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={formData.standardDailyWage}
                onChange={(e) => setFormData({ ...formData, standardDailyWage: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                Standard Work Hours *
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="24"
                value={formData.standardWorkHours}
                onChange={(e) => setFormData({ ...formData, standardWorkHours: parseFloat(e.target.value) || 8 })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                Status
              </label>
              <select
                value={formData.active ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
              >
                <option value="true">Active Worker</option>
                <option value="false">Inactive Worker</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
              placeholder="Residential or site location address"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingWorker ? 'Update Worker' : 'Register Worker'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Worker Record"
        message="Are you sure you want to delete this worker? This action will remove worker records from the database."
        isLoading={submitting}
      />
    </div>
  );
};
