import React, { useState } from 'react';
import { exams, subjects, classes } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Plus, Clock, Users, Eye, Edit2, Trash2, Key, Shuffle, Timer } from 'lucide-react';

export default function UjianPage() {
  const { user, hasPermission } = useAuth();
  const [selectedExam, setSelectedExam] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Aktif</span>;
      case 'draft': return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">Draft</span>;
      case 'closed': return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">Selesai</span>;
      default: return null;
    }
  };

  const selected = exams.find(e => e.id === selectedExam);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ujian Online</h1>
          <p className="text-gray-500 dark:text-gray-400">Buat dan kelola ujian untuk siswa</p>
        </div>
        {hasPermission('exam.manage') && (
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
            <Plus size={18} /> Buat Ujian
          </button>
        )}
      </div>

      {!selectedExam ? (
        <div className="space-y-4">
          {exams.map(exam => {
            const subject = subjects.find(s => s.id === exam.subjectId);
            const cls = classes.find(c => c.id === exam.classId);
            const mcCount = exam.questions.filter(q => q.type === 'multiple_choice').length;
            const essayCount = exam.questions.filter(q => q.type === 'essay').length;
            const totalPoints = exam.questions.reduce((a, q) => a + q.points, 0);

            return (
              <div key={exam.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{exam.title}</h3>
                      {getStatusBadge(exam.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <span>{subject?.name} — {cls?.name}</span>
                      <span className="flex items-center gap-1"><Timer size={12} /> {exam.duration} menit</span>
                      <span>{exam.questions.length} soal ({mcCount} PG, {essayCount} Esai)</span>
                      <span>Total: {totalPoints} poin</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {exam.token && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-700 dark:text-gray-300">
                          <Key size={12} /> Token: {exam.token}
                        </span>
                      )}
                      {exam.shuffleQuestions && (
                        <span className="flex items-center gap-1 text-xs text-gray-500"><Shuffle size={12} /> Soal diacak</span>
                      )}
                      {exam.shuffleOptions && (
                        <span className="flex items-center gap-1 text-xs text-gray-500"><Shuffle size={12} /> Opsi diacak</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedExam(exam.id)}
                      className="px-3 py-1.5 text-sm bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-100 transition-colors">
                      Detail
                    </button>
                    {hasPermission('exam.manage') && (
                      <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500"><Edit2 size={16} /></button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {exams.length === 0 && (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <GraduationCap size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Belum ada ujian</p>
              <p className="text-sm mt-1">Buat ujian online untuk menguji siswa Anda</p>
            </div>
          )}
        </div>
      ) : selected && (
        <div>
          <button onClick={() => setSelectedExam(null)} className="text-sm text-primary-600 dark:text-primary-400 mb-4 hover:underline">
            ← Kembali ke daftar ujian
          </button>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selected.title}</h2>
              {getStatusBadge(selected.status)}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Durasi</p>
                <p className="font-medium text-gray-900 dark:text-white">{selected.duration} menit</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Jumlah Soal</p>
                <p className="font-medium text-gray-900 dark:text-white">{selected.questions.length}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Tanggal</p>
                <p className="font-medium text-gray-900 dark:text-white">{new Date(selected.startDate).toLocaleDateString('id-ID')}</p>
              </div>
              {selected.token && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Token</p>
                  <p className="font-medium text-gray-900 dark:text-white font-mono">{selected.token}</p>
                </div>
              )}
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Daftar Soal</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {selected.questions.map((q, idx) => (
                <div key={q.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-medium text-primary-700 dark:text-primary-300 flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs rounded ${q.type === 'multiple_choice' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'}`}>
                          {q.type === 'multiple_choice' ? 'Pilihan Ganda' : 'Esai'}
                        </span>
                        <span className="text-xs text-gray-500">{q.points} poin</span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white mb-2">{q.question}</p>
                      {q.options && (
                        <div className="space-y-1">
                          {q.options.map((opt, i) => (
                            <div key={i} className={`text-sm px-3 py-1.5 rounded ${opt === q.correctAnswer ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                              {String.fromCharCode(65 + i)}. {opt} {opt === q.correctAnswer && '✓'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
