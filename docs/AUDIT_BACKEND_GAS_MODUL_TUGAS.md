# Audit Backend GAS — Modul Tugas Tupari LMS

Tanggal audit: 17 Oktober 2026  
Branch: `feature/pembelajaran-tugas-single-spreadsheet`  
Status: audit source yang pernah dibagikan; **belum ada perubahan atau deployment GAS**.

## Tujuan

Memindahkan workflow EduTask ke menu Tugas Tupari LMS yang sudah ada. Bukan aplikasi kedua, bukan spreadsheet kedua, dan tidak menyentuh deployment EduTask aktif.

## Bukti dari router GAS yang dibagikan

File router yang dibagikan sebelumnya menunjukkan:

- `doGet` mewajibkan token untuk semua action kecuali `health` dan `verifyToken`.
- `getAssignments` diteruskan ke `Assignments.getAssignments(params)`.
- `doPost` mewajibkan autentikasi untuk semua action kecuali `login` dan `health`, kemudian menambahkan `payload.user = user`.
- `createAssignment` diteruskan ke `Assignments.createAssignment(payload)`.
- `submitAssignment` diteruskan ke `Assignments.submitAssignment(payload)`.
- `gradeAssignment` diteruskan ke `Assignments.gradeSubmission(payload)`.
- Router juga memiliki jalur `submitTask` ke `UploadHandler.submitAssignment(assignmentId, studentId, content, fileUrl)` dan `gradeSubmission` ke `UploadHandler.gradeSubmission(submissionId, score, feedback)`.

## Risiko dan temuan

### 1. Ada dua pasang jalur submit/grade

Router mengekspose dua pasangan berbeda:

| Action | Handler | Status bukti |
|---|---|---|
| `submitAssignment` | `Assignments.submitAssignment(payload)` | Cuplikan audit terdahulu menyebut implementasi ini stub/tidak menyimpan. Source lengkap perlu diverifikasi ulang sebelum diubah. |
| `submitTask` | `UploadHandler.submitAssignment(...)` | Jalur yang menurut source terdahulu melakukan validasi tugas dan menyimpan ke SUBMISSIONS. |
| `gradeAssignment` | `Assignments.gradeSubmission(payload)` | Cuplikan audit terdahulu menyebut implementasi ini stub/tidak menyimpan. |
| `gradeSubmission` | `UploadHandler.gradeSubmission(...)` | Jalur yang menurut source terdahulu memperbarui pengumpulan dan menulis nilai. |

**Keputusan aman:** jangan mengalihkan semua pemanggil ke salah satu action sebelum seluruh pemanggil frontend dan kode handler aktual diperiksa. Hindari sukses palsu yang tidak menyimpan data.

### 2. Router hanya membuktikan autentikasi token, bukan otorisasi objek

Router menambahkan objek user ke payload, tetapi pada cuplikan yang tersedia belum terlihat pemeriksaan bahwa:
- guru hanya membuat/mengubah/menilai tugas di sekolah dan kelas yang menjadi kewenangannya;
- siswa hanya mengambil tugas kelasnya sendiri;
- siswa tidak dapat mengirim submission menggunakan `studentId` milik siswa lain;
- guru tidak dapat mengubah nilai submission di luar kelas/sekolahnya.

Validasi harus berada di backend, menggunakan identitas dari token dan relasi siswa/kelas/sekolah dari database. Jangan mempercayai `studentId`, `schoolId`, atau `teacherId` yang dikirim browser.

### 3. Filter frontend bukan kontrol keamanan

Pada frontend branch saat ini, `api.assignments.getAll(schoolId)` mengirim `getAssignments` dengan `schoolId`. Cuplikan kode handler yang tersedia sebelumnya menunjukkan filter `classId`, `subjectId`, dan `status`, namun tidak membuktikan filter `schoolId` atau otorisasi per role. Ini harus diperiksa pada implementasi backend penuh sebelum dinyatakan aman.

### 4. Pemetaan akun siswa belum terbukti

Frontend saat ini berusaha mencocokkan akun login dengan record siswa memakai `id`, `userId`, `accountId`, atau email. Itu hanya mekanisme fallback UI dan belum membuktikan bahwa struktur produksi menggunakan salah satu field tersebut. Relasi kanonik perlu ditentukan dari skema USERS/STUDENTS aktual; NIS/NISN sebaiknya tidak dipakai sebagai satu-satunya pengganti ID akun tanpa aturan unik yang terverifikasi.

### 5. Pengiriman ulang perlu validasi server

`allowResubmit` kini tersedia pada tipe frontend dan UI membatasi tombol kirim ulang. Backend tetap harus mengecek flag tugas, tenggat, status tugas, identitas siswa, dan aturan duplikasi secara atomik sebelum menulis data. Guard UI saja dapat dilewati.

## Urutan implementasi backend yang aman

