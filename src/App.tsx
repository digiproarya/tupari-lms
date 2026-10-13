import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';

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
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/data-master" element={<DataMasterPage />} />
        <Route path="/perencanaan" element={<PerencanaanPage />} />
        <Route path="/materi" element={<MateriPage />} />
        <Route path="/tugas" element={<TugasPage />} />
        <Route path="/penilaian" element={<PenilaianPage />} />
        <Route path="/presensi" element={<PresensiPage />} />
        <Route path="/ujian" element={<UjianPage />} />
        <Route path="/siswa" element={<SiswaPage />} />
        <Route path="/laporan" element={<LaporanPage />} />
        <Route path="/integrasi" element={<IntegrasiPage />} />
        <Route path="/pengguna" element={<PenggunaPage />} />
        <Route path="/pengaturan" element={<PengaturanPage />} />
        <Route path="/audit" element={<AuditPage />} />
        <Route path="/cbt/exam/:id?" element={<CBTExamPage />} />
        <Route path="/cbt/analysis" element={<CBTAnalysisPage />} />
        <Route path="/telegram" element={<TelegramSettingsPage />} />
        <Route path="/ai-generator" element={<AIGeneratorPage />} />
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
