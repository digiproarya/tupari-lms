# Tupari LMS — Audit Keamanan Backend
Tanggal: 2026-10-16
Status: audit statis sumber backend dari arsip terakhir yang dikonfirmasi pengguna sebagai kode GAS aktif. Belum diuji terhadap deployment produksi. Belum ada kode aplikasi yang diubah atau di-deploy.

## Temuan prioritas

### P0 — Isolasi sekolah pada Students belum ditegakkan secara konsisten
- `getStudents(params)` menerima `schoolId` dari klien dan memfilter data, tetapi tidak memastikan pengguna terautentikasi berhak mengakses sekolah itu.
- `getStudent(studentId)` mengambil data berdasarkan ID tanpa pemeriksaan cakupan sekolah.
- Operasi create/update/import perlu memvalidasi role dan kepemilikan sekolah di sisi backend.
- Router detail siswa tidak meneruskan identitas pengguna terverifikasi ke fungsi detail.
Risiko: akses lintas sekolah atau perubahan data oleh pengguna yang tidak berwenang.

### P0 — Otorisasi ujian mempercayai parameter klien
- Router `getExam` meneruskan `params.userRole` dan `params.studentId` dari request, bukan dari klaim pengguna hasil verifikasi token.
- `Exams.getExam` menghapus `correctAnswer` hanya ketika role bernilai `siswa`; role palsu dapat berisiko membuka kunci jawaban.
- Endpoint start/submit/validate perlu mengikat studentId pada identitas terautentikasi dan memverifikasi hak atas ujian, kelas, dan attempt.
- Filter teacherId/classId dari klien tidak boleh diperlakukan sebagai bukti otorisasi.

### P0 — Password dibandingkan sebagai plaintext
- `Auth.login` membandingkan password langsung dengan nilai spreadsheet.
- Fungsi `hashPassword`/`verifyPassword` yang ada belum dipakai oleh alur login.
- SHA-256 polos bukan pengganti password hashing adaptif dengan salt dan parameter yang memadai.
Risiko: password dapat terbaca jika spreadsheet atau ekspor data bocor. Perlu rencana migrasi kompatibel, backup, dan pengujian akun lama; jangan migrasi massal langsung di produksi.

### P1 — Kontrak autentikasi frontend dan GAS perlu diuji
- Frontend mengirim token di `payload.token` dan header Authorization.
- `authenticatePostRequest(e)` memeriksa `postData.token` atau `e.headers.Authorization`, bukan secara eksplisit `postData.payload.token`.
- Bentuk event Apps Script Web App tidak boleh diasumsikan sama dengan request object server Node.
Risiko: autentikasi dapat gagal atau bergantung pada jalur yang belum terbukti. Uji request nyata di lingkungan uji sebelum mengubah kontrak.

### P1 — Logout belum mencabut token
- `Auth.logout(token)` hanya memberi respons sukses; tidak terlihat penyimpanan daftar pencabutan/session state.
Risiko: token dapat tetap dipakai sampai kedaluwarsa jika tidak ada mekanisme lain.

### P1 — Otorisasi harus terpusat di backend
- Router menyisipkan pengguna hasil autentikasi, tetapi handler harus konsisten memeriksa role, status akun, schoolId, classId, dan ownership record.
- Jangan mempercayai userId/studentId/teacherId/userRole/schoolId dari payload klien sebagai otorisasi.

## Temuan frontend yang dikonfirmasi pada main
- `src/components/Sidebar.tsx` menampilkan nama sekolah statis `SD Negeri 1 Tupari`.
- `src/context/AuthContext.tsx`: `switchSchool` hanya mengubah state/localStorage, belum menyinkronkan sekolah aktif ke backend.
- `src/pages/PengaturanPage.tsx`: data sekolah/tahun ajaran/KKM bersifat statis; tombol simpan belum terhubung ke penyimpanan.
- `AuthContext` memulihkan user dari localStorage dan memiliki TODO validasi token saat aplikasi dimulai.

## Urutan perbaikan aman
1. Buat tes otorisasi dengan pengguna super_admin, admin sekolah sendiri, admin sekolah lain, akun nonaktif, siswa kelas lain, dan parameter identitas palsu.
2. Perbaiki isolasi Students: read/create/update/import; semua scope diturunkan atau diverifikasi dari identitas terautentikasi.
3. Perbaiki ujian: role dan identitas siswa dari token; validasi hak atas kelas/ujian/attempt; jangan pernah mengirim kunci jawaban ke siswa.
4. Uji kontrak autentikasi frontend ↔ GAS dengan request nyata di deployment uji.
5. Rancang migrasi password aman dengan backup, format hash yang dapat dikenali, uji login akun lama, dan rollback.
6. Baru lanjutkan penyelarasan sekolah aktif/tahun ajaran dan tahap Materi dinamis.

## Batasan
- Ini hasil audit statis, bukan penetration test dan bukan bukti semua jalur telah diuji.
- Belum ada perubahan kode, skema Sheets, kredensial, atau deployment.
- Jangan commit `backend-gas/Config.gs` mentah ke repositori karena konfigurasi dapat memuat secret/ID sensitif. Bila backend masuk version control, gunakan konfigurasi contoh yang telah disanitasi.
- Semua perubahan berikutnya harus diuji di salinan spreadsheet dan deployment GAS uji sebelum dipertimbangkan untuk produksi.
