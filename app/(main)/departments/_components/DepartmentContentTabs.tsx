'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    BookOpen,
    GraduationCap,
    Mail,
    Microscope,
    ScrollText,
    Users,
} from 'lucide-react';
import DepartmentFacultySection from './DepartmentFacultySection';
import DepartmentStaffSection from './DepartmentStaffSection';
import DepartmentLabsSection from './DepartmentLabsSection';
import DepartmentPublicationsSection from './DepartmentPublicationsSection';
import DepartmentContactSection from './DepartmentContactSection';

type ContentTab = 'faculty' | 'staff' | 'labs' | 'publications' | 'contact';

interface DepartmentContentTabsProps {
    departmentCode: string;
    title: string;
    subtitle: string;
    backHref?: string;
    initialTab?: ContentTab;
}

const TABS: { id: ContentTab; label: string; icon: React.ReactNode }[] = [
    { id: 'faculty', label: 'Faculty', icon: <GraduationCap size={16} /> },
    { id: 'staff', label: 'Staff', icon: <Users size={16} /> },
    { id: 'labs', label: 'Labs', icon: <Microscope size={16} /> },
    { id: 'publications', label: 'Publications', icon: <ScrollText size={16} /> },
    { id: 'contact', label: 'Contact', icon: <Mail size={16} /> },
];

export default function DepartmentContentTabs({
    departmentCode,
    title,
    subtitle,
    backHref = '/departments',
    initialTab = 'faculty',
}: DepartmentContentTabsProps) {
    const apiBase = `http://localhost:4000/v1/departments/${departmentCode}`;
    const [activeTab, setActiveTab] = useState<ContentTab>(initialTab);

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
                <Link href={backHref} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#171717]/15 text-[#171717] hover:bg-[#F9F9F9]">
                    <ArrowLeft size={16} /> Back
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="border-b border-[#171717]/10">
                    <div className="flex overflow-x-auto">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium whitespace-nowrap text-sm sm:text-base ${activeTab === tab.id ? 'bg-[#631012] text-white' : 'text-[#171717]/70 hover:bg-[#F9F9F9]'}`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-4 sm:p-6">
                    {activeTab === 'faculty' && <DepartmentFacultySection departmentCode={departmentCode} apiBase={apiBase} />}
                    {activeTab === 'staff' && <DepartmentStaffSection departmentCode={departmentCode} apiBase={apiBase} />}
                    {activeTab === 'labs' && <DepartmentLabsSection departmentCode={departmentCode} apiBase={apiBase} />}
                    {activeTab === 'publications' && <DepartmentPublicationsSection departmentCode={departmentCode} apiBase={apiBase} />}
                    {activeTab === 'contact' && <DepartmentContactSection departmentCode={departmentCode} apiBase={apiBase} />}
                </div>
            </div>
        </div>
    );
}
