# Audit Statis: Parameter Data Portal Siswa
Tanggal: 2026-10-16
Branch: `audit/backend-security-2026-10-16`
Status: temuan kode; belum ada perbaikan aplikasi.

## Temuan terverifikasi

### STU-006 — Parameter daftar tugas portal siswa tidak sesuai nama/kontrak fungsi frontend (potensi bug fungsional)
Di `src/pages/StudentPortalPage.tsx`, portal memanggil `api.assignments.getAll(user.activeSchoolId)`. Namun di `src/services/api.ts`, fungsi `assignments.getAll` menerima parameter bernama `classId`, membuat cache key `assignments_${classId}`, dan mengirim aksi `getAssignments` dengan payload `{ classId }`. Artinya nilai `activeSchoolId` dikirim ke endpoint sebagai `classId`. Berdasarkan kode frontend saja, ini merupakan ketidaksesuaian kontrak yang kuat dan dapat menyebabkan daftar tugas kosong/salah bila backend benar-benar memfilter berdasarkan classId.

## Perbaikan yang tidak boleh ditebak
Jangan sekadar mengganti satu parameter di portal sebelum memeriksa backend dan model penugasan: siswa mungkin mempunyai satu classId yang terhubung ke data siswa, atau endpoint mungkin dirancang untuk menerima schoolId meski nama parameter frontend menyatakan classId. Periksa handler `getAssignments`, hubungan siswa-kelas, dan apakah daftar tugas harus memfilter kelas, sekolah, atau penugasan spesifik. Setelah kontrak ditetapkan, lakukan perubahan kecil dan uji dua kelas serta dua sekolah.

## Batasan
- Audit statis saja; tidak ada kode aplikasi, branch main, deployment GAS produksi, atau spreadsheet produksi yang diubah.
- Modul Pembelajaran dan Tugas tidak diimplementasikan atau diubah. Temuan ini hanya menandai kontrak pemanggilan yang perlu diverifikasi sebelum perubahan.
