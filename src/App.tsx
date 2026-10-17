import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import RoleProtectedRoute from './components/RoleProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DataMasterPage from './pages/DataMasterPage';
import MateriPage from './pages/MateriPage';
import TugasPage from './pages/TugasPage';
import PenilaianPage from './pages/PenilaianPage';
import PresensiPage from './pages/PresensiPage';
import UjianPage from './pages/UjianPage';
import SiswaPage from './pages/SiswaPage';
import LaporanPage from './pages/LaporanPage';
import PenggunaPage from './pages/PenggunaPage';
import PengaturanPage from './pages/PengaturanPage';
import AuditPage from './pages/AuditPage';
import PerencanaanPage from './pages/PerencanaanPage';
import IntegrasiPage from './pages/IntegrasiPage';
import CBTExamPage from './pages/CBTExamPage';
import CBTAnalysisPage from './pages/CBTAnalysisPage';
import TelegramSettingsPage from './pages/TelegramSettingsPage';
import AIGeneratorPage from './pages/AIGeneratorPage';
import BankSoalPage from './pages/BankSoalPage';
import RubrikPage from './pages/RubrikPage';
import StudentPortalPage from './pages/StudentPortalPage';
import ContentStudioPage from './pages/ContentStudioPage';

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="lg:ml-[260px] min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
      } />
      
      {/* Dashboard - Semua role bisa akses */}
      <Route element={<ProtectedLayout />}>
        <Route element={<RoleProtectedRoute allowedRoles={['super_admin', 'admin_sekolah', 'kepala_sekolah', 'guru', 'siswa', 'operator']} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        {/* Data Master - Admin, Kepsek, Operator */}
        <Route element={<RoleProtectedRoute allowedRoles={['super_admin', 'admin_sekolah', 'kepala_sekolah', 'operator']} />}>
          <Route path="/data-master" element={<DataMasterPage />} />
        </Route>

        {/* Perencanaan - Admin, Guru */}
        <Route element={<RoleProtectedRoute allowedRoles={['super_admin', 'admin_sekolah', 'guru']} />}>
          <Route path="/perencanaan" element={<PerencanaanPage />} />
        </Route>

        {/* Materi - Admin, Guru, Siswa */}
        <Route element={<RoleProtectedRoute allowedRoles={['super_admin', 'admin_sekolah', 'guru', 'siswa']} />}>
          <Route path="/materi" element={<MateriPage />} />
        </Route>

        {/* Tugas - Admin, Guru, Siswa */}
        <Route element={<RoleProtectedRoute allowedRoles={['super_admin', 'admin_sekolah', 'guru', 'siswa']} />}>
          <Route path="/tugas" element={<TugasPage />} />
        </Route>

        {/* Penilaian - Admin, Guru, Siswa */}
        <Route element={<RoleProtectedRoute allowedRoles={['super_admin', 'admin_sekolah', 'guru', 'siswa']} />}>
          <Route path="/penilaian" element={<PenilaianPage />} />
        </Route>

        {/* Presensi - Admin, Guru, Siswa */}
        <Route element={<RoleProtectedRoute allowedRoles={['super_admin', 'admin_sekolah', 'guru', 'siswa']} />}>
          <Route path="/presensi" element={<PresensiPage />} />
        </Route>

        {/* Ujian - Admin, Guru, Siswa */}
        <Route element={<RoleProtectedRoute allowedRoles={['super_admin', 'admin_sekolah', 'guru', 'siswa']} />}>
          <Route path="/ujian" element={<UjianPage />} />
        </Route>

        {/* Siswa - Admin, Kepsek, Guru, Operator */}
        <Route element={<RoleProtectedRoute allowedRoles={['super_admin', 'admin_sekolah', 'kepala_sekolah', 'guru', 'operator']} />}>
          <Route path="/siswa" element={<SiswaPage />} />
        </Route>

        {/* Laporan - Admin, Kepsek, Guru, Operator */}
        <Route element={<RoleProtectedRoute allowedRoles={['super_admin', 'admin_sekolah', 'kepala_sekolah', 'guru', 'operator']} />}>
          <Route path="/laporan" element={<LaporanPage />} />
        </Route>

        {/* Integrasi - Admin only */}
        <Route element={<RoleProtectedRoute allowedRoles={['super_admin', 'admin_sekolah']} />}>
          <Route path="/integrasi" element={<IntegrasiPage />} />
        </Route>

        {/* Pengguna & Akses - Admin only */}
        <Route element={<RoleProtectedRoute allowedRoles={['super_admin', 'admin_sekolah']} />}>
          <Route path="/pengguna" element={<PenggunaPage />} />
        </Route>

        {/* Pengaturan - Admin only */}
        <Route element={<RoleProtectedRoute allowedRoles={['super_admin', 'admin_sekolah']} />}>
          <Route path="/pengaturan" element={<PengaturanPage />} />
        </Route>

        {/* Audit - Admin, Kepsek */}
        <Route element={<RoleProtectedRoute allowedRoles={['super_admin', 'admin_sekolah', 'kepala_sekolah']} />}>
          <Route path="/audit" element={<AuditPage />} />
        </Route>

        {/* CBT Exam - Siswa only */}
        <Route element={<RoleProtectedRoute allowedRoles={['siswa']} />}>
          <Route path="/cbt/exam/:id?" element={<CBTExamPage />} />
        </Route>

        {/* CBT Analysis - Admin, Guru */}
        <Route element={<RoleProtectedRoute allowedRoles={['super_admin', 'admin_sekolah', 'guru']} />}>
          <Route path="/cbt/analysis" element={<CBTAnalysisPage />} />
        </Route>

        {/* Telegram - Admin, Guru */}
        <Route element={<RoleProtectedRoute allowedRoles={['super_admin', 'admin_sekolah', 'guru']} />}>
          <Route path="/telegram" element={<TelegramSettingsPage />} />
        </Route>

        {/* AI Generator - Admin, Guru */}
        <Route element={<RoleProtectedRoute allowedRoles={['super_admin', 'admin_sekolah', 'guru']} />}>
          <Route path="/ai-generator" element={<AIGeneratorPage />} />
        </Route>

        {/* Content Studio - Admin, Guru */}
        <Route element={<RoleProtectedRoute allowedRoles={['super_admin', 'admin_sekolah', 'guru']} />}>
          <Route path="/content-studio" element={<ContentStudioPage />} />
        </Route>

        {/* Bank Soal - Admin, Guru */}
        <Route element={<RoleProtectedRoute allowedRoles={['super_admin', 'admin_sekolah', 'guru']} />}>
          <Route path="/bank-soal" element={<BankSoalPage />} />
        </Route>

        {/* Rubrik Penilaian - Admin, Guru */}
        <Route element={<RoleProtectedRoute allowedRoles={['super_admin', 'admin_sekolah', 'guru']} />}>
          <Route path="/rubrik" element={<RubrikPage />} />
        </Route>

        {/* Portal Siswa - Siswa only */}
        <Route element={<RoleProtectedRoute allowedRoles={['siswa']} />}>
          <Route path="/portal" element={<StudentPortalPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  );
}
