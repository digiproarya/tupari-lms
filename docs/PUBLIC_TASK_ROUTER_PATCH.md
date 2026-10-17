# Tupari LMS — Patch router GAS untuk Tugas Publik

Status: **patch dokumentasi untuk review**, belum dipasang atau diuji pada Apps Script aktif. Terapkan hanya pada branch kerja GAS setelah mencocokkan router aktif dan header spreadsheet. Jangan ubah deployment produksi atau EduTask dalam langkah ini.

## 1. Allowlist publik POST

Pada `doPost(e)`, router yang dipulihkan dari arsip memakai:

```javascript
const publicActions = ['login', 'health'];
```

Ubah hanya allowlist menjadi:

```javascript
const publicActions = [
  'login',
  'health',
  'getPublicTask',
  'submitPublicTask'
];
```

**Jangan** masukkan `enablePublicTaskLink` ke allowlist. Aksi itu harus tetap melalui autentikasi dan pemeriksaan kepemilikan tugas.

## 2. Tambahkan tiga case di switch `doPost`

Letakkan dalam bagian Assignment/Tugas:

```javascript
case 'getPublicTask':
  result = PublicTasks.getPublicTask(
    payload.assignmentId,
    payload.accessToken
  );
  break;

case 'submitPublicTask':
  result = PublicTasks.submitPublicTask(payload);
  break;

case 'enablePublicTaskLink':
  result = PublicTasks.enablePublicLink(payload.assignmentId, user);
  break;
```

Signature penting: rancangan handler `getPublicTask` menerima **dua argumen** (`assignmentId`, `accessToken`), sedangkan `submitPublicTask` menerima satu objek `payload`. Handler `enablePublicLink` menerima ID tugas dan objek `user` hasil autentikasi router—bukan identitas/role dari browser.

## 3. Kontrak respons

Frontend `publicTaskRequest` mengharapkan JSON dengan `success: true` dan data di properti `data`. Sebelum mengaktifkan fitur, pastikan tiga handler mempertahankan bentuk respons itu dan hanya mengembalikan detail tugas minimum kepada publik. Jangan mengirim token sesi guru, data siswa lain, jawaban/kunci, atau informasi internal.

## 4. Syarat sebelum dianggap siap

- [ ] Cocokkan nama objek `PublicTasks` dan nama metode dengan file GAS yang benar-benar aktif.
- [ ] Pastikan header `ASSIGNMENTS` mendukung `publicToken` dan `schoolId`.
- [ ] Pastikan header `SUBMISSIONS` mendukung seluruh kolom yang ditulis handler.
- [ ] Handler publik memvalidasi token, status aktif, tenggat yang valid, dan identitas siswa terhadap kelas/sekolah tugas.
- [ ] Gunakan `LockService` dan periksa ulang duplikasi di dalam lock sebelum menyimpan submission.
- [ ] `allowResubmit` diproses konsisten baik sebagai boolean maupun string dari Sheets.
- [ ] `enablePublicLink` memverifikasi kepemilikan guru dan sekolah yang diizinkan.
- [ ] `Assignments.getAssignments` menerapkan filter sekolah di backend; filter frontend saja tidak cukup.
- [ ] Uji: token salah, tugas draft/tutup/kedaluwarsa, NIS tidak cocok, submit ganda bersamaan, izin guru salah, dan penyimpanan benar-benar berhasil.
- [ ] Build/typecheck frontend dan uji integrasi GAS dilakukan sebelum PR keluar dari status draft.

## 5. Batas perubahan

Patch ini hanya panduan router. Jangan mengubah `submitTask`, `UploadHandler`, `Database`, skema spreadsheet, arsitektur, deployment produksi, atau integrasi EduTask sebagai bagian dari patch ini. Jangan menganggap respons sukses dari handler sebagai bukti tersimpan sebelum memeriksa hasil tulis aktual.

**Keputusan:** PR #1 tetap draft dan belum boleh merge sampai handler, header, isolasi sekolah, serta pengujian integrasi diverifikasi.
