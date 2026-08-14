'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Save, Loader2, CheckCircle, XCircle, X, Plus, Trash2, Globe
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

const API = 'http://localhost:4000/api/v1/departments';

// Section names match existing final.sql tables
const SECTIONS = ['visions', 'programmes', 'faculty', 'staff', 'labs', 'contact', 'publications', 'projects', 'written', 'supervision'] as const;
type Section = typeof SECTIONS[number];

export default function SectionEditorPage() {
  const router = useRouter();
  const params = useParams();
  const deptId = params.id as string;

  const [dept, setDept] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Section>('visions');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [sectionData, setSectionData] = useState<any>({});

  const fetchDept = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/${deptId}`);
      const json = await res.json();
      if (json.success) {
        setDept(json.data);
        const sd: any = {};
        SECTIONS.forEach(s => { sd[s] = json.data[s] || (Array.isArray(json.data[s]) ? [] : null); });
        setSectionData(sd);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [deptId]);

  useEffect(() => { fetchDept(); }, [fetchDept]);

  const showToast = (type: 'success' | 'error', msg: string) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500); };

  const saveSection = async (section: Section) => {
    setSaving(true);
    try {
      const data = sectionData[section];
      const res = await fetch(`${API}/${deptId}/sections/${section}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) { showToast('success', `${section} saved`); setSectionData(prev => ({ ...prev, [section]: json.data })); }
      else showToast('error', json.error || 'Failed');
    } catch { showToast('error', 'Network error'); }
    finally { setSaving(false); }
  };

  const saveAll = async () => { for (const s of SECTIONS) await saveSection(s); };

  const deleteDept = async () => {
    if (!confirm('Delete this department and ALL its data?')) return;
    const res = await fetch(`${API}/${deptId}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) router.push('/departments');
    else showToast('error', json.error || 'Failed');
  };

  const updateSectionField = (section: Section, field: string, value: any) => {
    setSectionData(prev => ({ ...prev, [section]: { ...(prev[section] || {}), [field]: value } }));
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
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.msg}<button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100"><X size={14} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/departments')} className="p-2 rounded-lg hover:bg-[#171717]/10"><ArrowLeft size={20} /></button>
          <div><h1 className="text-xl font-bold text-[#171717]">{dept.name_en}</h1><p className="text-xs text-[#171717]/60">{dept.code?.toUpperCase()} · {dept.slug}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={saveAll} disabled={saving} className="flex items-center gap-2 bg-[#631012] hover:bg-[#7a1214] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md active:scale-95 disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save All
          </button>
          <button onClick={deleteDept} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md border border-[#171717]/5 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-[#171717]/10">
          {SECTIONS.map(s => (
            <button key={s} onClick={() => setActiveTab(s)} className={`px-5 py-3 text-sm font-medium whitespace-nowrap capitalize ${activeTab === s ? 'bg-[#631012] text-white' : 'text-[#171717]/70 hover:bg-[#F9F9F9]'}`}>{s}</button>
          ))}
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#171717] capitalize">Edit {activeTab}</h2>
            <button onClick={() => saveSection(activeTab)} disabled={saving} className="flex items-center gap-2 bg-[#631012] hover:bg-[#7a1214] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md active:scale-95 disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save {activeTab}
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4"><Globe size={14} className="text-[#631012]" /><span className="text-xs text-[#171717]/60">Editing <strong>{activeTab}</strong> — fill both EN and HN fields</span></div>

          {activeTab === 'visions' && <VisionsEditor data={sectionData.visions} onChange={(f, v) => updateSectionField('visions', f, v)} />}
          {activeTab === 'programmes' && <ListEditor section="programmes" items={sectionData.programmes || []} fields={[{key:'program_name_en',label:'Programme Name (EN)'},{key:'program_name_hn',label:'Programme Name (HN)'}]} onUpdate={(i,f,v) => updateListItem('programmes',i,f,v)} onAdd={() => addListItem('programmes',{program_name_en:'',program_name_hn:''})} onRemove={i => removeListItem('programmes',i)} />}
          {activeTab === 'faculty' && <ListEditor section="faculty" items={sectionData.faculty || []} fields={[{key:'name_en',label:'Name (EN)'},{key:'name',label:'Name (HN)'},{key:'type',label:'Type (Professor/Associate/etc)'},{key:'area_of_interest',label:'Area of Interest'},{key:'email',label:'Email'},{key:'profile_link',label:'Profile Link'}]} onUpdate={(i,f,v) => updateListItem('faculty',i,f,v)} onAdd={() => addListItem('faculty',{name_en:'',name:'',type:'',area_of_interest:'',email:'',profile_link:''})} onRemove={i => removeListItem('faculty',i)} />}
          {activeTab === 'staff' && <ListEditor section="staff" items={sectionData.staff || []} fields={[{key:'name_en',label:'Name (EN)'},{key:'name',label:'Name (HN)'},{key:'type',label:'Type (office/technical)'},{key:'designation',label:'Designation'},{key:'phone_no',label:'Phone'},{key:'email',label:'Email'}]} onUpdate={(i,f,v) => updateListItem('staff',i,f,v)} onAdd={() => addListItem('staff',{name_en:'',name:'',type:'office',designation:'',phone_no:'',email:''})} onRemove={i => removeListItem('staff',i)} />}
          {activeTab === 'labs' && <ListEditor section="labs" items={sectionData.labs || []} fields={[{key:'lab_name_en',label:'Lab Name (EN)'},{key:'lab_name_hn',label:'Lab Name (HN)'}]} onUpdate={(i,f,v) => updateListItem('labs',i,f,v)} onAdd={() => addListItem('labs',{lab_name_en:'',lab_name_hn:''})} onRemove={i => removeListItem('labs',i)} />}
          {activeTab === 'contact' && <ContactEditor data={sectionData.contact} onChange={(f, v) => updateSectionField('contact', f, v)} />}
          {activeTab === 'publications' && <ListEditor section="publications" items={sectionData.publications || []} fields={[{key:'journal_name',label:'Journal'},{key:'title',label:'Title'},{key:'author',label:'Author'},{key:'sci',label:'SCI/Scopus'},{key:'year',label:'Year'}]} onUpdate={(i,f,v) => updateListItem('publications',i,f,v)} onAdd={() => addListItem('publications',{journal_name:'',title:'',author:'',sci:'',year:''})} onRemove={i => removeListItem('publications',i)} />}
          {activeTab === 'projects' && <ListEditor section="projects" items={sectionData.projects || []} fields={[{key:'role',label:'Role'},{key:'project_type',label:'Type'},{key:'title',label:'Title'},{key:'funding_agency',label:'Funding Agency'},{key:'from',label:'From'},{key:'to',label:'To'},{key:'amount',label:'Amount'},{key:'status',label:'Status'},{key:'co_investigator',label:'Co-Investigator'},{key:'sanction_order',label:'Sanction Order'}]} onUpdate={(i,f,v) => updateListItem('projects',i,f,v)} onAdd={() => addListItem('projects',{role:'',project_type:'',title:'',funding_agency:'',from:'',to:'',amount:'',status:'',co_investigator:'',sanction_order:''})} onRemove={i => removeListItem('projects',i)} />}
          {activeTab === 'written' && <ListEditor section="written" items={sectionData.written || []} fields={[{key:'type',label:'Type'},{key:'title',label:'Title'},{key:'publisher',label:'Publisher'},{key:'author',label:'Author'},{key:'isbn',label:'ISBN'},{key:'year',label:'Year'}]} onUpdate={(i,f,v) => updateListItem('written',i,f,v)} onAdd={() => addListItem('written',{type:'',title:'',publisher:'',author:'',isbn:'',year:''})} onRemove={i => removeListItem('written',i)} />}
          {activeTab === 'supervision' && <ListEditor section="supervision" items={sectionData.supervision || []} fields={[{key:'program_name',label:'Programme'},{key:'scholar_name',label:'Scholar Name'},{key:'research_topic',label:'Research Topic'},{key:'status',label:'Status'},{key:'year',label:'Year'},{key:'co_supervisor',label:'Co-Supervisor'}]} onUpdate={(i,f,v) => updateListItem('supervision',i,f,v)} onAdd={() => addListItem('supervision',{program_name:'',scholar_name:'',research_topic:'',status:'',year:'',co_supervisor:''})} onRemove={i => removeListItem('supervision',i)} />}
        </div>
      </div>
    </div>
  );
}

/* ── Vision & Mission Editor (singleton, EN/HN) ── */
function VisionsEditor({ data, onChange }: { data: any; onChange: (f: string, v: any) => void }) {
  const d = data || {};
  return (
    <div className="space-y-4">
      <BilingualField label="Vision" en={d.vision_en || ''} hn={d.vision_hn || ''} onEn={v => onChange('vision_en', v)} onHn={v => onChange('vision_hn', v)} multiline />
      <BilingualField label="Mission" en={d.mission_en || ''} hn={d.mission_hn || ''} onEn={v => onChange('mission_en', v)} onHn={v => onChange('mission_hn', v)} multiline />
    </div>
  );
}

/* ── Contact Editor ── */
function ContactEditor({ data, onChange }: { data: any; onChange: (f: string, v: any) => void }) {
  const d = data || {};
  return (
    <div className="space-y-3">
      <BilingualField label="HOD Name" en={d.hod_en || ''} hn={d.hod_hn || ''} onEn={v => onChange('hod_en', v)} onHn={v => onChange('hod_hn', v)} />
      <MonoField label="Phone" value={d.phone_no || ''} onChange={v => onChange('phone_no', v)} />
      <MonoField label="HOD Email" value={d.hod_email || ''} onChange={v => onChange('hod_email', v)} />
      <MonoField label="Office Email" value={d.office_email || ''} onChange={v => onChange('office_email', v)} />
      <MonoField label="Department" value={d.department || ''} onChange={v => onChange('department', v)} />
      <MonoField label="College" value={d.college || ''} onChange={v => onChange('college', v)} />
      <MonoField label="Address" value={d.address || ''} onChange={v => onChange('address', v)} multiline />
    </div>
  );
}

/* ── Generic List Editor ── */
function ListEditor({ section, items, fields, onUpdate, onAdd, onRemove }: {
  section: string; items: any[]; fields: { key: string; label: string }[];
  onUpdate: (i: number, f: string, v: any) => void; onAdd: () => void; onRemove: (i: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm font-medium text-[#171717]">{section} ({items.length})</p>
        <button onClick={onAdd} className="text-xs text-[#631012] hover:underline flex items-center gap-1"><Plus size={12} /> Add</button>
      </div>
      {items.length === 0 && <p className="text-xs text-[#171717]/40 text-center py-6">No items added yet</p>}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {items.map((item: any, i: number) => (
          <div key={i} className="border border-[#171717]/10 rounded-lg p-4 space-y-2 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#631012]">#{i + 1}</span>
              <button onClick={() => onRemove(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
            {fields.map(f => (
              <MonoField key={f.key} label={f.label} value={item[f.key] ?? ''} onChange={v => onUpdate(i, f.key, v)} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Shared Field Components ── */
function BilingualField({ label, en, hn, onEn, onHn, multiline = false }: { label: string; en: string; hn: string; onEn: (v: string) => void; onHn: (v: string) => void; multiline?: boolean }) {
  const cls = "flex-1 px-3 py-2.5 border border-[#171717]/20 rounded-lg bg-[#F9F9F9] text-sm focus:ring-2 focus:ring-[#631012] focus:border-transparent focus:bg-white transition-all";
  const Input = multiline ? 'textarea' : 'input';
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-xs font-medium text-[#171717]/70 mb-1 block">{label} (EN)</label>
        <Input value={en} onChange={e => onEn(e.target.value)} placeholder={`English ${label.toLowerCase()}`} className={cls + (multiline ? ' resize-y' : '')} rows={multiline ? 3 : undefined} />
      </div>
      <div>
        <label className="text-xs font-medium text-[#171717]/70 mb-1 block">{label} (HN)</label>
        <Input value={hn} onChange={e => onHn(e.target.value)} placeholder={`${label.toLowerCase()} हिंदी में`} className={cls + (multiline ? ' resize-y' : '')} rows={multiline ? 3 : undefined} />
      </div>
    </div>
  );
}

function MonoField({ label, value, onChange, multiline = false, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; type?: string }) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-xs font-medium text-[#171717]/70 w-36 shrink-0">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="flex-1 px-3 py-2.5 border border-[#171717]/20 rounded-lg bg-[#F9F9F9] text-sm focus:ring-2 focus:ring-[#631012] focus:border-transparent focus:bg-white transition-all" />
    </div>
  );
}
