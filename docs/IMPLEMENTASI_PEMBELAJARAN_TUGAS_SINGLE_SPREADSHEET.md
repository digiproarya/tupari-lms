# Migrasi EduTask ke Menu Tugas Tupari LMS

## Keputusan arsitektur (wajib dipertahankan)

EduTask **bukan aplikasi kedua** dan bukan tautan tugas publik yang berdiri sendiri. Fitur EduTask dipindahkan/adaptasi ke menu **Tugas** yang sudah ada di Tupari LMS. Guru dan siswa tetap menggunakan aplikasi, autentikasi, navigasi, dan pengalaman LMS yang sama.

- Frontend: React + Vite + TypeScript pada aplikasi Tupari LMS yang ada.
- Backend: Google Apps Script Tupari LMS yang ada.
- Penyimpanan: spreadsheet/backend Tupari LMS yang sudah dikonfigurasi. Jangan membuat spreadsheet atau database kedua.
- EduTask HTML/Apps Script yang tersimpan di Library adalah **referensi perilaku dan fitur**. Jangan mengedit deployment atau data EduTask yang masih aktif.
- Kerjakan hanya pada branch pengembangan. Jangan merge, deploy produksi, atau menjalankan migrasi data sebelum audit backend dan pengujian disetujui.

## Inventaris fitur EduTask yang perlu dipetakan

Referensi EduTask yang ditemukan di Library mencakup:
- Ringkasan/dashboard tugas.
- Daftar tugas dan modal buat tugas.
- Penentuan kelas, tenggat, status, dan instruksi.
- Pengumpulan siswa, berkas/link, catatan siswa, status pengumpulan.
- Pemeriksaan/penilaian dan umpan balik guru.
- Rekap nilai dengan filter kelas, Bab/TP/tugas/siswa/status dan ekspor Excel.
- Pengumuman, riwayat login, reset PIN siswa, dan alur pemeriksaan otomatis untuk jenis berkas tertentu.

Fitur tersebut perlu dipetakan ke modul Tupari LMS yang relevan; bukan semuanya otomatis disalin ke satu halaman. Prioritaskan alur inti tugas terlebih dahulu, lalu fitur pendukung setelah API dan model datanya terverifikasi.

### Temuan langsung dari source EduTask yang diberikan

Source `index_EduTask_FINAL_ROLLBACK_BATCH.html` dan `Code_EduTask_FINAL_ROLLBACK_BATCH.gs` juga menunjukkan fitur yang harus diperhitungkan dalam migrasi:

- Kartu tugas siswa dengan tombol **Kirim Tugas**, status deadline, dan kondisi pengumpulan terlambat.
- Metode pengumpulan berupa file dan catatan/jawaban siswa; alur tertentu meminta berkas `.ipynb`.
- Aturan deadline: pengumpulan bisa ditutup atau terlambat diizinkan dengan batas nilai/pengurangan per hari.
- Revisi pengumpulan dengan log versi; pengumpulan baru tidak boleh diam-diam menghapus riwayat revisi.
- Pemetaan kurikulum Bab dan TP, bobot tugas, rubrik/arahan otomatis, serta perhitungan rekap nilai berbobot.
- Rekap nilai kelas, rekap pengumpulan per kelas, persentase pengumpulan, dan ekspor.
- Draft penilaian AI disimpan terpisah dari nilai final, termasuk feedback, ringkasan, kekuatan, perbaikan, confidence, status persetujuan, dan waktu persetujuan.
- Lampiran tugas, pengumuman bertarget kelas, konfigurasi nilai sumatif, serta log revisi.

**Batas migrasi data:** source EduTask menggunakan nama tab dan kolom seperti `Tugas`, `Pengumpulan`, `REVISI_LOG`, `AI_DRAFTS`, dan `LAMPIRAN_TUGAS`. Nama ini tidak boleh langsung dijadikan tab baru di Tupari LMS. Setiap fitur harus dipetakan ke model dan sheet Tupari LMS yang sudah ada; bila sebuah fitur tidak punya padanan aman, tandai sebagai kebutuhan desain terpisah dan jangan membuat tab/spreadsheet baru secara otomatis.

## Alur tujuan

