import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileBarChart, Download } from 'lucide-react';

export default function LaporanPage() {
  const { hasPermission } = useAuth();
  const [reportType, setReportType] = useState('nilai');

  const reportTypes = [
    { id: 'nilai', label: 'Rekap Nilai' },
    { id: 'presensi', label: 'Rekap Presensi' },
    { id: 'siswa', label: 'Data Siswa' },
    { id: 'kelas', label: 'Data Kelas' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Laporan</h1>
          <p className="text-gray-500 dark:text-gray-400">Analisis dan ekspor data pembelajaran</p>
        </div>
        {hasPermission('report.export') && (
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
              <Download size={18} /> Ekspor Excel
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
              <Download size={18} /> Ekspor PDF
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {reportTypes.map(rt => (
          <button key={rt.id} onClick={() => setReportType(rt.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              reportType === rt.id ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}>
            {rt.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
        <FileBarChart size={48} className="mx-auto mb-4 text-gray-400 opacity-50" />
        <p className="text-gray-500 dark:text-gray-400">Laporan akan muncul setelah data tersedia</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Tambahkan data siswa, nilai, dan presensi di Google Sheets</p>
      </div>
    </div>
  );
}
