# Implementasi Pembelajaran dan Tugas — Satu Spreadsheet

Tanggal: 2026-10-16

## Keputusan arsitektur

- Implementasi dilakukan di aplikasi Tupari LMS yang sudah ada (React/Vite + Google Apps Script).
- Tetap memakai satu spreadsheet backend Tupari LMS sebagai sumber data utama (CONFIG.SPREADSHEET_ID). Tidak membuat spreadsheet baru.
- Tab tambahan di spreadsheet yang sama diperbolehkan bila diperlukan untuk relasi tahap belajar dan progres siswa.
- EduTask dipakai sebagai referensi fitur dan alur, bukan ditempel sebagai aplikasi kedua atau dijalankan dengan database/spreadsheet terpisah.
- Perubahan dikerjakan pada branch fitur; tidak mengubah main atau deployment produksi sampai tes lulus.
- Tidak mengimplementasikan ulang fitur di luar lingkup Pembelajaran/Tugas dan integrasi yang diperlukan.

## Alur Pembelajaran

1. Guru membuat materi dan menentukan mapel, kelas, status, jadwal publikasi, serta konten.
2. Sistem membuat enam tahap default yang terkait ke materialId: Apersepsi, Asesmen Awal, Materi Pokok, Simulasi Kuis, Asesmen Akhir, Refleksi.
3. Guru mengisi/mengedit isi tahap; tahap yang belum diisi tetap tersimpan sebagai draft.
4. Siswa hanya melihat materi yang diterbitkan dan ditujukan ke kelasnya di sekolah aktifnya.
5. Jawaban dan progres tahap disimpan per siswa dan per materi, bukan hanya di browser.
6. Progres dapat dimuat ulang dari backend; cache harus dipisahkan berdasarkan pengguna, sekolah, kelas, dan material jika data bersifat personal.

## Alur Tugas

1. Guru membuat tugas untuk mapel dan kelas, menetapkan tenggat, skor maksimum, status, dan kebijakan revisi.
2. Tugas ditampilkan hanya kepada siswa kelas sasaran dan hanya ketika statusnya sesuai.
3. Siswa mengirim teks dan/atau berkas melalui endpoint submission yang sudah ada.
4. Guru melihat pengumpulan, memberi nilai dan umpan balik, dan melihat rekap per kelas.
5. Impor nilai EduTask/rollback hanya boleh dipakai melalui integrasi yang diverifikasi, dengan log batch dan pratinjau rollback. Tidak boleh membuat spreadsheet kedua atau menimpa data lain.

## Satu sumber data dan skema

Tab utama yang sudah ada tetap dipakai: USERS, SCHOOLS, STUDENTS, CLASSES, SUBJECTS, MATERIALS, ASSIGNMENTS, SUBMISSIONS, GRADES dan tab lain yang sudah dikonfigurasi.

Tab relasional tambahan yang mungkin diperlukan (semuanya dalam spreadsheet yang sama):
- MATERIAL_STAGES: id, materialId, stageKey, title, content, configJson, order, status, createdAt, updatedAt.
- MATERIAL_PROGRESS: id, materialId, stageId, studentId, status, answersJson, score, startedAt, completedAt, updatedAt.

Tab tambahan baru hanya dibuat setelah implementasi backend dan header diperiksa. Jangan membuat tab dengan nama duplikat atau menggandakan daftar siswa/tugas yang sudah ada.

## Kontrak identitas dan akses

- activeSchoolId adalah ID sekolah, bukan ID kelas. Tidak boleh diteruskan sebagai classId.
- Data materi dan tugas memakai classId; siswa memiliki classId dan schoolId.
- Pemetaan akun login USERS ke baris STUDENTS harus ditentukan dari data backend yang sah; jangan menebak bahwa user.id selalu sama dengan student.id.
- Backend wajib memvalidasi pengguna dari token dan memastikan sekolah/kelas berada dalam cakupan izinnya. Parameter dari browser tidak cukup sebagai otorisasi.
- Jangan membuka materi draft, submission siswa lain, jawaban atau progres siswa lain.
- Jangan menghapus seluruh IndexedDB saat logout karena ada data offline CBT yang harus dipertahankan.

## Urutan pengerjaan dan verifikasi

1. Pertahankan baseline dan buat perubahan hanya di branch fitur.
2. Audit dan implementasikan pemetaan identitas siswa ke kelas secara aman.
3. Sinkronkan API materi/tugas dan filter berdasarkan kelas, tanpa mengubah arti parameter API secara diam-diam.
4. Implementasikan CRUD materi/tugas yang tombolnya benar-benar berfungsi.
5. Implementasikan enam tahap, jawaban, progres, dan persistensi backend.
6. Integrasikan alur pengumpulan/penilaian EduTask yang relevan ke kontrak Tupari LMS; jangan menyalin seluruh aplikasi EduTask atau menjalankan backend kedua.
7. Jalankan build frontend dan pemeriksaan statis; uji alur per peran menggunakan data uji yang tidak menyentuh data produksi.
8. Laporkan secara terpisah apa yang lolos build, apa yang sudah diuji, dan apa yang masih memerlukan uji langsung di Apps Script.

## Batasan saat ini

Tab yang dilaporkan pengguna masih kosong. Karena itu, uji end-to-end menggunakan akun dan data nyata belum bisa disimpulkan. Kode EduTask yang diserahkan menggunakan banyak tab bernama seperti Tugas, Siswa, dan Pengumpulan, sedangkan Tupari LMS memakai ASSIGNMENTS, STUDENTS, dan SUBMISSIONS. Integrasi harus memetakan kedua skema ke satu sumber data, bukan menyalin database ke spreadsheet baru.