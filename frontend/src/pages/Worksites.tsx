import React, { useEffect, useState } from 'react';
import { worksiteService } from '../services/worksiteService';
import { Worksite, WorksiteFormData } from '../types';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Building2, Plus, Search, MapPin, Users, Edit2, Trash2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export const Worksites: React.FC = () => {
  const [worksites, setWorksites] = useState<Worksite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorksite, setEditingWorksite] = useState<Worksite | null>(null);
  const [formData, setFormData] = useState<WorksiteFormData>({
    worksiteCode: '',
    name: '',
    location: '',
    description: '',
    active: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchWorksites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await worksiteService.getAll();
      setWorksites(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch worksites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorksites();
  }, []);

  const handleOpenAddModal = () => {
    setEditingWorksite(null);
    setFormData({
      worksiteCode: `SITE-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      location: '',
      description: '',
      active: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (site: Worksite) => {
    setEditingWorksite(site);
    setFormData({
      worksiteCode: site.worksiteCode,
      name: site.name,
      location: site.location,
      description: site.description || '',
      active: site.active,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.worksiteCode.trim()) {
      setFormError('Worksite code is required');
      return;
    }
    if (!formData.name.trim()) {
      setFormError('Worksite name is required');
      return;
    }
    if (!formData.location.trim()) {
      setFormError('Location is required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingWorksite) {
        await worksiteService.update(editingWorksite.id, formData);
      } else {
        await worksiteService.create(formData);
      }
      setIsModalOpen(false);
      fetchWorksites();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save worksite details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      setSubmitting(true);
      await worksiteService.delete(deletingId);
      setDeletingId(null);
      fetchWorksites();
    } catch (err: any) {
      setError(err.message || 'Failed to delete worksite');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredWorksites = worksites.filter(
    (site) =>
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.worksiteCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Worksite Locations</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage construction project sites, farm plots, and active field locations.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Worksite
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search site name, code, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
          />
        </div>
      </div>

      {/* Worksites Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm">Loading worksites...</div>
      ) : error ? (
        <div className="p-6 text-center text-red-600 text-sm">{error}</div>
      ) : filteredWorksites.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm">No worksites found matching your search.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorksites.map((site) => (
            <div
              key={site.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {site.worksiteCode}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{site.name}</h3>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      site.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {site.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mt-3 flex items-center text-sm text-slate-600">
                  <MapPin className="h-4 w-4 mr-1.5 text-slate-400 shrink-0" />
                  <span className="truncate">{site.location}</span>
                </div>

                {site.description && (
                  <p className="mt-3 text-xs text-slate-500 line-clamp-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {site.description}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center text-xs font-medium text-slate-500">
                  <Users className="h-4 w-4 mr-1 text-sky-600" />
                  <span>{site.activeWorkersCount || 0} Workers Logged</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEditModal(site)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                    title="Edit Worksite"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(site.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete Worksite"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Worksite Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWorksite ? 'Edit Worksite' : 'Add New Worksite Location'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
              Worksite Code *
            </label>
            <input
              type="text"
              value={formData.worksiteCode}
              onChange={(e) => setFormData({ ...formData, worksiteCode: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
              Worksite Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
              placeholder="e.g. Metro Bridge Construction Block B"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
              Location / Address *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
              placeholder="e.g. NH-44 Sector 12, Cyber City"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
              Description / Notes
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
              placeholder="Details regarding site supervisor, active scope, or landmark"
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
              <option value="true">Active Site</option>
              <option value="false">Inactive Site</option>
            </select>
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
              {submitting ? 'Saving...' : editingWorksite ? 'Update Site' : 'Create Site'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Worksite Location"
        message="Are you sure you want to delete this worksite? This action cannot be undone."
        isLoading={submitting}
      />
    </div>
  );
};
