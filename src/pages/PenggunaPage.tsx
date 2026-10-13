import React, { useState } from 'react';
import { users, schools } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { Shield, Plus, Search, Edit2, Trash2, Eye, UserCheck, UserX } from 'lucide-react';

export default function PenggunaPage() {
  const { user, hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      super_admin: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      admin_sekolah: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      kepala_sekolah: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      guru: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      siswa: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      operator: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    };
    const labels: Record<string, string> = {
      super_admin: 'Super Admin', admin_sekolah: 'Admin Sekolah', kepala_sekolah: 'Kepala Sekolah',
      guru: 'Guru', siswa: 'Siswa', operator: 'Operator',
    };
    return <span className={`px-2 py-0.5 text-xs rounded-full ${styles[role] || ''}`}>{labels[role] || role}</span>;
  };

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

      {/* Permission Matrix Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
        <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
          <Shield size={18} /> Permission Matrix
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {['Super Admin', 'Admin Sekolah', 'Kepala Sekolah', 'Guru', 'Siswa', 'Operator'].map(role => (
            <div key={role} className="bg-white dark:bg-gray-800 rounded-lg p-2 text-center">
              <p className="font-medium text-gray-900 dark:text-white mb-1">{role}</p>
              <p className="text-gray-500 dark:text-gray-400">
                {role === 'Super Admin' ? '18 izin' : role === 'Admin Sekolah' ? '15 izin' : role === 'Kepala Sekolah' ? '7 izin' : role === 'Guru' ? '8 izin' : role === 'Siswa' ? '2 izin' : '5 izin'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
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
          <option value="kepala_sekolah">Kepala Sekolah</option>
          <option value="guru">Guru</option>
          <option value="siswa">Siswa</option>
          <option value="operator">Operator</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nama</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sekolah</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary-700 dark:text-primary-300">{u.name.charAt(0)}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{u.email}</td>
                  <td className="px-4 py-3">{getRoleBadge(u.role)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {u.schoolIds.map(id => schools.find(s => s.id === id)?.name).join(', ')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 text-xs ${u.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {u.status === 'active' ? <UserCheck size={14} /> : <UserX size={14} />}
                      {u.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><Eye size={14} /></button>
                      {hasPermission('user.update') && <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500"><Edit2 size={14} /></button>}
                      {hasPermission('user.delete') && u.role !== 'super_admin' && <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"><Trash2 size={14} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
