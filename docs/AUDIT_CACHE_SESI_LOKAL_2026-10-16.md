# Audit cache lokal dan batas sesi — Tupari LMS

Tanggal: 2026-10-16
Branch: `audit/backend-security-2026-10-16`

## Temuan dari `src/services/db.ts` dan `src/services/api.ts`

### CACHE-001 — Cache API tetap ada setelah logout
`clearAuth()` di `src/services/api.ts` hanya menghapus `tupari_token` dan `tupari_user`. Cache IndexedDB tersimpan di database `tupari_lms_db` dengan object store `cache`; tidak tampak ada pemanggilan `db.clear('cache')` pada alur logout tersebut.

Dampak yang mungkin: pengguna berikutnya di perangkat yang sama dapat melihat data cache akun/sekolah sebelumnya bila aplikasi meminta cache key yang sama dan menerima fallback stale cache saat server gagal. Ini bukan bukti bahwa seluruh data pasti bocor; perlu diuji pada alur logout/login dan pergantian sekolah.

### CACHE-002 — Tidak aman menghapus seluruh IndexedDB secara membabi buta
Database yang sama juga menyimpan `exam_answers` yang belum tersinkron, `exam_sessions`, `drafts`, preferensi, dan notifikasi. Menghapus semua store saat logout dapat menghilangkan jawaban ujian offline atau draft yang perlu dipulihkan. Karena itu, solusi harus membedakan cache respons API dari jawaban/draft yang belum tersinkron.

### CACHE-003 — Cache tidak terikat ke sesi atau sekolah secara konsisten
Beberapa cache key menggunakan `schoolId` atau `classId`, tetapi key lain menggunakan hanya `studentId`, `examId`, atau ID entitas. Bila pengguna/sekolah berganti, entri cache lama mungkin tetap dapat dipakai. Perlu dipastikan apakah ID unik global dan apakah semua pembacaan memakai cache key yang terisolasi.

### CACHE-004 — Fallback cache stale setelah kegagalan API
`getCachedData()` mengembalikan data cache lama jika permintaan server gagal dan `forceRefresh` tidak aktif. Perilaku ini berguna untuk offline-first, tetapi tidak boleh menjadi fallback untuk data sensitif setelah sesi berubah, token tidak valid, atau sekolah aktif berganti.

## Rekomendasi desain (belum diimplementasikan)
1. Pisahkan kebijakan cache data API dari penyimpanan jawaban ujian/draft offline.
2. Setelah logout atau pergantian akun, bersihkan cache respons API yang sensitif; jangan hapus jawaban/draft offline tanpa aturan pemulihan yang jelas.
3. Gunakan namespace cache yang mencakup identitas sesi/akun dan, jika relevan, sekolah aktif.
4. Pada respons autentikasi invalid (401) dan pergantian sekolah, larang fallback ke cache lintas sesi.
5. Uji skenario: akun A logout lalu akun B login pada browser yang sama; sekolah A berganti sekolah B; token expired ketika offline; jawaban ujian belum tersinkron saat logout; dan pemulihan draft.
6. Pastikan backend tetap memverifikasi izin setiap request. Cache frontend bukan kontrol akses.

## Keputusan keamanan
Belum mengubah kode karena perubahan harus menjaga jawaban ujian offline dan draft. Perbaikan perlu dilakukan secara terpisah, satu fitur, dengan tes regresi. Modul Pembelajaran dan Tugas tidak diubah; pengembangan keduanya menunggu materi/arahan pemilik proyek.
