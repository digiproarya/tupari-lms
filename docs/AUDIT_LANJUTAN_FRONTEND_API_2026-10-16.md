# Audit lanjutan frontend/API — Tupari LMS

Tanggal: 2026-10-16
Branch: `audit/backend-security-2026-10-16`

## Cakupan
Pemeriksaan statis terhadap `src/services/api.ts` pada branch `main`. Tidak ada perubahan kode aplikasi dalam audit ini. Modul Pembelajaran dan Tugas tidak diubah; implementasinya tetap menunggu bahan/arahan pemilik proyek.

## Temuan yang dapat dibuktikan dari frontend

### FE-001 — Identitas siswa dikirim oleh klien pada operasi ujian
Metode `exams.startExam`, `submitAnswer`, `batchSubmitAnswers`, `submitExam`, `validateToken`, dan beberapa metode proctoring mengirim `studentId` dari pemanggil frontend. Nilai yang dikirim browser tidak boleh menjadi bukti identitas. Backend wajib mengikat tindakan ke siswa dari sesi/token terverifikasi dan memeriksa kepemilikan attempt/ujian.

**Prioritas:** P0 jika backend mempercayai `studentId` tanpa validasi kepemilikan.

### FE-002 — Endpoint data pribadi menggunakan ID yang diberikan klien
Metode `students.getById`, `grades.getByStudent`, dan `attendance.getByStudent` mengirim ID ke API. Ini bukan kerentanan yang terbukti sendirian, tetapi backend wajib memastikan pengguna berhak membaca rekaman tersebut; siswa hanya boleh membaca datanya sendiri kecuali role yang berwenang.

**Prioritas:** P0/P1 bergantung pada validasi backend.

### FE-003 — Cache IndexedDB tidak dibersihkan saat logout
`clearAuth()` menghapus `tupari_token` dan `tupari_user`, tetapi tidak membersihkan cache data IndexedDB. `getCachedData()` mengembalikan cache lama bahkan ketika permintaan server gagal. Pada perangkat bersama, data sekolah/pengguna sebelumnya berpotensi terlihat setelah pergantian akun jika layar memakai cache yang sama.

**Prioritas:** P1. Perlu audit `src/services/db.ts` dan seluruh pemanggil cache sebelum menentukan perbaikan minimal. Jangan menghapus seluruh IndexedDB tanpa memeriksa apakah ada data ujian offline yang perlu dipertahankan.

### FE-004 — Cache tidak selalu memasukkan identitas sekolah/pengguna
Beberapa key memasukkan `schoolId` atau `classId`, tetapi key seperti `student_<studentId>`, `grades_<studentId>`, `attendance_student_<studentId>`, dan data lain tidak memasukkan identitas sesi. Risiko utamanya meningkat pada perangkat bersama dan jika data antar sekolah memakai ID yang tidak unik secara global.

**Prioritas:** P1. Verifikasi apakah semua ID benar-benar unik global dan bagaimana pergantian akun/sekolah menangani cache.

### FE-005 — URL GAS cadangan tertanam di source
`src/services/api.ts` memakai `VITE_GAS_URL` tetapi juga memiliki URL deployment sebagai fallback. Ini dapat membuat build tanpa environment variable tetap mengarah ke deployment tertentu tanpa disadari.

**Prioritas:** P2. Tidak mengungkap token pada cuplikan yang diaudit, tetapi konfigurasi produksi sebaiknya eksplisit dan divalidasi saat build.

### FE-006 — Timeout controller tidak dibatalkan setelah semua jalur selesai
`clearTimeout(timeoutId)` dipanggil setelah `fetch` berhasil mendapat respons dan pada percobaan terakhir di catch. Untuk respons/exception tertentu, timer dapat tetap hidup sampai batas waktu. Ini terutama masalah kebersihan resource, bukan prioritas keamanan.

**Prioritas:** P2. Perbaikan yang tepat adalah `finally` yang konsisten, diuji agar retry dan abort tetap benar.

### FE-007 — Retry untuk semua error jaringan dapat mengulang operasi tulis
`fetchWithRetry()` mengulang hingga tiga kali setelah exception. Operasi seperti membuat siswa, membuat materi, mengirim jawaban, atau submit tugas menggunakan helper yang sama. Jika server berhasil menyimpan tetapi koneksi putus sebelum respons diterima, retry dapat membuat duplikasi kecuali backend menerapkan idempotency/deduplication.

**Prioritas:** P1/P2 sesuai dampak tiap operasi. Jangan mengubah kebijakan retry secara global sebelum memetakan operasi baca/tulis dan memastikan perilaku backend.

## Batas bukti
- Audit ini hanya membuktikan pola yang terlihat pada `src/services/api.ts`; belum membuktikan backend benar-benar rentan. Harus diperiksa bersama `Code.gs`, modul terkait, `Auth.verifyToken`, dan skema Sheets.
- Pencarian kode di repo frontend tidak menemukan source `backend-gas`; backend aktif berasal dari arsip yang disebut pemilik proyek, bukan dari tree GitHub saat ini.
- Belum ada test request terhadap deployment GAS, karena perubahan produksi dilarang dan kontrak autentikasi perlu dipastikan lebih dahulu.

## Urutan pemeriksaan berikutnya
1. Periksa `AuthContext`, route protection, dan mekanisme logout/pergantian sekolah untuk memastikan sesi UI tidak dianggap sebagai otorisasi backend.
2. Periksa `src/services/db.ts` untuk skema cache dan kemungkinan data ujian offline; rancang isolasi cache per sesi tanpa menghilangkan jawaban yang belum tersinkron.
3. Cocokkan tiap aksi frontend dengan router GAS dan pemeriksaan izin backend, terutama identitas siswa, ujian, nilai, presensi, serta operasi tulis yang dapat terduplikasi.
4. Setelah source backend disertakan dalam kontrol versi dengan rahasia disanitasi, siapkan test harness dan uji di salinan GAS + spreadsheet.
5. Jangan implementasikan perubahan di Pembelajaran atau Tugas sebelum pemilik proyek mengirim bahan/arahan.

## Status
Ini dokumen audit statis. Tidak ada perubahan kode, spreadsheet, deployment, atau branch `main`.
