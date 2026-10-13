import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link2, Database, HardDrive, FileSpreadsheet, FolderOpen, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function IntegrasiPage() {
  const { hasPermission } = useAuth();

  const integrations = [
    {
      id: 'sheets',
      name: 'Google Sheets',
      description: 'Database utama untuk menyimpan data siswa, kelas, nilai, presensi, dan seluruh data operasional.',
      icon: <FileSpreadsheet size={24} className="text-green-600" />,
      status: 'connected',
      details: 'Spreadsheet ID: 1ABC...xyz',
      lastSync: '2025-02-18 10:30',
    },
    {
      id: 'drive',
      name: 'Google Drive',
      description: 'Penyimpanan berkas untuk materi, lampiran tugas, dokumen perencanaan, dan hasil ekspor.',
      icon: <FolderOpen size={24} className="text-yellow-600" />,
      status: 'connected',
      details: 'Folder ID: 1DEF...uvw',
      lastSync: '2025-02-18 09:15',
    },
    {
      id: 'gas',
      name: 'Google Apps Script',
      description: 'Backend API yang menangani logika bisnis, autentikasi, dan operasi database.',
      icon: <Database size={24} className="text-blue-600" />,
      status: 'connected',
      details: 'Deployment ID: AKfycb...123',
      lastSync: '2025-02-18 10:30',
    },
  ];

  const sheetStructure = [
    { name: 'PERIODE_AKTIF', rows: 2, description: 'Data periode akademik' },
    { name: 'SISWA', rows: 12, description: 'Data siswa' },
    { name: 'KELAS', rows: 5, description: 'Data kelas/rombel' },
    { name: 'MATERI', rows: 5, description: 'Materi pembelajaran' },
    { name: 'TUGAS', rows: 3, description: 'Data tugas' },
    { name: 'UJIAN', rows: 2, description: 'Data ujian' },
    { name: 'NILAI', rows: 8, description: 'Data nilai' },
    { name: 'KEHADIRAN', rows: 10, description: 'Data presensi' },
    { name: 'BANK_SOAL', rows: 5, description: 'Bank soal ujian' },
    { name: 'SYSTEM_LOG', rows: 6, description: 'Log aktivitas sistem' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Integrasi</h1>
        <p className="text-gray-500 dark:text-gray-400">Kelola koneksi ke layanan Google dan pantau status integrasi</p>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {integrations.map(intg => (
          <div key={intg.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                {intg.icon}
              </div>
              <span className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${
                intg.status === 'connected' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                {intg.status === 'connected' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                {intg.status === 'connected' ? 'Terhubung' : 'Error'}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{intg.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{intg.description}</p>
            <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
              <p className="font-mono truncate">{intg.details}</p>
              <p>Sinkronisasi terakhir: {intg.lastSync}</p>
            </div>
            {hasPermission('settings.manage') && (
              <button className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                <RefreshCw size={14} /> Sinkronisasi Ulang
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Sheet Structure */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet size={18} /> Struktur Spreadsheet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Daftar sheet dan jumlah baris data saat ini</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nama Sheet</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Deskripsi</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Jumlah Baris</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sheetStructure.map(sheet => (
                <tr key={sheet.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900 dark:text-white">{sheet.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{sheet.description}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-300">{sheet.rows}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Aktif</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* API Endpoints */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mt-6">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Link2 size={18} /> Endpoint API (Google Apps Script)
        </h3>
        <div className="space-y-2">
          {[
            { method: 'POST', path: '/doPost?action=login', desc: 'Autentikasi pengguna' },
            { method: 'GET', path: '/doGet?action=getStudents&schoolId=xxx', desc: 'Ambil data siswa' },
            { method: 'POST', path: '/doPost?action=createAssignment', desc: 'Buat tugas baru' },
            { method: 'POST', path: '/doPost?action=submitAttendance', desc: 'Simpan presensi' },
            { method: 'GET', path: '/doGet?action=getGrades&classId=xxx', desc: 'Ambil data nilai' },
            { method: 'POST', path: '/doPost?action=submitExam', desc: 'Kirim jawaban ujian' },
          ].map((ep, i) => (
            <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded ${
                ep.method === 'GET' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              }`}>{ep.method}</span>
              <code className="text-sm text-gray-700 dark:text-gray-300 font-mono flex-1 truncate">{ep.path}</code>
              <span className="text-xs text-gray-500 dark:text-gray-400">{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
