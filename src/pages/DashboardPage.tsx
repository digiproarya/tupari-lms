import React from 'react';
import { useAuth } from '../context/AuthContext';
import { students, classes, materials, assignments, exams, attendance, grades, notifications, auditLogs, subjects } from '../data/mockData';
import { Users, BookOpen, ClipboardList, GraduationCap, UserCheck, TrendingUp, Bell, Clock, AlertTriangle, CheckCircle2, BarChart3, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  const classStudents = students.filter(s => s.schoolId === user.activeSchoolId);
  const schoolClasses = classes.filter(c => c.schoolId === user.activeSchoolId);
  const schoolMaterials = materials.filter(m => m.status === 'published');
  const activeAssignments = assignments.filter(a => a.status === 'active');
  const activeExams = exams.filter(e => e.status === 'active');
  const unreadNotifs = notifications.filter(n => !n.read && n.userId === user.id);

  // Stats
  const totalStudents = classStudents.length;
  const totalClasses = schoolClasses.length;
  const totalMaterials = schoolMaterials.length;
  const pendingSubmissions = assignments.reduce((acc, a) => acc + a.submissions.filter(s => s.status === 'pending').length, 0);
  
  // Attendance stats
  const todayAttendance = attendance.filter(a => a.date === '2025-02-18');
  const hadirCount = todayAttendance.filter(a => a.status === 'hadir').length;
  const sakitCount = todayAttendance.filter(a => a.status === 'sakit').length;
  const izinCount = todayAttendance.filter(a => a.status === 'izin').length;
  const alpaCount = todayAttendance.filter(a => a.status === 'alpa').length;

  // Grade distribution
  const gradeDistribution = [
    { name: '≥90', value: grades.filter(g => g.score >= 90).length, color: '#22c55e' },
    { name: '80-89', value: grades.filter(g => g.score >= 80 && g.score < 90).length, color: '#3b82f6' },
    { name: '70-79', value: grades.filter(g => g.score >= 70 && g.score < 80).length, color: '#f59e0b' },
    { name: '<70', value: grades.filter(g => g.score < 70).length, color: '#ef4444' },
  ];

  // Weekly activity
  const weeklyActivity = [
    { day: 'Sen', materi: 2, tugas: 1, ujian: 0 },
    { day: 'Sel', materi: 1, tugas: 2, ujian: 0 },
    { day: 'Rab', materi: 3, tugas: 0, ujian: 1 },
    { day: 'Kam', materi: 1, tugas: 1, ujian: 0 },
    { day: 'Jum', materi: 2, tugas: 3, ujian: 0 },
    { day: 'Sab', materi: 0, tugas: 0, ujian: 1 },
  ];

  // Subject performance
  const subjectPerformance = subjects.slice(0, 5).map(sb => {
    const subjectGrades = grades.filter(g => g.subjectId === sb.id);
    const avg = subjectGrades.length > 0 ? Math.round(subjectGrades.reduce((a, g) => a + g.score, 0) / subjectGrades.length) : 0;
    return { name: sb.code, avg };
  });

  const statCards = [
    { label: 'Total Siswa', value: totalStudents, icon: <Users size={22} />, color: 'bg-blue-500', trend: '+12' },
    { label: 'Total Kelas', value: totalClasses, icon: <BookOpen size={22} />, color: 'bg-emerald-500', trend: '5 rombel' },
    { label: 'Materi Aktif', value: totalMaterials, icon: <FileText size={22} />, color: 'bg-purple-500', trend: '+3 minggu ini' },
    { label: 'Tugas Aktif', value: activeAssignments.length, icon: <ClipboardList size={22} />, color: 'bg-amber-500', trend: `${pendingSubmissions} blm dikumpulkan` },
    { label: 'Ujian Aktif', value: activeExams.length, icon: <GraduationCap size={22} />, color: 'bg-rose-500', trend: '1 minggu ini' },
    { label: 'Kehadiran Hari Ini', value: `${totalStudents > 0 ? Math.round((hadirCount / Math.max(todayAttendance.length, 1)) * 100) : 0}%`, icon: <UserCheck size={22} />, color: 'bg-teal-500', trend: `${hadirCount} hadir` },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Selamat Datang, {user.name.split(',')[0]} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Berikut ringkasan aktivitas pembelajaran hari ini
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center text-white`}>
                {card.icon}
              </div>
              <TrendingUp size={14} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">{card.trend}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aktivitas Mingguan</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="materi" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Materi" />
              <Bar dataKey="tugas" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Tugas" />
              <Bar dataKey="ujian" fill="#ef4444" radius={[4, 4, 0, 0]} name="Ujian" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Grade Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribusi Nilai</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={gradeDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subject Performance & Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Subject Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rata-rata Nilai per Mapel</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={subjectPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={40} />
              <Tooltip />
              <Bar dataKey="avg" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Rata-rata" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rekap Presensi Hari Ini</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{hadirCount}</p>
              <p className="text-xs text-green-600 dark:text-green-400">Hadir</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{sakitCount}</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">Sakit</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{izinCount}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Izin</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-700 dark:text-red-400">{alpaCount}</p>
              <p className="text-xs text-red-600 dark:text-red-400">Alpa</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Notifications & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell size={18} /> Notifikasi
            </h3>
            {unreadNotifs.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">
                {unreadNotifs.length} baru
              </span>
            )}
          </div>
          <div className="space-y-3">
            {notifications.slice(0, 5).map(n => (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg ${n.read ? 'bg-gray-50 dark:bg-gray-700/50' : 'bg-primary-50 dark:bg-primary-900/20'}`}>
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  n.type === 'info' ? 'bg-blue-500' :
                  n.type === 'warning' ? 'bg-amber-500' :
                  n.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Clock size={18} /> Aktivitas Terbaru
          </h3>
          <div className="space-y-3">
            {auditLogs.slice(0, 5).map(log => (
              <div key={log.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    {log.userName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">{log.userName.split(',')[0]}</span>
                    {' '}{log.details.toLowerCase()}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {new Date(log.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
