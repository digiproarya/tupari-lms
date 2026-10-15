import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserCheck, Download, Calendar, CheckCircle2, XCircle, AlertCircle, Loader2, Database, FileSpreadsheet, FileText, Save } from 'lucide-react';
import type { Student, Class, Attendance as AttendanceType } from '../types';
import { exportAttendanceToExcel, exportAttendanceToPDF } from '../utils/export';

export default function PresensiPage() {
  const { user, hasPermission } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Record<string, { status: string; note: string }>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.activeSchoolId) return;
      setLoading(true);
      try {
        const [studentsData, classesData] = await Promise.all([
          api.students.getAll(user.activeSchoolId) as Promise<Student[] | null>,
          api.classes.getAll(user.activeSchoolId) as Promise<Class[] | null>,
        ]);
        if (studentsData) setStudents(studentsData);
        if (classesData) {
          setClasses(classesData);
          if (classesData.length > 0 && !selectedClass) {
            setSelectedClass(classesData[0].id);
          }
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.activeSchoolId]);

  const classStudents = students.filter(s => s.classId === selectedClass);

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status, note: prev[studentId]?.note || '' }
    }));
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], note }
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || !user) return;
    
    setSaving(true);
    try {
      const records = classStudents.map(student => ({
        studentId: student.id,
        status: attendanceData[student.id]?.status || 'hadir',
        note: attendanceData[student.id]?.note || '',
        recordedBy: user.id
      }));
      
      await api.attendance.submit(selectedClass, selectedDate, records);
      alert('Presensi berhasil disimpan!');
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Gagal menyimpan presensi. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportExcel = () => {
    const data = classStudents.map(s => ({
      studentName: s.name,
      className: classes.find(c => c.id === selectedClass)?.name || '-',
      date: selectedDate,
      status: attendanceData[s.id]?.status || 'belum',
      note: attendanceData[s.id]?.note || '-',
    }));
    exportAttendanceToExcel(data);
  };

  const handleExportPDF = () => {
    const data = classStudents.map(s => ({
      studentName: s.name,
      className: classes.find(c => c.id === selectedClass)?.name || '-',
      date: selectedDate,
      status: attendanceData[s.id]?.status || 'belum',
      note: attendanceData[s.id]?.note || '-',
    }));
    const className = classes.find(c => c.id === selectedClass)?.name || 'Kelas';
    exportAttendanceToPDF(data, className, selectedDate);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Memuat presensi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Presensi</h1>
          <p className="text-gray-500 dark:text-gray-400">Catat dan rekap kehadiran siswa</p>
        </div>
        {hasPermission('report.export') && (
          <div className="flex gap-2">
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              <FileSpreadsheet size={18} /> Excel
            </button>
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
              <FileText size={18} /> PDF
            </button>
          </div>
        )}
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-400">
            ✅ Terhubung ke Google Sheets — {students.length} siswa, {classes.length} kelas
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
          <option value="">Pilih Kelas</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-700 dark:text-green-400">Hadir</span>
          </div>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">0</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={18} className="text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm text-yellow-700 dark:text-yellow-400">Sakit</span>
          </div>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">0</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-700 dark:text-blue-400">Izin</span>
          </div>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">0</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-1">
            <XCircle size={18} className="text-red-600 dark:text-red-400" />
            <span className="text-sm text-red-700 dark:text-red-400">Alpa</span>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">0</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Daftar Hadir — {classes.find(c => c.id === selectedClass)?.name || 'Pilih kelas'}
          </h3>
          {hasPermission('attendance.manage') && selectedClass && (
            <button 
              onClick={handleSaveAttendance}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50">
              <Save size={16} />
              {saving ? 'Menyimpan...' : 'Simpan Presensi'}
            </button>
          )}
        </div>
        {!selectedClass ? (
          <div className="p-12 text-center">
            <UserCheck size={48} className="mx-auto mb-4 text-gray-400 opacity-50" />
            <p className="text-gray-500 dark:text-gray-400">Pilih kelas untuk melihat daftar hadir</p>
          </div>
        ) : classStudents.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck size={48} className="mx-auto mb-4 text-gray-400 opacity-50" />
            <p className="text-gray-500 dark:text-gray-400">Belum ada siswa di kelas ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">No</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nama Siswa</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">NIS</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hadir</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sakit</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Izin</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Alpa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {classStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{student.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{student.nis}</td>
                    <td className="px-4 py-3 text-center">
                      <input 
                        type="radio" 
                        name={`att-${student.id}`} 
                        checked={attendanceData[student.id]?.status === 'hadir'}
                        onChange={() => handleAttendanceChange(student.id, 'hadir')}
                        className="w-4 h-4 text-green-600" 
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input 
                        type="radio" 
                        name={`att-${student.id}`} 
                        checked={attendanceData[student.id]?.status === 'sakit'}
                        onChange={() => handleAttendanceChange(student.id, 'sakit')}
                        className="w-4 h-4 text-yellow-600" 
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input 
                        type="radio" 
                        name={`att-${student.id}`} 
                        checked={attendanceData[student.id]?.status === 'izin'}
                        onChange={() => handleAttendanceChange(student.id, 'izin')}
                        className="w-4 h-4 text-blue-600" 
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input 
                        type="radio" 
                        name={`att-${student.id}`} 
                        checked={attendanceData[student.id]?.status === 'alpa'}
                        onChange={() => handleAttendanceChange(student.id, 'alpa')}
                        className="w-4 h-4 text-red-600" 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
