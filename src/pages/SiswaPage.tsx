import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Users, Search, Eye, Edit2, Download, Plus, User, Phone, Loader2, AlertCircle, Database, FileSpreadsheet, FileText } from 'lucide-react';
import type { Student, Class } from '../types';
import { exportStudentsToExcel, exportStudentsToPDF } from '../utils/export';

export default function SiswaPage() {
  const { user, hasPermission } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.activeSchoolId) return;
      setLoading(true);
      try {
        const [studentsData, classesData] = await Promise.all([
          api.students.getAll(user.activeSchoolId) as Promise<Student[] | null>,
          api.classes.getAll(user.activeSchoolId) as Promise<Class[] | null>,
        ]);
        if (studentsData) setStudents(studentsData);
        if (classesData) setClasses(classesData);
      } catch (err) {
        setError('Gagal memuat data siswa');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.activeSchoolId]);

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search);
    const matchClass = selectedClass === 'all' || s.classId === selectedClass;
    return matchSearch && matchClass;
  });

  const student = students.find(s => s.id === selectedStudent);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Memuat data siswa...</p>
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
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">Refresh</button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Siswa</h1>
          <p className="text-gray-500 dark:text-gray-400">Data real dari Google Sheets</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              const studentsWithClass = filtered.map(s => ({
                ...s,
                className: classes.find(c => c.id === s.classId)?.name || '-'
              }));
              exportStudentsToExcel(studentsWithClass);
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <FileSpreadsheet size={18} /> Excel
          </button>
          <button 
            onClick={() => {
              const studentsWithClass = filtered.map(s => ({
                ...s,
                className: classes.find(c => c.id === s.classId)?.name || '-'
              }));
              exportStudentsToPDF(studentsWithClass, 'SD Negeri 1 Tupari');
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <FileText size={18} /> PDF
          </button>
          {hasPermission('student.manage') && (
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
              <Plus size={18} /> Tambah Siswa
            </button>
          )}
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-400">
            ✅ Terhubung ke Google Sheets — <strong>{students.length}</strong> siswa
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari nama atau NIS..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
          <option value="all">Semua Kelas</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {!selectedStudent ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">NIS</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">NISN</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nama</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kelas</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">L/P</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Orang Tua</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                      <Users size={40} className="mx-auto mb-3 opacity-50" />
                      <p>Belum ada data siswa</p>
                      <p className="text-sm mt-1">Tambahkan data siswa di Google Sheets</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">{s.nis}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">{s.nisn}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{s.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{classes.find(c => c.id === s.classId)?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{s.gender}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{s.parentName}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSelectedStudent(s.id)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><Eye size={14} /></button>
                          {hasPermission('student.manage') && <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500"><Edit2 size={14} /></button>}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
              Menampilkan {filtered.length} dari {students.length} siswa
            </div>
          )}
        </div>
      ) : student && (
        <div>
          <button onClick={() => setSelectedStudent(null)} className="text-sm text-primary-600 dark:text-primary-400 mb-4 hover:underline">
            ← Kembali ke daftar siswa
          </button>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <User size={32} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{student.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">NIS: {student.nis} | NISN: {student.nisn}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Kelas</p>
                <p className="font-medium text-gray-900 dark:text-white">{classes.find(c => c.id === student.classId)?.name || '-'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Jenis Kelamin</p>
                <p className="font-medium text-gray-900 dark:text-white">{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tanggal Lahir</p>
                <p className="font-medium text-gray-900 dark:text-white">{new Date(student.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nama Orang Tua</p>
                <p className="font-medium text-gray-900 dark:text-white">{student.parentName}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">No. Telepon</p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2"><Phone size={14} /> {student.parentPhone}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <span className={`px-2 py-0.5 text-xs rounded-full ${student.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                  {student.status === 'active' ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
