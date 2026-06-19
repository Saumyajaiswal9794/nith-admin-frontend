'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Edit2, Loader2, Save, Trash2 } from 'lucide-react';

export interface PublicationItem {
    id?: number;
    year: string;
    authors: string;
    title: string;
    journal: string;
    indexing: string;
    url: string;
    order_index: number | string;
    is_active: boolean;
}

interface Props {
    departmentCode: string;
    apiBase: string;
}

const EMPTY: PublicationItem = {
    year: '',
    authors: '',
    title: '',
    journal: '',
    indexing: '',
    url: '',
    order_index: 0,
    is_active: true,
};

export default function DepartmentPublicationsSection({ departmentCode, apiBase }: Props) {
    const [rows, setRows] = useState<PublicationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<PublicationItem>(EMPTY);
    const [editingId, setEditingId] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiBase}/publications`);
            const json = res.ok ? await res.json() : null;
            setRows((json?.data || []) as PublicationItem[]);
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
                year: form.year.trim() || null,
                authors: form.authors.trim() || null,
                title: form.title.trim(),
                journal: form.journal.trim() || null,
                indexing: form.indexing.trim() || null,
                url: form.url.trim() || null,
                order_index: Number(form.order_index) || 0,
                is_active: Boolean(form.is_active),
            };
            const res = await fetch(
                editingId ? `${apiBase}/publications/${editingId}` : `${apiBase}/publications`,
                { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
            );
            if (!res.ok) throw new Error('Failed to save publication');
            setForm(EMPTY);
            setEditingId(null);
            await load();
            alert(editingId ? 'Publication updated' : 'Publication added');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error saving publication');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this publication?')) return;
        const res = await fetch(`${apiBase}/publications/${id}`, { method: 'DELETE' });
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
                        <h2 className="text-xl font-bold text-[#171717]">Research Publications</h2>
                        <p className="text-sm text-[#171717]/60">Manage publications for {departmentCode.toUpperCase()}.</p>
                    </div>
                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#631012] text-white disabled:opacity-70">
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {editingId ? 'Update Publication' : 'Add Publication'}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} placeholder="Year" className="w-full px-3 py-2 border rounded-lg text-black" />
                    <input value={form.journal} onChange={(e) => setForm((p) => ({ ...p, journal: e.target.value }))} placeholder="Journal name" className="w-full px-3 py-2 border rounded-lg text-black" />
                    <input value={form.authors} onChange={(e) => setForm((p) => ({ ...p, authors: e.target.value }))} placeholder="Authors" className="w-full px-3 py-2 border rounded-lg text-black md:col-span-2" />
                    <textarea rows={3} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Title & volume details" required className="w-full px-3 py-2 border rounded-lg text-black md:col-span-2" />
                    <input value={form.indexing} onChange={(e) => setForm((p) => ({ ...p, indexing: e.target.value }))} placeholder="Indexing (SCI / Scopus)" className="w-full px-3 py-2 border rounded-lg text-black" />
                    <input value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} placeholder="DOI / URL" className="w-full px-3 py-2 border rounded-lg text-black" />
                    <input type="number" value={form.order_index} onChange={(e) => setForm((p) => ({ ...p, order_index: e.target.value }))} placeholder="Order" className="w-full px-3 py-2 border rounded-lg text-black" />
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="accent-[#631012]" /> Active</label>
                </div>
            </form>
            {loading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div> : (
                <div className="space-y-3">
                    {rows.length === 0 ? <p className="text-sm text-[#171717]/60 text-center py-6">No publications added yet.</p> : rows.map((row) => (
                        <div key={row.id} className="rounded-lg border p-4 bg-[#F9F9F9]/50 flex flex-col md:flex-row md:justify-between gap-4">
                            <div>
                                <p className="text-xs text-[#631012] font-semibold">{row.year} | {row.journal}</p>
                                <h4 className="font-bold text-[#171717]">{row.title}</h4>
                                <p className="text-sm text-[#171717]/70">{row.authors}</p>
                                <p className="text-xs text-[#171717]/50">Indexing: {row.indexing || '-'}</p>
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => { setEditingId(row.id || null); setForm({ ...row, year: row.year || '', authors: row.authors || '', journal: row.journal || '', indexing: row.indexing || '', url: row.url || '', order_index: row.order_index || 0 }); }} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"><Edit2 size={14} /> Edit</button>
                                <button type="button" onClick={() => handleDelete(row.id || 0)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 text-sm"><Trash2 size={14} /> Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
