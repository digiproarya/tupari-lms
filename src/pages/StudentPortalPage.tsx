/**
 * Portal Siswa - Complete Student Portal
 * 
 * Fitur lengkap untuk siswa:
 * - Dashboard dengan statistik
 * - Materi pembelajaran
 * - Tugas & pengumpulan
 * - Nilai & rapor
 * - Presensi
 * - Ujian online
 * - Pengumuman
 * - Profil
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Home, BookOpen, ClipboardList, BarChart3, UserCheck, GraduationCap,
  Bell, User, Loader2, AlertCircle, Calendar, Clock, TrendingUp,
  Download, Eye, CheckCircle2, XCircle, FileText
} from 'lucide-react';
import type { Material, Assignment, Grade, Attendance, Exam, Notification, Student } from '../types';

type StudentTab = 'home' | 'materi' | 'tugas' | 'nilai' | 'presensi' | 'ujian' | 'pengumuman' | 'profil';

export default function StudentPortalPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StudentTab>('home');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user?.role !== 'siswa') {
      setError('Portal ini hanya untuk siswa');
      setLoading(false);
      return;
    }
    fetchStudentData();
  }, [user]);

  const fetchStudentData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all student data in parallel
      const [materialsData, assignmentsData, gradesData, attendanceData, examsData, studentsData] = await Promise.all([
        api.materials.getAll(user.activeSchoolId) as Promise<Material[] | null>,
        api.assignments.getAll(user.activeSchoolId) as Promise<Assignment[] | null>,
        api.grades.getByStudent(user.id) as Promise<Grade[] | null>,
        api.attendance.getByStudent(user.id) as Promise<Attendance[] | null>,
        api.exams.getActive(user.activeSchoolId) as Promise<Exam[] | null>,
        api.students.getAll(user.activeSchoolId, { forceRefresh: true }) as Promise<Student[] | null>,
      ]);

      // Match only explicit account identifiers. If the account/student relation is absent,
      // fail closed rather than showing tasks for every class in the school.
      const linkedStudent = (studentsData || []).find(student => {
        const record = student as Student & { userId?: string; accountId?: string; email?: string };
        return record.id === user.id || record.userId === user.id || record.accountId === user.id ||
          (!!user.email && record.email?.toLowerCase() === user.email.toLowerCase());
      });
      const classId = linkedStudent?.classId;
      if (materialsData) setMaterials(materialsData);
      if (assignmentsData) {
        // Fail closed: never show all school assignments when student-to-class mapping is missing.
        setAssignments(classId ? assignmentsData.filter(a => a.classId === classId) : []);
        if (!classId) setError('Kelas akun siswa belum terhubung dengan data siswa. Hubungi administrator untuk memperbaiki pemetaan kelas.');
      }
      if (gradesData) setGrades(gradesData);
      if (attendanceData) setAttendance(attendanceData);
      if (examsData) setExams(examsData);
    } catch (err) {
      console.error('Error fetching student data:', err);
      setError('Gagal memuat data. Silakan refresh halaman.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 dark:text-white font-medium mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'siswa') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">Portal ini hanya untuk siswa</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'home' as StudentTab, label: 'Beranda', icon: <Home size={18} /> },
    { id: 'materi' as StudentTab, label: 'Materi', icon: <BookOpen size={18} /> },
    { id: 'tugas' as StudentTab, label: 'Tugas', icon: <ClipboardList size={18} /> },
    { id: 'nilai' as StudentTab, label: 'Nilai', icon: <BarChart3 size={18} /> },
    { id: 'presensi' as StudentTab, label: 'Presensi', icon: <UserCheck size={18} /> },
    { id: 'ujian' as StudentTab, label: 'Ujian', icon: <GraduationCap size={18} /> },
    { id: 'pengumuman' as StudentTab, label: 'Pengumuman', icon: <Bell size={18} /> },
    { id: 'profil' as StudentTab, label: 'Profil', icon: <User size={18} /> },
  ];

  // Calculate statistics
  const pendingAssignments = assignments.filter(a => a.status === 'active');
  const completedAssignments = assignments.filter(a => 
    a.submissions?.some(s => s.studentId === user.id && s.status !== 'pending')
  );
  const avgScore = grades.length > 0 
    ? Math.round(grades.reduce((a, g) => a + g.score, 0) / grades.length) 
    : 0;
  const attendanceRate = attendance.length > 0
    ? Math.round((attendance.filter(a => a.status === 'hadir').length / attendance.length) * 100)
    : 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <User size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Halo, {user.name}!</h1>
            <p className="text-white/80">Selamat belajar hari ini</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={20} className="text-blue-500" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Materi</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{materials.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-2">
                <ClipboardList size={20} className="text-orange-500" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Tugas Aktif</p>
              </div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{pendingAssignments.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={20} className="text-green-500" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Rata-rata</p>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{avgScore}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck size={20} className="text-purple-500" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Kehadiran</p>
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{attendanceRate}%</p>
            </div>
          </div>

          {/* Recent Materials */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Materi Terbaru</h3>
            {materials.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Belum ada materi</p>
            ) : (
              <div className="space-y-3">
                {materials.slice(0, 3).map(m => (
                  <div key={m.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <FileText size={20} className="text-primary-600 dark:text-primary-400" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{m.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{m.description}</p>
                    </div>
                    <button className="px-3 py-1 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
                      Buka
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Assignments */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tugas yang Harus Dikerjakan</h3>
            {pendingAssignments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Tidak ada tugas aktif</p>
            ) : (
              <div className="space-y-3">
                {pendingAssignments.slice(0, 3).map(a => (
                  <div key={a.id} className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800">
                    <ClipboardList size={20} className="text-orange-600 dark:text-orange-400" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{a.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Tenggat: {new Date(a.dueDate).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <button className="px-3 py-1 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-lg">
                      Kerjakan
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'materi' && (
        <div className="space-y-4">
          {materials.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p>Belum ada materi tersedia</p>
            </div>
          ) : (
            materials.map(m => (
              <div key={m.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{m.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{m.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(m.publishDate || m.createdAt).toLocaleDateString('id-ID')}
                  </span>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Download size={14} /> Download
                    </button>
                    <button className="px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
                      Buka Materi
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'tugas' && (
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <ClipboardList size={48} className="mx-auto mb-4 opacity-50" />
              <p>Belum ada tugas</p>
            </div>
          ) : (
            assignments.map(a => {
              const submission = a.submissions?.find(s => s.studentId === user.id);
              const isSubmitted = submission && submission.status !== 'pending';
              
              return (
                <div key={a.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{a.title}</h3>
                    <div className="flex items-center gap-2">
                      {isSubmitted ? (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          <CheckCircle2 size={12} className="inline mr-1" />
                          Terkumpul
                        </span>
                      ) : a.status === 'active' ? (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                          <Clock size={12} className="inline mr-1" />
                          Belum dikumpulkan
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          Ditutup
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{a.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Tenggat: {new Date(a.dueDate).toLocaleDateString('id-ID')}
                    </span>
                    {a.status === 'active' && !isSubmitted && (
                      <button
                        onClick={() => navigate(`/tugas?assignmentId=${encodeURIComponent(a.id)}`)}
                        className="px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                      >
                        Kumpulkan
                      </button>
                    )}
                    {isSubmitted && submission?.score !== undefined && (
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        Nilai: {submission.score}/{a.maxScore}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'nilai' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistik Nilai</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{avgScore}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Rata-rata</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {grades.length > 0 ? Math.max(...grades.map(g => g.score)) : 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tertinggi</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {grades.filter(g => g.score >= 75).length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tuntas</p>
              </div>
            </div>
          </div>

          {grades.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
              <p>Belum ada nilai</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Jenis</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nilai</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {grades.map(g => (
                    <tr key={g.id}>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white capitalize">{g.type}</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">{g.score}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          g.score >= 75 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {g.score >= 75 ? 'Tuntas' : 'Belum Tuntas'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'presensi' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistik Kehadiran</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {attendance.filter(a => a.status === 'hadir').length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Hadir</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {attendance.filter(a => a.status === 'sakit').length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sakit</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {attendance.filter(a => a.status === 'izin').length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Izin</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {attendance.filter(a => a.status === 'alpa').length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Alpa</p>
              </div>
            </div>
          </div>

          {attendance.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <UserCheck size={48} className="mx-auto mb-4 opacity-50" />
              <p>Belum ada data presensi</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tanggal</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {attendance.map(a => (
                    <tr key={a.id}>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {new Date(a.date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          a.status === 'hadir' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          a.status === 'sakit' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                          a.status === 'izin' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{a.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'ujian' && (
        <div className="space-y-4">
          {exams.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <GraduationCap size={48} className="mx-auto mb-4 opacity-50" />
              <p>Tidak ada ujian aktif saat ini</p>
            </div>
          ) : (
            exams.map(exam => (
              <div key={exam.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{exam.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {exam.duration} menit
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> {new Date(exam.startDate).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <button className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
                  Mulai Ujian
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'pengumuman' && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <Bell size={48} className="mx-auto mb-4 opacity-50" />
          <p>Tidak ada pengumuman baru</p>
        </div>
      )}

      {activeTab === 'profil' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <User size={40} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
              <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Role</p>
              <p className="font-medium text-gray-900 dark:text-white capitalize">{user.role}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
              <p className="font-medium text-gray-900 dark:text-white capitalize">{user.status}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
