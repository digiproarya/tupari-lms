import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { HelpCircle, Plus, Search, Filter, Edit2, Trash2, Eye, Tag, Loader2, Database } from 'lucide-react';
import type { Question, Subject } from '../types';

export default function BankSoalPage() {
  const { user, hasPermission } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.activeSchoolId) return;
      setLoading(true);
      try {
        const [subjectsData, questionsResponse] = await Promise.all([
          api.subjects.getAll(user.activeSchoolId) as Promise<Subject[] | null>,
          api.questions.getAll(user.activeSchoolId),
        ]);
        
        if (subjectsData) setSubjects(subjectsData);
        if (questionsResponse.success && Array.isArray(questionsResponse.data)) {
          setQuestions(questionsResponse.data as Question[]);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.activeSchoolId]);

  const filtered = questions.filter(q => {
    const matchSearch = q.question.toLowerCase().includes(search.toLowerCase());
    const matchSubject = filterSubject === 'all' || q.examId === filterSubject;
    const matchDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
    return matchSearch && matchSubject && matchDifficulty;
  });

  const difficultyColors = {
    low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    hots: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={48} className="animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Memuat bank soal...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bank Soal</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola bank soal reusable untuk ujian</p>
        </div>
        {hasPermission('exam.manage') && (
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
            <Plus size={18} /> Tambah Soal
          </button>
        )}
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-400">
            ✅ Terhubung ke Google Sheets — <strong>{questions.length}</strong> soal
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari soal..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
          <option value="all">Semua Mapel</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
          <option value="all">Semua Tingkat</option>
          <option value="low">Mudah</option>
          <option value="medium">Sedang</option>
          <option value="high">Sulit</option>
          <option value="hots">HOTS</option>
        </select>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <HelpCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Belum ada soal</p>
            <p className="text-sm mt-1">Tambahkan soal ke bank soal</p>
          </div>
        ) : (
          filtered.map(q => (
            <div key={q.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${difficultyColors[q.difficulty as keyof typeof difficultyColors] || difficultyColors.medium}`}>
                      {q.difficulty === 'hots' ? 'HOTS' : q.difficulty === 'high' ? 'Sulit' : q.difficulty === 'low' ? 'Mudah' : 'Sedang'}
                    </span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                      {q.type === 'multiple_choice' ? 'PG' : 'Esai'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{q.points} poin</span>
                  </div>
                  <p className="text-gray-900 dark:text-white">{q.question}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><Eye size={14} /></button>
                  {hasPermission('exam.manage') && (
                    <>
                      <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500"><Edit2 size={14} /></button>
                      <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"><Trash2 size={14} /></button>
                    </>
                  )}
                </div>
              </div>
              {q.options && (
                <div className="ml-4 space-y-1">
                  {q.options.map((opt, i) => (
                    <div key={i} className={`text-sm px-3 py-1.5 rounded ${
                      opt === q.correctAnswer ? 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {String.fromCharCode(65 + i)}. {opt} {opt === q.correctAnswer && '✓'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
