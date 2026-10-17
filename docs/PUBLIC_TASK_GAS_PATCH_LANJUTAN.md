> **DEPRECATED — JANGAN DIPASANG.** Arah halaman tugas publik terpisah sudah dibatalkan. Keputusan final: EduTask dipindahkan menjadi fitur native pada menu Tugas Tupari LMS, memakai autentikasi dan spreadsheet yang sudah ada. Dokumen ini hanya arsip historis; jangan menyalin patch ini ke GAS produksi.

# Patch lanjutan GAS — endpoint tautan tugas dan filter sekolah

Status: rancangan untuk ditinjau. Belum dipasang atau diuji di project Apps Script.

## A. Handler untuk tombol guru

Tambahkan metode ini ke objek PublicTasks yang dirancang pada PUBLIC_TASK_GAS_PATCH.md. Router harus meneruskan user yang dihasilkan authenticatePostRequest, bukan user dari payload browser.

~~~javascript
enablePublicLink: function(assignmentId, user) {
  try {
    if (!user || !user.id || !user.role) {
      return { success: false, error: 'Autentikasi diperlukan' };
    }
    const assignment = Database.getById(CONFIG.SHEETS.ASSIGNMENTS, String(assignmentId));
    if (!assignment) return { success: false, error: 'Tugas tidak ditemukan' };

    const cls = Database.getById(CONFIG.SHEETS.CLASSES, String(assignment.classId));
    if (!cls) return { success: false, error: 'Kelas tugas tidak ditemukan' };

    const admin = user.role === 'super_admin' || user.role === 'admin_sekolah';
    const teacherOwner = user.role === 'guru' &&
      String(assignment.teacherId) === String(user.id);
    if (!admin && !teacherOwner) {
      return { success: false, error: 'Tidak memiliki izin membagikan tugas ini' };
    }

    const permittedSchools = Array.isArray(user.schoolIds) ? user.schoolIds.map(String) : [];
    const activeSchool = user.activeSchoolId ? String(user.activeSchoolId) : '';
    if (!admin && !permittedSchools.includes(String(cls.schoolId)) &&
        activeSchool !== String(cls.schoolId)) {
      return { success: false, error: 'Kelas berada di luar sekolah yang diizinkan' };
    }
    if (assignment.schoolId && String(assignment.schoolId) !== String(cls.schoolId)) {
      return { success: false, error: 'Sekolah dan kelas tugas tidak cocok' };
    }

    const token = assignment.publicToken || (Utilities.getUuid() + Utilities.getUuid());
    const update = Database.update(CONFIG.SHEETS.ASSIGNMENTS, String(assignmentId), {
      publicToken: token,
      schoolId: assignment.schoolId || cls.schoolId
    });
    if (!update || update.success !== true) {
      return { success: false, error: 'Tautan gagal disimpan. Periksa header ASSIGNMENTS.' };
    }
    return { success: true, data: { publicToken: token } };
  } catch (error) {
    Logger.log('PublicTasks.enablePublicLink error: ' + error.toString());
    return { success: false, error: 'Tautan tugas gagal dibuat' };
  }
},
~~~

Catatan: periksa apakah peran admin sekolah perlu dibatasi ke sekolah aktif; kode di atas perlu disesuaikan dengan kebijakan multi-sekolah yang sebenarnya. Jangan menambahkan aksi ini ke allowlist publik.

Di router doPost, setelah autentikasi POST berhasil dan variabel user tersedia, tambahkan:

~~~javascript
case 'enablePublicTaskLink':
  result = PublicTasks.enablePublicLink(payload.assignmentId, user);
  break;
~~~

Pastikan nama variabel autentikasi sesuai implementasi router sebenarnya. Jangan menyalin nama variabel ini secara buta.

## B. Filter tugas untuk sekolah

Versi Assignments.getAssignments yang diserahkan hanya memfilter classId/subjectId/status. Frontend sekarang mengirim schoolId. Perubahan minimal harus:

1. Membaca daftar kelas yang terhubung dengan sekolah yang telah diverifikasi di backend.
2. Menyaring tugas berdasarkan classId yang termasuk dalam sekolah tersebut, bukan percaya pada schoolId dari browser.
3. Mempertahankan filter classId, subjectId, dan status yang sudah ada.
4. Tidak menampilkan data lintas sekolah untuk pengguna guru.
5. Menguji tugas lama yang tidak memiliki kolom schoolId, dengan memakai relasi classId → CLASSES.schoolId.

Jangan mengubah metode backend sampai router autentikasi dan aturan schoolIds/activeSchoolId sudah diverifikasi. Cuplikan yang tersedia belum cukup untuk menulis perubahan router secara aman.

## C. Persyaratan skema

