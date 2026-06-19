'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Edit2, Loader2, Save, Trash2 } from 'lucide-react';

export interface FacultyMember {
    id?: number;
    name: string;
    designation_en: string;
    designation_hi: string;
    email: string;
    phone: string;
    interests: string;
    group_title: string;
    is_featured: boolean;
    photo_url: string;
    order_index: number | string;
    is_active: boolean;
}

interface DepartmentFacultySectionProps {
    departmentCode: string;
    apiBase: string;
}

const EMPTY_FACULTY: FacultyMember = {
    name: '',
    designation_en: '',
    designation_hi: '',
    email: '',
    phone: '',
    interests: '',
    group_title: 'Professor',
    is_featured: false,
    photo_url: '',
    order_index: 0,
    is_active: true,
};

const GROUP_OPTIONS = [
    'Professor',
    'Associate Professor',
    'Assistant Professor Grade-I',
    'Assistant Professor Grade-II',
    'Faculty',
];

export default function DepartmentFacultySection({
    departmentCode,
    apiBase,
}: DepartmentFacultySectionProps) {
    const [faculty, setFaculty] = useState<FacultyMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [facultyForm, setFacultyForm] = useState<FacultyMember>(EMPTY_FACULTY);
    const [facultyEditingId, setFacultyEditingId] = useState<number | null>(null);

    const fetchFaculty = useCallback(async () => {
        const res = await fetch(`${apiBase}/faculty?language=both`);
        if (!res.ok) return [] as FacultyMember[];
        const json = await res.json();
        return (json?.data || []) as FacultyMember[];
    }, [apiBase]);

    const loadFaculty = useCallback(async () => {
        try {
            setLoading(true);
            const rows = await fetchFaculty();
            setFaculty(rows);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [fetchFaculty]);

    useEffect(() => {
        void loadFaculty();
    }, [loadFaculty]);

    const handleFacultySubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            setSaving(true);
            const payload = {
                name: facultyForm.name.trim(),
                designation_en: facultyForm.designation_en.trim() || null,
                designation_hi: facultyForm.designation_hi.trim() || null,
                email: facultyForm.email.trim(),
                phone: facultyForm.phone.trim() || null,
                interests: facultyForm.interests.trim() || null,
                group_title: facultyForm.group_title.trim() || 'Faculty',
                is_featured: Boolean(facultyForm.is_featured),
                photo_url: facultyForm.photo_url.trim() || null,
                order_index: Number(facultyForm.order_index) || 0,
                is_active: Boolean(facultyForm.is_active),
            };

            const res = await fetch(
                facultyEditingId ? `${apiBase}/faculty/${facultyEditingId}` : `${apiBase}/faculty`,
                {
                    method: facultyEditingId ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) {
                const json = await res.json().catch(() => null);
                throw new Error(json?.message || 'Failed to save faculty member');
            }

            setFacultyForm(EMPTY_FACULTY);
            setFacultyEditingId(null);
            await loadFaculty();
            alert(facultyEditingId ? 'Faculty member updated' : 'Faculty member added');
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Error saving faculty member');
        } finally {
            setSaving(false);
        }
    };

    const handleFacultyDelete = async (id: number) => {
        if (!confirm('Delete this faculty member?')) return;

        const res = await fetch(`${apiBase}/faculty/${id}`, { method: 'DELETE' });
        if (res.ok) {
            await loadFaculty();
            if (facultyEditingId === id) {
                setFacultyEditingId(null);
                setFacultyForm(EMPTY_FACULTY);
            }
            alert('Faculty member deleted');
        } else {
            alert('Failed to delete faculty member');
        }
    };

    const groupedFaculty = GROUP_OPTIONS.reduce<Record<string, FacultyMember[]>>((acc, group) => {
        acc[group] = faculty.filter((member) => member.group_title === group);
        return acc;
    }, {});

    const otherGroups = faculty.filter((member) => !GROUP_OPTIONS.includes(member.group_title));
    if (otherGroups.length > 0) {
        groupedFaculty.Other = otherGroups;
    }

    return (
        <div className="space-y-4">
            <form onSubmit={handleFacultySubmit} className="rounded-lg border border-[#171717]/10 p-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-[#171717]">Faculty Directory</h2>
                        <p className="text-sm text-[#171717]/60">
                            Add, edit, or remove faculty shown on the public {departmentCode.toUpperCase()} faculty page.
                        </p>
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#631012] text-white hover:bg-[#7a1214] transition-colors disabled:opacity-70"
                    >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {facultyEditingId ? 'Update Faculty' : 'Add Faculty'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        value={facultyForm.name}
                        onChange={(e) => setFacultyForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Full name"
                        required
                        className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black"
                    />
                    <input
                        value={facultyForm.email}
                        onChange={(e) => setFacultyForm((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="Email"
                        type="email"
                        required
                        className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black"
                    />
                    <input
                        value={facultyForm.designation_en}
                        onChange={(e) => setFacultyForm((prev) => ({ ...prev, designation_en: e.target.value }))}
                        placeholder="Designation (English)"
                        className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black"
                    />
                    <input
                        value={facultyForm.designation_hi}
                        onChange={(e) => setFacultyForm((prev) => ({ ...prev, designation_hi: e.target.value }))}
                        placeholder="Designation (Hindi)"
                        className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black"
                    />
                    <select
                        value={facultyForm.group_title}
                        onChange={(e) => setFacultyForm((prev) => ({ ...prev, group_title: e.target.value }))}
                        className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black"
                    >
                        {GROUP_OPTIONS.map((group) => (
                            <option key={group} value={group}>
                                {group}
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        value={facultyForm.order_index}
                        onChange={(e) => setFacultyForm((prev) => ({ ...prev, order_index: e.target.value }))}
                        placeholder="Display order"
                        className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black"
                    />
                    <textarea
                        rows={3}
                        value={facultyForm.interests}
                        onChange={(e) => setFacultyForm((prev) => ({ ...prev, interests: e.target.value }))}
                        placeholder="Research domains / interests"
                        className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black md:col-span-2"
                    />
                    <input
                        value={facultyForm.phone}
                        onChange={(e) => setFacultyForm((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="Phone (optional)"
                        className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black"
                    />
                    <input
                        value={facultyForm.photo_url}
                        onChange={(e) => setFacultyForm((prev) => ({ ...prev, photo_url: e.target.value }))}
                        placeholder="Photo URL (optional)"
                        className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black"
                    />
                    <label className="flex items-center gap-3 text-sm font-medium text-[#171717]">
                        <input
                            type="checkbox"
                            checked={facultyForm.is_featured}
                            onChange={(e) => setFacultyForm((prev) => ({ ...prev, is_featured: e.target.checked }))}
                            className="h-4 w-4 accent-[#631012]"
                        />
                        Featured layout (Professor tier)
                    </label>
                    <label className="flex items-center gap-3 text-sm font-medium text-[#171717]">
                        <input
                            type="checkbox"
                            checked={facultyForm.is_active}
                            onChange={(e) => setFacultyForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                            className="h-4 w-4 accent-[#631012]"
                        />
                        Active on public site
                    </label>
                </div>

                {facultyEditingId && (
                    <button
                        type="button"
                        onClick={() => {
                            setFacultyEditingId(null);
                            setFacultyForm(EMPTY_FACULTY);
                        }}
                        className="text-sm text-[#171717]/60 hover:text-[#171717] underline"
                    >
                        Cancel editing
                    </button>
                )}
            </form>

            {loading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-[#171717]/60">
                    <Loader2 className="animate-spin" size={18} /> Loading faculty...
                </div>
            ) : faculty.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#171717]/15 bg-[#F9F9F9] p-6 text-center text-[#171717]/60">
                    No faculty members yet. Use the form above to add the first entry.
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedFaculty)
                        .filter(([, members]) => members.length > 0)
                        .map(([groupTitle, members]) => (
                            <div key={groupTitle} className="space-y-3">
                                <h3 className="text-lg font-bold text-[#631012]">{groupTitle}</h3>
                                {members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="rounded-lg border border-[#171717]/10 p-4 bg-[#F9F9F9]/50 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
                                    >
                                        <div className="space-y-1">
                                            <h4 className="text-base font-bold text-[#171717]">{member.name}</h4>
                                            <p className="text-sm text-[#171717]/70">
                                                {member.designation_en || 'No designation'}
                                            </p>
                                            <p className="text-sm text-[#171717]/70">{member.email}</p>
                                            <p className="text-sm text-[#171717]/70">{member.interests || 'No interests listed'}</p>
                                            <p className="text-xs text-[#171717]/50">
                                                Group: {member.group_title} | Order: {member.order_index}
                                                {member.is_featured ? ' | Featured' : ''}
                                                {!member.is_active ? ' | Hidden' : ''}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFacultyEditingId(member.id || null);
                                                    setFacultyForm({
                                                        ...member,
                                                        designation_hi: member.designation_hi || '',
                                                        phone: member.phone || '',
                                                        interests: member.interests || '',
                                                        photo_url: member.photo_url || '',
                                                        order_index: member.order_index || 0,
                                                    });
                                                }}
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#171717]/15 text-[#171717] hover:bg-white text-sm"
                                            >
                                                <Edit2 size={14} /> Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleFacultyDelete(member.id || 0)}
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
