'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Edit2,
  Globe2,
  LayoutGrid,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

interface DepartmentRecord {
  id: number;
  code: string;
  name_en: string;
  name_hi: string | null;
  slug: string | null;
  description_short_en: string | null;
  description_short_hi: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface DepartmentFormState {
  code: string;
  name_en: string;
  name_hi: string;
  slug: string;
  description_short_en: string;
  description_short_hi: string;
  is_active: boolean;
}

const API_BASE = 'http://localhost:4000/v1/departments';

const EMPTY_FORM: DepartmentFormState = {
  code: '',
  name_en: '',
  name_hi: '',
  slug: '',
  description_short_en: '',
  description_short_hi: '',
  is_active: true,
};

const FALLBACK_DEPARTMENTS: DepartmentRecord[] = [
  {
    id: 1,
    code: 'cse',
    name_en: 'Computer Science and Engineering',
    name_hi: 'कंप्यूटर विज्ञान और इंजीनियरिंग',
    slug: 'cse',
    description_short_en: 'CSE Department at NIT Hamirpur',
    description_short_hi: 'एनआईटी हमीरपुर का कंप्यूटर विज्ञान एवं अभियांत्रिकी विभाग',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [formData, setFormData] = useState<DepartmentFormState>(EMPTY_FORM);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      if (!res.ok) {
        throw new Error('Failed to load departments');
      }

      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setDepartments(FALLBACK_DEPARTMENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_BASE);
        if (!res.ok) {
          throw new Error('Failed to load departments');
        }

        const data = await res.json();
        setDepartments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setDepartments(FALLBACK_DEPARTMENTS);
      } finally {
        setLoading(false);
      }
    };