1. Guru membuka **Tupari LMS → Tugas**, membuat tugas, memilih mata pelajaran/kelas, menulis instruksi, menentukan tenggat, nilai maksimum, izin kirim ulang, dan status draft/aktif.
2. Tugas aktif tampil sebagai kartu di panel siswa yang memang terdaftar pada kelas target tersebut.
3. Siswa membuka kartu tugas di dalam LMS, membaca instruksi/tenggat, mengirim teks dan/atau berkas, lalu melihat status pengumpulan.
4. Guru melihat pengumpulan tugas, membuka berkas/link, memberi nilai dan umpan balik.
5. Siswa melihat nilai dan umpan balik; guru dapat memfilter serta mengekspor rekap.
6. Semua akses data dibatasi di backend berdasarkan autentikasi, sekolah, peran, kelas, dan kepemilikan tugas. Penyaringan di UI saja tidak cukup.

## Pemetaan data awal (perlu diverifikasi terhadap header spreadsheet aktual)

| Kebutuhan | Model Tupari LMS yang sudah ada | Catatan |
|---|---|---|
| Tugas | `ASSIGNMENTS` / `Assignment` | Pertahankan satu sumber data; cek field sekolah, guru, kelas, tenggat, status, nilai maksimum, izin kirim ulang. |
| Siswa | `STUDENTS` / `Student` | Identitas siswa dan relasi kelas harus diverifikasi; jangan mengasumsikan user ID sama dengan student ID tanpa bukti. |
| Pengumpulan | `SUBMISSIONS` / `AssignmentSubmission` | Simpan studentId, assignmentId, konten, URL berkas, waktu, status, nilai dan umpan balik sesuai skema backend. |
| Nilai | `GRADES` / `Grade` | Pastikan penilaian tugas tidak menggandakan atau memutus relasi dengan rekap nilai yang sudah ada. |

Nama tab di atas berasal dari struktur/model Tupari LMS yang tersedia pada branch; header spreadsheet produksi dan handler GAS tetap harus diverifikasi sebelum operasi tulis.

## Temuan audit pada branch

- `TugasPage.tsx` sudah memiliki daftar tugas, form pembuatan, form pengumpulan, dan tampilan pengumpulan.
- `StudentPortalPage.tsx` sudah menampilkan kartu tugas, tetapi tombol **Kumpulkan** sebelumnya belum mengarah ke alur pengumpulan. Perubahan awal mengarahkannya ke menu Tugas dengan ID tugas terpilih.
- Kartu tugas kini tetap menyediakan **Lihat detail** setelah pengumpulan agar siswa bisa kembali melihat nilai/umpan balik di menu Tugas.
- Model `Assignment` kini memiliki `allowResubmit?`; UI detail tugas tidak menawarkan kirim ulang jika pengumpulan sudah ada dan tugas tidak mengizinkannya. Ini hanya guard UI; backend tetap wajib memvalidasi aturan yang sama.
- Peringatan pemetaan kelas ditampilkan di tab Tugas siswa, bukan memblokir seluruh portal siswa. Jika pemetaan belum ditemukan, daftar tugas tetap kosong (fail-closed).
- Route terpisah `/tugas-public/:assignmentId` dan tombol salin tautan publik telah dilepas dari jalur UI utama. Ini sesuai keputusan bahwa siswa mengerjakan tugas di dalam LMS, bukan aplikasi publik terpisah.
- Metode/berkas `PublicTaskPage` atau helper API lama yang tidak lagi digunakan dapat dihapus setelah seluruh referensi dan build diperiksa; jangan menghapus handler backend yang mungkin dipakai fitur lain tanpa audit.
- Ada risiko penting yang belum boleh dianggap selesai: pemfilteran tugas untuk siswa harus berdasarkan relasi kelas siswa yang terverifikasi di backend; halaman tugas tidak boleh menampilkan pengumpulan milik siswa lain. Data API saat ini dan relasi ID perlu ditelusuri sebelum alur siswa dinyatakan siap.
- Fungsi pengumpulan dan penilaian backend harus diperiksa. Jangan menganggap operasi berhasil hanya karena UI mendapat respons sukses; uji tulis-baca menggunakan data uji.

