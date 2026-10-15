import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Database, BookOpen, FileText, ClipboardList,
  BarChart3, Users, UserCheck, GraduationCap, FileBarChart,
  Link2, Shield, Settings, Activity, LogOut, ChevronLeft,
  ChevronRight, Menu, School, Bell, Sparkles, HelpCircle, ClipboardCheck, Home
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
  badge?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', roles: ['super_admin', 'admin_sekolah', 'kepala_sekolah', 'guru', 'siswa', 'operator'] },
  { id: 'ai-generator', label: 'AI Generator', icon: <Sparkles size={20} />, path: '/ai-generator', roles: ['super_admin', 'admin_sekolah', 'guru'], badge: '✨' },
  { id: 'content-studio', label: 'Content Studio', icon: <BookOpen size={20} />, path: '/content-studio', roles: ['super_admin', 'admin_sekolah', 'guru'], badge: 'NEW' },
  { id: 'data-master', label: 'Data Master', icon: <Database size={20} />, path: '/data-master', roles: ['super_admin', 'admin_sekolah', 'kepala_sekolah', 'operator'] },
  { id: 'perencanaan', label: 'Perencanaan', icon: <BookOpen size={20} />, path: '/perencanaan', roles: ['super_admin', 'admin_sekolah', 'guru'] },
  { id: 'materi', label: 'Materi', icon: <FileText size={20} />, path: '/materi', roles: ['super_admin', 'admin_sekolah', 'guru', 'siswa'] },
  { id: 'tugas', label: 'Tugas', icon: <ClipboardList size={20} />, path: '/tugas', roles: ['super_admin', 'admin_sekolah', 'guru', 'siswa'] },
  { id: 'penilaian', label: 'Penilaian', icon: <BarChart3 size={20} />, path: '/penilaian', roles: ['super_admin', 'admin_sekolah', 'guru', 'siswa'] },
  { id: 'presensi', label: 'Presensi', icon: <UserCheck size={20} />, path: '/presensi', roles: ['super_admin', 'admin_sekolah', 'guru', 'siswa'] },
  { id: 'ujian', label: 'Ujian Online', icon: <GraduationCap size={20} />, path: '/ujian', roles: ['super_admin', 'admin_sekolah', 'guru', 'siswa'] },
  { id: 'cbt-exam', label: 'Kerjakan Ujian', icon: <GraduationCap size={20} />, path: '/cbt/exam', roles: ['siswa'] },
  { id: 'cbt-analysis', label: 'Analisis Soal', icon: <BarChart3 size={20} />, path: '/cbt/analysis', roles: ['super_admin', 'admin_sekolah', 'guru'] },
  { id: 'bank-soal', label: 'Bank Soal', icon: <HelpCircle size={20} />, path: '/bank-soal', roles: ['super_admin', 'admin_sekolah', 'guru'] },
  { id: 'rubrik', label: 'Rubrik Penilaian', icon: <ClipboardCheck size={20} />, path: '/rubrik', roles: ['super_admin', 'admin_sekolah', 'guru'] },
  { id: 'portal', label: 'Portal Siswa', icon: <Home size={20} />, path: '/portal', roles: ['siswa'] },
  { id: 'telegram', label: 'Telegram Bot', icon: <Link2 size={20} />, path: '/telegram', roles: ['super_admin', 'admin_sekolah', 'guru'] },
  { id: 'siswa', label: 'Siswa', icon: <Users size={20} />, path: '/siswa', roles: ['super_admin', 'admin_sekolah', 'kepala_sekolah', 'guru', 'operator'] },
  { id: 'laporan', label: 'Laporan', icon: <FileBarChart size={20} />, path: '/laporan', roles: ['super_admin', 'admin_sekolah', 'kepala_sekolah', 'guru', 'operator'] },
  { id: 'integrasi', label: 'Integrasi', icon: <Link2 size={20} />, path: '/integrasi', roles: ['super_admin', 'admin_sekolah'] },
  { id: 'pengguna', label: 'Pengguna & Akses', icon: <Shield size={20} />, path: '/pengguna', roles: ['super_admin', 'admin_sekolah'] },
  { id: 'pengaturan', label: 'Pengaturan', icon: <Settings size={20} />, path: '/pengaturan', roles: ['super_admin', 'admin_sekolah'] },
  { id: 'audit', label: 'Audit Aktivitas', icon: <Activity size={20} />, path: '/audit', roles: ['super_admin', 'admin_sekolah', 'kepala_sekolah'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const filteredNav = navItems.filter(item => item.roles.includes(user.role));

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-50 transition-all duration-300
        ${collapsed ? 'w-[70px]' : 'w-[260px]'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
        flex flex-col shadow-lg
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 h-16">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
            <School size={20} className="text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-sm text-gray-900 dark:text-white whitespace-nowrap">TUPARI LMS</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Teacher OS</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex ml-auto p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* School info */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">Sekolah Aktif</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">SD Negeri 1 Tupari</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {filteredNav.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.path)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all
                ${location.pathname.startsWith(item.path)
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && (
                <span className="text-sm flex-1 text-left">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="px-1.5 py-0.5 text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User info & logout */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3">
          {!collapsed && (
            <div className="flex items-center gap-3 mb-2 px-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  {user.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={20} />
            {!collapsed && <span className="text-sm">Keluar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
