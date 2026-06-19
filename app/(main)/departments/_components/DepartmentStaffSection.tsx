'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Edit2, Loader2, Save, Trash2 } from 'lucide-react';

export interface StaffMember {
    id?: number;
    staff_type: string;
    name: string;
    designation: string;
    phone: string;
    email: string;
    order_index: number | string;
    is_active: boolean;
}

interface Props {
    departmentCode: string;
    apiBase: string;
}

const EMPTY: StaffMember = {
    staff_type: 'office',
    name: '',
    designation: '',
    phone: '',
    email: '',
    order_index: 0,
    is_active: true,
};

export default function DepartmentStaffSection({ departmentCode, apiBase }: Props) {
    const [rows, setRows] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<StaffMember>(EMPTY);
    const [editingId, setEditingId] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiBase}/staff`);
            const json = res.ok ? await res.json() : null;
            setRows((json?.data || []) as StaffMember[]);
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
                staff_type: form.staff_type,
                name: form.name.trim(),
                designation: form.designation.trim() || null,
                phone: form.phone.trim() || null,
                email: form.email.trim() || null,
                order_index: Number(form.order_index) || 0,
                is_active: Boolean(form.is_active),
            };
            const res = await fetch(
                editingId ? `${apiBase}/staff/${editingId}` : `${apiBase}/staff`,
                { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
            );
            if (!res.ok) throw new Error('Failed to save staff member');
            setForm(EMPTY);
            setEditingId(null);
            await load();
            alert(editingId ? 'Staff updated' : 'Staff added');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error saving staff');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this staff member?')) return;
        const res = await fetch(`${apiBase}/staff/${id}`, { method: 'DELETE' });
        if (res.ok) {
            await load();
            if (editingId === id) { setEditingId(null); setForm(EMPTY); }
        }
    };

    const grouped = {
        office: rows.filter((r) => r.staff_type === 'office'),
        technical: rows.filter((r) => r.staff_type === 'technical'),
    };

    const renderList = (items: StaffMember[], label: string) => (
        <div className="space-y-3">
            <h3 className="text-lg font-bold text-[#631012]">{label}</h3>
            {items.length === 0 ? (
                <p className="text-sm text-[#171717]/60">No {label.toLowerCase()} yet.</p>
            ) : items.map((row) => (
                <div key={row.id} className="rounded-lg border border-[#171717]/10 p-4 bg-[#F9F9F9]/50 flex flex-col md:flex-row md:justify-between gap-4">
                    <div>
                        <h4 className="font-bold text-[#171717]">{row.name}</h4>
                        <p className="text-sm text-[#171717]/70">{row.designation}</p>
                        <p className="text-sm text-[#171717]/70">Phone: {row.phone || '-'} | Email: {row.email || '-'}</p>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => { setEditingId(row.id || null); setForm({ ...row, phone: row.phone || '', email: row.email || '', order_index: row.order_index || 0 }); }} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"><Edit2 size={14} /> Edit</button>
                        <button type="button" onClick={() => handleDelete(row.id || 0)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 text-sm"><Trash2 size={14} /> Delete</button>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="rounded-lg border border-[#171717]/10 p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-[#171717]">Staff Directory</h2>
                        <p className="text-sm text-[#171717]/60">Manage office and technical staff for {departmentCode.toUpperCase()}.</p>
                    </div>
                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#631012] text-white disabled:opacity-70">
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {editingId ? 'Update Staff' : 'Add Staff'}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select value={form.staff_type} onChange={(e) => setForm((p) => ({ ...p, staff_type: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-black">
                        <option value="office">Office Staff</option>
                        <option value="technical">Technical Staff</option>
                    </select>
                    <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Name" required className="w-full px-3 py-2 border rounded-lg text-black" />
                    <input value={form.designation} onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))} placeholder="Designation" className="w-full px-3 py-2 border rounded-lg text-black" />
                    <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" className="w-full px-3 py-2 border rounded-lg text-black" />
                    <input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" className="w-full px-3 py-2 border rounded-lg text-black" />
                    <input type="number" value={form.order_index} onChange={(e) => setForm((p) => ({ ...p, order_index: e.target.value }))} placeholder="Order" className="w-full px-3 py-2 border rounded-lg text-black" />
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="accent-[#631012]" /> Active</label>
                </div>
            </form>
            {loading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div> : (
                <div className="space-y-6">
                    {renderList(grouped.office, 'Office Staff')}
                    {renderList(grouped.technical, 'Technical Staff')}
                </div>
            )}
        </div>
    );
}
