import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ClipboardCheck, Loader2, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface PublicAssignment {
  id: string;
  title: string;
  description?: string;
  subjectName?: string;
  className?: string;
  dueDate?: string;
  maxScore?: number;
  status: string;
}

export default function PublicTaskPage() {
  const { assignmentId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get('token') || '';
  const [assignment, setAssignment] = useState<PublicAssignment | null>(null);
  const [studentNis, setStudentNis] = useState('');
  const [studentName, setStudentName] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!assignmentId || !accessToken) {
        setError('Tautan tugas tidak lengkap. Minta tautan terbaru dari guru.');
        setLoading(false);
        return;
      }
      const result = await api.publicTasks.get(assignmentId, accessToken);
      if (cancelled) return;
      if (result.success && result.data) {
        setAssignment(result.data as PublicAssignment);
      } else {
        setError(result.error || 'Tugas tidak dapat dibuka. Periksa tautan atau hubungi guru.');
      }
      setLoading(false);
    };
    void load();
    return () => { cancelled = true; };
  }, [assignmentId, accessToken]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!studentNis.trim() || !studentName.trim() || !content.trim()) {
      setError('Isi NIS, nama siswa, dan jawaban terlebih dahulu.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await api.publicTasks.submit({
        assignmentId,
        accessToken,
        studentNis: studentNis.trim(),
        studentName: studentName.trim(),
        content: content.trim(),
      });
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Pengumpulan belum berhasil. Silakan coba kembali.');
      }
    } catch {
      setError('Koneksi bermasalah. Pengumpulan belum dapat dikonfirmasi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center p-6"><div className="text-center"><Loader2 className="animate-spin mx-auto mb-3" size={36} /><p>Memuat tugas...</p></div></main>;
  }

  if (error && !assignment) {
    return <main className="min-h-screen flex items-center justify-center p-6"><section className="max-w-lg w-full bg-white rounded-2xl shadow p-6 text-center"><AlertCircle className="mx-auto mb-3 text-amber-600" size={40} /><h1 className="text-xl font-bold mb-2">Tugas tidak tersedia</h1><p className="text-gray-600">{error}</p></section></main>;
  }

  if (success) {
    return <main className="min-h-screen flex items-center justify-center p-6"><section className="max-w-lg w-full bg-white rounded-2xl shadow p-6 text-center"><CheckCircle2 className="mx-auto mb-3 text-green-600" size={44} /><h1 className="text-xl font-bold mb-2">Pengumpulan diterima</h1><p className="text-gray-600">Server mengonfirmasi pengumpulan tugas. Simpan informasi ini jika diperlukan.</p><p className="mt-3 font-semibold">{assignment?.title}</p></section></main>;
  }

  const overdue = assignment?.dueDate ? new Date(assignment.dueDate).getTime() < Date.now() : false;
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <header className="mb-6 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-primary-100 text-primary-700 mb-3"><ClipboardCheck size={28} /></div>
          <h1 className="text-2xl font-bold text-gray-900">Pengumpulan Tugas</h1>
          <p className="text-gray-600 mt-1">Tidak perlu login. Gunakan identitas siswa yang terdaftar di kelas.</p>
        </header>
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7 mb-5">
          <div className="flex items-start justify-between gap-3">
            <div><h2 className="text-xl font-bold text-gray-900">{assignment?.title}</h2><p className="text-gray-600 mt-2 whitespace-pre-wrap">{assignment?.description || 'Tidak ada deskripsi tambahan.'}</p></div>
            <span className={overdue ? 'text-xs rounded-full bg-red-100 text-red-700 px-2 py-1' : 'text-xs rounded-full bg-green-100 text-green-700 px-2 py-1'}>{overdue ? 'Melewati tenggat' : 'Tautan valid'}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5 text-sm">
            <div className="bg-gray-50 rounded-lg p-3"><p className="text-gray-500">Mata pelajaran</p><p className="font-medium">{assignment?.subjectName || '—'}</p></div>
            <div className="bg-gray-50 rounded-lg p-3"><p className="text-gray-500">Kelas</p><p className="font-medium">{assignment?.className || '—'}</p></div>
            <div className="bg-gray-50 rounded-lg p-3"><p className="text-gray-500">Tenggat</p><p className="font-medium">{assignment?.dueDate ? new Date(assignment.dueDate).toLocaleString('id-ID') : '—'}</p></div>
            <div className="bg-gray-50 rounded-lg p-3"><p className="text-gray-500">Nilai maksimum</p><p className="font-medium">{assignment?.maxScore ?? '—'}</p></div>
          </div>
        </section>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7 space-y-4">
          <h2 className="font-bold text-lg">Identitas dan jawaban</h2>
          <p className="text-sm text-gray-600">NIS digunakan untuk mencocokkan pengumpulan dengan daftar siswa kelas. Ini bukan proses login.</p>
          <label className="block"><span className="block text-sm font-medium mb-1">NIS</span><input value={studentNis} onChange={e => setStudentNis(e.target.value)} autoComplete="off" required maxLength={40} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none" /></label>
          <label className="block"><span className="block text-sm font-medium mb-1">Nama siswa</span><input value={studentName} onChange={e => setStudentName(e.target.value)} autoComplete="name" required maxLength={120} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none" /></label>
          <label className="block"><span className="block text-sm font-medium mb-1">Jawaban / isi tugas</span><textarea value={content} onChange={e => setContent(e.target.value)} required rows={8} maxLength={30000} placeholder="Tuliskan jawaban di sini..." className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none resize-y" /><span className="text-xs text-gray-500">{content.length}/30000 karakter</span></label>
          {error && <div role="alert" className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
          <button type="submit" disabled={submitting || !assignment || assignment.status !== 'active' || overdue} className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold px-4 py-3"><Send size={17} />{submitting ? 'Mengirim...' : 'Kumpulkan Tugas'}</button>
          {assignment?.status !== 'active' && <p className="text-sm text-amber-700">Tugas belum aktif atau sudah ditutup.</p>}
          {overdue && <p className="text-sm text-red-700">Tenggat tugas telah lewat. Hubungi guru jika memerlukan perpanjangan.</p>}
        </form>
        <p className="text-xs text-center text-gray-500 mt-5">Jangan bagikan tautan akses tugas ke orang di luar kelas.</p>
      </div>
    </main>
  );
}
