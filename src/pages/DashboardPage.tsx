import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Users, BookOpen, ClipboardList, GraduationCap, UserCheck, TrendingUp, Bell, Clock, CheckCircle2, BarChart3, FileText, Loader2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Student, Class, Material, Assignment, Exam, Attendance, Grade } from '../types';

export default function DashboardPage() {
  const { user } = useAuth();
  
  // State untuk data real dari API
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data dari API
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.activeSchoolId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch data secara paralel
        const [studentsData, classesData] = await Promise.all([
          api.students.getAll(user.activeSchoolId) as Promise<Student[] | null>,
          api.classes.getAll(user.activeSchoolId) as Promise<Class[] | null>,
        ]);
        
        if (studentsData) setStudents(studentsData);
        if (classesData) setClasses(classesData);
        
        // Note: materials, assignments, exams akan ditambahkan setelah endpoint tersedia di backend
        // Untuk sekarang, gunakan array kosong
        setMaterials([]);
        setAssignments([]);
      } catch (err) {
        console.error('Error fetching dashboard ', err);
        setError('Gagal memuat data dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user?.activeSchoolId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 dark:text-white font-medium mb-2">Gagal Memuat Dashboard</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
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

  if (!user) return null;

  // Calculate stats dari data real
  const totalStudents = students.length;
  const totalClasses = classes.length;
  const totalMaterials = materials.length;
  const activeAssignments = assignments.filter(a => a.status === 'active').length;
  
  // Attendance stats (placeholder - akan diisi setelah attendance API siap)
  const hadirCount = 0;
  const sakitCount = 0;
  const izinCount = 0;
  const alpaCount = 0;

  // Grade distribution (placeholder)
  const gradeDistribution = [
    { name: '≥90', value: 0, color: '#22c55e' },
    { name: '80-89', value: 0, color: '#3b82f6' },
    { name: '70-79', value: 0, color: '#f59e0b' },
    { name: '<70', value: 0, color: '#ef4444' },
  ];

  // Weekly activity (placeholder)
  const weeklyActivity = [
    { day: 'Sen', materi: 0, tugas: 0, ujian: 0 },
    { day: 'Sel', materi: 0, tugas: 0, ujian: 0 },
    { day: 'Rab', materi: 0, tugas: 0, ujian: 0 },
    { day: 'Kam', materi: 0, tugas: 0, ujian: 0 },
    { day: 'Jum', materi: 0, tugas: 0, ujian: 0 },
    { day: 'Sab', materi: 0, tugas: 0, ujian: 0 },
  ];

  const statCards = [
    { label: 'Total Siswa', value: totalStudents, icon: <Users size={22} />, color: 'bg-blue-500', trend: `${totalStudents} siswa aktif` },
    { label: 'Total Kelas', value: totalClasses, icon: <BookOpen size={22} />, color: 'bg-emerald-500', trend: `${totalClasses} rombel` },
    { label: 'Materi Aktif', value: totalMaterials, icon: <FileText size={22} />, color: 'bg-purple-500', trend: 'dari Google Sheets' },
    { label: 'Tugas Aktif', value: activeAssignments, icon: <ClipboardList size={22} />, color: 'bg-amber-500', trend: 'perlu ditindaklanjuti' },
    { label: 'Ujian Aktif', value: 0, icon: <GraduationCap size={22} />, color: 'bg-rose-500', trend: 'minggu ini' },
    { label: 'Kehadiran', value: '—', icon: <UserCheck size={22} />, color: 'bg-teal-500', trend: 'data presensi' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Selamat Datang, {user.name.split(',')[0]} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Dashboard dengan data real dari Google Sheets Anda
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

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-1">Data Terhubung ke Google Sheets</h3>
            <p className="text-sm text-blue-800 dark:text-blue-400">
              Dashboard ini menampilkan data real dari Google Sheets Anda. 
              Total {totalStudents} siswa dan {totalClasses} kelas terdeteksi.
            </p>
          </div>
        </div>
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

      {/* Attendance Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rekap Presensi Hari Ini</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
  );
}
