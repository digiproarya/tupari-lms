# Batasan Tahap Pengembangan Tupari LMS

Tanggal: 2026-10-16

## Instruksi pemilik proyek
- **Jangan mulai mengembangkan atau mengubah modul Pembelajaran dan Tugas sebelum meminta materi/arahan dari pemilik proyek.**
- Saat pekerjaan sudah mendekati tahap Pembelajaran atau Tugas, berhenti sebelum membuat perubahan pada kedua modul tersebut, lalu beri tahu pemilik proyek agar dapat mengirimkan bahan, alur, ketentuan, dan contoh yang ingin digunakan.
- Audit yang hanya membaca struktur, dependensi, dan kontrak API boleh dilakukan selama tidak mengubah perilaku kedua modul.
- Jangan membuat asumsi tentang fitur, alur kerja, rubrik, struktur konten, atau skema data Pembelajaran dan Tugas.
- Setelah bahan diterima, audit bahan dan implementasi yang ada terlebih dahulu; usulkan perubahan minimal sebelum mengedit kode.

## Urutan kerja yang tetap berlaku
1. Pertahankan arsitektur frontend React/Vite + TypeScript, backend Google Apps Script, dan Google Sheets.
2. Audit integrasi autentikasi dan akses data nyata terlebih dahulu; gunakan branch terpisah.
3. Jangan mengubah proyek GAS produksi, spreadsheet produksi, atau branch main sebelum pengujian dan persetujuan.
4. Jangan memasukkan file konfigurasi/secrets (token, API key, password, ID sensitif) ke GitHub.
5. Lakukan satu perubahan terukur pada satu waktu; jalankan pemeriksaan/build dan dokumentasikan hasilnya.
6. Jangan menggabungkan proposal atau patch yang belum diuji seolah-olah sudah siap rilis.

## Status saat catatan dibuat
- Branch kerja: audit/backend-security-2026-10-16
- Branch berisi dokumentasi audit dan proposal, bukan perubahan backend produksi.
- main belum diubah oleh pekerjaan audit ini.
- Proposal FIX-002 isolasi data siswa belum layak diterapkan langsung; router GET, objek user terverifikasi, schema role/school scope, dan kontrak request perlu dipastikan terlebih dahulu.
- Pembelajaran dan Tugas: **ditahan untuk implementasi sampai pemilik proyek mengirimkan bahan/arahan**.
