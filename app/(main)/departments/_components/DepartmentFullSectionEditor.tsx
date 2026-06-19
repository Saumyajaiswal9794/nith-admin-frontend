'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    ArrowLeft,
    BookOpen,
    Edit2,
    FileText,
    GraduationCap,
    Loader2,
    Mail,
    Microscope,
    Plus,
    Save,
    ScrollText,
    ShieldCheck,
    Trash2,
    Users,
} from 'lucide-react';
import Link from 'next/link';
import DepartmentFacultySection from './DepartmentFacultySection';
import DepartmentStaffSection from './DepartmentStaffSection';
import DepartmentLabsSection from './DepartmentLabsSection';
import DepartmentPublicationsSection from './DepartmentPublicationsSection';
import DepartmentContactSection from './DepartmentContactSection';

interface SectionInfo {
    id?: number;
    intro_heading_en: string | null;
    intro_heading_hi: string | null;
    intro_description_en: string | null;
    intro_description_hi: string | null;
    dept_image_url: string | null;
    default_language?: string;
    is_published?: boolean;
}

interface ProgrammeItem {
    id?: number;
    programme_type: string;
    title_en: string;
    title_hi: string;
    description_en: string;
    description_hi: string;
    duration_years: number | string;
    icon_emoji: string;
    order_index: number | string;
}

interface ResearchAreaItem {
    id?: number;
    area_name_en: string;
    area_name_hi: string;
    description_en: string;
    description_hi: string;
    order_index: number | string;
}

interface MissionVisionState {
    mission_heading_en: string;
    mission_heading_hi: string;
    mission_description_en: string;
    mission_description_hi: string;
    mission_points_en: string;
    mission_points_hi: string;
}

interface DepartmentFullSectionEditorProps {
    departmentCode: string;
    title: string;
    subtitle: string;
    backHref?: string;
}

const EMPTY_PROGRAMME: ProgrammeItem = {
    programme_type: '',
    title_en: '',
    title_hi: '',
    description_en: '',
    description_hi: '',
    duration_years: '',
    icon_emoji: '🎓',
    order_index: 0,
};

const EMPTY_RESEARCH: ResearchAreaItem = {
    area_name_en: '',
    area_name_hi: '',
    description_en: '',
    description_hi: '',
    order_index: 0,
};

const EMPTY_MISSION: MissionVisionState = {
    mission_heading_en: '',
    mission_heading_hi: '',
    mission_description_en: '',
    mission_description_hi: '',
    mission_points_en: '',
    mission_points_hi: '',
};

