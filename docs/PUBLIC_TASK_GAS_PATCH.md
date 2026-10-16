# Patch Google Apps Script: tugas tanpa login siswa

Tanggal: 2026-10-16  
Status: **disiapkan untuk peninjauan; belum dipasang ke Apps Script atau deployment**

Tujuan: siswa membuka tautan tugas tanpa akun/login LMS. Akses publik dibatasi oleh token acak per tugas. Backend tetap menjadi sumber keputusan; jangan mengandalkan validasi frontend.

## 1. Tambahkan modul PublicTasks ke project Apps Script

Buat file .gs baru bernama PublicTasks.gs (atau tempatkan objek ini di file modul yang sesuai). Modul memakai spreadsheet dan sheet yang sudah ada, tidak membuat spreadsheet atau tab baru.

~~~javascript
const PublicTasks = {
  getPublicTask: function(assignmentId, accessToken) {
    try {
      if (!assignmentId || !accessToken) {
        return { success: false, error: 'Tautan tugas tidak lengkap' };
      }

      const assignment = Database.getById(CONFIG.SHEETS.ASSIGNMENTS, String(assignmentId));
      if (!assignment || !assignment.publicToken ||
          String(assignment.publicToken) !== String(accessToken)) {
        return { success: false, error: 'Tautan tugas tidak valid' };
      }

      if (assignment.status !== 'active') {
        return { success: false, error: 'Tugas belum aktif atau sudah ditutup' };
      }

      const cls = Database.getById(CONFIG.SHEETS.CLASSES, String(assignment.classId));
      const subject = Database.getById(CONFIG.SHEETS.SUBJECTS, String(assignment.subjectId));

      return {
        success: true,
        data: {
          id: assignment.id,
          title: assignment.title,
          description: assignment.description || '',
          dueDate: assignment.dueDate || '',
          maxScore: Number(assignment.maxScore || 0),
          status: assignment.status,
          className: cls ? cls.name : '',
          subjectName: subject ? subject.name : ''
        }
      };
    } catch (error) {
      Logger.log('PublicTasks.getPublicTask error: ' + error.toString());
      return { success: false, error: 'Tugas tidak dapat dibuka' };
    }
  },

  submitPublicTask: function(payload) {
    try {
      const assignmentId = String(payload.assignmentId || '');
      const accessToken = String(payload.accessToken || '');
      const studentNis = String(payload.studentNis || '').trim();
      const studentName = String(payload.studentName || '').trim();
      const content = String(payload.content || '').trim();

      if (!assignmentId || !accessToken || !studentNis || !studentName || !content) {
        return { success: false, error: 'Identitas dan jawaban wajib diisi' };
      }
      if (content.length > 30000) {
        return { success: false, error: 'Jawaban melebihi batas 30.000 karakter' };
      }

      const assignment = Database.getById(CONFIG.SHEETS.ASSIGNMENTS, assignmentId);
      if (!assignment || !assignment.publicToken ||
          String(assignment.publicToken) !== accessToken) {
        return { success: false, error: 'Tautan tugas tidak valid' };
      }
      if (assignment.status !== 'active') {
        return { success: false, error: 'Tugas belum aktif atau sudah ditutup' };
      }
      if (assignment.dueDate && new Date(assignment.dueDate).getTime() < Date.now()) {
        return { success: false, error: 'Tenggat tugas telah lewat' };
      }

      const students = Database.getWhere(CONFIG.SHEETS.STUDENTS, {
        schoolId: assignment.schoolId,
        classId: assignment.classId
      });
      const student = students.find(function(s) {
        return String(s.nis || '').trim() === studentNis &&
          String(s.status || 'active') === 'active';
      });
      if (!student) {
        return { success: false, error: 'NIS tidak ditemukan pada kelas tugas ini' };
      }
      if (String(student.name || '').trim().toLocaleLowerCase() !== studentName.toLocaleLowerCase()) {
        return { success: false, error: 'Nama tidak cocok dengan NIS pada data kelas' };
      }

      const existing = Database.getWhere(CONFIG.SHEETS.SUBMISSIONS, {
        assignmentId: assignmentId,
        studentId: String(student.id)
      });
      if (existing.length && assignment.allowResubmit !== true &&
          String(assignment.allowResubmit).toLowerCase() !== 'true') {
        return { success: false, error: 'Tugas sudah pernah dikumpulkan dan revisi tidak diizinkan' };
      }

      const saved = Database.create(CONFIG.SHEETS.SUBMISSIONS, {
        assignmentId: assignmentId,
        studentId: String(student.id),
        content: content,
        fileUrl: '',
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        score: '',
        feedback: ''
      });
      if (!saved || saved.success !== true) {
        return { success: false, error: 'Pengumpulan gagal disimpan. Silakan coba kembali.' };
      }

      return {
        success: true,
        data: { submissionId: saved.data.id, submittedAt: saved.data.submittedAt },
        message: 'Pengumpulan berhasil disimpan'
      };
    } catch (error) {
      Logger.log('PublicTasks.submitPublicTask error: ' + error.toString());
      return { success: false, error: 'Pengumpulan gagal diproses' };
    }
  }
};
~~~

### Catatan sebelum memakai patch

