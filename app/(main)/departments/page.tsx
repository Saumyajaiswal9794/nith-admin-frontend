'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, Plus, Search, Globe, Pencil, Trash2, Loader2, CheckCircle, XCircle, X, ChevronRight
} from 'lucide-react';

const API = 'http://localhost:4000/api/v1/departments';

interface Department {
  id: number;
  code: string;
  slug: string;
  name_en: string;
  name_hi: string | null;
  short_description_en: string | null;
  status: string;
  created_at: string;
}

interface Counts {
  total: number;
  active: number;
  inactive: number;
}

const SECTION_DESCRIPTIONS: Record<string, string> = {
  cse: 'Full section + faculty CRUD',
  mnc: 'Edit Mathematics & Scientific Computing',
  chem: 'Edit Chemistry section content',
  phy: 'Faculty, staff, labs, publications, contact',
  mse: 'Faculty, staff, labs, publications, contact',
  ce: 'Civil Engineering department content',
  che: 'Chemical Engineering department content',
  ece: 'Electronics & Communication content',
  ee: 'Electrical Engineering department content',
  me: 'Mechanical Engineering department content',
  ces: 'Centre for Energy Studies content',
  arch: 'Architecture department content',
  mgt: 'Management Studies content',
  hss: 'Humanities & Social Sciences content',
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [counts, setCounts] = useState<Counts>({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  // New department form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newDept, setNewDept] = useState({ code: '', slug: '', name_en: '', name_hi: '', status: 'active' });
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Records
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ code: '', slug: '', name_en: '', name_hi: '', status: '' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchDepts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const json = await res.json();
      if (json.success) {
        setDepartments(json.data);
        setCounts(json.counts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDepts(); }, [fetchDepts]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreate = async () => {
    if (!newDept.code || !newDept.slug || !newDept.name_en) {
      showToast('error', 'Code, Slug, and Name (EN) are required');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDept),
      });
      const json = await res.json();
      if (json.success) {
        showToast('success', `Department "${newDept.name_en}" created`);
        setNewDept({ code: '', slug: '', name_en: '', name_hi: '', status: 'active' });
        setShowNewForm(false);
        fetchDepts();
      } else {
        showToast('error', json.error || 'Failed to create');
      }
    } catch {
      showToast('error', 'Network error');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (id: number) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (json.success) {
        showToast('success', 'Department updated');
        setEditingId(null);
        fetchDepts();
      } else {
        showToast('error', json.error || 'Failed to update');
      }
    } catch {
      showToast('error', 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this department? This will remove all associated data.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast('success', 'Department deleted');
        if (selectedDept?.id === id) setSelectedDept(null);
        fetchDepts();
      } else {
        showToast('error', json.error || 'Failed to delete');
      }
    } catch {
      showToast('error', 'Network error');
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (dept: Department) => {
    setEditingId(dept.id);
    setEditForm({ code: dept.code, slug: dept.slug, name_en: dept.name_en, name_hi: dept.name_hi || '', status: dept.status });
  };

  const filtered = departments.filter(d => {
    const matchSearch = d.name_en.toLowerCase().includes(searchTerm.toLowerCase()) || d.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filter === 'all' || d.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.msg}
          <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100"><X size={14} /></button>
        </div>
      )}

      {/* Banner */}
      <div className="bg-gradient-to-r from-[#631012] to-[#7a1214] rounded-lg px-6 py-4 text-white">
        <p className="text-sm sm:text-base">Add, update, publish, and remove department records for the public site.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="TOTAL DEPARTMENTS" value={String(counts.total)} accent="text-[#171717]" />
        <StatCard label="ACTIVE" value={String(counts.active)} accent="text-green-700" />
        <StatCard label="INACTIVE" value={String(counts.inactive)} accent="text-amber-600" />
        <div className="bg-white rounded-lg shadow-md p-4 border border-[#171717]/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#631012]/10 flex items-center justify-center">
            <Globe size={18} className="text-[#631012]" />
          </div>
          <div>
            <p className="text-xs text-[#171717]/60 font-medium">SELECTED</p>
            <p className="text-sm font-semibold text-[#631012] truncate max-w-[140px]">{selectedDept ? selectedDept.name_en : 'New Department'}</p>
          </div>
        </div>
      </div>

      {/* Department Sections Grid */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-[#171717]/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#171717]">Department Sections</h2>
            <p className="text-xs text-[#171717]/60 mt-1">Master records cover every department; dedicated backend sections are available where the API already supports them.</p>
          </div>
          {selectedDept && (
            <button
              onClick={() => window.location.href = `/departments/${selectedDept.id}/edit`}
              className="flex items-center gap-2 bg-[#631012] hover:bg-[#7a1214] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md active:scale-95 transition-all"
            >
              <Pencil size={14} /> Open {selectedDept.code.toUpperCase()} Section Editor
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-8"><Loader2 className="animate-spin text-[#631012]" size={24} /></div>
          ) : (
            departments.map(dept => (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept)}
                className={`text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  selectedDept?.id === dept.id
                    ? 'border-[#631012] bg-[#631012]/5'
                    : 'border-[#171717]/10 bg-white hover:border-[#631012]/30'
                }`}
              >
                <span className="text-xs font-bold text-[#631012] uppercase tracking-wide">{dept.code}</span>
                <h3 className="text-sm font-semibold text-[#171717] mt-1 truncate">{dept.name_en}</h3>
                <p className="text-xs text-[#171717]/50 mt-1 line-clamp-2">{SECTION_DESCRIPTIONS[dept.code] || 'Department content'}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Department Editor Section */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-[#171717]/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#631012]/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1" stroke="#631012" strokeWidth="1.5"/><rect x="11" y="2" width="7" height="7" rx="1" stroke="#631012" strokeWidth="1.5"/><rect x="2" y="11" width="7" height="7" rx="1" stroke="#631012" strokeWidth="1.5"/><rect x="11" y="11" width="7" height="7" rx="1" stroke="#631012" strokeWidth="1.5"/></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#171717]">Department Editor</h2>
              <p className="text-xs text-[#171717]/60">Create a department or edit an existing one.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDepts}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#171717]/20 text-[#171717] text-sm font-medium hover:bg-[#F9F9F9] transition-all"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button
              onClick={() => setShowNewForm(!showNewForm)}
              className="flex items-center gap-2 bg-[#631012] hover:bg-[#7a1214] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md active:scale-95 transition-all"
            >
              <Plus size={14} /> New Department
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: New Department Form */}
          <div className={`${showNewForm ? '' : 'hidden'}`}>
            <div className="border border-[#171717]/10 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-[#171717]">Add New Department</h3>
                  <p className="text-xs text-[#171717]/60">Fields in this form are the ones the public frontend can consume.</p>
                </div>
                {showNewForm && <button onClick={() => setShowNewForm(false)}><X size={16} className="text-[#171717]/40 hover:text-[#171717]" /></button>}
              </div>
              <div className="space-y-3">
                <FormField label="Department Code" value={newDept.code} onChange={v => setNewDept({ ...newDept, code: v.toLowerCase().replace(/[^a-z0-9]/g, '') })} placeholder="e.g. cse" />
                <FormField label="Slug" value={newDept.slug} onChange={v => setNewDept({ ...newDept, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, '') })} placeholder="e.g. computer-science-engineering" />
                <FormField label="Name (English)" value={newDept.name_en} onChange={v => setNewDept({ ...newDept, name_en: v })} placeholder="e.g. Computer Science & Engineering" />
                <FormField label="Name (Hindi)" value={newDept.name_hi} onChange={v => setNewDept({ ...newDept, name_hi: v })} placeholder="e.g. कंप्यूटर विज्ञान इंजीनियरिंग" />
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-[#171717]/70 w-28">Status</label>
                  <select
                    value={newDept.status}
                    onChange={e => setNewDept({ ...newDept, status: e.target.value })}
                    className="flex-1 px-3 py-2.5 border border-[#171717]/20 rounded-lg bg-[#F9F9F9] text-sm focus:ring-2 focus:ring-[#631012] focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex items-center gap-2 bg-[#631012] hover:bg-[#7a1214] text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-md active:scale-95 transition-all disabled:opacity-50 mt-2"
                >
                  {creating ? <Loader2 size={14} className="animate-spin" /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>}
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Department Records */}
          <div>
            <div className="border border-[#171717]/10 rounded-lg p-5">
              <div className="mb-4">
                <h3 className="font-bold text-[#171717]">Department Records</h3>
                <p className="text-xs text-[#171717]/60">Search, edit, or delete the records that power the public department section.</p>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#171717]/40" />
                <input
                  type="text"
                  placeholder="Search departments"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-[#171717]/20 rounded-lg bg-[#F9F9F9] text-sm focus:ring-2 focus:ring-[#631012] focus:border-transparent focus:bg-white"
                />
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2 mb-3">
                {(['all', 'active', 'inactive'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                      filter === f ? 'bg-[#631012] text-white shadow-md' : 'bg-white border border-[#171717]/20 text-[#171717]/70 hover:bg-[#F9F9F9]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Records List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin text-[#631012]" size={20} /></div>
                ) : filtered.length === 0 ? (
                  <p className="text-center text-sm text-[#171717]/40 py-8">No departments found</p>
                ) : (
                  filtered.map(dept => (
                    <div key={dept.id} className="flex items-center justify-between p-3 rounded-lg border border-[#171717]/10 hover:bg-[#631012]/5 transition-all group">
                      {editingId === dept.id ? (
                        <div className="flex-1 space-y-2">
                          <div className="flex gap-2">
                            <input value={editForm.code} onChange={e => setEditForm({ ...editForm, code: e.target.value })} className="w-20 px-2 py-1.5 border border-[#171717]/20 rounded text-xs" placeholder="Code" />
                            <input value={editForm.slug} onChange={e => setEditForm({ ...editForm, slug: e.target.value })} className="flex-1 px-2 py-1.5 border border-[#171717]/20 rounded text-xs" placeholder="Slug" />
                          </div>
                          <div className="flex gap-2">
                            <input value={editForm.name_en} onChange={e => setEditForm({ ...editForm, name_en: e.target.value })} className="flex-1 px-2 py-1.5 border border-[#171717]/20 rounded text-xs" placeholder="Name EN" />
                            <input value={editForm.name_hi} onChange={e => setEditForm({ ...editForm, name_hi: e.target.value })} className="flex-1 px-2 py-1.5 border border-[#171717]/20 rounded text-xs" placeholder="Name HI" />
                          </div>
                          <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="px-2 py-1.5 border border-[#171717]/20 rounded text-xs">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdate(dept.id)} disabled={saving} className="flex items-center gap-1 px-3 py-1 bg-[#631012] text-white rounded text-xs font-medium hover:bg-[#7a1214] disabled:opacity-50">
                              {saving ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />} Save
                            </button>
                            <button onClick={() => setEditingId(null)} className="px-3 py-1 border border-[#171717]/20 rounded text-xs hover:bg-[#F9F9F9]">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedDept(dept)}>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold uppercase ${dept.status === 'active' ? 'text-green-700' : 'text-amber-600'}`}>{dept.code}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${dept.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-600'}`}>{dept.status}</span>
                            </div>
                            <p className="text-sm font-medium text-[#171717] truncate mt-0.5">{dept.name_en}</p>
                            {dept.name_hi && <p className="text-xs text-[#171717]/50 truncate">{dept.name_hi}</p>}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => window.location.href = `/departments/${dept.id}/edit`}
                              className="p-1.5 rounded hover:bg-[#631012]/10 text-[#631012]" title="Open Section Editor"
                            >
                              <ChevronRight size={14} />
                            </button>
                            <button onClick={() => startEdit(dept)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600" title="Edit">
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(dept.id)}
                              disabled={deletingId === dept.id}
                              className="p-1.5 rounded hover:bg-red-50 text-red-600 disabled:opacity-50" title="Delete"
                            >
                              {deletingId === dept.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Reusable Components ── */

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-[#171717]/5">
      <p className="text-xs text-[#171717]/60 font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent}`}>{value}</p>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-[#171717]/70 w-28 shrink-0">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-3 py-2.5 border border-[#171717]/20 rounded-lg bg-[#F9F9F9] text-sm focus:ring-2 focus:ring-[#631012] focus:border-transparent focus:bg-white transition-all"
      />
    </div>
  );
}
