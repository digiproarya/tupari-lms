import React, { useState } from 'react';
import { grades, students, subjects, classes } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Download, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PenilaianPage() {
  const { user, hasPermission } = useAuth();
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const filteredGrades = grades.filter(g => {
    const matchClass = selectedClass === 'all' || g.classId === selectedClass;
    const matchSubject = selectedSubject === 'all' || g.subjectId === selectedSubject;
    const matchType = selectedType === 'all' || g.type === selectedType;
    return matchClass && matchSubject && matchType;
  });

  // Calculate stats
  const avgScore = filteredGrades.length > 0 ? Math.round(filteredGrades.reduce((a, g) => a + g.score, 0) / filteredGrades.length) : 0;
  const maxScore = filteredGrades.length > 0 ? Math.max(...filteredGrades.map(g => g.score)) : 0;
  const minScore = filteredGrades.length > 0 ? Math.min(...filteredGrades.map(g => g.score)) : 0;
  const kkm = 75;
  const tuntasCount = filteredGrades.filter(g => g.score >= kkm).length;
  const tuntasPercent = filteredGrades.length > 0 ? Math.round((tuntasCount / filteredGrades.length) * 100) : 0;

  // Chart data
  const chartData = [
    { range: '0-59', count: filteredGrades.filter(g => g.score < 60).length },
    { range: '60-69', count: filteredGrades.filter(g => g.score >= 60 && g.score < 70).length },
    { range: '70-79', count: filteredGrades.filter(g => g.score >= 70 && g.score < 80).length },
    { range: '80-89', count: filteredGrades.filter(g => g.score >= 80 && g.score < 90).length },
    { range: '90-100', count: filteredGrades.filter(g => g.score >= 90).length },
  ];

  // Student grade summary
  const studentSummaries = students.filter(s => s.classId === (selectedClass === 'all' ? 'c1' : selectedClass)).map(student => {
    const studentGrades = filteredGrades.filter(g => g.studentId === student.id);
    const avg = studentGrades.length > 0 ? Math.round(studentGrades.reduce((a, g) => a + g.score, 0) / studentGrades.length) : 0;
    return { ...student, avg, totalGrades: studentGrades.length };
  }).filter(s => s.totalGrades > 0);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Penilaian</h1>
          <p className="text-gray-500 dark:text-gray-400">Rekap dan analisis nilai siswa</p>
        </div>
        {hasPermission('report.export') && (
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            <Download size={18} /> Ekspor Excel
          </button>
        )}
      </div>

      {/* Stats Cards */}
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

      {/* Filters */}
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
        <select value={selectedType} onChange={e => setSelectedType(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
          <option value="all">Semua Jenis</option>
          <option value="tugas">Tugas</option>
          <option value="uh">Ulangan Harian</option>
          <option value="uts">UTS</option>
          <option value="uas">UAS</option>
          <option value="praktik">Praktik</option>
        </select>
      </div>

      {/* Chart */}
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

      {/* Grade Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Rekap Nilai per Siswa</h3>
        </div>
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
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{student?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{classes.find(c => c.id === grade.classId)?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{subject?.name}</td>
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
      </div>
    </div>
  );
}
