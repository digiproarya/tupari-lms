/**
 * Telegram Settings Page - Setup Bot & Notifikasi ke Siswa
 * 
 * Fitur:
 * ✅ Setup Telegram Bot token
 * ✅ Link akun Telegram siswa
 * ✅ Template notifikasi
 * ✅ Broadcast ke kelas
 * ✅ Test kirim pesan
 * ✅ Riwayat notifikasi terkirim
 */

import React, { useState } from 'react';
import { Send, Bot, Users, MessageSquare, Bell, CheckCircle2, AlertCircle, Copy, Eye, Trash2, Plus, Settings } from 'lucide-react';

export default function TelegramSettingsPage() {
  const [activeTab, setActiveTab] = useState<'setup' | 'templates' | 'broadcast' | 'history'>('setup');
  const [botToken, setBotToken] = useState('');
  const [botUsername, setBotUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  // Demo data
  const linkedStudents = [
    { id: 'st1', name: 'Rizki Pratama', class: '4A', telegramId: '@rizki_p', linkedAt: '2025-02-15', status: 'active' },
    { id: 'st2', name: 'Anisa Putri', class: '4A', telegramId: '@anisa_p', linkedAt: '2025-02-16', status: 'active' },
    { id: 'st3', name: 'Bima Sakti', class: '4A', telegramId: '@bima_s', linkedAt: '2025-02-17', status: 'active' },
    { id: 'st4', name: 'Citra Dewi', class: '4A', telegramId: '', linkedAt: '', status: 'not_linked' },
    { id: 'st5', name: 'Dimas Arya', class: '4B', telegramId: '@dimas_a', linkedAt: '2025-02-18', status: 'active' },
  ];

  const templates = [
    { id: 't1', name: 'Tugas Baru', event: 'assignment_created', message: '📚 <b>Tugas Baru!</b>\n\n{assignment_title}\nMapel: {subject}\nKelas: {class}\nTenggat: {due_date}\n\nKerjakan segera ya!', enabled: true },
    { id: 't2', name: 'Pengingat Tenggat', event: 'assignment_reminder', message: '⏰ <b>Pengingat!</b>\n\nTugas "{assignment_title}" tenggat besok.\nJangan lupa dikumpulkan!', enabled: true },
    { id: 't3', name: 'Nilai Dipublikasi', event: 'grade_published', message: '📊 <b>Nilai Baru!</b>\n\nNilai {grade_type} untuk {subject} telah dipublikasi.\nNilai Anda: {score}/{max_score}\n\n{feedback}', enabled: true },
    { id: 't4', name: 'Ujian Dimulai', event: 'exam_started', message: '📝 <b>Ujian Dimulai!</b>\n\n{exam_title}\nDurasi: {duration} menit\nToken: {token}\n\nSegera kerjakan!', enabled: true },
    { id: 't5', name: 'Pengumuman', event: 'announcement', message: '📢 <b>Pengumuman</b>\n\n{message}\n\n- {teacher_name}', enabled: true },
  ];

  const broadcastHistory = [
    { id: 'b1', template: 'Tugas Baru', class: '4A', recipients: 28, sent: 28, failed: 0, timestamp: '2025-02-18 10:30' },
    { id: 'b2', template: 'Pengingat Tenggat', class: '4A', recipients: 5, sent: 5, failed: 0, timestamp: '2025-02-19 08:00' },
    { id: 'b3', template: 'Nilai Dipublikasi', class: '4B', recipients: 25, sent: 24, failed: 1, timestamp: '2025-02-20 14:15' },
  ];

  const tabs = [
    { id: 'setup', label: 'Setup Bot', icon: <Bot size={16} /> },
    { id: 'templates', label: 'Template', icon: <MessageSquare size={16} /> },
    { id: 'broadcast', label: 'Broadcast', icon: <Send size={16} /> },
    { id: 'history', label: 'Riwayat', icon: <Bell size={16} /> },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Integrasi Telegram</h1>
          <p className="text-gray-500 dark:text-gray-400">Kirim notifikasi otomatis ke siswa via Telegram</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
            isConnected ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}>
            {isConnected ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {isConnected ? 'Bot Terhubung' : 'Belum Terhubung'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Setup Tab */}
      {activeTab === 'setup' && (
        <div className="space-y-6">
          {/* Bot Setup */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Bot size={20} /> Setup Telegram Bot
            </h3>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Cara Membuat Bot:</h4>
              <ol className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
                <li>Buka Telegram dan cari <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">@BotFather</code></li>
                <li>Kirim perintah <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">/newbot</code></li>
                <li>Ikuti instruksi untuk memberi nama bot</li>
                <li>Copy token yang diberikan BotFather</li>
                <li>Paste token di bawah ini</li>
              </ol>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bot Token</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={botToken}
                    onChange={e => setBotToken(e.target.value)}
                    placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  />
                  <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
                    Test Koneksi
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bot Username (opsional)</label>
                <input
                  type="text"
                  value={botUsername}
                  onChange={e => setBotUsername(e.target.value)}
                  placeholder="@tupari_lms_bot"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <button 
                onClick={() => setIsConnected(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                <CheckCircle2 size={16} /> Simpan & Hubungkan
              </button>
            </div>
          </div>

          {/* Linked Students */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Users size={20} /> Akun Telegram Siswa
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {linkedStudents.filter(s => s.status === 'active').length}/{linkedStudents.length} terhubung
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nama</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kelas</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Telegram</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {linkedStudents.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{s.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{s.class}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 font-mono">{s.telegramId || '—'}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          s.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {s.status === 'active' ? 'Terhubung' : 'Belum'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Cara Siswa Menghubungkan Akun:</h4>
              <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                <li>Siswa buka Telegram dan cari bot Anda</li>
                <li>Kirim perintah <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">/start</code></li>
                <li>Bot akan memberikan kode verifikasi</li>
                <li>Siswa login ke LMS dan masukkan kode di menu Profil</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Template Notifikasi</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
              <Plus size={16} /> Template Baru
            </button>
          </div>

          {templates.map(template => (
            <div key={template.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Event: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{template.event}</code></p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Aktif</span>
                  <input type="checkbox" defaultChecked={template.enabled} className="w-4 h-4 text-primary-600 rounded" />
                </label>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">{template.message}</pre>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Eye size={14} /> Preview
                </button>
                <button className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Settings size={14} /> Edit
                </button>
                <button className="flex items-center gap-1 px-3 py-1 text-sm border border-red-300 dark:border-red-700 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Trash2 size={14} /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Broadcast Tab */}
      {activeTab === 'broadcast' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Send size={20} /> Kirim Broadcast
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Template</label>
              <select className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>Pengumuman</option>
                <option>Tugas Baru</option>
                <option>Pengingat Tenggat</option>
                <option>Nilai Dipublikasi</option>
                <option>Ujian Dimulai</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kelas Tujuan</label>
              <select className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>Semua Kelas</option>
                <option>4A</option>
                <option>4B</option>
                <option>5A</option>
                <option>5B</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pesan</label>
              <textarea
                rows={5}
                placeholder="Tulis pesan Anda di sini... (mendukung HTML: &lt;b&gt;, &lt;i&gt;, &lt;a&gt;)"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-400">
                <strong>Preview:</strong> Akan dikirim ke 28 siswa yang terhubung Telegram
              </p>
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
                <Eye size={16} /> Preview
              </button>
              <button className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">
                <Send size={16} /> Kirim Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Riwayat Broadcast</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Waktu</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Template</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kelas</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Penerima</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Terkirim</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Gagal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {broadcastHistory.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{b.timestamp}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{b.template}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{b.class}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-300">{b.recipients}</td>
                    <td className="px-4 py-3 text-sm text-center text-green-600 dark:text-green-400">{b.sent}</td>
                    <td className="px-4 py-3 text-sm text-center text-red-600 dark:text-red-400">{b.failed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
