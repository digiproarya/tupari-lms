import React, { useState } from 'react';
import { assignments, subjects, classes, students } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, Plus, Search, Clock, CheckCircle2, AlertCircle, Users, Eye, Edit2, Download } from 'lucide-react';

export default function TugasPage() {
  const { user, hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

  const filtered = assignments.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Aktif</span>;
      case 'draft': return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">Draft</span>;
      case 'closed': return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">Ditutup</span>;
      default: return null;
    }
  };

  const getSubmissionStats = (assignment: typeof assignments[0]) => {
    const total = assignment.submissions.length;
    const submitted = assignment.submissions.filter(s => s.status !== 'pending').length;
    const graded = assignment.submissions.filter(s => s.status === 'graded').length;
    const pending = assignment.submissions.filter(s => s.status === 'pending').length;
    return { total, submitted, graded, pending };
  };

  const selected = assignments.find(a => a.id === selectedAssignment);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tugas</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola tugas dan pantau pengumpulan siswa</p>
        </div>
        {hasPermission('assignment.manage') && (
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
            <Plus size={18} /> Buat Tugas
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Cari tugas..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
      </div>

      {!selectedAssignment ? (
        /* Assignment List */
        <div className="space-y-4">
          {filtered.map(assignment => {
            const stats = getSubmissionStats(assignment);
            const subject = subjects.find(s => s.id === assignment.subjectId);
            const cls = classes.find(c => c.id === assignment.classId);
            const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status === 'active';

            return (
              <div key={assignment.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{assignment.title}</h3>
                      {getStatusBadge(assignment.status)}
                      {isOverdue && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">Terlambat</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{assignment.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>{subject?.name}</span>
                      <span>{cls?.name}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> Tenggat: {new Date(assignment.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <span>Nilai Maks: {assignment.maxScore}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Progress bar */}
                    <div className="text-center">
                      <div className="flex items-center gap-2 mb-1">
                        <Users size={14} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.submitted}/{stats.total || '—'}</span>
                      </div>
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${stats.total > 0 ? (stats.submitted / stats.total) * 100 : 0}%` }} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{stats.graded} dinilai</p>
                    </div>
                    <button onClick={() => setSelectedAssignment(assignment.id)}
                      className="px-3 py-1.5 text-sm bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors">
                      Detail
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <ClipboardList size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Belum ada tugas</p>
            </div>
          )}
        </div>
      ) : selected && (
        /* Assignment Detail */
        <div>
          <button onClick={() => setSelectedAssignment(null)} className="text-sm text-primary-600 dark:text-primary-400 mb-4 hover:underline">
            ← Kembali ke daftar tugas
          </button>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selected.title}</h2>
              {getStatusBadge(selected.status)}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{selected.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Mata Pelajaran</p>
                <p className="font-medium text-gray-900 dark:text-white">{subjects.find(s => s.id === selected.subjectId)?.name}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Kelas</p>
                <p className="font-medium text-gray-900 dark:text-white">{classes.find(c => c.id === selected.classId)?.name}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Tenggat</p>
                <p className="font-medium text-gray-900 dark:text-white">{new Date(selected.dueDate).toLocaleDateString('id-ID')}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Nilai Maks</p>
                <p className="font-medium text-gray-900 dark:text-white">{selected.maxScore}</p>
              </div>
            </div>
          </div>

          {/* Submissions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Pengumpulan Siswa</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                <Download size={14} /> Ekspor
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Siswa</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Dikumpulkan</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nilai</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Umpan Balik</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {selected.submissions.map(sub => {
                    const student = students.find(s => s.id === sub.studentId);
                    return (
                      <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{student?.name || 'Unknown'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            sub.status === 'graded' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                            sub.status === 'submitted' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                            sub.status === 'late' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {sub.status === 'graded' ? 'Dinilai' : sub.status === 'submitted' ? 'Terkumpul' : sub.status === 'late' ? 'Terlambat' : 'Belum'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('id-ID') : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {sub.score !== undefined ? `${sub.score}/${selected.maxScore}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                          {sub.feedback || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
