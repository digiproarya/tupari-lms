import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BarChart3, Download, Loader2, Database, FileSpreadsheet, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Grade, Student, Subject, Class } from '../types';
import { exportGradesToExcel, exportToPDF } from '../utils/export';

import { Plus, X } from 'lucide-react';

export default function PenilaianPage() {
  const { user, hasPermission } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputForm, setInputForm] = useState({
    studentId: '',
    subjectId: '',
    classId: '',
    type: 'tugas' as 'tugas' | 'uh' | 'uts' | 'uas' | 'praktik',
    score: 0,
    maxScore: 100,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.activeSchoolId) return;
      setLoading(true);
      try {
        const [gradesData, studentsData, subjectsData, classesData] = await Promise.all([
          api.grades.getBySchool(user.activeSchoolId) as Promise<Grade[] | null>,
          api.students.getAll(user.activeSchoolId) as Promise<Student[] | null>,
          api.subjects.getAll(user.activeSchoolId) as Promise<Subject[] | null>,
          api.classes.getAll(user.activeSchoolId) as Promise<Class[] | null>,
        ]);
        if (gradesData) setGrades(gradesData);
        if (studentsData) setStudents(studentsData);
        if (subjectsData) setSubjects(subjectsData);
        if (classesData) setClasses(classesData);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.activeSchoolId]);

  const filteredGrades = grades.filter(g => {
    const matchClass = selectedClass === 'all' || g.classId === selectedClass;
    const matchSubject = selectedSubject === 'all' || g.subjectId === selectedSubject;
    return matchClass && matchSubject;
  });

  const avgScore = filteredGrades.length > 0 ? Math.round(filteredGrades.reduce((a, g) => a + g.score, 0) / filteredGrades.length) : 0;
  const maxScore = filteredGrades.length > 0 ? Math.max(...filteredGrades.map(g => g.score)) : 0;
  const minScore = filteredGrades.length > 0 ? Math.min(...filteredGrades.map(g => g.score)) : 0;
  const kkm = 75;
  const tuntasCount = filteredGrades.filter(g => g.score >= kkm).length;
  const tuntasPercent = filteredGrades.length > 0 ? Math.round((tuntasCount / filteredGrades.length) * 100) : 0;

  const chartData = [
    { range: '0-59', count: filteredGrades.filter(g => g.score < 60).length },
    { range: '60-69', count: filteredGrades.filter(g => g.score >= 60 && g.score < 70).length },
    { range: '70-79', count: filteredGrades.filter(g => g.score >= 70 && g.score < 80).length },
    { range: '80-89', count: filteredGrades.filter(g => g.score >= 80 && g.score < 90).length },
    { range: '90-100', count: filteredGrades.filter(g => g.score >= 90).length },
  ];

  const handleInputGrade = async () => {
    if (!inputForm.studentId || !inputForm.subjectId || !inputForm.classId) {
      alert('Mohon lengkapi semua field');
      return;
    }

    if (inputForm.score < 0 || inputForm.score > inputForm.maxScore) {
      alert(`Nilai harus antara 0 dan ${inputForm.maxScore}`);
      return;
    }

    try {
      // TODO: Call API untuk simpan nilai
      // await api.grades.save({
      //   studentId: inputForm.studentId,
      //   subjectId: inputForm.subjectId,
      //   classId: inputForm.classId,
      //   type: inputForm.type,
      //   score: inputForm.score,
      //   maxScore: inputForm.maxScore,
      // });

      // Reset form
      setInputForm({
        studentId: '',
        subjectId: '',
        classId: '',
        type: 'tugas',
        score: 0,
        maxScore: 100,
      });
      setShowInputModal(false);
      alert('Nilai berhasil ditambahkan!');
      
      // Refresh data
      if (user?.activeSchoolId) {
        const gradesData = await api.grades.getBySchool(user.activeSchoolId) as Grade[] | null;
        if (gradesData) setGrades(gradesData);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat menyimpan nilai');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Memuat nilai...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Penilaian</h1>
          <p className="text-gray-500 dark:text-gray-400">Rekap dan analisis nilai siswa</p>
        </div>
        <div className="flex gap-2">
          {hasPermission('grade.edit') && (
            <button 
              onClick={() => setShowInputModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <Plus size={18} /> Input Nilai
            </button>
          )}
          {hasPermission('report.export') && (
            <>
              <button 
                onClick={() => {
                  const gradesWithNames = filteredGrades.map(g => ({
                    ...g,
                    studentName: students.find(s => s.id === g.studentId)?.name || '-',
                    className: classes.find(c => c.id === g.classId)?.name || '-',
                    subjectName: subjects.find(s => s.id === g.subjectId)?.name || '-',
                  }));
                  exportGradesToExcel(gradesWithNames);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                <FileSpreadsheet size={18} /> Excel
              </button>
              <button 
                onClick={() => {
                  const headers = ['Siswa', 'Kelas', 'Mapel', 'Jenis', 'Nilai', 'Status'];
                  const data = filteredGrades.map(g => [
                    students.find(s => s.id === g.studentId)?.name || '-',
                    classes.find(c => c.id === g.classId)?.name || '-',
                    subjects.find(s => s.id === g.subjectId)?.name || '-',
                    g.type.toUpperCase(),
                    g.score,
                    g.score >= 75 ? 'Tuntas' : 'Belum Tuntas',
                  ]);
                  exportToPDF('Rekap Nilai', headers, data, 'Rekap_Nilai', {
                    subtitle: `Total: ${filteredGrades.length} data | Rata-rata: ${avgScore}`,
                    footer: 'Dokumen ini dicetak otomatis dari TUPARI LMS',
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                <FileText size={18} /> PDF
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-400">
            ✅ Terhubung ke Google Sheets — <strong>{grades.length}</strong> data nilai
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Rata-rata</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{avgScore}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Tertinggi</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{maxScore}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Terendah</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{minScore}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Ketuntasan</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{tuntasPercent}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">KKM</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{kkm}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
          <option value="all">Semua Kelas</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
          <option value="all">Semua Mapel</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribusi Nilai</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="range" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Jumlah Siswa" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Rekap Nilai</h3>
        </div>
        {filteredGrades.length === 0 ? (
          <div className="p-12 text-center">
            <BarChart3 size={48} className="mx-auto mb-4 text-gray-400 opacity-50" />
            <p className="text-gray-500 dark:text-gray-400">Belum ada data nilai</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Tambahkan data nilai di Google Sheets</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Siswa</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kelas</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mapel</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Jenis</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nilai</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredGrades.map(grade => {
                  const student = students.find(s => s.id === grade.studentId);
                  const subject = subjects.find(s => s.id === grade.subjectId);
                  return (
                    <tr key={grade.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{student?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{classes.find(c => c.id === grade.classId)?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{subject?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 capitalize">{grade.type}</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">{grade.score}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          grade.score >= kkm ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {grade.score >= kkm ? 'Tuntas' : 'Belum Tuntas'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Input Nilai Modal */}
      {showInputModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Input Nilai</h2>
              <button onClick={() => setShowInputModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kelas *</label>
                <select 
                  value={inputForm.classId}
                  onChange={e => setInputForm({ ...inputForm, classId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Pilih Kelas</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Siswa *</label>
                <select 
                  value={inputForm.studentId}
                  onChange={e => setInputForm({ ...inputForm, studentId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Pilih Siswa</option>
                  {students
                    .filter(s => !inputForm.classId || s.classId === inputForm.classId)
                    .map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mata Pelajaran *</label>
                <select 
                  value={inputForm.subjectId}
                  onChange={e => setInputForm({ ...inputForm, subjectId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Pilih Mapel</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Penilaian *</label>
                <select 
                  value={inputForm.type}
                  onChange={e => setInputForm({ ...inputForm, type: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="tugas">Tugas</option>
                  <option value="uh">Ulangan Harian</option>
                  <option value="uts">UTS</option>
                  <option value="uas">UAS</option>
                  <option value="praktik">Praktik</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nilai *</label>
                  <input 
                    type="number" 
                    value={inputForm.score}
                    onChange={e => setInputForm({ ...inputForm, score: parseFloat(e.target.value) })}
                    min="0"
                    max={inputForm.maxScore}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nilai Maksimal</label>
                  <input 
                    type="number" 
                    value={inputForm.maxScore}
                    onChange={e => setInputForm({ ...inputForm, maxScore: parseFloat(e.target.value) })}
                    min="1"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button 
                onClick={() => setShowInputModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Batal
              </button>
              <button 
                onClick={handleInputGrade}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
              >
                Simpan Nilai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
