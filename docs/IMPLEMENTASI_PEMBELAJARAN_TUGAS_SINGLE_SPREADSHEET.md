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

## Temuan audit backend setelah pemeriksaan `modules.gs` (2026-10-16)

Temuan berikut berasal dari cuplikan modul yang diberikan untuk diperiksa; belum merupakan pengujian langsung Apps Script.

### MATERIALS
- `getMaterials(params)` hanya memfilter berdasarkan `classId`, `subjectId`, dan `status`. Belum ada filter `schoolId` atau pemeriksaan akses pada cuplikan fungsi ini.
- `createMaterial(data)` memerlukan `title`, `subjectId`, dan `classId`, lalu langsung menyimpan data melalui `Database.create`. Belum membuat enam tahap default.
- `getMaterial(materialId)` dan `updateMaterial(materialId, data)` belum memperlihatkan validasi sekolah/kelas maupun otorisasi pemilik materi pada cuplikan yang tersedia.

### ASSIGNMENTS dan SUBMISSIONS
- `getAssignments(params)` hanya memfilter `classId`, `subjectId`, dan `status`; data pengumpulan belum digabungkan ke setiap tugas pada fungsi yang terlihat.
- `createAssignment(data)` menyimpan tugas melalui `Database.create`. Notifikasi Telegram bersifat tambahan dan bukan bukti penyimpanan atau otorisasi.
- `submitAssignment(payload)` dan `gradeSubmission(payload)` masih berupa stub `TODO`. Keduanya mengembalikan `success: true` tanpa menulis data. UI tidak boleh menampilkan konfirmasi bahwa pengumpulan atau penilaian benar-benar tersimpan sebelum implementasi persistensi tersedia.
- Perutean yang diketahui memakai nama aksi berbeda untuk pengumpulan (`submitTask` dan `gradeSubmission`) dibandingkan nama metode modul (`submitAssignment` dan `gradeSubmission`). Periksa implementasi `UploadHandler` dan router sebelum menyatukan alur; jangan mengasumsikan kedua rute memiliki perilaku yang sama.

### Kontrak frontend yang belum konsisten
- Beberapa halaman meneruskan `user.activeSchoolId` ke API `getAll(...)`, sementara fungsi backend yang terlihat menafsirkan parameter sebagai `classId`. ID sekolah tidak boleh dipakai sebagai ID kelas.
- Tugas yang ditampilkan membutuhkan data pengumpulan, tetapi kontrak `getAssignments` yang terlihat hanya mengembalikan baris tugas. Sumber data submission dan relasinya perlu ditetapkan sebelum statistik pengumpulan dianggap akurat.
- Frontend mengirim `user.id` sebagai `studentId` saat siswa mengumpulkan tugas. Relasi akun `USERS` dengan `STUDENTS` belum dibuktikan; jangan menyamakan kedua ID tanpa pemetaan backend.
- Fungsi `createAssignment` pada branch fitur belum boleh dianggap siap produksi sampai penyegaran daftar tugas, pemfilteran sekolah/kelas, dan validasi otorisasi backend diselesaikan.

### Gerbang sebelum implementasi backend
1. Periksa seluruh router `doGet`/`doPost`, `authenticatePostRequest`, `UploadHandler`, dan fungsi `Database` yang relevan.
2. Pastikan nama tab dan header yang benar dari `CONFIG.SHEETS` serta spreadsheet yang sudah ada. Jangan menjalankan inisialisasi atau membuat tab sebelum pemeriksaan ini.
3. Tetapkan pemetaan akun siswa ke `STUDENTS`, validasi akses guru/siswa di backend, serta aturan status draft/published/active.
4. Implementasikan penyimpanan submission dan nilai yang nyata, termasuk validasi tugas, siswa, tenggat, izin revisi, batas skor, dan pencegahan duplikasi sesuai kebijakan produk.
5. Tambahkan penyimpanan enam tahap dan progres per siswa pada spreadsheet yang sama hanya setelah skema final ditinjau.
6. Uji dengan data uji terpisah dari data produksi; lakukan build frontend dan uji langsung GAS sebelum menyatakan fitur siap.


### Temuan audit Database CRUD setelah cuplikan Database diberikan (2026-10-16)

- `getAll()` menangkap error lalu mengembalikan array kosong. Pemanggil tidak dapat membedakan sheet benar-benar kosong dari kegagalan membaca; ini berisiko menampilkan keadaan kosong yang menyesatkan.
- `create()` dan `bulkCreate()` membentuk nilai sel dengan `data[header] || ''`. Nilai valid seperti angka `0` dan boolean `false` berubah menjadi string kosong. Perbaikan perlu memakai pemeriksaan nilai kosong yang eksplisit.
- `getById()` dan `update()` menggunakan perbandingan ID ketat. Format dan tipe ID harus konsisten antara frontend, sheet, dan relasi USERS/STUDENTS.
- `create()` menambahkan properti `id` dan `createdAt` langsung ke objek data yang diterima. Pemanggil sebaiknya tidak mengandalkan objek input tetap tidak berubah.
- `update()` menulis tiap sel secara terpisah dan mengembalikan gabungan `{ id, ...data }`, yang belum tentu merupakan rekaman lengkap terbaru. Operasi multi-field bisa lebih lambat dan perlu dirancang agar konsisten.
- `getAll()` membaca seluruh rentang sheet dan fungsi filter bekerja di memori. Untuk skala besar, pertimbangkan optimasi setelah kebutuhan dan ukuran data terukur; jangan mengubah pola akses tanpa pengujian.
- Fungsi CRUD generik ini tidak melakukan otorisasi sendiri. Otorisasi harus dipastikan di router/handler sebelum operasi baca/tulis yang sensitif; parameter dari browser tidak cukup.
- `create()` dan `bulkCreate()` memetakan data hanya ke header yang sudah ada. Field baru tidak akan tersimpan jika kolomnya belum tersedia; jangan menambah kolom/tab sebelum skema disepakati.
- Penilaian pada `UploadHandler.gradeSubmission()` tetap perlu validasi nilai numerik dan rentang skor, serta penanganan bila update SUBMISSIONS berhasil tetapi pembuatan GRADES gagal. Hal ini belum dapat diperbaiki dengan aman hanya dari modul CRUD tanpa melihat router, skema, dan pola transaksi yang tersedia.

Temuan di atas merupakan audit statis atas cuplikan kode, bukan bukti uji runtime. Belum ada perubahan pada Apps Script, spreadsheet, branch utama, atau deployment produksi.