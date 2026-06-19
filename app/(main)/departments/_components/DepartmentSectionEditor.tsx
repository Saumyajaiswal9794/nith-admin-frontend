'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    BookOpen,
    Edit2,
    Loader2,
    RefreshCw,
    Save,
    ShieldCheck,
    Trash2,
} from 'lucide-react';

interface SectionDefaults {
    name_en: string;
    name_hi: string;
    slug: string;
    description_short_en: string;
    description_short_hi: string;
}

interface DepartmentSectionEditorProps {
    code: string;
    title: string;
    subtitle: string;
    backHref?: string;
    defaults: SectionDefaults;
}

interface DepartmentFormState {
    name_en: string;
    name_hi: string;
    slug: string;
    description_short_en: string;
    description_short_hi: string;
    is_active: boolean;
}

const API_BASE = 'http://localhost:4000/v1/departments';

const makeEmptyForm = (defaults: SectionDefaults): DepartmentFormState => ({
    name_en: defaults.name_en,
    name_hi: defaults.name_hi,
    slug: defaults.slug,
    description_short_en: defaults.description_short_en,
    description_short_hi: defaults.description_short_hi,
    is_active: true,
});

export default function DepartmentSectionEditor({
    code,
    title,
    subtitle,
    backHref = '/departments',
    defaults,
}: DepartmentSectionEditorProps) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isExisting, setIsExisting] = useState(false);
    const [recordId, setRecordId] = useState<number | null>(null);
    const [formData, setFormData] = useState<DepartmentFormState>(makeEmptyForm(defaults));

    const loadDepartment = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/${code}`);

            if (res.status === 404) {
                setIsExisting(false);
                setRecordId(null);
                setFormData(makeEmptyForm(defaults));
                return;
            }

            if (!res.ok) {
                throw new Error('Failed to load department');
            }

            const json = await res.json();
            const data = json?.data || json;
            setIsExisting(true);
            setRecordId(data?.id ?? null);
            setFormData({
                name_en: data?.name_en || defaults.name_en,
                name_hi: data?.name_hi || defaults.name_hi,
                slug: data?.slug || defaults.slug,
                description_short_en: data?.description_short_en || defaults.description_short_en,
                description_short_hi: data?.description_short_hi || defaults.description_short_hi,
                is_active: Boolean(data?.is_active ?? true),
            });
        } catch (error) {
            console.error(error);
            setIsExisting(false);
            setRecordId(null);
            setFormData(makeEmptyForm(defaults));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const syncDepartment = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/${code}`);

                if (res.status === 404) {
                    setIsExisting(false);
                    setRecordId(null);
                    setFormData(makeEmptyForm(defaults));
                    return;
                }

                if (!res.ok) {
                    throw new Error('Failed to load department');
                }

                const json = await res.json();
                const data = json?.data || json;
                setIsExisting(true);
                setRecordId(data?.id ?? null);
                setFormData({
                    name_en: data?.name_en || defaults.name_en,
                    name_hi: data?.name_hi || defaults.name_hi,
                    slug: data?.slug || defaults.slug,
                    description_short_en: data?.description_short_en || defaults.description_short_en,
                    description_short_hi: data?.description_short_hi || defaults.description_short_hi,
                    is_active: Boolean(data?.is_active ?? true),
                });
            } catch (error) {
                console.error(error);
                setIsExisting(false);
                setRecordId(null);
                setFormData(makeEmptyForm(defaults));
            } finally {
                setLoading(false);
            }
        };

        void syncDepartment();
    }, [code, defaults]);

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

    const resetForm = () => {
        setFormData(makeEmptyForm(defaults));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);

        try {
            const payload = {
                code,
                name_en: formData.name_en.trim(),
                name_hi: formData.name_hi.trim() || null,
                slug: formData.slug.trim() || code,
                description_short_en: formData.description_short_en.trim() || null,
                description_short_hi: formData.description_short_hi.trim() || null,
                is_active: formData.is_active,
            };

            const res = await fetch(isExisting ? `${API_BASE}/${code}` : API_BASE, {
                method: isExisting ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const responseData = await res.json().catch(() => null);
            if (!res.ok) {
                throw new Error(responseData?.message || 'Failed to save department');
            }

            await loadDepartment();
            alert(isExisting ? 'Department updated successfully' : 'Department created successfully');
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Error saving department');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!isExisting) {
            alert('Nothing to delete yet. Create the department first.');
            return;
        }

        if (!confirm(`Delete ${title}?`)) return;

        try {
            const res = await fetch(`${API_BASE}/${code}`, { method: 'DELETE' });
            if (!res.ok) {
                throw new Error('Failed to delete department');
            }

            setIsExisting(false);
            setRecordId(null);
            resetForm();
            alert('Department deleted successfully');
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Error deleting department');
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-[#631012]/10 p-3 rounded-full text-[#631012] flex-shrink-0">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-[#171717]">{title}</h1>
                        <p className="text-sm text-[#171717]/60">{subtitle}</p>
                    </div>
                </div>
                <Link href={backHref} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#171717]/15 text-[#171717] hover:bg-[#F9F9F9] transition-colors">
                    <ArrowLeft size={16} />
                    Back
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white rounded-lg shadow-md p-4 border border-[#171717]/10">
                    <p className="text-xs uppercase tracking-widest text-[#171717]/50 font-semibold">Department Code</p>
                    <p className="text-lg font-bold text-[#171717] mt-2">{code}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 border border-[#171717]/10">
                    <p className="text-xs uppercase tracking-widest text-[#171717]/50 font-semibold">Status</p>
                    <p className="text-lg font-bold text-[#171717] mt-2">{isExisting ? 'Saved' : 'Not Created'}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 border border-[#171717]/10 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-[#171717]/50 font-semibold">Record ID</p>
                        <p className="text-lg font-bold text-[#171717] mt-2">{recordId ?? 'New'}</p>
                    </div>
                    <ShieldCheck className="text-[#631012]" />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-[#171717]">Department Editor</h2>
                        <p className="text-sm text-[#171717]/60 mt-1">English and Hindi fields are shown side by side.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={loadDepartment} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#171717]/15 text-[#171717] hover:bg-[#F9F9F9] transition-colors">
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                        <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#631012] text-white hover:bg-[#7a1214] transition-colors">
                            <Edit2 size={16} />
                            Reset
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-12 flex items-center justify-center gap-2 text-[#171717]/60">
                        <Loader2 className="animate-spin" size={18} />
                        Loading department...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[#171717] mb-2">Name English</label>
                                <input
                                    name="name_en"
                                    value={formData.name_en}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#631012] text-black"
                                    placeholder={defaults.name_en}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#171717] mb-2">Name Hindi</label>
                                <input
                                    name="name_hi"
                                    value={formData.name_hi}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#631012] text-black"
                                    placeholder={defaults.name_hi}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#171717] mb-2">Slug</label>
                                <input
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#631012] text-black"
                                    placeholder={defaults.slug}
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-7">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 accent-[#631012]"
                                />
                                <span className="text-sm font-medium text-[#171717]">Active on public site</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[#171717] mb-2">Short Description English</label>
                                <textarea
                                    name="description_short_en"
                                    value={formData.description_short_en}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#631012] text-black"
                                    placeholder={defaults.description_short_en}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#171717] mb-2">Short Description Hindi</label>
                                <textarea
                                    name="description_short_hi"
                                    value={formData.description_short_hi}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#631012] text-black"
                                    placeholder={defaults.description_short_hi}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#631012] text-white hover:bg-[#7a1214] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                {saving ? 'Saving...' : isExisting ? 'Update Department' : 'Create Department'}
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                            >
                                <Trash2 size={16} />
                                Delete Department
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h3 className="text-lg font-bold text-[#171717] mb-4">Live Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-[#171717]/10 p-4 bg-[#F9F9F9]">
                        <p className="text-xs uppercase tracking-widest text-[#171717]/50 font-semibold mb-2">English</p>
                        <p className="text-lg font-bold text-[#171717]">{formData.name_en || defaults.name_en}</p>
                        <p className="text-sm text-[#171717]/70 mt-2">{formData.description_short_en || defaults.description_short_en}</p>
                    </div>
                    <div className="rounded-lg border border-[#171717]/10 p-4 bg-[#F9F9F9]">
                        <p className="text-xs uppercase tracking-widest text-[#171717]/50 font-semibold mb-2">Hindi</p>
                        <p className="text-lg font-bold text-[#171717]">{formData.name_hi || defaults.name_hi}</p>
                        <p className="text-sm text-[#171717]/70 mt-2">{formData.description_short_hi || defaults.description_short_hi}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
