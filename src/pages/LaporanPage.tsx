import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileBarChart, Download, Filter, Calendar, Users, BookOpen, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { students, classes, subjects, grades } from '../data/mockData';

export default function LaporanPage() {
  const { user, hasPermission } = useAuth();
  const [reportType, setReportType] = useState('nilai');

  const reportTypes = [
    { id: 'nilai', label: 'Rekap Nilai', icon: <TrendingUp size={16} /> },
    { id: 'presensi', label: 'Rekap Presensi', icon: <Users size={16} /> },
    { id: 'siswa', label: 'Data Siswa', icon: <Users size={16} /> },
    { id: 'kelas', label: 'Data Kelas', icon: <BookOpen size={16} /> },
  ];

  // Sample chart data
  const monthlyProgress = [
    { month: 'Jul', avg: 72 }, { month: 'Ags', avg: 75 }, { month: 'Sep', avg: 78 },
    { month: 'Okt', avg: 76 }, { month: 'Nov', avg: 80 }, { month: 'Des', avg: 82 },
    { month: 'Jan', avg: 79 }, { month: 'Feb', avg: 83 },
  ];

  const classPerformance = classes.filter(c => c.schoolId === user?.activeSchoolId).map(cls => {
    const classGrades = grades.filter(g => g.classId === cls.id);
    const avg = classGrades.length > 0 ? Math.round(classGrades.reduce((a, g) => a + g.score, 0) / classGrades.length) : 0;
    return { name: cls.name, avg };
  });

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Laporan</h1>
          <p className="text-gray-500 dark:text-gray-400">Analisis dan ekspor data pembelajaran</p>
        </div>
        {hasPermission('report.export') && (
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
              <Download size={18} /> Ekspor Excel
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
              <Download size={18} /> Ekspor PDF
            </button>
          </div>
        )}
      </div>

      {/* Report Type Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {reportTypes.map(rt => (
          <button key={rt.id} onClick={() => setReportType(rt.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              reportType === rt.id ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}>
            {rt.icon} {rt.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
          <option>Tahun Ajaran 2025/2026</option>
        </select>
        <select className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
          <option>Semester 2</option>
          <option>Semester 1</option>
        </select>
        <select className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
          <option>Semua Kelas</option>
          {classes.map(c => <option key={c.id}>{c.name}</option>)}
        </select>
        <select className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
          <option>Semua Mapel</option>
          {subjects.map(s => <option key={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tren Rata-rata Nilai Bulanan</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} name="Rata-rata" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performa per Kelas</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={classPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="avg" fill="#22c55e" radius={[4, 4, 0, 0]} name="Rata-rata" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Rekap per Mata Pelajaran</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mata Pelajaran</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Jumlah Siswa</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rata-rata</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tertinggi</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Terendah</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ketuntasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {subjects.map(sub => {
                const subGrades = grades.filter(g => g.subjectId === sub.id);
                const avg = subGrades.length > 0 ? Math.round(subGrades.reduce((a, g) => a + g.score, 0) / subGrades.length) : 0;
                const max = subGrades.length > 0 ? Math.max(...subGrades.map(g => g.score)) : 0;
                const min = subGrades.length > 0 ? Math.min(...subGrades.map(g => g.score)) : 0;
                const tuntas = subGrades.filter(g => g.score >= 75).length;
                const pct = subGrades.length > 0 ? Math.round((tuntas / subGrades.length) * 100) : 0;
                return (
                  <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{sub.name}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-300">{subGrades.length}</td>
                    <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-white">{avg}</td>
                    <td className="px-4 py-3 text-sm text-center text-green-600 dark:text-green-400">{max}</td>
                    <td className="px-4 py-3 text-sm text-center text-red-600 dark:text-red-400">{min}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${pct >= 75 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                        {pct}%
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
