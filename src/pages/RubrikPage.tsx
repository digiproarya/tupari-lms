import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ClipboardCheck, Plus, Edit2, Trash2, Eye, Loader2, Database } from 'lucide-react';

interface Rubric {
  id: string;
  name: string;
  subject: string;
  criteria: {
    name: string;
    weight: number;
    levels: {
      score: number;
      description: string;
    }[];
  }[];
}

export default function RubrikPage() {
  const { user, hasPermission } = useAuth();
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRubrics();
  }, [user?.activeSchoolId]);

  const loadRubrics = async () => {
    if (!user?.activeSchoolId) return;
    
    setLoading(true);
    try {
      const response = await api.rubrics.getAll(user.activeSchoolId);
      if (response.success && Array.isArray(response.data)) {
        setRubrics(response.data as Rubric[]);
      }
    } catch (error) {
      console.error('Error loading rubrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Memuat rubrik...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rubrik Penilaian</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola rubrik penilaian multi-kriteria</p>
        </div>
        {hasPermission('grade.edit') && (
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
            <Plus size={18} /> Buat Rubrik
          </button>
        )}
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-400">
            ✅ Terhubung ke Google Sheets — <strong>{rubrics.length}</strong> rubrik
          </p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-800 dark:text-blue-400">
          💡 Rubrik penilaian membantu memberikan penilaian yang konsisten dan transparan
        </p>
      </div>

      <div className="space-y-4">
        {rubrics.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <ClipboardCheck size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Belum ada rubrik penilaian</p>
            <p className="text-sm mt-1">Klik "Buat Rubrik" untuk membuat rubrik baru</p>
          </div>
        ) : (
          rubrics.map(rubric => (
            <div key={rubric.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{rubric.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{rubric.subject}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><Eye size={14} /></button>
                  {hasPermission('grade.edit') && (
                    <>
                      <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500"><Edit2 size={14} /></button>
                      <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"><Trash2 size={14} /></button>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                {rubric.criteria.map((criterion, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">{criterion.name}</h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Bobot: {criterion.weight}%</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {criterion.levels.map((level, i) => (
                        <div key={i} className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                          <p className="text-xs font-medium text-gray-900 dark:text-white">{level.score}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{level.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
