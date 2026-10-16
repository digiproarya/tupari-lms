# Audit Statis: Portal Siswa dan Kontrak Data Materi
Tanggal: 2026-10-16
Branch: `audit/backend-security-2026-10-16`
Status: dokumentasi temuan saja; tidak ada perubahan kode.

## File yang diperiksa
- `src/pages/StudentPortalPage.tsx`
- `src/pages/MateriPage.tsx`
- `src/services/api.ts`
- `src/types/index.ts`

## Temuan

### STU-001 — Pengambilan materi portal siswa menggunakan ID sekolah, bukan identitas kelas/siswa (perlu verifikasi backend)
Portal siswa memanggil `api.materials.getAll(user.activeSchoolId)`. Tipe `Material` frontend memiliki `classId`, `teacherId`, dan `status`, tetapi pemanggilan di portal tidak menyertakan `user.id` atau `classId` sebagai parameter. Belum dapat dipastikan dari frontend bahwa respons dibatasi hanya pada materi yang ditujukan untuk siswa tersebut. Backend harus memastikan filter sekolah, kelas, status publikasi, dan penugasan berdasarkan identitas terverifikasi; jangan mengandalkan filter tampilan saja.

### STU-002 — Identitas user siswa diasumsikan sama dengan studentId untuk nilai/presensi
Portal memanggil `api.grades.getByStudent(user.id)` dan `api.attendance.getByStudent(user.id)`. Tipe frontend membedakan `User.id` dan `Student.id`, tetapi tidak ada kontrak yang membuktikan nilainya selalu sama. Perlu verifikasi data sheet dan login siswa sebelum mengubah parameter. Backend harus memetakan sesi login ke rekam siswa yang benar dan tidak mempercayai studentId kiriman klien tanpa pemeriksaan kepemilikan.

### STU-003 — Cache materi belum terbukti terisolasi per sesi pengguna
Lapisan cache menggunakan key berbasis schoolId untuk daftar materi, sementara mekanisme cache generik dapat mengembalikan cache lama saat server gagal. Cache sekolah mungkin memang dibagi pada tingkat sekolah, tetapi belum ada pemeriksaan yang membuktikan data yang dikembalikan aman untuk semua role atau penugasan di sekolah itu. Sebelum menambah detail materi khusus kelas/siswa, desain cache perlu memasukkan konteks akses yang relevan atau meniadakan fallback untuk data yang sensitif. Jangan menghapus seluruh IndexedDB tanpa migrasi karena data offline ujian/draf juga disimpan di sana.

### STU-004 — Portal siswa dan halaman Materi umum adalah dua permukaan UI berbeda
`StudentPortalPage.tsx` menyediakan tab Materi di portal siswa; `MateriPage.tsx` merupakan halaman menu Materi umum dan juga mengakses daftar materi, mata pelajaran, dan kelas. Sebelum menyatukan tampilan enam tahap dari prototipe HTML, perlu diputuskan titik integrasi yang benar dan dicek route/sidebar agar tidak membuat dua sumber data atau dua implementasi progres yang berbeda. Audit ini tidak memilih atau mengubah titik integrasi.

### STU-005 — Tipe Material saat ini belum memuat model enam tahap
Interface `Material` hanya memuat identitas materi, mata pelajaran, kelas, guru, jenis, konten, status, tanggal publikasi, dan tanggal pembuatan. Tidak terlihat model tahap, jawaban per tahap, atau progres per siswa pada tipe tersebut. Ini bukan bukti bahwa backend tidak memiliki tabel/JSON tambahan, tetapi model data enam tahap belum tampak di kontrak TypeScript yang diperiksa. Sebelum implementasi, audit sheet/backend untuk mengetahui apakah tahap perlu berupa struktur tertanam, sheet terpisah, atau konfigurasi konten yang sudah ada.

## Urutan verifikasi sebelum implementasi
1. Cocokkan route siswa yang dipakai sebenarnya (`/portal` dan/atau `/materi`) dengan pengalaman yang diinginkan.
2. Periksa handler GAS untuk daftar materi, pemfilteran school/class/status, serta pemetaan akun login siswa ke data siswa.
3. Uji dengan dua sekolah, dua kelas dalam satu sekolah, dan dua akun siswa untuk memastikan materi tidak bocor silang.
4. Tetapkan kontrak data untuk enam tahap, status selesai, jawaban, dan progres per siswa.
5. Baru setelah Mr. memberikan materi dan instruksi untuk modul Pembelajaran, implementasikan perubahan dalam satu lingkup kecil dengan uji regresi.

## Batasan yang tetap berlaku
- Tidak ada kode aplikasi yang diubah.
- Tidak ada perubahan pada `main`, deployment GAS produksi, atau spreadsheet produksi.
- Modul Pembelajaran dan Tugas tidak diimplementasikan atau diubah. Dokumen ini hanya mencatat hasil pembacaan kode.