1. Ambil source aktif dan versi deployment GAS tanpa mengubahnya; identifikasi file router, `Assignments`, `UploadHandler`, `Database`, `CONFIG.SHEETS`, dan fungsi auth.
2. Catat header sheet aktual untuk ASSIGNMENTS, STUDENTS/USERS, SUBMISSIONS, dan GRADES. Jangan membuat tab baru dan jangan mengubah header produksi saat audit.
3. Lacak pemanggilan API frontend untuk daftar, pembuatan, pengumpulan, dan penilaian; pilih satu jalur kanonik per operasi setelah memastikan handler mana yang benar-benar menyimpan.
4. Implementasikan otorisasi berdasarkan user token dan relasi sekolah/kelas; jangan mempercayai ID kepemilikan dari browser.
5. Tambahkan validasi tenggat, status tugas, batas nilai, resubmission, dan duplikasi di server. Gunakan `LockService` atau mekanisme atomik yang sesuai jika perlu mencegah dua pengiriman bersamaan.
6. Uji di salinan/staging dengan data uji: guru sekolah A, guru sekolah B, siswa kelas A, siswa kelas B; tugas aktif/draft/ditutup; submit pertama/kedua; deadline; penilaian dan feedback.
7. Jalankan build/typecheck frontend dan tes API end-to-end. Baru setelah lulus, tinjau diff dan rencana rilis secara terpisah.

## Yang belum dilakukan

- Tidak ada source GAS produksi yang diubah.
- Tidak ada spreadsheet, tab, header, deployment, trigger, atau properti produksi yang diubah.
- Tidak ada perubahan pada EduTask aktif.
- Tidak ada merge PR atau deployment.
- Build, typecheck, dan tes end-to-end belum dijalankan di lingkungan lokal.

## Source yang masih dibutuhkan untuk menerapkan patch kode

Agar patch backend dapat dibuat akurat, audit berikutnya harus menggunakan source GAS aktif yang memuat implementasi penuh:
- router `doPost(e)` dan `authenticatePostRequest(e)`;
- `Assignments.getAssignments`, `createAssignment`, `submitAssignment`, `gradeSubmission`;
- `UploadHandler.submitAssignment`, `gradeSubmission`;
- `Database.getAll/getById/create/update`, `CONFIG.SHEETS`, serta header sheet terkait.

Cuplikan router sudah tersedia dalam percakapan, tetapi bukan pengganti implementasi lengkap handler dan header spreadsheet. Patch terhadap kode yang tidak terlihat akan berisiko membuat data submission/nilai rusak.


## Pembaruan audit frontend — 17 Oktober 2026

Pemeriksaan ulang terhadap source branch menghasilkan temuan berikut:

- `src/services/api.ts`: `api.assignments.getAll(schoolId)` mengirim action `getAssignments` dengan parameter `schoolId`; invalidasi cache setelah pembuatan tugas memakai key `assignments_school_<schoolId>`.
- `src/services/api.ts`: helper `api.submissions.grade(submissionId, score, feedback)` memang ada dan memanggil action `gradeSubmission`.
- `src/pages/TugasPage.tsx`: tabel pengumpulan guru belum memanggil `api.submissions.grade`; tindakan yang terlihat pada baris pengumpulan hanya membuka file lampiran jika ada. Jadi alur penilaian guru belum tersambung dari UI pada halaman ini.
- `src/pages/TugasPage.tsx`: nilai dan feedback sudah punya tempat untuk ditampilkan pada tampilan pengumpulan siswa. Ini belum membuktikan data dari handler selalu tersimpan dan terbaca konsisten.
- `src/types/index.ts`: model `Assignment` memuat `allowResubmit?`, `AssignmentSubmission` memuat `score?` dan `feedback?`. Tipe frontend bukan bukti bahwa kolom-kolom itu ada dengan nama yang sama di spreadsheet produksi.
- Pemeriksaan file utama `src/App.tsx`, `src/pages/TugasPage.tsx`, `src/services/api.ts`, dan `src/types/index.ts` tidak menemukan referensi `PublicTaskPage`, `publicTasks`, `enablePublicLink`, atau `publicToken` pada versi yang diperiksa.

### Keputusan implementasi setelah pemeriksaan ulang

Penilaian belum ditambahkan ke UI karena handler GAS aktif dan header sheet belum tersedia secara lengkap untuk verifikasi. Menambahkan formulir nilai sekarang akan berisiko memberi kesan bahwa nilai sudah tersimpan, padahal otorisasi, pemetaan kolom, dan hasil persistensi belum dibuktikan.

Langkah kode berikutnya adalah mengaudit source GAS aktif dan header sheet, lalu menyambungkan kontrol penilaian pada halaman Tugas dengan validasi nilai `0..maxScore`, feedback, status berhasil/gagal yang eksplisit, refresh data setelah penyimpanan, dan otorisasi server. Tidak boleh menganggap validasi UI sebagai pengganti validasi backend.

### Status build/preview

Status pemeriksaan commit PR terakhir yang tersedia menunjukkan check Vercel gagal. Tidak ada log build yang dapat dibaca melalui konektor yang tersedia, dan tidak ada hasil GitHub Actions untuk commit tersebut. Penyebab kegagalan belum terverifikasi; tidak boleh menebak atau mengubah konfigurasi deployment tanpa log yang menunjukkan penyebabnya.