## Urutan implementasi yang aman

### Tahap 1 — UI native dan navigasi
- Pertahankan menu Tugas Tupari LMS.
- Hapus penggunaan jalur tugas publik terpisah.
- Hubungkan kartu tugas siswa ke detail tugas native.
- Pastikan siswa hanya dapat melihat tugas dan pengumpulan miliknya sendiri.

### Tahap 2 — Audit backend dan keamanan
- Telusuri router GAS, autentikasi, handler daftar/buat tugas, pengumpulan, penilaian, dan fungsi Database.
- Cocokkan nama kolom aktual dengan model TypeScript.
- Terapkan validasi akses di backend: sekolah aktif, guru pemilik tugas, kelas siswa, status tugas, tenggat, serta aturan kirim ulang.
- Pastikan operasi tulis tidak menghasilkan pengumpulan/nilai ganda saat permintaan diulang.

### Tahap 3 — Penilaian dan rekap
- Uji alur nilai dan umpan balik dari guru sampai panel siswa.
- Hubungkan rekap dan ekspor dengan filter kelas/tugas/siswa.
- Pertahankan kompatibilitas modul Nilai/Laporan yang sudah ada.

### Tahap 4 — Fitur lanjutan EduTask
- Pemetaan Bab/TP, rubrik, pemeriksaan otomatis, pengumuman, riwayat login, reset PIN, dan analitik dilakukan terpisah.
- Fitur AI/eksekusi berkas memerlukan audit keamanan, batas biaya, izin Drive, dan fallback sebelum diaktifkan.

## Koreksi arah implementasi — 17 Oktober 2026

Keputusan final: EduTask menjadi modul **Tugas native di dalam Tupari LMS**. Bukan halaman tugas publik, bukan aplikasi kedua, dan bukan spreadsheet kedua.

- `src/services/api.ts` tidak lagi mengekspos helper/API `publicTasks`, request tanpa token, atau `enablePublicLink`.
- Model Assignment tidak lagi membawa `publicToken`.
- Halaman `PublicTaskPage.tsx` dihapus dari branch pengembangan karena tidak sesuai dengan alur native LMS.
- Dokumen `PUBLIC_TASK_GAS_PATCH*.md` dan `PUBLIC_TASK_ROUTER_PATCH.md` adalah catatan historis/draft arah lama; jangan dipasang ke GAS dan jangan diperlakukan sebagai spesifikasi final.
- Pengumpulan dari antarmuka native menggunakan handler autentikasi `submitTask`. Ini belum membuktikan keamanan backend: handler GAS wajib mengikat studentId ke identitas token dan memvalidasi kelas/tugas di server.

## Kriteria selesai sebelum merge/deploy

- [ ] Build dan TypeScript typecheck lulus.
- [ ] Guru hanya mengelola tugas di sekolah/kelas yang diizinkan.
- [ ] Tugas siswa difilter ke kelas yang benar di backend.
- [ ] Siswa tidak dapat melihat data pengumpulan siswa lain.
- [ ] Submit, kirim ulang, tenggat, penilaian, dan umpan balik diuji end-to-end.
- [ ] Nilai tampil konsisten di modul Tugas dan Nilai/Laporan.
- [ ] Ekspor dan filter diuji dengan beberapa kelas dan tugas.
- [ ] Tidak ada spreadsheet kedua atau ketergantungan pada aplikasi publik terpisah.
- [ ] Deployment EduTask aktif dan data produksinya tidak disentuh.
- [ ] Hasil pengujian dan rollback plan didokumentasikan.

**Status saat ini:** integrasi awal navigasi dan perilaku UI telah dibuat di branch pengembangan, termasuk detail setelah pengumpulan dan guard kirim ulang. Ini belum merupakan migrasi fitur lengkap dan belum siap merge/deploy. Belum ada bukti bahwa GAS memfilter assignment/submission per pengguna; pemetaan akun siswa masih memakai identifier eksplisit yang perlu diverifikasi. Source backend GAS aktual, header spreadsheet, validasi otorisasi, submit/grade, serta build/typecheck dan pengujian end-to-end belum terverifikasi. Jangan menganggap perubahan UI sebagai kontrol keamanan server.
