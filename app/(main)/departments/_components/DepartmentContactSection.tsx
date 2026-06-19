'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Save, Trash2 } from 'lucide-react';

interface ContactForm {
    id?: number;
    head_name: string;
    head_designation: string;
    department_name_en: string;
    department_name_hi: string;
    institute_name: string;
    address_line: string;
    pin_code: string;
    state: string;
    phone: string;
    hod_email: string;
    office_email: string;
    fax: string;
    website_url: string;
}

interface Props {
    departmentCode: string;
    apiBase: string;
}

const EMPTY: ContactForm = {
    head_name: '',
    head_designation: 'Head of Department',
    department_name_en: '',
    department_name_hi: '',
    institute_name: 'National Institute of Technology Hamirpur',
    address_line: '',
    pin_code: '177005',
    state: 'Himachal Pradesh',
    phone: '',
    hod_email: '',
    office_email: '',
    fax: '',
    website_url: '',
};

export default function DepartmentContactSection({ departmentCode, apiBase }: Props) {
    const [form, setForm] = useState<ContactForm>(EMPTY);
    const [hasRecord, setHasRecord] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiBase}/contact`);
            if (res.ok) {
                const json = await res.json();
                const data = json?.data;
                if (data) {
                    setForm({
                        id: data.id,
                        head_name: data.head_name || '',
                        head_designation: data.head_designation || 'Head of Department',
                        department_name_en: data.department_name_en || '',
                        department_name_hi: data.department_name_hi || '',
                        institute_name: data.institute_name || EMPTY.institute_name,
                        address_line: data.address_line || '',
                        pin_code: data.pin_code || '177005',
                        state: data.state || 'Himachal Pradesh',
                        phone: data.phone || '',
                        hod_email: data.hod_email || '',
                        office_email: data.office_email || '',
                        fax: data.fax || '',
                        website_url: data.website_url || '',
                    });
                    setHasRecord(true);
                }
            } else {
                setHasRecord(false);
            }
        } finally {
            setLoading(false);
        }
    }, [apiBase]);

    useEffect(() => { void load(); }, [load]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`${apiBase}/contact`, {
                method: hasRecord ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error('Failed to save contact info');
            await load();
            alert('Contact information saved');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error saving contact');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete contact information?')) return;
        const res = await fetch(`${apiBase}/contact`, { method: 'DELETE' });
        if (res.ok) {
            setForm(EMPTY);
            setHasRecord(false);
            alert('Contact information deleted');
        }
    };

    if (loading) {
        return <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-[#171717]/10 p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-[#171717]">Contact Information</h2>
                    <p className="text-sm text-[#171717]/60">Edit the contact card shown on the {departmentCode.toUpperCase()} contact page.</p>
                </div>
                <div className="flex gap-2">
                    {hasRecord && (
                        <button type="button" onClick={handleDelete} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm">
                            <Trash2 size={16} /> Delete
                        </button>
                    )}
                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#631012] text-white disabled:opacity-70">
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {hasRecord ? 'Update Contact' : 'Save Contact'}
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={form.head_name} onChange={(e) => setForm((p) => ({ ...p, head_name: e.target.value }))} placeholder="Head of Department name" className="w-full px-3 py-2 border rounded-lg text-black" />
                <input value={form.head_designation} onChange={(e) => setForm((p) => ({ ...p, head_designation: e.target.value }))} placeholder="Designation" className="w-full px-3 py-2 border rounded-lg text-black" />
                <input value={form.department_name_en} onChange={(e) => setForm((p) => ({ ...p, department_name_en: e.target.value }))} placeholder="Department name (English)" className="w-full px-3 py-2 border rounded-lg text-black" />
                <input value={form.department_name_hi} onChange={(e) => setForm((p) => ({ ...p, department_name_hi: e.target.value }))} placeholder="Department name (Hindi)" className="w-full px-3 py-2 border rounded-lg text-black" />
                <input value={form.institute_name} onChange={(e) => setForm((p) => ({ ...p, institute_name: e.target.value }))} placeholder="Institute name" className="w-full px-3 py-2 border rounded-lg text-black md:col-span-2" />
                <textarea rows={2} value={form.address_line} onChange={(e) => setForm((p) => ({ ...p, address_line: e.target.value }))} placeholder="Address line" className="w-full px-3 py-2 border rounded-lg text-black md:col-span-2" />
                <input value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} placeholder="State" className="w-full px-3 py-2 border rounded-lg text-black" />
                <input value={form.pin_code} onChange={(e) => setForm((p) => ({ ...p, pin_code: e.target.value }))} placeholder="PIN code" className="w-full px-3 py-2 border rounded-lg text-black" />
                <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" className="w-full px-3 py-2 border rounded-lg text-black" />
                <input value={form.hod_email} onChange={(e) => setForm((p) => ({ ...p, hod_email: e.target.value }))} placeholder="HoD email" className="w-full px-3 py-2 border rounded-lg text-black" />
                <input value={form.office_email} onChange={(e) => setForm((p) => ({ ...p, office_email: e.target.value }))} placeholder="Office email" className="w-full px-3 py-2 border rounded-lg text-black" />
                <input value={form.fax} onChange={(e) => setForm((p) => ({ ...p, fax: e.target.value }))} placeholder="Fax" className="w-full px-3 py-2 border rounded-lg text-black" />
                <input value={form.website_url} onChange={(e) => setForm((p) => ({ ...p, website_url: e.target.value }))} placeholder="Website URL" className="w-full px-3 py-2 border rounded-lg text-black" />
            </div>
        </form>
    );
}
