'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import DepartmentFacultySection from '../_components/DepartmentFacultySection';

interface DepartmentFacultyPageProps {
    departmentCode: string;
    title: string;
    subtitle: string;
    backHref?: string;
}

export default function DepartmentFacultyPage({
    departmentCode,
    title,
    subtitle,
    backHref = '/departments',
}: DepartmentFacultyPageProps) {
    const apiBase = `http://localhost:4000/v1/departments/${departmentCode}`;

    return (
        <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-[#631012]/10 p-3 rounded-full text-[#631012] flex-shrink-0">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-[#171717]">{title}</h1>
                        <p className="text-sm text-[#171717]/60">{subtitle}</p>
                    </div>
                </div>
                <Link
                    href={backHref}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#171717]/15 text-[#171717] hover:bg-[#F9F9F9] transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <DepartmentFacultySection departmentCode={departmentCode} apiBase={apiBase} />
            </div>
        </div>
    );
}
