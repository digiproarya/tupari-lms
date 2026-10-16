# Validasi lanjutan FIX-002 — 2026-10-16

## Hasil pemeriksaan sumber arsip
Saya membandingkan proposal dengan `backend-gas/Students.gs` dan bagian router `backend-gas/Code.gs` pada arsip yang dikonfirmasi pengguna sebagai sumber aktif.

### Fakta yang dikonfirmasi
- Modul `Students` dalam arsip memiliki lima operasi: `getStudents`, `getStudent`, `createStudent`, `updateStudent`, dan `bulkImport`.
- GET router saat ini memanggil `Students.getStudents(params)` dan `Students.getStudent(params.studentId)`.
- POST router memanggil `createStudent(payload)`, `updateStudent(payload.studentId, payload)`, dan `bulkImport(payload.schoolId, payload.students)`.
- Fungsi data siswa yang ada tidak melakukan otorisasi berbasis user di dalam modul `Students`.
- Contoh `testCreateStudent()` dan tes lain di `Code.gs` memanggil fungsi tanpa konteks user. Setelah pemeriksaan akses ditambahkan, tes tersebut harus diperbarui menjadi tes yang memakai user terverifikasi atau diganti dengan pengujian khusus.

## Penghalang penting sebelum patch bisa diterapkan
1. **Jalur GET belum terbukti mengautentikasi token dan menyisipkan user terverifikasi.** Pada potongan router yang diperiksa, `params` berasal dari `e.parameter`; belum terlihat penambahan `params.user`. Patch yang mengharuskan `params.user` akan menolak seluruh GET sampai router GET terlebih dahulu memverifikasi token dan menyisipkan user hasil verifikasi.
2. **Nama ID pengguna belum terbukti.** Helper patch mengharapkan `user.id`, tetapi schema autentikasi aktif perlu dikonfirmasi apakah memakai `id`, `userId`, atau field lain.
3. **Role dan scope sekolah perlu cocok dengan data nyata.** `schoolIds` bisa berupa JSON string atau array; harus diperiksa terhadap baris USERS dan format role yang benar-benar digunakan. Jangan mengandalkan `activeSchoolId` sebagai fallback jika kebijakan akun mengharuskan scope eksplisit tanpa persetujuan.
4. **Kebijakan super_admin perlu eksplisit.** Patch mengizinkan super_admin membaca semua sekolah bila schoolId tidak diberikan. Pastikan ini sesuai kebijakan dan setiap operasi lintas sekolah diaudit.
5. **Kontrak API belum diuji.** Frontend mungkin mengirim parameter GET dengan format berbeda dari yang diasumsikan patch. Jangan mengubah produksi sebelum pengujian request nyata.

## Status patch
Patch di `patches/FIX-002_student_isolation.patch` tetap proposal, bukan patch siap rilis. Jangan menerapkan secara langsung ke proyek GAS aktif. Urutan aman:
1. Buat salinan proyek GAS dan salinan spreadsheet uji.
2. Audit fungsi autentikasi GET di `Code.gs`, bentuk objek yang dikembalikan `Auth.verifyToken`, serta schema `USERS` dan `STUDENTS`.
3. Implementasikan autentikasi terpusat di router terlebih dahulu.
4. Terapkan otorisasi `Students` berdasarkan user terverifikasi.
5. Uji dua sekolah, dua admin sekolah, super_admin, siswa, token invalid/expired, dan parameter schoolId palsu.
6. Jalankan smoke test seluruh modul karena perubahan router dapat memengaruhi endpoint lain.
7. Baru setelah lulus, siapkan rilis produksi dengan backup dan rencana rollback.

## Batasan
Tidak ada perubahan pada spreadsheet, deployment, `main`, atau proyek GAS produksi. Ini hanya catatan validasi statis.
