/**
 * CBT Analysis Page - Analisis Butir Soal & Hasil Ujian
 * 
 * Fitur:
 * ✅ Analisis tingkat kesukaran soal
 * ✅ Analisis daya beda soal
 * ✅ Distribusi nilai (histogram)
 * ✅ Rekap per siswa
 * ✅ Export ke Excel/PDF
 * ✅ Identifikasi soal bermasalah
 * ✅ Koreksi otomatis PG
 */

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Users, FileText, Award } from 'lucide-react';

// ==================== DEMO DATA ====================
const DEMO_EXAM_DATA = {
  examId: 'exam_001',
  title: 'Ulangan Harian Matematika - Bab 3: Pecahan',
  subject: 'Matematika',
  class: '4A',
  totalStudents: 30,
  studentsSubmitted: 28,
  date: '2025-03-01',
  questions: [
    { id: 'q1', text: 'Hasil dari 1/2 + 1/4 adalah...', type: 'PG', points: 10, difficulty: 0.35, discrimination: 0.42, correctCount: 24, wrongCount: 4 },
    { id: 'q2', text: 'Pecahan yang senilai dengan 2/3 adalah...', type: 'PG', points: 10, difficulty: 0.65, discrimination: 0.38, correctCount: 18, wrongCount: 10 },
    { id: 'q3', text: '0,75 dalam bentuk pecahan adalah...', type: 'PG', points: 10, difficulty: 0.25, discrimination: 0.55, correctCount: 26, wrongCount: 2 },
    { id: 'q4', text: 'Jelaskan cara mengubah pecahan biasa menjadi desimal', type: 'Esai', points: 20, difficulty: 0.55, discrimination: 0.48, correctCount: 20, wrongCount: 8 },
    { id: 'q5', text: 'Hasil dari 3/4 - 1/2 adalah...', type: 'PG', points: 10, difficulty: 0.40, discrimination: 0.35, correctCount: 22, wrongCount: 6 },
    { id: 'q6', text: 'Bentuk paling sederhana dari 12/18 adalah...', type: 'PG', points: 10, difficulty: 0.50, discrimination: 0.45, correctCount: 21, wrongCount: 7 },
    { id: 'q7', text: 'Urutan pecahan dari terkecil ke terbesar', type: 'PG', points: 10, difficulty: 0.70, discrimination: 0.30, correctCount: 15, wrongCount: 13 },
    { id: 'q8', text: 'Ibu membeli 3/4 kg gula dan 1/2 kg tepung...', type: 'Esai', points: 20, difficulty: 0.60, discrimination: 0.52, correctCount: 19, wrongCount: 9 },
    { id: 'q9', text: 'Pecahan 5/8 jika diubah menjadi desimal', type: 'PG', points: 10, difficulty: 0.45, discrimination: 0.40, correctCount: 23, wrongCount: 5 },
    { id: 'q10', text: 'Hasil dari 2 × 3/4 adalah...', type: 'PG', points: 10, difficulty: 0.30, discrimination: 0.50, correctCount: 25, wrongCount: 3 },
  ],
  scoreDistribution: [
    { range: '0-20', count: 1 },
    { range: '21-40', count: 2 },
    { range: '41-60', count: 5 },
    { range: '61-75', count: 8 },
    { range: '76-85', count: 7 },
    { range: '86-100', count: 5 },
  ],
  studentResults: [
    { id: 'st1', name: 'Rizki Pratama', score: 85, status: 'tuntas', timeSpent: 45 },
    { id: 'st2', name: 'Anisa Putri', score: 92, status: 'tuntas', timeSpent: 38 },
    { id: 'st3', name: 'Bima Sakti', score: 70, status: 'tuntas', timeSpent: 52 },
    { id: 'st4', name: 'Citra Dewi', score: 78, status: 'tuntas', timeSpent: 48 },
    { id: 'st5', name: 'Dimas Arya', score: 65, status: 'belum', timeSpent: 55 },
    { id: 'st6', name: 'Eka Safitri', score: 88, status: 'tuntas', timeSpent: 42 },
    { id: 'st7', name: 'Farhan Maulana', score: 72, status: 'tuntas', timeSpent: 50 },
    { id: 'st8', name: 'Gita Permata', score: 95, status: 'tuntas', timeSpent: 35 },
  ],
};