    void loadDepartments();
  }, []);

  const resetForm = () => {
    setIsEditing(null);
    setEditingCode(null);
    setFormData(EMPTY_FORM);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = event.target;
    const nextValue =
      type === 'checkbox'
        ? (event.target as HTMLInputElement).checked
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const handleEdit = (department: DepartmentRecord) => {
    setIsEditing(department.id);
    setEditingCode(department.code);
    setFormData({
      code: department.code || '',
      name_en: department.name_en || '',
      name_hi: department.name_hi || '',
      slug: department.slug || '',
      description_short_en: department.description_short_en || '',
      description_short_hi: department.description_short_hi || '',
      is_active: Boolean(department.is_active),
    });
  };

  const handleDelete = async (department: DepartmentRecord) => {
    if (!confirm(`Delete ${department.name_en}?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/${department.code}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete department');
      }

      setDepartments((prev) => prev.filter((item) => item.id !== department.id));
      if (isEditing === department.id) {
        resetForm();
      }
      alert('Department deleted successfully');
    } catch (error) {
      console.error(error);
      alert('Error deleting department');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        code: formData.code.trim(),
        name_en: formData.name_en.trim(),
        name_hi: formData.name_hi.trim() || null,
        slug: formData.slug.trim() || formData.code.trim().toLowerCase(),
        description_short_en: formData.description_short_en.trim() || null,
        description_short_hi: formData.description_short_hi.trim() || null,
        is_active: formData.is_active,
      };

      const res = await fetch(
        isEditing ? `${API_BASE}/${editingCode || payload.code}` : API_BASE,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          responseData?.message || 'Unable to save department'
        );
      }

      await fetchDepartments();
      resetForm();
      alert(
        isEditing ? 'Department updated successfully' : 'Department created successfully'
      );
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Error saving department');
    } finally {
      setSaving(false);
    }
  };

  const filteredDepartments = departments.filter((department) => {
    const matchesSearch =
      department.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (department.slug || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      activeFilter === 'all' ||
      (activeFilter === 'active' && department.is_active) ||
      (activeFilter === 'inactive' && !department.is_active);

    return matchesSearch && matchesStatus;
  });

  const selectedDepartment = isEditing
    ? departments.find((department) => department.id === isEditing) || null
    : null;

  const activeCount = departments.filter((department) => department.is_active).length;
  const inactiveCount = departments.length - activeCount;

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
      <div className="bg-gradient-to-r from-[#631012] to-[#7a1214] rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
            Department Management
          </h1>
        </div>
        <p className="text-sm sm:text-base text-white/90">
          Add, update, publish, and remove department records for the public site.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border border-[#171717]/10">
          <p className="text-xs uppercase tracking-widest text-[#171717]/50 font-semibold">
            Total Departments
          </p>
          <p className="text-2xl font-bold text-[#171717] mt-2">{departments.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-[#171717]/10">
          <p className="text-xs uppercase tracking-widest text-[#171717]/50 font-semibold">
            Active
          </p>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{activeCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-[#171717]/10">
          <p className="text-xs uppercase tracking-widest text-[#171717]/50 font-semibold">
            Inactive
          </p>
          <p className="text-2xl font-bold text-amber-700 mt-2">{inactiveCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-[#171717]/10 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#171717]/50 font-semibold">
              Selected
            </p>
            <p className="text-base font-semibold text-[#171717] mt-2">
              {selectedDepartment ? selectedDepartment.name_en : 'New Department'}
            </p>
          </div>
          <Globe2 className="text-[#631012]" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#171717]">Department Sections</h2>
            <p className="text-sm text-[#171717]/60 mt-1">
              Master records cover every department; dedicated backend sections are available where the API already supports them.
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { code: 'cse', title: 'CSE', subtitle: 'Full section + faculty CRUD', href: '/departments/cse' },
            { code: 'mnc', title: 'MNC', subtitle: 'Edit Mathematics & Scientific Computing', href: '/departments/mnc' },
            { code: 'chem', title: 'Chemistry', subtitle: 'Edit Chemistry section content', href: '/departments/chem' },
            { code: 'phy', title: 'Physics', subtitle: 'Faculty, staff, labs, publications, contact', href: '/departments/phy' },
            { code: 'msc', title: 'Material Science', subtitle: 'Faculty, staff, labs, publications, contact', href: '/departments/msc' },
          ].map((section) => (
            <Link key={section.code} href={section.href} className="rounded-lg border border-[#171717]/10 p-4 bg-[#F9F9F9]/60 hover:border-[#631012] hover:bg-white transition-colors">
              <p className="text-xs uppercase tracking-widest text-[#171717]/50 font-semibold">{section.code}</p>
              <h3 className="text-base font-bold text-[#171717] mt-2">{section.title}</h3>
              <p className="text-sm text-[#171717]/60 mt-1">{section.subtitle}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="bg-[#631012]/10 p-2 sm:p-3 rounded-full text-[#631012] flex-shrink-0">
              <LayoutGrid className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#171717]">
                Department Editor
              </h2>
              <p className="text-sm sm:text-base text-[#171717]/60 mt-1">
                Create a department or edit an existing one.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              type="button"
              onClick={fetchDepartments}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[#171717]/15 text-[#171717] hover:bg-[#F9F9F9] transition-colors"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#631012] text-white hover:bg-[#7a1214] transition-colors"
            >
              <Plus size={16} />
              New Department
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#171717]">
                {isEditing ? 'Edit Department' : 'Add New Department'}
              </h3>
              <p className="text-sm text-[#171717]/60 mt-1">
                Fields in this form are the ones the public frontend can consume.
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#631012] text-white hover:bg-[#7a1214] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {saving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#171717] mb-2">
                Department Code
              </label>
              <input
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="cse"
                disabled={Boolean(isEditing)}
                className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#631012] text-black"
              />
              {isEditing && (
                <p className="text-xs text-[#171717]/50 mt-1">
                  Department code is used as the record key and cannot be changed here.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#171717] mb-2">
                Slug
              </label>
              <input
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="computer-science-engineering"
                className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#631012] text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#171717] mb-2">
                Name English
              </label>
              <input
                name="name_en"
                value={formData.name_en}
                onChange={handleInputChange}
                placeholder="Computer Science and Engineering"
                className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#631012] text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#171717] mb-2">
                Name Hindi
              </label>
              <input
                name="name_hi"
                value={formData.name_hi}
                onChange={handleInputChange}
                placeholder="कंप्यूटर विज्ञान और इंजीनियरिंग"
                className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#631012] text-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#171717] mb-2">
                Short Description English
              </label>
              <textarea
                name="description_short_en"
                value={formData.description_short_en}
                onChange={handleInputChange}
                rows={4}
                placeholder="CSE Department at NIT Hamirpur"
                className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#631012] text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#171717] mb-2">
                Short Description Hindi
              </label>
              <textarea
                name="description_short_hi"
                value={formData.description_short_hi}
                onChange={handleInputChange}
                rows={4}
                placeholder="एनआईटी हमीरपुर का कंप्यूटर विज्ञान एवं अभियांत्रिकी विभाग"
                className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#631012] text-black"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm font-medium text-[#171717]">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="h-4 w-4 accent-[#631012]"
            />
            Active on public site
          </label>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#631012] text-white hover:bg-[#7a1214] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {isEditing ? 'Update Department' : 'Create Department'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[#171717]/15 text-[#171717] hover:bg-[#F9F9F9] transition-colors"
            >
              Reset Form
            </button>
          </div>
        </form>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#171717]">
                Department Records
              </h3>
              <p className="text-sm text-[#171717]/60 mt-1">
                Search, edit, or delete the records that power the public department section.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#171717]/40" size={16} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search departments"
                className="w-full pl-9 pr-3 py-2 border border-[#171717]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#631012] text-black"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['all', 'active', 'inactive'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${activeFilter === filter
                  ? 'bg-[#631012] text-white border-[#631012]'
                  : 'bg-white text-[#171717]/70 border-[#171717]/15 hover:bg-[#F9F9F9]'
                  }`}
              >
                {filter === 'all'
                  ? 'All'
                  : filter === 'active'
                    ? 'Active'
                    : 'Inactive'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-[#171717]/60">
              <Loader2 className="animate-spin mb-3" />
              Loading departments...
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="py-16 text-center text-[#171717]/60">
              No departments match your current filters.
            </div>
          ) : (
            <div className="space-y-3 max-h-[760px] overflow-auto pr-1">
              {filteredDepartments.map((department) => (
                <div
                  key={department.id}
                  className="rounded-xl border border-[#171717]/10 p-4 hover:border-[#631012]/30 transition-colors bg-[#F9F9F9]/40"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="text-base font-bold text-[#171717]">
                          {department.name_en}
                        </h4>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${department.is_active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                            }`}
                        >
                          <ShieldCheck size={12} />
                          {department.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-[#171717]/70">
                        {department.description_short_en || 'No description added.'}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-[#171717]/55">
                        <span className="px-2 py-1 rounded-full bg-white border border-[#171717]/10">
                          Code: {department.code}
                        </span>
                        <span className="px-2 py-1 rounded-full bg-white border border-[#171717]/10">
                          Slug: {department.slug || 'auto-generated'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(department)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#171717]/15 text-[#171717] hover:bg-white transition-colors text-sm"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(department)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors text-sm"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-[#171717] mb-3">
          Public Preview
        </h3>
        <div className="rounded-xl border border-dashed border-[#171717]/15 bg-[#F9F9F9] p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredDepartments.slice(0, 3).map((department) => (
              <div key={department.id} className="rounded-lg bg-white p-4 border border-[#171717]/10 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-[#631012] uppercase tracking-wide">
                    {department.code}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${department.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {department.is_active ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <h4 className="text-base font-bold text-[#171717] mb-1">
                  {department.name_en}
                </h4>
                <p className="text-sm text-[#171717]/60">
                  {department.name_hi || 'No Hindi name set'}
                </p>
                <p className="text-sm text-[#171717]/75 mt-3">
                  {department.description_short_en || 'No description available.'}
                </p>
              </div>
            ))}
          </div>
          {filteredDepartments.length === 0 && (
            <p className="text-sm text-[#171717]/60 text-center py-6">
              Create or search for a department to preview how it will appear on the public site.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
