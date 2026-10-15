import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { GraduationCap, Plus, Clock, Users, Loader2, Database } from 'lucide-react';
import type { Exam, Subject, Class } from '../types';

export default function UjianPage() {
  const { user, hasPermission } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.activeSchoolId) return;
      setLoading(true);
      try {
        const [examsData, subjectsData, classesData] = await Promise.all([
          api.exams.getActive(user.activeSchoolId) as Promise<Exam[] | null>,
          api.subjects.getAll(user.activeSchoolId) as Promise<Subject[] | null>,
          api.classes.getAll(user.activeSchoolId) as Promise<Class[] | null>,
        ]);
        if (examsData) setExams(examsData);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Aktif</span>;
      case 'draft': return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">Draft</span>;
      case 'closed': return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">Selesai</span>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Memuat ujian...</p>
        </div>
      </div>
    );
  }

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

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-400">
            ✅ Terhubung ke Google Sheets — <strong>{exams.length}</strong> ujian
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {exams.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <GraduationCap size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Belum ada ujian</p>
            <p className="text-sm mt-1">Buat ujian online untuk menguji siswa Anda</p>
          </div>
        ) : (
          exams.map(exam => {
            const subject = subjects.find(s => s.id === exam.subjectId);
            const cls = classes.find(c => c.id === exam.classId);
            return (
              <div key={exam.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{exam.title}</h3>
                      {getStatusBadge(exam.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>{subject?.name || '-'}</span>
                      <span>{cls?.name || '-'}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {exam.duration} menit</span>
                      <span>{exam.questions?.length || 0} soal</span>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 text-sm bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-100 transition-colors">
                    Detail
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
