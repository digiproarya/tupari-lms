import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Plus, FileText, Edit2, Eye, Download, Copy, Calendar } from 'lucide-react';

export default function PerencanaanPage() {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('cp');

  const tabs = [
    { id: 'cp', label: 'Capaian Pembelajaran (CP)' },
    { id: 'tp', label: 'Tujuan Pembelajaran (TP)' },
    { id: 'atp', label: 'Alur TP (ATP)' },
    { id: 'prota', label: 'Program Tahunan' },
    { id: 'promes', label: 'Program Semester' },
    { id: 'modul', label: 'Modul Ajar' },
    { id: 'lkpd', label: 'LKPD' },
  ];

  const sampleDocs = [
    { id: '1', title: 'CP Matematika Fase B', type: 'CP', subject: 'Matematika', status: 'final', updatedAt: '2025-01-10' },
    { id: '2', title: 'CP Bahasa Indonesia Fase B', type: 'CP', subject: 'Bahasa Indonesia', status: 'final', updatedAt: '2025-01-12' },
    { id: '3', title: 'TP Matematika Kelas 4 - Bab 1', type: 'TP', subject: 'Matematika', status: 'draft', updatedAt: '2025-02-01' },
    { id: '4', title: 'ATP Matematika Kelas 4 Semester 2', type: 'ATP', subject: 'Matematika', status: 'final', updatedAt: '2025-01-20' },
    { id: '5', title: 'Prota Matematika Kelas 4 TA 2025/2026', type: 'Prota', subject: 'Matematika', status: 'final', updatedAt: '2025-01-05' },
    { id: '6', title: 'Promes Matematika Kelas 4 Semester 2', type: 'Promes', subject: 'Matematika', status: 'final', updatedAt: '2025-01-08' },
    { id: '7', title: 'Modul Ajar: Pecahan dan Desimal', type: 'Modul', subject: 'Matematika', status: 'published', updatedAt: '2025-01-15' },
    { id: '8', title: 'LKPD: Operasi Pecahan', type: 'LKPD', subject: 'Matematika', status: 'published', updatedAt: '2025-01-18' },
  ];

  const filteredDocs = sampleDocs.filter(d => {
    if (activeTab === 'cp') return d.type === 'CP';
    if (activeTab === 'tp') return d.type === 'TP';
    if (activeTab === 'atp') return d.type === 'ATP';
    if (activeTab === 'prota') return d.type === 'Prota';
    if (activeTab === 'promes') return d.type === 'Promes';
    if (activeTab === 'modul') return d.type === 'Modul';
    if (activeTab === 'lkpd') return d.type === 'LKPD';
    return true;
  });

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Perencanaan Pembelajaran</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola CP, TP, ATP, Prota, Promes, Modul Ajar, dan LKPD</p>
        </div>
        {hasPermission('material.manage') && (
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
            <Plus size={18} /> Buat Dokumen
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {filteredDocs.map(doc => (
          <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <FileText size={20} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{doc.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{doc.subject}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(doc.updatedAt).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  doc.status === 'final' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                  doc.status === 'published' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                }`}>
                  {doc.status === 'final' ? 'Final' : doc.status === 'published' ? 'Terbit' : 'Draft'}
                </span>
                <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><Eye size={14} /></button>
                <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500"><Edit2 size={14} /></button>
                <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><Copy size={14} /></button>
                <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-green-500"><Download size={14} /></button>
              </div>
            </div>
          </div>
        ))}
        {filteredDocs.length === 0 && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Belum ada dokumen</p>
            <p className="text-sm mt-1">Buat dokumen perencanaan pembelajaran untuk kelas Anda</p>
          </div>
        )}
      </div>
    </div>
  );
}
