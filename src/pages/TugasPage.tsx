import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ClipboardList, Plus, Search, Clock, Users, Loader2, Database, Upload, X, FileText, Download, Eye } from 'lucide-react';
import type { Assignment, Subject, Class, Student } from '../types';
import { uploadFile, validateFile, formatFileSize } from '../utils/upload';

export default function TugasPage() {
  const { user, hasPermission } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    content: '',
    file: null as File | null,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.activeSchoolId) return;
      setLoading(true);
      try {
        const [assignmentsData, subjectsData, classesData, studentsData] = await Promise.all([
          api.assignments.getAll(user.activeSchoolId) as Promise<Assignment[] | null>,
          api.subjects.getAll(user.activeSchoolId) as Promise<Subject[] | null>,
          api.classes.getAll(user.activeSchoolId) as Promise<Class[] | null>,
          api.students.getAll(user.activeSchoolId) as Promise<Student[] | null>,
        ]);
        if (assignmentsData) setAssignments(assignmentsData);
        if (subjectsData) setSubjects(subjectsData);
        if (classesData) setClasses(classesData);
        if (studentsData) setStudents(studentsData);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.activeSchoolId]);

  const filtered = assignments.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Aktif</span>;
      case 'draft': return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">Draft</span>;
      case 'closed': return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">Ditutup</span>;
      default: return null;
    }
  };

  const getSubmissionStats = (assignment: Assignment) => {
    const total = assignment.submissions?.length || 0;
    const submitted = assignment.submissions?.filter(s => s.status !== 'pending').length || 0;
    const graded = assignment.submissions?.filter(s => s.status === 'graded').length || 0;
    return { total, submitted, graded };
  };

  const handleSubmitTask = async () => {
    if (!submitForm.content && !submitForm.file) {
      alert('Mohon isi konten atau upload file');
      return;
    }

    setSubmitting(true);
    try {
      let fileUrl = '';
      
      // Upload file jika ada
      if (submitForm.file) {
        const validation = validateFile(submitForm.file);
        if (!validation.valid) {
          alert(validation.error);
          return;
        }

        const uploadResult = await uploadFile(submitForm.file, 'tugas');
        if (!uploadResult.success) {
          alert('Gagal upload file: ' + uploadResult.error);
          return;
        }
        fileUrl = uploadResult.fileUrl || '';
      }

      // Call API untuk submit tugas
      if (!selectedAssignment || !user) {
        alert('Data tidak lengkap');
        return;
      }

      const response = await api.submissions.submit(
        selectedAssignment,
        user.id,
        submitForm.content,
        fileUrl
      );

      if (response.success) {
        // Reset form
        setSubmitForm({ content: '', file: null });
        setShowSubmitModal(false);
        alert('Tugas berhasil dikumpulkan!');
        
        // Refresh data
        if (user?.activeSchoolId) {
          const assignmentsData = await api.assignments.getAll(user.activeSchoolId) as Assignment[] | null;
          if (assignmentsData) setAssignments(assignmentsData);
        }
      } else {
        alert('Gagal mengumpulkan tugas: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Terjadi kesalahan saat mengumpulkan tugas');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSubmitForm({ ...submitForm, file });
    }
  };

  const selected = assignments.find(a => a.id === selectedAssignment);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Memuat tugas...</p>
        </div>
      </div>
    );
  }

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

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-400">
            ✅ Terhubung ke Google Sheets — <strong>{assignments.length}</strong> tugas
          </p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Cari tugas..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
      </div>

      {!selectedAssignment ? (
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <ClipboardList size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Belum ada tugas</p>
              <p className="text-sm mt-1">Tambahkan tugas di Google Sheets</p>
            </div>
          ) : (
            filtered.map(assignment => {
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
            })
          )}
        </div>
      ) : selected && (
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
            
            {/* Submit Button untuk Siswa */}
            {user?.role === 'siswa' && selected.status === 'active' && (
              <button 
                onClick={() => setShowSubmitModal(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                <Upload size={18} /> Kumpulkan Tugas
              </button>
            )}
          </div>

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
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {selected.submissions?.map(sub => {
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
                        <td className="px-4 py-3">
                          {sub.fileUrl && (
                            <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500">
                              <Eye size={14} />
                            </button>
                          )}
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

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Kumpulkan Tugas</h2>
              <button onClick={() => setShowSubmitModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jawaban (Teks)</label>
                <textarea 
                  value={submitForm.content}
                  onChange={e => setSubmitForm({ ...submitForm, content: e.target.value })}
                  placeholder="Tulis jawaban Anda di sini..."
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload File (Opsional)</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center relative">
                  {submitForm.file ? (
                    <div>
                      <FileText size={32} className="mx-auto mb-2 text-primary-600" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{submitForm.file.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatFileSize(submitForm.file.size)}</p>
                      <button 
                        onClick={() => setSubmitForm({ ...submitForm, file: null })}
                        className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                      >
                        Hapus file
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Klik untuk pilih file atau drag & drop</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">PDF, DOC, Gambar (Max 50MB)</p>
                      <input 
                        type="file" 
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button 
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Batal
              </button>
              <button 
                onClick={handleSubmitTask}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Mengumpulkan...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Kumpulkan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
