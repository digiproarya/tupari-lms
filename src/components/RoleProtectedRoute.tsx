import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

interface RoleProtectedRouteProps {
  allowedRoles: Role[];
  redirectTo?: string;
}

/**
 * Role-Based Route Protection
 * 
 * Mencegah akses halaman berdasarkan role pengguna.
 * Jika user tidak punya role yang diizinkan, redirect ke halaman lain.
 * 
 * PENTING: Ini adalah lapisan keamanan FRONTEND.
 * Backend GAS juga harus validasi role untuk setiap endpoint.
 */
export default function RoleProtectedRoute({ 
  allowedRoles, 
  redirectTo = '/dashboard' 
}: RoleProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  // Jika belum login, redirect ke login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Jika user tidak punya role yang diizinkan, redirect
  if (!user || !allowedRoles.includes(user.role as Role)) {
    // Optional: Log unauthorized access attempt
    console.warn(`Unauthorized access attempt: User ${user?.email} with role ${user?.role} tried to access protected route`);
    
    return <Navigate to={redirectTo} replace />;
  }

  // User punya akses, tampilkan halaman
  return <Outlet />;
}

/**
 * Role definitions untuk setiap halaman
 * 
 * PENTING: Daftar ini harus sinkron dengan:
 * 1. Sidebar.tsx (menu yang ditampilkan)
 * 2. Backend GAS (permission check di setiap endpoint)
 * 3. ROLE_PERMISSIONS di types/index.ts
 */
export const PAGE_ROLES: Record<string, Role[]> = {
  // Dashboard: semua role bisa akses
  '/dashboard': ['super_admin', 'admin_sekolah', 'kepala_sekolah', 'guru', 'siswa', 'operator'],
  
  // Data Master: Admin & Operator
  '/data-master': ['super_admin', 'admin_sekolah', 'kepala_sekolah', 'operator'],
  
  // Perencanaan: Guru & Admin
  '/perencanaan': ['super_admin', 'admin_sekolah', 'guru'],
  
  // Materi: Guru (kelola), Siswa (lihat)
  '/materi': ['super_admin', 'admin_sekolah', 'guru', 'siswa'],
  
  // Tugas: Guru (kelola), Siswa (kerjakan)
  '/tugas': ['super_admin', 'admin_sekolah', 'guru', 'siswa'],
  
  // Penilaian: Guru (input), Siswa (lihat nilai sendiri)
  '/penilaian': ['super_admin', 'admin_sekolah', 'guru', 'siswa'],
  
  // Presensi: Guru (catat), Siswa (lihat)
  '/presensi': ['super_admin', 'admin_sekolah', 'guru', 'siswa'],
  
  // Ujian: Guru (buat), Siswa (kerjakan)
  '/ujian': ['super_admin', 'admin_sekolah', 'guru', 'siswa'],
  
  // Siswa: Admin, Guru, Operator
  '/siswa': ['super_admin', 'admin_sekolah', 'kepala_sekolah', 'guru', 'operator'],
  
  // Laporan: Admin, Kepsek, Guru, Operator
  '/laporan': ['super_admin', 'admin_sekolah', 'kepala_sekolah', 'guru', 'operator'],
  
  // Integrasi: Admin only
  '/integrasi': ['super_admin', 'admin_sekolah'],
  
  // Pengguna & Akses: Admin only
  '/pengguna': ['super_admin', 'admin_sekolah'],
  
  // Pengaturan: Admin only
  '/pengaturan': ['super_admin', 'admin_sekolah'],
  
  // Audit: Admin & Kepsek
  '/audit': ['super_admin', 'admin_sekolah', 'kepala_sekolah'],
  
  // CBT Exam: Siswa saja (guru pakai /ujian)
  '/cbt/exam': ['siswa'],
  
  // CBT Analysis: Guru & Admin
  '/cbt/analysis': ['super_admin', 'admin_sekolah', 'guru'],
  
  // Telegram: Admin & Guru
  '/telegram': ['super_admin', 'admin_sekolah', 'guru'],
  
  // AI Generator: Admin & Guru
  '/ai-generator': ['super_admin', 'admin_sekolah', 'guru'],
};