export default function DepartmentFullSectionEditor({
    departmentCode,
    title,
    subtitle,
    backHref = '/departments',
}: DepartmentFullSectionEditorProps) {
    const API_BASE = `http://localhost:4000/v1/departments/${departmentCode}`;

    const [loading, setLoading] = useState(false);
    const [savingInfo, setSavingInfo] = useState(false);
    const [savingProgramme, setSavingProgramme] = useState(false);
    const [savingResearch, setSavingResearch] = useState(false);
    const [savingMission, setSavingMission] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'programmes' | 'mission' | 'research' | 'faculty' | 'staff' | 'labs' | 'publications' | 'contact'>('overview');

    const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
    const [infoForm, setInfoForm] = useState({
        intro_heading_en: '',
        intro_heading_hi: '',
        intro_description_en: '',
        intro_description_hi: '',
        dept_image_url: '',
        is_published: true,
    });

    const [programmes, setProgrammes] = useState<ProgrammeItem[]>([]);
    const [programmeForm, setProgrammeForm] = useState<ProgrammeItem>(EMPTY_PROGRAMME);
    const [programmeEditingId, setProgrammeEditingId] = useState<number | null>(null);

    const [missionVision, setMissionVision] = useState<MissionVisionState>(EMPTY_MISSION);

    const [researchAreas, setResearchAreas] = useState<ResearchAreaItem[]>([]);
    const [researchForm, setResearchForm] = useState<ResearchAreaItem>(EMPTY_RESEARCH);
    const [researchEditingId, setResearchEditingId] = useState<number | null>(null);
    const [facultyCount, setFacultyCount] = useState(0);

    const fetchSectionInfo = async () => {
        const res = await fetch(`${API_BASE}?language=both`);
        if (!res.ok) return null;
        const json = await res.json();
        return json?.data || null;
    };

    const fetchProgrammes = async () => {
        const res = await fetch(`${API_BASE}/programmes?language=both`);
        if (!res.ok) return [] as ProgrammeItem[];
        const json = await res.json();
        return (json?.data || []) as ProgrammeItem[];
    };

    const fetchMissionVision = async () => {
        const res = await fetch(`${API_BASE}/mission-vision?language=both`);
        if (!res.ok) return null;
        const json = await res.json();
        return json?.data || null;
    };

    const fetchResearchAreas = async () => {
        const res = await fetch(`${API_BASE}/research-areas?language=both`);
        if (!res.ok) return [] as ResearchAreaItem[];
        const json = await res.json();
        return (json?.data || []) as ResearchAreaItem[];
    };

    const fetchFacultyCount = async () => {
        const res = await fetch(`${API_BASE}/faculty?language=both`);
        if (!res.ok) return 0;
        const json = await res.json();
        return Array.isArray(json?.data) ? json.data.length : 0;
    };

    useEffect(() => {
        const loadInitial = async () => {
            try {
                setLoading(true);

                const [infoRes, programmesRes, missionRes, researchRes, facultyRes] = await Promise.all([
                    fetch(`${API_BASE}?language=both`),
                    fetch(`${API_BASE}/programmes?language=both`),
                    fetch(`${API_BASE}/mission-vision?language=both`),
                    fetch(`${API_BASE}/research-areas?language=both`),
                    fetch(`${API_BASE}/faculty?language=both`),
                ]);

                const infoJson = infoRes.ok ? await infoRes.json() : null;
                const programmesJson = programmesRes.ok ? await programmesRes.json() : null;
                const missionJson = missionRes.ok ? await missionRes.json() : null;
                const researchJson = researchRes.ok ? await researchRes.json() : null;
                const facultyJson = facultyRes.ok ? await facultyRes.json() : null;

                const info = infoJson?.data || null;
                const programmeRows = (programmesJson?.data || []) as ProgrammeItem[];
                const missionRows = missionJson?.data || null;
                const researchRows = (researchJson?.data || []) as ResearchAreaItem[];

                setSectionInfo(info);
                setInfoForm({
                    intro_heading_en: info?.intro_heading_en || '',
                    intro_heading_hi: info?.intro_heading_hi || '',
                    intro_description_en: info?.intro_description_en || '',
                    intro_description_hi: info?.intro_description_hi || '',
                    dept_image_url: info?.dept_image_url || '',
                    is_published: Boolean(info?.is_published),
                });

                setProgrammes(programmeRows);
                setMissionVision({
                    mission_heading_en: missionRows?.mission_heading_en || '',
                    mission_heading_hi: missionRows?.mission_heading_hi || '',
                    mission_description_en: missionRows?.mission_description_en || '',
                    mission_description_hi: missionRows?.mission_description_hi || '',
                    mission_points_en: Array.isArray(missionRows?.mission_points_en)
                        ? missionRows.mission_points_en.join('\n')
                        : '',
                    mission_points_hi: Array.isArray(missionRows?.mission_points_hi)
                        ? missionRows.mission_points_hi.join('\n')
                        : '',
                });
                setResearchAreas(researchRows);
                setFacultyCount(Array.isArray(facultyJson?.data) ? facultyJson.data.length : 0);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        void loadInitial();
    }, [API_BASE]);

    const loadAll = async () => {
        try {
            setLoading(true);
            const [info, programmeRows, missionRows, researchRows, facultyTotal] = await Promise.all([
                fetchSectionInfo(),
                fetchProgrammes(),
                fetchMissionVision(),
                fetchResearchAreas(),
                fetchFacultyCount(),
            ]);

            setSectionInfo(info);
            setInfoForm({
                intro_heading_en: info?.intro_heading_en || '',
                intro_heading_hi: info?.intro_heading_hi || '',
                intro_description_en: info?.intro_description_en || '',
                intro_description_hi: info?.intro_description_hi || '',
                dept_image_url: info?.dept_image_url || '',
                is_published: Boolean(info?.is_published),
            });

            setProgrammes(programmeRows);
            setMissionVision({
                mission_heading_en: missionRows?.mission_heading_en || '',
                mission_heading_hi: missionRows?.mission_heading_hi || '',
                mission_description_en: missionRows?.mission_description_en || '',
                mission_description_hi: missionRows?.mission_description_hi || '',
                mission_points_en: Array.isArray(missionRows?.mission_points_en)
                    ? missionRows.mission_points_en.join('\n')
                    : '',
                mission_points_hi: Array.isArray(missionRows?.mission_points_hi)
                    ? missionRows.mission_points_hi.join('\n')
                    : '',
            });
            setResearchAreas(researchRows);
            setFacultyCount(facultyTotal);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInfoSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            setSavingInfo(true);
            const payload = {
                intro_heading_en: infoForm.intro_heading_en || null,
                intro_heading_hi: infoForm.intro_heading_hi || null,
                intro_description_en: infoForm.intro_description_en || null,
                intro_description_hi: infoForm.intro_description_hi || null,
                dept_image_url: infoForm.dept_image_url || null,
                is_published: infoForm.is_published,
            };

            const res = await fetch(API_BASE, {
                method: sectionInfo ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error('Failed to save section info');
            }

            await loadAll();
            alert(`${departmentCode.toUpperCase()} overview saved successfully`);
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Error saving section overview');
        } finally {
            setSavingInfo(false);
        }
    };

    const handleProgrammeSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            setSavingProgramme(true);
            const payload = {
                programme_type: programmeForm.programme_type,
                title_en: programmeForm.title_en,
                title_hi: programmeForm.title_hi,
                description_en: programmeForm.description_en,
                description_hi: programmeForm.description_hi,
                duration_years: Number(programmeForm.duration_years) || null,
                icon_emoji: programmeForm.icon_emoji,
                order_index: Number(programmeForm.order_index) || 0,
            };

            const res = await fetch(
                programmeEditingId ? `${API_BASE}/programmes/${programmeEditingId}` : `${API_BASE}/programmes`,
                {
                    method: programmeEditingId ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) {
                throw new Error('Failed to save programme');
            }

            setProgrammeForm(EMPTY_PROGRAMME);
            setProgrammeEditingId(null);
            await loadAll();
            alert(programmeEditingId ? 'Programme updated' : 'Programme created');
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Error saving programme');
        } finally {
            setSavingProgramme(false);
        }
    };

    const handleProgrammeDelete = async (id: number) => {
        if (!confirm('Delete this programme?')) return;
        const res = await fetch(`${API_BASE}/programmes/${id}`, { method: 'DELETE' });
        if (res.ok) {
            await loadAll();
            if (programmeEditingId === id) {
                setProgrammeEditingId(null);
                setProgrammeForm(EMPTY_PROGRAMME);
            }
        }
    };

    const handleResearchSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            setSavingResearch(true);
            const payload = {
                area_name_en: researchForm.area_name_en,
                area_name_hi: researchForm.area_name_hi,
                description_en: researchForm.description_en,
                description_hi: researchForm.description_hi,
                order_index: Number(researchForm.order_index) || 0,
            };

            const res = await fetch(
                researchEditingId ? `${API_BASE}/research-areas/${researchEditingId}` : `${API_BASE}/research-areas`,
                {
                    method: researchEditingId ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) {
                throw new Error('Failed to save research area');
            }

            setResearchForm(EMPTY_RESEARCH);
            setResearchEditingId(null);
            await loadAll();
            alert(researchEditingId ? 'Research area updated' : 'Research area created');
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Error saving research area');
        } finally {
            setSavingResearch(false);
        }
    };

    const handleResearchDelete = async (id: number) => {
        if (!confirm('Delete this research area?')) return;
        const res = await fetch(`${API_BASE}/research-areas/${id}`, { method: 'DELETE' });
        if (res.ok) {
            await loadAll();
            if (researchEditingId === id) {
                setResearchEditingId(null);
                setResearchForm(EMPTY_RESEARCH);
            }
        }
    };

    const handleMissionSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            setSavingMission(true);
            const payload = {
                mission_heading_en: missionVision.mission_heading_en || null,
                mission_heading_hi: missionVision.mission_heading_hi || null,
                mission_description_en: missionVision.mission_description_en || null,
                mission_description_hi: missionVision.mission_description_hi || null,
                mission_points_en: missionVision.mission_points_en
                    .split('\n')
                    .map((point) => point.trim())
                    .filter(Boolean),
                mission_points_hi: missionVision.mission_points_hi
                    .split('\n')
                    .map((point) => point.trim())
                    .filter(Boolean),
            };

            const res = await fetch(`${API_BASE}/mission-vision`, {
                method: sectionInfo ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error('Failed to save mission & vision');
            }

            await loadAll();
            alert('Mission & vision saved successfully');
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Error saving mission & vision');
        } finally {
            setSavingMission(false);
        }
    };

    const overviewPreview = useMemo(
        () => [
            { label: 'English', heading: infoForm.intro_heading_en, description: infoForm.intro_description_en },
            { label: 'Hindi', heading: infoForm.intro_heading_hi, description: infoForm.intro_description_hi },
        ],
        [infoForm]
    );

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

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: 'Overview', value: sectionInfo ? 'Saved' : 'New' },
                    { label: 'Programmes', value: String(programmes.length) },
                    { label: 'Mission', value: missionVision.mission_heading_en ? 'Saved' : 'New' },
                    { label: 'Research Areas', value: String(researchAreas.length) },
                    { label: 'Faculty', value: String(facultyCount) },
                ].map((item) => (
                    <div key={item.label} className="bg-white rounded-lg shadow-md p-4 border border-[#171717]/10">
                        <p className="text-xs uppercase tracking-widest text-[#171717]/50 font-semibold">{item.label}</p>
                        <p className="text-lg font-bold text-[#171717] mt-2">{item.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="border-b border-[#171717]/10">
                    <div className="flex overflow-x-auto">
                        {[
                            { id: 'overview', label: 'Overview', icon: <FileText size={16} /> },
                            { id: 'programmes', label: 'Programmes', icon: <Plus size={16} /> },
                            { id: 'mission', label: 'Mission & Vision', icon: <ShieldCheck size={16} /> },
                            { id: 'research', label: 'Research Areas', icon: <Users size={16} /> },
                            { id: 'faculty', label: 'Faculty', icon: <GraduationCap size={16} /> },
                            { id: 'staff', label: 'Staff', icon: <Users size={16} /> },
                            { id: 'labs', label: 'Labs', icon: <Microscope size={16} /> },
                            { id: 'publications', label: 'Publications', icon: <ScrollText size={16} /> },
                            { id: 'contact', label: 'Contact', icon: <Mail size={16} /> },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium whitespace-nowrap text-sm sm:text-base ${activeTab === tab.id ? 'bg-[#631012] text-white' : 'text-[#171717]/70 hover:bg-[#F9F9F9]'}`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                    {loading && (
                        <div className="flex items-center justify-center gap-2 py-8 text-[#171717]/60">
                            <Loader2 className="animate-spin" size={18} /> Loading section content...
                        </div>
                    )}

                    {activeTab === 'overview' && (
                        <form onSubmit={handleInfoSubmit} className="space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-bold text-[#171717]">Department Main Page</h2>
                                    <p className="text-sm text-[#171717]/60">English and Hindi fields stay side by side for direct editing.</p>
                                </div>
                                <button type="submit" disabled={savingInfo} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#631012] text-white hover:bg-[#7a1214] transition-colors disabled:opacity-70">
                                    {savingInfo ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    {savingInfo ? 'Saving...' : 'Save Overview'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#171717] mb-2">Heading English</label>
                                    <input value={infoForm.intro_heading_en} onChange={(e) => setInfoForm((prev) => ({ ...prev, intro_heading_en: e.target.value }))} className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#171717] mb-2">Heading Hindi</label>
                                    <input value={infoForm.intro_heading_hi} onChange={(e) => setInfoForm((prev) => ({ ...prev, intro_heading_hi: e.target.value }))} className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#171717] mb-2">Description English</label>
                                    <textarea rows={4} value={infoForm.intro_description_en} onChange={(e) => setInfoForm((prev) => ({ ...prev, intro_description_en: e.target.value }))} className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#171717] mb-2">Description Hindi</label>
                                    <textarea rows={4} value={infoForm.intro_description_hi} onChange={(e) => setInfoForm((prev) => ({ ...prev, intro_description_hi: e.target.value }))} className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#171717] mb-2">Image URL</label>
                                    <input value={infoForm.dept_image_url} onChange={(e) => setInfoForm((prev) => ({ ...prev, dept_image_url: e.target.value }))} className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black" placeholder="https://..." />
                                </div>
                                <div className="flex items-center gap-3 pt-7">
                                    <input type="checkbox" checked={infoForm.is_published} onChange={(e) => setInfoForm((prev) => ({ ...prev, is_published: e.target.checked }))} className="h-4 w-4 accent-[#631012]" />
                                    <span className="text-sm font-medium text-[#171717]">Published</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                {overviewPreview.map((item) => (
                                    <div key={item.label} className="rounded-lg border border-dashed border-[#171717]/15 bg-[#F9F9F9] p-4">
                                        <p className="text-xs uppercase tracking-widest text-[#171717]/50 font-semibold mb-2">{item.label}</p>
                                        <p className="text-lg font-bold text-[#171717]">{item.heading || 'No heading set'}</p>
                                        <p className="text-sm text-[#171717]/70 mt-2">{item.description || 'No description set'}</p>
                                    </div>
                                ))}
                            </div>
                        </form>
                    )}

                    {activeTab === 'programmes' && (
                        <div className="space-y-4">
                            <form onSubmit={handleProgrammeSubmit} className="rounded-lg border border-[#171717]/10 p-4 space-y-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-xl font-bold text-[#171717]">Programmes</h2>
                                        <p className="text-sm text-[#171717]/60">Add, edit, or remove programme cards shown on the section page.</p>
                                    </div>
                                    <button type="submit" disabled={savingProgramme} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#631012] text-white hover:bg-[#7a1214] transition-colors disabled:opacity-70">
                                        {savingProgramme ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                        {programmeEditingId ? 'Update Programme' : 'Add Programme'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input value={programmeForm.programme_type} onChange={(e) => setProgrammeForm((prev) => ({ ...prev, programme_type: e.target.value }))} placeholder="B.Tech" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black" />
                                    <input value={programmeForm.icon_emoji} onChange={(e) => setProgrammeForm((prev) => ({ ...prev, icon_emoji: e.target.value }))} placeholder="🎓" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black" />
                                    <input value={programmeForm.title_en} onChange={(e) => setProgrammeForm((prev) => ({ ...prev, title_en: e.target.value }))} placeholder="B.Tech" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black" />
                                    <input value={programmeForm.title_hi} onChange={(e) => setProgrammeForm((prev) => ({ ...prev, title_hi: e.target.value }))} placeholder="बी.टेक" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black" />
                                    <textarea rows={3} value={programmeForm.description_en} onChange={(e) => setProgrammeForm((prev) => ({ ...prev, description_en: e.target.value }))} placeholder="Programme description in English" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black" />
                                    <textarea rows={3} value={programmeForm.description_hi} onChange={(e) => setProgrammeForm((prev) => ({ ...prev, description_hi: e.target.value }))} placeholder="कार्यक्रम विवरण हिंदी में" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black" />
                                    <input type="number" value={programmeForm.duration_years} onChange={(e) => setProgrammeForm((prev) => ({ ...prev, duration_years: e.target.value }))} placeholder="4" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black" />
                                    <input type="number" value={programmeForm.order_index} onChange={(e) => setProgrammeForm((prev) => ({ ...prev, order_index: e.target.value }))} placeholder="0" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black" />
                                </div>
                            </form>

                            <div className="space-y-3">
                                {programmes.map((programme) => (
                                    <div key={programme.id} className="rounded-lg border border-[#171717]/10 p-4 bg-[#F9F9F9]/50">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-[#631012]">{programme.programme_type}</p>
                                                <h3 className="text-lg font-bold text-[#171717]">{programme.title_en} / {programme.title_hi}</h3>
                                                <p className="text-sm text-[#171717]/70">{programme.description_en}</p>
                                                <p className="text-sm text-[#171717]/70">{programme.description_hi}</p>
                                                <p className="text-xs text-[#171717]/50">Duration: {programme.duration_years} years | Order: {programme.order_index} | Icon: {programme.icon_emoji}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <button type="button" onClick={() => { setProgrammeEditingId(programme.id || null); setProgrammeForm({ ...programme, duration_years: programme.duration_years || '', order_index: programme.order_index || 0 }); }} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#171717]/15 text-[#171717] hover:bg-white text-sm">
                                                    <Edit2 size={14} /> Edit
                                                </button>
                                                <button type="button" onClick={() => handleProgrammeDelete(programme.id || 0)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm">
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'mission' && (
                        <form onSubmit={handleMissionSubmit} className="space-y-4 rounded-lg border border-[#171717]/10 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-bold text-[#171717]">Mission & Vision</h2>
                                    <p className="text-sm text-[#171717]/60">Store bilingual mission headings, descriptions, and bullet points.</p>
                                </div>
                                <button type="submit" disabled={savingMission} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#631012] text-white hover:bg-[#7a1214] transition-colors disabled:opacity-70">
                                    {savingMission ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    Save Mission
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input value={missionVision.mission_heading_en} onChange={(e) => setMissionVision((prev) => ({ ...prev, mission_heading_en: e.target.value }))} placeholder="Our Vision" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black" />
                                <input value={missionVision.mission_heading_hi} onChange={(e) => setMissionVision((prev) => ({ ...prev, mission_heading_hi: e.target.value }))} placeholder="हमारी दृष्टि" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black" />
                                <textarea rows={4} value={missionVision.mission_description_en} onChange={(e) => setMissionVision((prev) => ({ ...prev, mission_description_en: e.target.value }))} placeholder="Mission description in English" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black" />
                                <textarea rows={4} value={missionVision.mission_description_hi} onChange={(e) => setMissionVision((prev) => ({ ...prev, mission_description_hi: e.target.value }))} placeholder="मिशन का विवरण हिंदी में" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black" />
                                <textarea rows={5} value={missionVision.mission_points_en} onChange={(e) => setMissionVision((prev) => ({ ...prev, mission_points_en: e.target.value }))} placeholder="English points, one per line" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black" />
                                <textarea rows={5} value={missionVision.mission_points_hi} onChange={(e) => setMissionVision((prev) => ({ ...prev, mission_points_hi: e.target.value }))} placeholder="हिंदी बुलेट पॉइंट, हर पंक्ति अलग" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black" />
                            </div>
                        </form>
                    )}

                    {activeTab === 'research' && (
                        <div className="space-y-4">
                            <form onSubmit={handleResearchSubmit} className="rounded-lg border border-[#171717]/10 p-4 space-y-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-xl font-bold text-[#171717]">Research Areas</h2>
                                        <p className="text-sm text-[#171717]/60">Add bilingual research focus items and order them for the public page.</p>
                                    </div>
                                    <button type="submit" disabled={savingResearch} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#631012] text-white hover:bg-[#7a1214] transition-colors disabled:opacity-70">
                                        {savingResearch ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                        {researchEditingId ? 'Update Area' : 'Add Area'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input value={researchForm.area_name_en} onChange={(e) => setResearchForm((prev) => ({ ...prev, area_name_en: e.target.value }))} placeholder="AI & ML" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black" />
                                    <input value={researchForm.area_name_hi} onChange={(e) => setResearchForm((prev) => ({ ...prev, area_name_hi: e.target.value }))} placeholder="एआई और एमएल" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black" />
                                    <textarea rows={3} value={researchForm.description_en} onChange={(e) => setResearchForm((prev) => ({ ...prev, description_en: e.target.value }))} placeholder="Description in English" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black" />
                                    <textarea rows={3} value={researchForm.description_hi} onChange={(e) => setResearchForm((prev) => ({ ...prev, description_hi: e.target.value }))} placeholder="विवरण हिंदी में" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black" />
                                    <input type="number" value={researchForm.order_index} onChange={(e) => setResearchForm((prev) => ({ ...prev, order_index: e.target.value }))} placeholder="0" className="w-full px-3 py-2 border border-[#171717]/20 rounded-lg text-black" />
                                </div>
                            </form>

                            <div className="space-y-3">
                                {researchAreas.map((area) => (
                                    <div key={area.id} className="rounded-lg border border-[#171717]/10 p-4 bg-[#F9F9F9]/50 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold text-[#171717]">{area.area_name_en} / {area.area_name_hi}</h3>
                                            <p className="text-sm text-[#171717]/70">{area.description_en}</p>
                                            <p className="text-sm text-[#171717]/70">{area.description_hi}</p>
                                            <p className="text-xs text-[#171717]/50">Order: {area.order_index}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button type="button" onClick={() => { setResearchEditingId(area.id || null); setResearchForm({ ...area, order_index: area.order_index || 0 }); }} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#171717]/15 text-[#171717] hover:bg-white text-sm">
                                                <Edit2 size={14} /> Edit
                                            </button>
                                            <button type="button" onClick={() => handleResearchDelete(area.id || 0)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm">
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'faculty' && (
                        <DepartmentFacultySection departmentCode={departmentCode} apiBase={API_BASE} />
                    )}

                    {activeTab === 'staff' && (
                        <DepartmentStaffSection departmentCode={departmentCode} apiBase={API_BASE} />
                    )}

                    {activeTab === 'labs' && (
                        <DepartmentLabsSection departmentCode={departmentCode} apiBase={API_BASE} />
                    )}

                    {activeTab === 'publications' && (
                        <DepartmentPublicationsSection departmentCode={departmentCode} apiBase={API_BASE} />
                    )}

                    {activeTab === 'contact' && (
                        <DepartmentContactSection departmentCode={departmentCode} apiBase={API_BASE} />
                    )}
                </div>
            </div>
        </div>
    );
}
