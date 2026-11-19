import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { School, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [gasUrl, setGasUrl] = useState(() => localStorage.getItem('tupari_gas_url') || (import.meta as any).env?.VITE_GAS_URL || '');
  const [checking, setChecking] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Email dan password wajib diisi');
      return;
    }

    if (!gasUrl.trim()) { setError('Alamat LMS (Google Apps Script Web App) wajib diisi.'); return; }
    try { const parsed=new URL(gasUrl.trim()); if(parsed.protocol!=='https:'||!parsed.hostname.endsWith('google.com')||!parsed.pathname.includes('/macros/s/')) {setError('Alamat harus berupa URL Web App Google Apps Script.');return;} localStorage.setItem('tupari_gas_url',parsed.toString()); } catch {setError('URL LMS tidak valid.');return;}
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Email atau password salah.');
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg mb-4">
            <School size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher OS</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">TUPARI Learning Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Masuk ke Akun Anda</h2>
          
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertCircle size={18} className="text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Alamat LMS / Backend (Google Apps Script)</label>
              <input type="url" value={gasUrl} onChange={e=>{setGasUrl(e.target.value);setConnectionMessage('');}} placeholder="https://script.google.com/macros/s/.../exec" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" required />
              <button type="button" disabled={checking||!gasUrl.trim()} onClick={async()=>{setChecking(true);setConnectionMessage('');try{const u=new URL(gasUrl.trim());if(u.protocol!=='https:'||!u.hostname.endsWith('google.com')||!u.pathname.includes('/macros/s/'))throw new Error('URL bukan Web App Google Apps Script.');localStorage.setItem('tupari_gas_url',u.toString());const res=await fetch(u.toString()+(u.search?'&':'?')+'action=health');const data=await res.json();setConnectionMessage(data?.success?'✓ Backend terhubung.':'Backend merespons, health check gagal.');}catch(err){setConnectionMessage(err instanceof Error?err.message:'Koneksi gagal. Periksa URL dan deployment.');}finally{setChecking(false);}}} className="mt-2 text-xs text-primary-600 hover:underline disabled:opacity-50">{checking?'Memeriksa koneksi…':'Tes koneksi LMS'}</button>
              {connectionMessage&&<p className="text-xs mt-1 text-gray-600 dark:text-gray-300">{connectionMessage}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@tupari.id"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Memproses...
                </>
              ) : 'Masuk'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"><p className="text-xs text-gray-500 dark:text-gray-400 text-center">Gunakan alamat LMS sekolah Anda dan akun yang diberikan administrator.</p></div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          © 2025 TUPARI LMS. Platform Pembelajaran Digital.
        </p>
      </div>
    </div>
  );
}
