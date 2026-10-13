import React, { useState } from 'react';
import { students, classes, subjects, schools, academicPeriods } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Download, Upload, Edit2, Trash2, Eye, Filter, Users, BookOpen, GraduationCap } from 'lucide-react';

type Tab = 'siswa' | 'kelas' | 'mapel' | 'sekolah' | 'periode';

export default function DataMasterPage() {
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('siswa');
  const [search, setSearch] = useState('');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'siswa', label: 'Siswa', icon: <Users size={16} /> },
    { id: 'kelas', label: 'Kelas', icon: <BookOpen size={16} /> },
    { id: 'mapel', label: 'Mata Pelajaran', icon: <GraduationCap size={16} /> },
    { id: 'sekolah', label: 'Sekolah', icon: <GraduationCap size={16} /> },
    { id: 'periode', label: 'Periode Akademik', icon: <GraduationCap size={16} /> },
  ];

  const filteredStudents = students.filter(s => 
    s.schoolId === user?.activeSchoolId && 
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search))
  );

  const filteredClasses = classes.filter(c => 
    c.schoolId === user?.activeSchoolId && 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSubjects = subjects.filter(s => 
    s.schoolId === user?.activeSchoolId && 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Master</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola data utama sistem pembelajaran</p>
        </div>
        {hasPermission('user.create') && (
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
            <Plus size={18} /> Tambah Data
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Cari ${activeTab}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
          <Filter size={16} /> Filter
        </button>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
          <Download size={16} /> Ekspor
        </button>
        {hasPermission('user.create') && (
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
            <Upload size={16} /> Impor
          </button>
        )}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {activeTab === 'siswa' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">NIS</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">NISN</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nama</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kelas</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">L/P</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{student.nis}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{student.nisn}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{student.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {classes.find(c => c.id === student.classId)?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{student.gender}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        student.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>{student.status === 'active' ? 'Aktif' : 'Nonaktif'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><Eye size={14} /></button>
                        {hasPermission('user.update') && <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500"><Edit2 size={14} /></button>}
                        {hasPermission('user.delete') && <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"><Trash2 size={14} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Users size={40} className="mx-auto mb-3 opacity-50" />
                <p>Tidak ada data siswa ditemukan</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'kelas' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nama Kelas</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tingkat</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Wali Kelas</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Jumlah Siswa</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredClasses.map(cls => (
                  <tr key={cls.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{cls.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Kelas {cls.grade}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {students.find(s => s.id === cls.homeroomTeacherId)?.name || 'Belum ditugaskan'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{cls.studentCount} siswa</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><Eye size={14} /></button>
                        <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500"><Edit2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'mapel' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kode</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mata Pelajaran</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tingkat</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSubjects.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-300">{sub.code}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{sub.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Kelas {sub.grade}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500"><Edit2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'sekolah' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schools.map(school => (
              <div key={school.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <GraduationCap size={20} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{school.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">NPSN: {school.npsn}</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <p>{school.address}</p>
                  <p>Jenjang: {school.level}</p>
                  <p>Kurikulum: {school.curriculum}</p>
                  <p>TA: {school.academicYear} - Sem {school.semester}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'periode' && (
          <div className="p-4 space-y-3">
            {academicPeriods.filter(p => p.schoolId === user?.activeSchoolId).map(period => (
              <div key={period.id} className={`border rounded-lg p-4 ${period.isActive ? 'border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{period.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(period.startDate).toLocaleDateString('id-ID')} - {new Date(period.endDate).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  {period.isActive && (
                    <span className="px-3 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">Aktif</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
