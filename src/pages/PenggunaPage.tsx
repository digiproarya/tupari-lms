import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Plus, Search, Edit2, Trash2, Eye, UserCheck, UserX } from 'lucide-react';

export default function PenggunaPage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengguna & Hak Akses</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola pengguna, role, dan permission</p>
        </div>
        {hasPermission('user.create') && (
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
            <Plus size={18} /> Tambah Pengguna
          </button>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
        <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
          <Shield size={18} /> Permission Matrix
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {['Super Admin', 'Admin Sekolah', 'Kepala Sekolah', 'Guru', 'Siswa', 'Operator'].map(role => (
            <div key={role} className="bg-white dark:bg-gray-800 rounded-lg p-2 text-center">
              <p className="font-medium text-gray-900 dark:text-white mb-1">{role}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari pengguna..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
          <option value="all">Semua Role</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin_sekolah">Admin Sekolah</option>
          <option value="guru">Guru</option>
          <option value="siswa">Siswa</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
        <Shield size={48} className="mx-auto mb-4 text-gray-400 opacity-50" />
        <p className="text-gray-500 dark:text-gray-400">Data pengguna akan muncul setelah terhubung ke backend</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Tambahkan data pengguna di sheet USERS</p>
      </div>
    </div>
  );
}