Sebelum menguji, pastikan sheet ASSIGNMENTS memiliki header publicToken dan schoolId, serta SUBMISSIONS memiliki header yang dipakai oleh Database.create. Database.update hanya memperbarui kolom yang sudah ada di header; ia tidak membuat kolom baru.

Jangan membuat spreadsheet atau tab baru. Jika header perlu ditambah, backup dulu, tambahkan hanya kolom yang disetujui pada spreadsheet Tupari LMS yang sama, lalu uji pada salinan lingkungan pengembangan.

## D. Tes minimum sebelum deploy

- Pengguna tanpa login tidak bisa memanggil enablePublicTaskLink.
- Guru hanya bisa membuat tautan untuk tugas miliknya dan sekolah yang diizinkan.
- Token salah tidak dapat membaca atau mengirim tugas.
- Draft/closed dan tugas lewat tenggat ditolak.
- NIS yang tidak cocok dengan kelas ditolak.
- Pengumpulan pertama tersimpan tepat satu kali.
- Pengumpulan ulang ditolak bila allowResubmit=false; bila true, baris sebelumnya tetap ada.
- Tidak ada data siswa atau pengumpulan lain yang dikembalikan oleh endpoint publik.

**Status tes: belum dijalankan.** Ini adalah rancangan patch, bukan konfirmasi fungsi sudah berjalan.


## E. Pemeriksaan tambahan sebelum backend dinyatakan aman

Saat meninjau rancangan handler di dokumen patch awal, ada beberapa detail yang wajib ditangani sebelum menyalin kode ke Apps Script:

1. **Kunci untuk mencegah pengumpulan ganda.** Pemeriksaan SUBMISSIONS lalu Database.create bukan operasi atomik. Dua permintaan bersamaan bisa lolos dari pemeriksaan yang sama. Bungkus bagian validasi duplikasi dan penulisan submission dengan `LockService.getScriptLock()`, panggil `waitLock(...)`, dan selalu `releaseLock()` di blok `finally`. Periksa ulang data existing setelah lock didapat.
2. **Tipe nilai spreadsheet.** Nilai `allowResubmit` dari Google Sheets bisa berupa boolean atau teks. Normalisasikan eksplisit; jangan hanya mengandalkan `=== true`.
3. **Tanggal tenggat.** Validasi tanggal yang tidak valid secara eksplisit. Jika `dueDate` berisi tanggal tidak valid, tolak secara aman atau tandai sebagai konfigurasi tugas bermasalah; jangan membiarkan `NaN` melewati pemeriksaan tenggat.
4. **Kecocokan sekolah.** Jika `assignment.schoolId` kosong pada tugas lama, tentukan sekolah melalui kelas dan validasi bahwa kelas itu memang milik sekolah yang benar sebelum menerima pengumpulan.
5. **Skema.** `Database.create` hanya menulis field yang memiliki header. Pastikan header SUBMISSIONS mencakup `id`, `assignmentId`, `studentId`, `content`, `fileUrl`, `submittedAt`, `status`, `score`, `feedback`, dan `createdAt` jika dipakai. Header ASSIGNMENTS harus memiliki `publicToken` dan `schoolId`.
6. **Kontrak respons.** Frontend menampilkan sukses hanya bila `success === true`. Backend harus mengembalikan sukses hanya setelah Database.create mengonfirmasi penulisan. Jangan mengembalikan sukses pada stub `Assignments.submitAssignment`.
7. **Privasi.** Endpoint publik hanya mengembalikan data tugas yang diperlukan, tidak mengembalikan daftar siswa, NIS siswa lain, submission, feedback, atau nilai.

## F. Kriteria selesai sebelum merge

- [ ] Build Vercel success pada commit terbaru.
- [ ] Router doPost ditinjau dan aksi publik dibatasi ke `getPublicTask` dan `submitPublicTask`; `enablePublicTaskLink` wajib melalui autentikasi.
- [ ] `Assignments.getAssignments` memfilter tugas berdasarkan sekolah yang diverifikasi backend, dengan kompatibilitas tugas lama.
- [ ] Header sheet yang diperlukan diverifikasi tanpa membuat spreadsheet baru.
- [ ] Tes sukses: tautan valid + siswa kelas yang benar + tugas aktif + sebelum tenggat.
- [ ] Tes gagal: token salah, tugas draft/closed, tenggat lewat, NIS salah, nama salah, siswa beda kelas/sekolah.
- [ ] Tes pengumpulan ganda termasuk dua permintaan bersamaan.
- [ ] Tes revisi: ditolak jika `allowResubmit=false`; jika true, riwayat lama dipertahankan.
- [ ] Tes guru: hanya pemilik tugas atau admin berizin yang dapat membuat tautan.
- [ ] Deployment uji dan data uji terpisah dari produksi; tidak ada perubahan EduTask.

Belum ada runtime test yang dilakukan untuk item-item ini.
