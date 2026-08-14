'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Save, Loader2, CheckCircle, XCircle, X, Plus, Trash2, Upload, Globe
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

const API = 'http://localhost:4000/api/v1/departments';

const SECTIONS = ['overview', 'mission', 'programmes', 'research', 'faculty', 'labs', 'contact', 'media', 'staff'] as const;
type Section = typeof SECTIONS[number];

export default function SectionEditorPage() {
  const router = useRouter();
  const params = useParams();
  const deptId = params.id as string;

  const [dept, setDept] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Section>('overview');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Section data (local edits)
  const [sectionData, setSectionData] = useState<any>({});

  const fetchDept = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/${deptId}`);
      const json = await res.json();
      if (json.success) {
        setDept(json.data);
        // Initialize section data from fetched data
        const sd: any = {};
        SECTIONS.forEach(s => {
          sd[s] = json.data[s] || (Array.isArray(json.data[s]) ? [] : null);
        });
        setSectionData(sd);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [deptId]);

  useEffect(() => { fetchDept(); }, [fetchDept]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const saveSection = async (section: Section) => {
    setSaving(true);
    try {
      const data = sectionData[section];
      const res = await fetch(`${API}/${deptId}/sections/${section}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        showToast('success', `${section.charAt(0).toUpperCase() + section.slice(1)} saved`);
        // Update local state with response
        setSectionData(prev => ({ ...prev, [section]: json.data }));
      } else {
        showToast('error', json.error || 'Failed to save');
      }
    } catch {
      showToast('error', 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const saveAll = async () => {
    for (const s of SECTIONS) {
      await saveSection(s);
    }
  };

  const deleteDept = async () => {
    if (!confirm('Are you sure you want to delete this department and ALL its data? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API}/${deptId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        router.push('/departments');
      } else {
        showToast('error', json.error || 'Failed to delete');
      }
    } catch {
      showToast('error', 'Network error');
    }
  };

  const updateSectionField = (section: Section, field: string, value: any) => {
    setSectionData(prev => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [field]: value },
    }));
  };

  const updateListItem = (section: Section, index: number, field: string, value: any) => {
    const items = [...(sectionData[section] || [])];
    items[index] = { ...items[index], [field]: value };
    setSectionData(prev => ({ ...prev, [section]: items }));
  };

  const addListItem = (section: Section, template: any) => {
    const items = [...(sectionData[section] || []), template];
    setSectionData(prev => ({ ...prev, [section]: items }));
  };

  const removeListItem = (section: Section, index: number) => {
    const items = (sectionData[section] || []).filter((_: any, i: number) => i !== index);
    setSectionData(prev => ({ ...prev, [section]: items }));
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-[#631012]" size={32} /></div>;
  if (!dept) return <div className="p-6">Department not found</div>;

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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/departments')} className="p-2 rounded-lg hover:bg-[#171717]/10 transition-all">
            <ArrowLeft size={20} className="text-[#171717]" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#171717]">{dept.name_en}</h1>
            <p className="text-xs text-[#171717]/60">{dept.code.toUpperCase()} · {dept.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={saveAll} disabled={saving} className="flex items-center gap-2 bg-[#631012] hover:bg-[#7a1214] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md active:scale-95 transition-all disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save All
          </button>
          <button onClick={deleteDept} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-all">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="bg-white rounded-lg shadow-md border border-[#171717]/5 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-[#171717]/10">
          {SECTIONS.map(s => (
            <button
              key={s}
              onClick={() => setActiveTab(s)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-all capitalize ${
                activeTab === s
                  ? 'bg-[#631012] text-white'
                  : 'text-[#171717]/70 hover:bg-[#F9F9F9]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#171717] capitalize">Edit {activeTab}</h2>
            <button
              onClick={() => saveSection(activeTab)}
              disabled={saving}
              className="flex items-center gap-2 bg-[#631012] hover:bg-[#7a1214] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save {activeTab}
            </button>
          </div>

          <LangWrapper label={activeTab}>
            {activeTab === 'overview' && <OverviewEditor data={sectionData.overview} onChange={(f, v) => updateSectionField('overview', f, v)} />}
            {activeTab === 'mission' && <MissionEditor data={sectionData.mission} onChange={(f, v) => updateSectionField('mission', f, v)} />}
            {activeTab === 'programmes' && <ProgrammesEditor data={sectionData.programmes} onChange={(f, v) => updateSectionField('programmes', f, v)} />}
            {activeTab === 'research' && <ResearchEditor data={sectionData.research} onChange={(f, v) => updateSectionField('research', f, v)} />}
            {activeTab === 'faculty' && <FacultyEditor items={sectionData.faculty || []} onUpdate={(i, f, v) => updateListItem('faculty', i, f, v)} onAdd={t => addListItem('faculty', t)} onRemove={i => removeListItem('faculty', i)} />}
            {activeTab === 'labs' && <LabsEditor items={sectionData.labs || []} onUpdate={(i, f, v) => updateListItem('labs', i, f, v)} onAdd={t => addListItem('labs', t)} onRemove={i => removeListItem('labs', i)} />}
            {activeTab === 'contact' && <ContactEditor data={sectionData.contact} onChange={(f, v) => updateSectionField('contact', f, v)} />}
            {activeTab === 'media' && <MediaEditor items={sectionData.media || []} onUpdate={(i, f, v) => updateListItem('media', i, f, v)} onAdd={t => addListItem('media', t)} onRemove={i => removeListItem('media', i)} />}
            {activeTab === 'staff' && <StaffEditor items={sectionData.staff || []} onUpdate={(i, f, v) => updateListItem('staff', i, f, v)} onAdd={t => addListItem('staff', t)} onRemove={i => removeListItem('staff', i)} />}
          </LangWrapper>
        </div>
      </div>
    </div>
  );
}

/* ── Language Wrapper ── */
function LangWrapper({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Globe size={14} className="text-[#631012]" />
      <span className="text-xs text-[#171717]/60">Editing <strong className="text-[#171717]">{label}</strong> — fill both EN and HI fields</span>
    </div>
  );
}

/* ── Overview Editor ── */
function OverviewEditor({ data, onChange }: { data: any; onChange: (f: string, v: any) => void }) {
  const d = data || {};
  const descsEn = Array.isArray(d.descriptions_en) ? d.descriptions_en : [''];
  const descsHi = Array.isArray(d.descriptions_hi) ? d.descriptions_hi : [''];

  const updateDesc = (lang: string, idx: number, val: string) => {
    const key = `descriptions_${lang}`;
    const arr = lang === 'en' ? [...descsEn] : [...descsHi];
    arr[idx] = val;
    onChange(key, arr);
  };
  const addDesc = (lang: string) => {
    const key = `descriptions_${lang}`;
    const arr = lang === 'en' ? [...descsEn, ''] : [...descsHi, ''];
    onChange(key, arr);
  };
  const removeDesc = (lang: string, idx: number) => {
    const key = `descriptions_${lang}`;
    const arr = (lang === 'en' ? descsEn : descsHi).filter((_: string, i: number) => i !== idx);
    onChange(key, arr);
  };

  return (
    <div className="space-y-4">
      <BilingualField label="Title" en={d.title_en || ''} hi={d.title_hi || ''} onEn={v => onChange('title_en', v)} onHi={v => onChange('title_hi', v)} />
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-[#171717]">Descriptions (EN)</p>
          <button onClick={() => addDesc('en')} className="text-xs text-[#631012] hover:underline flex items-center gap-1"><Plus size={12} /> Add</button>
        </div>
        {descsEn.map((desc: string, i: number) => (
          <div key={i} className="flex gap-2 mb-2">
            <textarea value={desc} onChange={e => updateDesc('en', i, e.target.value)} rows={3} className="flex-1 px-3 py-2.5 border border-[#171717]/20 rounded-lg bg-[#F9F9F9] text-sm focus:ring-2 focus:ring-[#631012] focus:border-transparent focus:bg-white resize-y" placeholder="Description paragraph..." />
            {descsEn.length > 1 && <button onClick={() => removeDesc('en', i)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>}
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-[#171717]">Descriptions (HI)</p>
          <button onClick={() => addDesc('hi')} className="text-xs text-[#631012] hover:underline flex items-center gap-1"><Plus size={12} /> Add</button>
        </div>
        {descsHi.map((desc: string, i: number) => (
          <div key={i} className="flex gap-2 mb-2">
            <textarea value={desc} onChange={e => updateDesc('hi', i, e.target.value)} rows={3} className="flex-1 px-3 py-2.5 border border-[#171717]/20 rounded-lg bg-[#F9F9F9] text-sm focus:ring-2 focus:ring-[#631012] focus:border-transparent focus:bg-white resize-y" placeholder="विवरण पैराग्राफ..." />
            {descsHi.length > 1 && <button onClick={() => removeDesc('hi', i)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Mission Editor ── */
function MissionEditor({ data, onChange }: { data: any; onChange: (f: string, v: any) => void }) {
  const d = data || {};
  const missionEn = Array.isArray(d.mission_en) ? d.mission_en : [''];
  const missionHi = Array.isArray(d.mission_hi) ? d.mission_hi : [''];

  const updateMission = (lang: string, idx: number, val: string) => {
    const key = `mission_${lang}`;
    const arr = lang === 'en' ? [...missionEn] : [...missionHi];
    arr[idx] = val;
    onChange(key, arr);
  };
  const addMission = (lang: string) => {
    const key = `mission_${lang}`;
    const arr = lang === 'en' ? [...missionEn, ''] : [...missionHi, ''];
    onChange(key, arr);
  };
  const removeMission = (lang: string, idx: number) => {
    const key = `mission_${lang}`;
    const arr = (lang === 'en' ? missionEn : missionHi).filter((_: string, i: number) => i !== idx);
    onChange(key, arr);
  };

  return (
    <div className="space-y-4">
      <BilingualField label="Vision" en={d.vision_en || ''} hi={d.vision_hi || ''} onEn={v => onChange('vision_en', v)} onHi={v => onChange('vision_hi', v)} multiline />
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-[#171717]">Mission Points (EN)</p>
          <button onClick={() => addMission('en')} className="text-xs text-[#631012] hover:underline flex items-center gap-1"><Plus size={12} /> Add</button>
        </div>
        {missionEn.map((m: string, i: number) => (
          <div key={i} className="flex gap-2 mb-2">
            <textarea value={m} onChange={e => updateMission('en', i, e.target.value)} rows={2} className="flex-1 px-3 py-2.5 border border-[#171717]/20 rounded-lg bg-[#F9F9F9] text-sm focus:ring-2 focus:ring-[#631012] focus:border-transparent focus:bg-white resize-y" />
            {missionEn.length > 1 && <button onClick={() => removeMission('en', i)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>}
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-[#171717]">Mission Points (HI)</p>
          <button onClick={() => addMission('hi')} className="text-xs text-[#631012] hover:underline flex items-center gap-1"><Plus size={12} /> Add</button>
        </div>
        {missionHi.map((m: string, i: number) => (
          <div key={i} className="flex gap-2 mb-2">
            <textarea value={m} onChange={e => updateMission('hi', i, e.target.value)} rows={2} className="flex-1 px-3 py-2.5 border border-[#171717]/20 rounded-lg bg-[#F9F9F9] text-sm focus:ring-2 focus:ring-[#631012] focus:border-transparent focus:bg-white resize-y" />
            {missionHi.length > 1 && <button onClick={() => removeMission('hi', i)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Programmes Editor ── */
function ProgrammesEditor({ data, onChange }: { data: any; onChange: (f: string, v: any) => void }) {
  const d = data || {};
  const progsEn = Array.isArray(d.programmes_en) ? d.programmes_en : [];
  const progsHi = Array.isArray(d.programmes_hi) ? d.programmes_hi : [];

  const updateProg = (lang: string, idx: number, field: string, val: string) => {
    const key = `programmes_${lang}`;
    const arr = lang === 'en' ? progsEn.map((p: any, i: number) => i === idx ? { ...p, [field]: val } : p) : progsHi.map((p: any, i: number) => i === idx ? { ...p, [field]: val } : p);
    onChange(key, arr);
  };
  const addProg = (lang: string) => {
    const key = `programmes_${lang}`;
    const template = { name: '', icon: '', details: '' };
    onChange(key, [...(lang === 'en' ? progsEn : progsHi), template]);
  };
  const removeProg = (lang: string, idx: number) => {
    const key = `programmes_${lang}`;
    onChange(key, (lang === 'en' ? progsEn : progsHi).filter((_: any, i: number) => i !== idx));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-[#171717]">Programmes (English)</p>
          <button onClick={() => addProg('en')} className="text-xs text-[#631012] hover:underline flex items-center gap-1"><Plus size={12} /> Add</button>
        </div>
        {progsEn.length === 0 && <p className="text-xs text-[#171717]/40 text-center py-4">No programmes added</p>}
        {progsEn.map((p: any, i: number) => (
          <div key={i} className="border border-[#171717]/10 rounded-lg p-3 mb-3 space-y-2">
            <div className="flex justify-between items-center"><span className="text-xs font-bold text-[#631012]">#{i + 1}</span><button onClick={() => removeProg('en', i)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button></div>
            <input value={p.name || ''} onChange={e => updateProg('en', i, 'name', e.target.value)} placeholder="Programme name" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg bg-[#F9F9F9] text-sm focus:ring-2 focus:ring-[#631012] focus:border-transparent" />
            <input value={p.icon || ''} onChange={e => updateProg('en', i, 'icon', e.target.value)} placeholder="Icon (emoji)" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg bg-[#F9F9F9] text-sm focus:ring-2 focus:ring-[#631012] focus:border-transparent" />
            <textarea value={p.details || ''} onChange={e => updateProg('en', i, 'details', e.target.value)} rows={2} placeholder="Details" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg bg-[#F9F9F9] text-sm focus:ring-2 focus:ring-[#631012] focus:border-transparent resize-y" />
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-[#171717]">Programmes (Hindi)</p>
          <button onClick={() => addProg('hi')} className="text-xs text-[#631012] hover:underline flex items-center gap-1"><Plus size={12} /> Add</button>
        </div>
        {progsHi.length === 0 && <p className="text-xs text-[#171717]/40 text-center py-4">No programmes added</p>}
        {progsHi.map((p: any, i: number) => (
          <div key={i} className="border border-[#171717]/10 rounded-lg p-3 mb-3 space-y-2">
            <div className="flex justify-between items-center"><span className="text-xs font-bold text-[#631012]">#{i + 1}</span><button onClick={() => removeProg('hi', i)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button></div>
            <input value={p.name || ''} onChange={e => updateProg('hi', i, 'name', e.target.value)} placeholder="कार्यक्रम का नाम" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg bg-[#F9F9F9] text-sm focus:ring-2 focus:ring-[#631012] focus:border-transparent" />
            <input value={p.icon || ''} onChange={e => updateProg('hi', i, 'icon', e.target.value)} placeholder="Icon (emoji)" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg bg-[#F9F9F9] text-sm focus:ring-2 focus:ring-[#631012] focus:border-transparent" />
            <textarea value={p.details || ''} onChange={e => updateProg('hi', i, 'details', e.target.value)} rows={2} placeholder="विवरण" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg bg-[#F9F9F9] text-sm focus:ring-2 focus:ring-[#631012] focus:border-transparent resize-y" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Research Editor ── */
function ResearchEditor({ data, onChange }: { data: any; onChange: (f: string, v: any) => void }) {
  const d = data || {};
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-[#171717] mb-2">Research Categories (EN) — JSON array</p>
        <textarea value={JSON.stringify(d.categories_en || [], null, 2)} onChange={e => { try { onChange('categories_en', JSON.parse(e.target.value)); } catch {} }} rows={4} className="w-full px-3 py-2.5 border border-[#171717]/20 rounded-lg bg-[#F9F9F9] text-sm font-mono focus:ring-2 focus:ring-[#631012] focus:border-transparent focus:bg-white resize-y" />
      </div>
      <div>
        <p className="text-sm font-medium text-[#171717] mb-2">Research Categories (HI)</p>
        <textarea value={JSON.stringify(d.categories_hi || [], null, 2)} onChange={e => { try { onChange('categories_hi', JSON.parse(e.target.value)); } catch {} }} rows={4} className="w-full px-3 py-2.5 border border-[#171717]/20 rounded-lg bg-[#F9F9F9] text-sm font-mono focus:ring-2 focus:ring-[#631012] focus:border-transparent focus:bg-white resize-y" />
      </div>
      <div>
        <p className="text-sm font-medium text-[#171717] mb-2">Publications (EN) — JSON array</p>
        <textarea value={JSON.stringify(d.publications_en || [], null, 2)} onChange={e => { try { onChange('publications_en', JSON.parse(e.target.value)); } catch {} }} rows={6} className="w-full px-3 py-2.5 border border-[#171717]/20 rounded-lg bg-[#F9F9F9] text-sm font-mono focus:ring-2 focus:ring-[#631012] focus:border-transparent focus:bg-white resize-y" />
      </div>
      <div>
        <p className="text-sm font-medium text-[#171717] mb-2">Publications (HI)</p>
        <textarea value={JSON.stringify(d.publications_hi || [], null, 2)} onChange={e => { try { onChange('publications_hi', JSON.parse(e.target.value)); } catch {} }} rows={6} className="w-full px-3 py-2.5 border border-[#171717]/20 rounded-lg bg-[#F9F9F9] text-sm font-mono focus:ring-2 focus:ring-[#631012] focus:border-transparent focus:bg-white resize-y" />
      </div>
    </div>
  );
}

/* ── Faculty Editor (list) ── */
function FacultyEditor({ items, onUpdate, onAdd, onRemove }: { items: any[]; onUpdate: (i: number, f: string, v: any) => void; onAdd: (t: any) => void; onRemove: (i: number) => void }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm font-medium text-[#171717]">Faculty Members ({items.length})</p>
        <button onClick={() => onAdd({ group_title_en: '', group_title_hi: '', name_en: '', name_hi: '', designation_en: '', designation_hi: '', interests_en: '', interests_hi: '', email: '', photo_url: '', sort_order: items.length, is_featured: false })} className="text-xs text-[#631012] hover:underline flex items-center gap-1"><Plus size={12} /> Add Faculty</button>
      </div>
      {items.length === 0 && <p className="text-xs text-[#171717]/40 text-center py-6">No faculty added yet</p>}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {items.map((item: any, i: number) => (
          <div key={i} className="border border-[#171717]/10 rounded-lg p-4 space-y-2 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#631012]">Faculty #{i + 1}</span>
              <button onClick={() => onRemove(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
            <BilingualField label="Name" en={item.name_en || ''} hi={item.name_hi || ''} onEn={v => onUpdate(i, 'name_en', v)} onHi={v => onUpdate(i, 'name_hi', v)} />
            <BilingualField label="Designation" en={item.designation_en || ''} hi={item.designation_hi || ''} onEn={v => onUpdate(i, 'designation_en', v)} onHi={v => onUpdate(i, 'designation_hi', v)} />
            <BilingualField label="Group Title" en={item.group_title_en || ''} hi={item.group_title_hi || ''} onEn={v => onUpdate(i, 'group_title_en', v)} onHi={v => onUpdate(i, 'group_title_hi', v)} />
            <BilingualField label="Interests" en={item.interests_en || ''} hi={item.interests_hi || ''} onEn={v => onUpdate(i, 'interests_en', v)} onHi={v => onUpdate(i, 'interests_hi', v)} multiline />
            <MonoField label="Email" value={item.email || ''} onChange={v => onUpdate(i, 'email', v)} />
            <MonoField label="Photo URL" value={item.photo_url || ''} onChange={v => onUpdate(i, 'photo_url', v)} />
            <div className="flex items-center gap-4">
              <MonoField label="Sort Order" value={String(item.sort_order || 0)} onChange={v => onUpdate(i, 'sort_order', parseInt(v) || 0)} type="number" />
              <label className="flex items-center gap-2 text-xs text-[#171717]/70"><input type="checkbox" checked={item.is_featured || false} onChange={e => onUpdate(i, 'is_featured', e.target.checked)} className="accent-[#631012]" /> Featured</label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Labs Editor (list) ── */
function LabsEditor({ items, onUpdate, onAdd, onRemove }: { items: any[]; onUpdate: (i: number, f: string, v: any) => void; onAdd: (t: any) => void; onRemove: (i: number) => void }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm font-medium text-[#171717]">Labs ({items.length})</p>
        <button onClick={() => onAdd({ name_en: '', name_hi: '', description_en: '', description_hi: '', group_label_en: '', group_label_hi: '', sort_order: items.length })} className="text-xs text-[#631012] hover:underline flex items-center gap-1"><Plus size={12} /> Add Lab</button>
      </div>
      {items.length === 0 && <p className="text-xs text-[#171717]/40 text-center py-6">No labs added yet</p>}
      <div className="space-y-3">
        {items.map((item: any, i: number) => (
          <div key={i} className="border border-[#171717]/10 rounded-lg p-4 space-y-2 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#631012]">Lab #{i + 1}</span>
              <button onClick={() => onRemove(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
            <BilingualField label="Name" en={item.name_en || ''} hi={item.name_hi || ''} onEn={v => onUpdate(i, 'name_en', v)} onHi={v => onUpdate(i, 'name_hi', v)} />
            <BilingualField label="Description" en={item.description_en || ''} hi={item.description_hi || ''} onEn={v => onUpdate(i, 'description_en', v)} onHi={v => onUpdate(i, 'description_hi', v)} multiline />
            <BilingualField label="Group Label" en={item.group_label_en || ''} hi={item.group_label_hi || ''} onEn={v => onUpdate(i, 'group_label_en', v)} onHi={v => onUpdate(i, 'group_label_hi', v)} />
            <MonoField label="Sort Order" value={String(item.sort_order || 0)} onChange={v => onUpdate(i, 'sort_order', parseInt(v) || 0)} type="number" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Contact Editor ── */
function ContactEditor({ data, onChange }: { data: any; onChange: (f: string, v: any) => void }) {
  const d = data || {};
  return (
    <div className="space-y-3">
      <BilingualField label="HOD Name" en={d.hod_name_en || ''} hi={d.hod_name_hi || ''} onEn={v => onChange('hod_name_en', v)} onHi={v => onChange('hod_name_hi', v)} />
      <BilingualField label="HOD Title" en={d.hod_title_en || ''} hi={d.hod_title_hi || ''} onEn={v => onChange('hod_title_en', v)} onHi={v => onChange('hod_title_hi', v)} />
      <BilingualField label="Department Name" en={d.department_name_en || ''} hi={d.department_name_hi || ''} onEn={v => onChange('department_name_en', v)} onHi={v => onChange('department_name_hi', v)} />
      <BilingualField label="Institute Name" en={d.institute_name_en || ''} hi={d.institute_name_hi || ''} onEn={v => onChange('institute_name_en', v)} onHi={v => onChange('institute_name_hi', v)} />
      <BilingualField label="Address" en={d.address_en || ''} hi={d.address_hi || ''} onEn={v => onChange('address_en', v)} onHi={v => onChange('address_hi', v)} multiline />
      <MonoField label="Phone" value={d.phone || ''} onChange={v => onChange('phone', v)} />
      <MonoField label="HOD Email" value={d.hod_email || ''} onChange={v => onChange('hod_email', v)} />
      <MonoField label="Office Email" value={d.office_email || ''} onChange={v => onChange('office_email', v)} />
    </div>
  );
}

/* ── Media Editor (list) ── */
function MediaEditor({ items, onUpdate, onAdd, onRemove }: { items: any[]; onUpdate: (i: number, f: string, v: any) => void; onAdd: (t: any) => void; onRemove: (i: number) => void }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm font-medium text-[#171717]">Media Items ({items.length})</p>
        <button onClick={() => onAdd({ title_en: '', title_hi: '', description_en: '', description_hi: '', image_url: '', type: 'image', sort_order: items.length })} className="text-xs text-[#631012] hover:underline flex items-center gap-1"><Plus size={12} /> Add Media</button>
      </div>
      {items.length === 0 && <p className="text-xs text-[#171717]/40 text-center py-6">No media added yet</p>}
      <div className="space-y-3">
        {items.map((item: any, i: number) => (
          <div key={i} className="border border-[#171717]/10 rounded-lg p-4 space-y-2 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#631012]">Media #{i + 1}</span>
              <button onClick={() => onRemove(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
            <BilingualField label="Title" en={item.title_en || ''} hi={item.title_hi || ''} onEn={v => onUpdate(i, 'title_en', v)} onHi={v => onUpdate(i, 'title_hi', v)} />
            <BilingualField label="Description" en={item.description_en || ''} hi={item.description_hi || ''} onEn={v => onUpdate(i, 'description_en', v)} onHi={v => onUpdate(i, 'description_hi', v)} multiline />
            <MonoField label="Image URL" value={item.image_url || ''} onChange={v => onUpdate(i, 'image_url', v)} />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-[#171717]/70">Type:</label>
                <select value={item.type || 'image'} onChange={e => onUpdate(i, 'type', e.target.value)} className="px-3 py-1.5 border border-[#171717]/20 rounded-lg bg-[#F9F9F9] text-sm focus:ring-2 focus:ring-[#631012] focus:border-transparent">
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                </select>
              </div>
              <MonoField label="Sort Order" value={String(item.sort_order || 0)} onChange={v => onUpdate(i, 'sort_order', parseInt(v) || 0)} type="number" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Staff Editor (list) ── */
function StaffEditor({ items, onUpdate, onAdd, onRemove }: { items: any[]; onUpdate: (i: number, f: string, v: any) => void; onAdd: (t: any) => void; onRemove: (i: number) => void }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm font-medium text-[#171717]">Staff Members ({items.length})</p>
        <div className="flex gap-2">
          <button onClick={() => onAdd({ staff_type: 'office', name_en: '', name_hi: '', designation_en: '', designation_hi: '', phone: '', email: '', sort_order: items.length })} className="text-xs text-[#631012] hover:underline flex items-center gap-1"><Plus size={12} /> Office Staff</button>
          <button onClick={() => onAdd({ staff_type: 'technical', name_en: '', name_hi: '', designation_en: '', designation_hi: '', phone: '', email: '', sort_order: items.length })} className="text-xs text-[#631012] hover:underline flex items-center gap-1"><Plus size={12} /> Technical Staff</button>
        </div>
      </div>
      {items.length === 0 && <p className="text-xs text-[#171717]/40 text-center py-6">No staff added yet</p>}
      <div className="space-y-3">
        {items.map((item: any, i: number) => (
          <div key={i} className="border border-[#171717]/10 rounded-lg p-4 space-y-2 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#631012]">Staff #{i + 1}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${item.staff_type === 'office' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>{item.staff_type}</span>
              </div>
              <button onClick={() => onRemove(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
            <BilingualField label="Name" en={item.name_en || ''} hi={item.name_hi || ''} onEn={v => onUpdate(i, 'name_en', v)} onHi={v => onUpdate(i, 'name_hi', v)} />
            <BilingualField label="Designation" en={item.designation_en || ''} hi={item.designation_hi || ''} onEn={v => onUpdate(i, 'designation_en', v)} onHi={v => onUpdate(i, 'designation_hi', v)} />
            <MonoField label="Phone" value={item.phone || ''} onChange={v => onUpdate(i, 'phone', v)} />
            <MonoField label="Email" value={item.email || ''} onChange={v => onUpdate(i, 'email', v)} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Shared Field Components ── */
function BilingualField({ label, en, hi, onEn, onHi, multiline = false }: { label: string; en: string; hi: string; onEn: (v: string) => void; onHi: (v: string) => void; multiline?: boolean }) {
  const cls = "flex-1 px-3 py-2.5 border border-[#171717]/20 rounded-lg bg-[#F9F9F9] text-sm focus:ring-2 focus:ring-[#631012] focus:border-transparent focus:bg-white transition-all";
  const Input = multiline ? 'textarea' : 'input';
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-xs font-medium text-[#171717]/70 mb-1 block">{label} (EN)</label>
        <Input value={en} onChange={e => onEn(e.target.value)} placeholder={`English ${label.toLowerCase()}`} className={cls + (multiline ? ' resize-y' : '')} rows={multiline ? 3 : undefined} />
      </div>
      <div>
        <label className="text-xs font-medium text-[#171717]/70 mb-1 block">{label} (HI)</label>
        <Input value={hi} onChange={e => onHi(e.target.value)} placeholder={`${label.toLowerCase()} हिंदी में`} className={cls + (multiline ? ' resize-y' : '')} rows={multiline ? 3 : undefined} />
      </div>
    </div>
  );
}

function MonoField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-xs font-medium text-[#171717]/70 w-28 shrink-0">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="flex-1 px-3 py-2.5 border border-[#171717]/20 rounded-lg bg-[#F9F9F9] text-sm focus:ring-2 focus:ring-[#631012] focus:border-transparent focus:bg-white transition-all" />
    </div>
  );
}