- Cocokkan header aktual pada ASSIGNMENTS, STUDENTS, CLASSES, SUBJECTS, dan SUBMISSIONS. Jangan membuat spreadsheet atau tab baru.
- Pastikan ASSIGNMENTS menyimpan schoolId. Jika tugas lama tidak menyimpannya, validasi kelas terhadap sekolah harus dirancang sesuai skema aktual.
- NIS + nama bukan autentikasi kuat. Seseorang yang mengetahui keduanya dan memegang tautan dapat mencoba mengirim atas nama siswa. Untuk risiko lebih tinggi, tambahkan kode pengumpulan unik per siswa tanpa mewajibkan login LMS.
- Patch ini menerima jawaban teks saja; upload file publik belum diaktifkan.
- Database.getWhere memakai perbandingan ketat; tipe ID harus konsisten.
- Jika revisi diizinkan, patch menyimpan pengumpulan baru dan mempertahankan baris sebelumnya. Tampilan guru perlu memilih pengumpulan terbaru dan dapat menampilkan riwayat revisi.

## 2. Buat token acak saat guru membuat tugas

Pada Assignments.createAssignment(data), sebelum Database.create(...), tambahkan:

~~~javascript
if (!data.publicToken) {
  data.publicToken = Utilities.getUuid() + Utilities.getUuid();
}
~~~

Jangan membuat token di frontend. Token harus diperlakukan seperti rahasia tautan. Endpoint publik hanya membuka tugas dengan status active.

## 3. Tambahkan aksi publik di router doPost

Ubah daftar publicActions menjadi:

~~~javascript
const publicActions = ['login', 'health', 'getPublicTask', 'submitPublicTask'];
~~~

Tambahkan dua kasus ke switch(action) dalam doPost(e):

~~~javascript
case 'getPublicTask':
  result = PublicTasks.getPublicTask(payload.assignmentId, payload.accessToken);
  break;
case 'submitPublicTask':
  result = PublicTasks.submitPublicTask(payload);
  break;
~~~

Aksi ini tidak memerlukan sesi login, tetapi setiap permintaan tetap memvalidasi token tugas dan kecocokan NIS/nama dengan siswa di kelas yang dituju. Jangan menambahkan aksi publik untuk membaca daftar siswa, daftar tugas, atau pengumpulan.

## 4. Urutan pemasangan aman

1. Backup project Apps Script dan spreadsheet.
2. Cocokkan nama tab/header aktual, terutama ASSIGNMENTS, STUDENTS, CLASSES, SUBJECTS, dan SUBMISSIONS.
3. Tambahkan modul dan perubahan router pada project uji.
4. Uji token tidak valid, tugas draft/closed, NIS salah, nama salah, tenggat lewat, pengumpulan pertama, duplikasi, dan revisi yang diizinkan.
5. Deploy versi uji dan pastikan URL Web App yang digunakan frontend benar.
6. Jangan mengubah deployment produksi sebelum pengujian lolos dan disetujui.

**Penting:** frontend branch sudah disiapkan untuk memanggil getPublicTask dan submitPublicTask, tetapi fitur belum berfungsi sampai patch Apps Script dipasang dan diuji. Dokumen ini bukan bukti backend sudah terpasang.


## 5. Endpoint tambahan yang dipakai tombol guru

Tombol Salin Tautan Siswa pada frontend memanggil aksi terautentikasi `enablePublicTaskLink`. Aksi ini belum tersedia di router yang saat ini diserahkan. Sebelum tombol tersebut berfungsi, tambahkan handler backend yang:

- hanya mengizinkan guru pemilik tugas atau admin yang berwenang;
- memastikan tugas dan kelas valid serta berasal dari sekolah yang sesuai;
- membuat token acak di backend dan menyimpannya pada kolom `publicToken` di sheet ASSIGNMENTS yang sama;
- mengembalikan `{ success: true, data: { publicToken: "..." } }` hanya kepada pemanggil berwenang;
- tidak memasukkan aksi ini ke daftar `publicActions` karena pembuatan tautan membutuhkan autentikasi guru.

Jangan menganggap tombol berbagi siap dipakai sampai handler ini ditambahkan dan diuji. Untuk tugas lama, token dapat dibuat saat guru meminta tautan; untuk tugas baru, token juga dapat dibuat saat pembuatan tugas. Kedua jalur harus memakai generator token backend yang sama.


## 6. Filter daftar tugas untuk dashboard guru

Frontend sekarang meminta daftar tugas dengan schoolId, bukan classId. Karena implementasi Assignments.getAssignments yang telah diperiksa hanya memfilter classId, backend harus ditambah dukungan schoolId sebelum daftar tugas guru dianggap benar. Filter sekolah harus memeriksa sekolah kelas yang terkait, sehingga tugas lama tanpa schoolId masih bisa dipetakan dengan aman. Jangan sekadar menerima schoolId dari browser sebagai bukti izin; untuk endpoint guru tetap periksa cakupan sekolah pengguna terautentikasi.

Untuk tugas baru, frontend mengirim schoolId saat membuat tugas. Pastikan header schoolId tersedia di ASSIGNMENTS. Untuk tugas lama, handler enablePublicTaskLink perlu menyimpan token dan, jika schoolId kosong, mengisi schoolId berdasarkan kelas terkait setelah memverifikasi konsistensinya.
