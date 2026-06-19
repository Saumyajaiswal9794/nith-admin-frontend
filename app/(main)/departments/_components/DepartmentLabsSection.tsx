'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Edit2, Loader2, Save, Trash2 } from 'lucide-react';

export interface LabItem {
    id?: number;
    lab_name_en: string;
    lab_name_hi: string;
    description_en: string;
    description_hi: string;
    category: string;
    location: string;
    incharge_name: string;
    incharge_email: string;
    incharge_phone: string;
    lab_image_url: string;
    order_index: number | string;
    is_active: boolean;
}

interface Props {
    departmentCode: string;
    apiBase: string;
}

const EMPTY: LabItem = {
    lab_name_en: '',
    lab_name_hi: '',
    description_en: '',
    description_hi: '',
    category: 'general',
    location: '',
    incharge_name: '',
    incharge_email: '',
    incharge_phone: '',
    lab_image_url: '',
    order_index: 0,
    is_active: true,
};

const CATEGORIES = [
    { value: 'general', label: 'General Laboratory' },
    { value: 'btech', label: 'B.Tech Labs' },
    { value: 'msc', label: 'M.Sc / M.Tech Labs' },
    { value: 'facility', label: 'Facility' },
    { value: 'equipment', label: 'Equipment / R&D' },
];

export default function DepartmentLabsSection({ departmentCode, apiBase }: Props) {
    const [rows, setRows] = useState<LabItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<LabItem>(EMPTY);
    const [editingId, setEditingId] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiBase}/labs`);
            const json = res.ok ? await res.json() : null;
            setRows((json?.data || []) as LabItem[]);
        } finally {
            setLoading(false);
        }
    }, [apiBase]);

    useEffect(() => { void load(); }, [load]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                lab_name_en: form.lab_name_en.trim(),
                lab_name_hi: form.lab_name_hi.trim() || null,
                description_en: form.description_en.trim() || null,
                description_hi: form.description_hi.trim() || null,
                category: form.category,
                location: form.location.trim() || null,
                incharge_name: form.incharge_name.trim() || null,
                incharge_email: form.incharge_email.trim() || null,
                incharge_phone: form.incharge_phone.trim() || null,
                lab_image_url: form.lab_image_url.trim() || null,
                order_index: Number(form.order_index) || 0,
                is_active: Boolean(form.is_active),
            };
            const res = await fetch(
                editingId ? `${apiBase}/labs/${editingId}` : `${apiBase}/labs`,
                { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
            );
            if (!res.ok) throw new Error('Failed to save lab');
            setForm(EMPTY);
            setEditingId(null);
            await load();
            alert(editingId ? 'Lab updated' : 'Lab added');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error saving lab');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this lab entry?')) return;
        const res = await fetch(`${apiBase}/labs/${id}`, { method: 'DELETE' });
        if (res.ok) {
            await load();
            if (editingId === id) { setEditingId(null); setForm(EMPTY); }
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="rounded-lg border border-[#171717]/10 p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-[#171717]">Labs & Facilities</h2>
                        <p className="text-sm text-[#171717]/60">Manage laboratories shown on the {departmentCode.toUpperCase()} labs page.</p>
                    </div>
                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#631012] text-white disabled:opacity-70">
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {editingId ? 'Update Lab' : 'Add Lab'}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={form.lab_name_en} onChange={(e) => setForm((p) => ({ ...p, lab_name_en: e.target.value }))} placeholder="Lab name (English)" required className="w-full px-3 py-2 border rounded-lg text-black" />
                    <input value={form.lab_name_hi} onChange={(e) => setForm((p) => ({ ...p, lab_name_hi: e.target.value }))} placeholder="Lab name (Hindi)" className="w-full px-3 py-2 border rounded-lg text-black" />
                    <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-black">
                        {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <input type="number" value={form.order_index} onChange={(e) => setForm((p) => ({ ...p, order_index: e.target.value }))} placeholder="Order" className="w-full px-3 py-2 border rounded-lg text-black" />
                    <textarea rows={2} value={form.description_en} onChange={(e) => setForm((p) => ({ ...p, description_en: e.target.value }))} placeholder="Description (English)" className="w-full px-3 py-2 border rounded-lg text-black md:col-span-2" />
                    <input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="Location" className="w-full px-3 py-2 border rounded-lg text-black" />
                    <input value={form.incharge_name} onChange={(e) => setForm((p) => ({ ...p, incharge_name: e.target.value }))} placeholder="Incharge name" className="w-full px-3 py-2 border rounded-lg text-black" />
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="accent-[#631012]" /> Active</label>
                </div>
            </form>
            {loading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div> : (
                <div className="space-y-3">
                    {rows.length === 0 ? <p className="text-sm text-[#171717]/60 text-center py-6">No labs added yet.</p> : rows.map((row) => (
                        <div key={row.id} className="rounded-lg border p-4 bg-[#F9F9F9]/50 flex flex-col md:flex-row md:justify-between gap-4">
                            <div>
                                <p className="text-xs text-[#631012] font-semibold uppercase">{row.category}</p>
                                <h4 className="font-bold text-[#171717]">{row.lab_name_en}</h4>
                                <p className="text-sm text-[#171717]/70">{row.description_en || 'No description'}</p>
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => { setEditingId(row.id || null); setForm({ ...row, lab_name_hi: row.lab_name_hi || '', description_en: row.description_en || '', description_hi: row.description_hi || '', location: row.location || '', incharge_name: row.incharge_name || '', incharge_email: row.incharge_email || '', incharge_phone: row.incharge_phone || '', lab_image_url: row.lab_image_url || '', order_index: row.order_index || 0 }); }} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"><Edit2 size={14} /> Edit</button>
                                <button type="button" onClick={() => handleDelete(row.id || 0)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 text-sm"><Trash2 size={14} /> Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
