import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Search, Plus, Download, Upload, Edit2, Trash2, Eye, Filter, Users, BookOpen, GraduationCap, Loader2, AlertCircle, Database } from 'lucide-react';
import type { Student, Class, Subject } from '../types';

type Tab = 'siswa' | 'kelas' | 'mapel';

export default function DataMasterPage() {
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('siswa');
  const [search, setSearch] = useState('');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.activeSchoolId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const [studentsData, classesData, subjectsData] = await Promise.all([
          api.students.getAll(user.activeSchoolId) as Promise<Student[] | null>,
          api.classes.getAll(user.activeSchoolId) as Promise<Class[] | null>,
          api.subjects.getAll(user.activeSchoolId) as Promise<Subject[] | null>,
        ]);
        
        if (studentsData) setStudents(studentsData);
        if (classesData) setClasses(classesData);
        if (subjectsData) setSubjects(subjectsData);
      } catch (err) {
        setError('Gagal memuat data. Pastikan backend GAS sudah terhubung.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user?.activeSchoolId]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search)
  );

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'siswa', label: 'Siswa', icon: <Users size={16} />, count: students.length },
    { id: 'kelas', label: 'Kelas', icon: <BookOpen size={16} />, count: classes.length },
    { id: 'mapel', label: 'Mata Pelajaran', icon: <GraduationCap size={16} />, count: subjects.length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Memuat data dari Google Sheets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 dark:text-white font-medium mb-2">Gagal Memuat Data</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Master</h1>
          <p className="text-gray-500 dark:text-gray-400">Data real dari Google Sheets Anda</p>
        </div>
        {hasPermission('user.create') && (
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
            <Plus size={18} /> Tambah Data
          </button>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-400">
            ✅ Terhubung ke Google Sheets — {students.length} siswa, {classes.length} kelas, {subjects.length} mata pelajaran
          </p>
        </div>
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
            {tab.icon} {tab.label} ({tab.count})
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
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                      <Users size={40} className="mx-auto mb-3 opacity-50" />
                      <p>Belum ada data siswa di Google Sheets</p>
                      <p className="text-sm mt-1">Tambahkan data siswa di sheet STUDENTS</p>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'kelas' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nama Kelas</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tingkat</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Jumlah Siswa</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                      <BookOpen size={40} className="mx-auto mb-3 opacity-50" />
                      <p>Belum ada data kelas di Google Sheets</p>
                    </td>
                  </tr>
                ) : (
                  filteredClasses.map(cls => (
                    <tr key={cls.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{cls.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Kelas {cls.grade}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{cls.studentCount} siswa</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><Eye size={14} /></button>
                          <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500"><Edit2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
                {filteredSubjects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                      <GraduationCap size={40} className="mx-auto mb-3 opacity-50" />
                      <p>Belum ada data mata pelajaran di Google Sheets</p>
                    </td>
                  </tr>
                ) : (
                  filteredSubjects.map(sub => (
                    <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-300">{sub.code}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{sub.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">Kelas {sub.grade}</td>
                      <td className="px-4 py-3">
                        <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500"><Edit2 size={14} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
