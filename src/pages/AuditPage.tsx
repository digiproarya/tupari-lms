import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Search, Download, Loader2 } from 'lucide-react';

export default function AuditPage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('all');

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Aktivitas</h1>
          <p className="text-gray-500 dark:text-gray-400">Pantau seluruh aktivitas dalam sistem</p>
        </div>
        {hasPermission('report.export') && (
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download size={18} /> Ekspor Log
          </button>
        )}
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
        <p className="text-sm text-yellow-800 dark:text-yellow-400">
          ⚠️ Fitur audit log akan aktif setelah backend GAS terhubung sepenuhnya
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari aktivitas..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <select value={filterModule} onChange={e => setFilterModule(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
          <option value="all">Semua Modul</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
        <Activity size={48} className="mx-auto mb-4 text-gray-400 opacity-50" />
        <p className="text-gray-500 dark:text-gray-400">Belum ada aktivitas tercatat</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Aktivitas akan muncul setelah sistem digunakan</p>
      </div>
    </div>
  );
}
