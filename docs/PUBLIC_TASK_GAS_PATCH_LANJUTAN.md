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
