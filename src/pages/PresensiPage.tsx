import React, { useState } from 'react';
import { attendance, students, classes, subjects } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Download, Calendar, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function PresensiPage() {
  const { user, hasPermission } = useAuth();
  const [selectedClass, setSelectedClass] = useState('c1');
  const [selectedDate, setSelectedDate] = useState('2025-02-18');

  const classStudents = students.filter(s => s.classId === selectedClass);
  const dayAttendance = attendance.filter(a => a.classId === selectedClass && a.date === selectedDate);

  const getStudentAttendance = (studentId: string) => {
    return dayAttendance.find(a => a.studentId === studentId);
  };

  const stats = {
    hadir: dayAttendance.filter(a => a.status === 'hadir').length,
    sakit: dayAttendance.filter(a => a.status === 'sakit').length,
    izin: dayAttendance.filter(a => a.status === 'izin').length,
    alpa: dayAttendance.filter(a => a.status === 'alpa').length,
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Presensi</h1>
          <p className="text-gray-500 dark:text-gray-400">Catat dan rekap kehadiran siswa</p>
        </div>
        {hasPermission('report.export') && (
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              <Download size={18} /> Ekspor Excel
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <Download size={18} /> PDF
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-700 dark:text-green-400">Hadir</span>
          </div>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.hadir}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={18} className="text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm text-yellow-700 dark:text-yellow-400">Sakit</span>
          </div>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.sakit}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-700 dark:text-blue-400">Izin</span>
          </div>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.izin}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-1">
            <XCircle size={18} className="text-red-600 dark:text-red-400" />
            <span className="text-sm text-red-700 dark:text-red-400">Alpa</span>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.alpa}</p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Daftar Hadir — {classes.find(c => c.id === selectedClass)?.name} — {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </h3>
          {hasPermission('attendance.manage') && (
            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm transition-colors">
              Simpan Presensi
            </button>
          )}
        </div>
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {classStudents.map((student, idx) => {
                const att = getStudentAttendance(student.id);
                return (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{student.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{student.nis}</td>
                    <td className="px-4 py-3 text-center">
                      <input type="radio" name={`att-${student.id}`} defaultChecked={att?.status === 'hadir'} className="w-4 h-4 text-green-600" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input type="radio" name={`att-${student.id}`} defaultChecked={att?.status === 'sakit'} className="w-4 h-4 text-yellow-600" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input type="radio" name={`att-${student.id}`} defaultChecked={att?.status === 'izin'} className="w-4 h-4 text-blue-600" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input type="radio" name={`att-${student.id}`} defaultChecked={att?.status === 'alpa'} className="w-4 h-4 text-red-600" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="text" defaultValue={att?.note || ''} placeholder="Keterangan..."
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