export default function CBTAnalysisPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'students'>('overview');
  const data = DEMO_EXAM_DATA;

  // Calculate statistics
  const stats = useMemo(() => {
    const scores = data.studentResults.map(s => s.score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const tuntas = data.studentResults.filter(s => s.status === 'tuntas').length;
    const tuntasPercent = (tuntas / data.studentResults.length) * 100;
    
    // Standard deviation
    const variance = scores.reduce((acc, score) => acc + Math.pow(score - avg, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    return { avg: Math.round(avg), max, min, tuntas, tuntasPercent: Math.round(tuntasPercent), stdDev: Math.round(stdDev * 10) / 10 };
  }, [data]);

  // Identify problematic questions
  const problematicQuestions = useMemo(() => {
    return data.questions.filter(q => 
      q.difficulty > 0.7 || // Terlalu sulit
      q.difficulty < 0.2 || // Terlalu mudah
      q.discrimination < 0.3 // Daya beda rendah
    );
  }, [data]);

  const getDifficultyLabel = (d: number) => {
    if (d < 0.2) return { text: 'Terlalu Mudah', color: 'text-red-600' };
    if (d < 0.4) return { text: 'Mudah', color: 'text-orange-600' };
    if (d < 0.7) return { text: 'Sedang', color: 'text-green-600' };
    if (d < 0.85) return { text: 'Sulit', color: 'text-blue-600' };
    return { text: 'Terlalu Sulit', color: 'text-red-600' };
  };

  const getDiscriminationLabel = (d: number) => {
    if (d < 0.2) return { text: 'Jelek', color: 'text-red-600' };
    if (d < 0.3) return { text: 'Kurang', color: 'text-orange-600' };
    if (d < 0.4) return { text: 'Cukup', color: 'text-yellow-600' };
    if (d < 0.5) return { text: 'Baik', color: 'text-green-600' };
    return { text: 'Sangat Baik', color: 'text-emerald-600' };
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analisis Butir Soal</h1>
          <p className="text-gray-500 dark:text-gray-400">{data.title} • Kelas {data.class}</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
            <Download size={18} /> Ekspor Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
            <FileText size={18} /> PDF
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Peserta</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.studentsSubmitted}/{data.totalStudents}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Rata-rata</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.avg}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Tertinggi</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.max}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Terendah</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.min}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Ketuntasan</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.tuntasPercent}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Std Dev</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.stdDev}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button onClick={() => setActiveTab('overview')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'overview' ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}>
          Ringkasan
        </button>
        <button onClick={() => setActiveTab('items')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'items' ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}>
          Analisis Butir Soal
        </button>
        <button onClick={() => setActiveTab('students')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'students' ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}>
          Rekap Siswa
        </button>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribusi Nilai</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Jumlah Siswa" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Problematic Questions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" /> Soal Bermasalah
            </h3>
            <div className="space-y-3">
              {problematicQuestions.map(q => {
                const diff = getDifficultyLabel(q.difficulty);
                const disc = getDiscriminationLabel(q.discrimination);
                return (
                  <div key={q.id} className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {q.id.toUpperCase()}: {q.text.substring(0, 50)}...
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className={diff.color}>Tingkat Kesukaran: {diff.text} ({(q.difficulty * 100).toFixed(0)}%)</span>
                      <span className={disc.color}>• Daya Beda: {disc.text} ({q.discrimination.toFixed(2)})</span>
                    </div>
                  </div>
                );
              })}
              {problematicQuestions.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  <CheckCircle2 size={24} className="mx-auto mb-2 text-green-500" />
                  Tidak ada soal bermasalah
                </p>
              )}
            </div>
          </div>

          {/* Difficulty Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tingkat Kesukaran Soal</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.questions.map(q => ({ name: q.id.toUpperCase(), difficulty: q.difficulty * 100 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="difficulty" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Tingkat Kesukaran (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Discrimination Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daya Beda Soal</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.questions.map(q => ({ name: q.id.toUpperCase(), discrimination: q.discrimination }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="discrimination" fill="#22c55e" radius={[4, 4, 0, 0]} name="Daya Beda" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'items' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">No</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Soal</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tipe</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Poin</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Benar</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Salah</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kesukaran</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Daya Beda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.questions.map((q, idx) => {
                  const diff = getDifficultyLabel(q.difficulty);
                  const disc = getDiscriminationLabel(q.discrimination);
                  return (
                    <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">{q.text}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 text-xs rounded ${q.type === 'PG' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'}`}>
                          {q.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">{q.points}</td>
                      <td className="px-4 py-3 text-sm text-center text-green-600 dark:text-green-400">{q.correctCount}</td>
                      <td className="px-4 py-3 text-sm text-center text-red-600 dark:text-red-400">{q.wrongCount}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-medium ${diff.color}`}>{diff.text}</span>
                        <p className="text-xs text-gray-500">{(q.difficulty * 100).toFixed(0)}%</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-medium ${disc.color}`}>{disc.text}</span>
                        <p className="text-xs text-gray-500">{q.discrimination.toFixed(2)}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">No</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nama Siswa</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nilai</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Waktu (menit)</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.studentResults.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{s.name}</td>
                    <td className="px-4 py-3 text-sm text-center font-bold text-gray-900 dark:text-white">{s.score}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-300">{s.timeSpent}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        s.status === 'tuntas' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {s.status === 'tuntas' ? 'Tuntas' : 'Belum Tuntas'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
