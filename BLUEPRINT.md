# 📘 TUPARI LMS - Blueprint Final v1.0

**Platform Pembelajaran Digital Berbasis Google Apps Script**  
**Domain:** https://tupari.id/lms  
**Target:** 500+ siswa, multi-sekolah, multi-guru

---

## 🏗️ ARSITEKTUR HYBRID

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (React + Vite + Tailwind)                         │
│  Hosting: Vercel / Netlify (GRATIS)                         │
│  Status: ✅ SELESAI (20+ halaman, responsive, dark mode)    │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS + CORS
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND (Google Apps Script)                               │
│  Status: ⏳ BELUM DIBUAT                                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         ▼                         ▼
┌─────────────────┐      ┌─────────────────┐
│ Google Sheets   │      │ Google Drive    │
│ (Database)      │      │ (File Storage)  │
└─────────────────┘      └─────────────────┘
         │
         ▼
┌─────────────────┐
│ Telegram Bot    │
│ (Notifikasi)    │
└─────────────────┘
```

---

## 📋 DAFTAR MODUL LENGKAP (15 Modul)

### 1. DASHBOARD
**Role:** Semua (tampilan berbeda per role)

**Widget:**
- ✅ Jumlah sekolah/guru/siswa/kelas
- ✅ Materi aktif, tugas aktif, ujian aktif
- ✅ Rekap presensi hari ini
- ✅ Grafik rata-rata nilai
- ✅ Notifikasi terbaru
- ✅ Aktivitas terbaru
- ✅ **Ranking kelas** (untuk siswa)
- ✅ **Progress belajar** (materi dibaca, tugas selesai)

---

### 2. AI CONTENT GENERATOR ⭐ (FITUR UNGGULAN)
**Role:** Super Admin, Admin Sekolah, Guru

**Fitur:**
- ✅ **Auto-Generate Materi** (lengkap dengan penjelasan, contoh, ilustrasi)
- ✅ **Auto-Generate Soal** (PG, esai, interaktif, tingkat Low/Medium/HOTS)
- ✅ **Auto-Generate Modul Ajar** (sesuai Kurikulum Merdeka)
- ✅ **Auto-Generate Bahan Ajar** (presentasi, handout, LKPD)
- ✅ **Auto-Generate Draf Buku** (lengkap per semester)
- ✅ Export ke PDF, DOCX, HTML
- ✅ Save ke library untuk digunakan kembali

**Goal:** Setiap semester bisa generate draf buku otomatis

---

### 3. DATA MASTER
**Role:** Super Admin, Admin Sekolah, Kepala Sekolah, Operator

**Sub-modul:**
- ✅ **Sekolah** (multi-school support)
- ✅ **Tahun Ajaran** (periode akademik)
- ✅ **Guru** (NIP, mapel, kelas wali)
- ✅ **Siswa** (NIS, NISN, data ortu, foto)
- ✅ **Kelas/Rombel** (wali kelas, daftar siswa)
- ✅ **Mata Pelajaran** (kode, KKM, bobot)
- ✅ **Jadwal Pelajaran** (hari, jam, mapel, guru, ruang)

**Fitur:**
- ✅ CRUD lengkap
- ✅ Import/Export Excel
- ✅ Search & filter
- ✅ Validasi data

---

### 4. PERENCANAAN PEMBELAJARAN
**Role:** Guru, Admin Sekolah

**Dokumen:**
- ✅ **CP** (Capaian Pembelajaran)
- ✅ **TP** (Tujuan Pembelajaran)
- ✅ **ATP** (Alur TP)
- ✅ **Prota** (Program Tahunan)
- ✅ **Promes** (Program Semester)
- ✅ **Modul Ajar** (template Kurmer, bebas tapi konsisten)
- ✅ **RPP** (format 1 lembar / lengkap)
- ✅ **LKPD** (lembar kerja)
- ✅ **Bahan Ajar** (PDF, video, link)
- ✅ **Kalender Pendidikan**

**Fitur:**
- ✅ Template per dokumen
- ✅ Edit & duplikasi
- ✅ **Kolaborasi** (guru bisa share & edit bersama)
- ✅ **Bank Soal Terpisah** (reusable, tagging tingkat kesukaran)
- ✅ Export PDF dengan kop sekolah

---

### 5. MATERI PEMBELAJARAN
**Role:** Guru (kelola), Siswa (lihat)

**Fitur:**
- ✅ Upload materi (PDF, Video, Gambar, Link, Teks)
- ✅ Kelompokkan per: Mapel → Kelas → Bab → Pertemuan
- ✅ Status: Draft / Terbit / Arsip
- ✅ Jadwal publish otomatis
- ✅ Tracking: siapa yang sudah baca
- ✅ Lampiran dari Google Drive
- ✅ **Siswa bisa download materi**
- ✅ **Komentar/diskusi** di setiap materi
- ✅ **Pretest & Posttest** quiz (bisa di-setting per materi)
- ✅ Max upload 50MB/file

---

### 6. TUGAS
**Role:** Guru (buat & nilai), Siswa (kerjakan)

**Fitur Guru:**
- ✅ Buat tugas (judul, instruksi, tenggat, nilai max, lampiran)
- ✅ Assign ke 1 atau banyak kelas
- ✅ Lihat rekap pengumpulan (progress bar)
- ✅ Nilai & beri feedback per siswa
- ✅ Koreksi berkas (download, review, upload balik)
- ✅ **Izinkan revisi / pengumpulan ulang** (bisa diatur: Ya/Tidak/Conditional)
- ✅ **Plagiarism check** (bandingkan jawaban antar siswa)
- ✅ **Rubrik penilaian multi-kriteria**
- ✅ Export rekap ke Excel

**Fitur Siswa:**
- ✅ Lihat daftar tugas + deadline
- ✅ Upload jawaban (file / teks)
- ✅ Lihat status (belum / terkumpul / terlambat / dinilai)
- ✅ Lihat nilai & feedback guru
- ✅ Upload revisi jika diizinkan

**Notifikasi:**
- ✅ **Telegram** saat tugas baru

---

### 7. PENILAIAN
**Role:** Guru (input), Siswa (lihat nilai sendiri), Kepala Sekolah (rekap)

**Jenis Nilai:**
- ✅ Tugas (weight default 20%, **bisa di-custom guru**)
- ✅ Ulangan Harian (weight default 30%, **bisa di-custom**)
- ✅ UTS (weight default 20%, **bisa di-custom**)
- ✅ UAS (weight default 30%, **bisa di-custom**)
- ✅ Praktik (weight opsional)

**Fitur:**
- ✅ Input nilai manual (spreadsheet-like)
- ✅ Import nilai dari Excel
- ✅ Hitung otomatis nilai akhir (berdasarkan bobot custom)
- ✅ KKM custom per mapel
- ✅ Status ketuntasan otomatis
- ✅ Remedial flag
- ✅ Grafik perkembangan nilai per siswa
- ✅ Export rapor (PDF)

---

### 8. PRESENSI
**Role:** Guru (catat), Siswa (lihat), Admin (rekap)

**Fitur:**
- ✅ **Presensi manual** (guru input)
- ✅ **Presensi auto** (QR Code / GPS)
- ✅ Status: Hadir / Sakit / Izin / Alpa
- ✅ Upload bukti (surat sakit, dll)
- ✅ **Presensi guru** juga
- ✅ Rekap bulanan/semesteran
- ✅ **Rekap per semester otomatis**
- ✅ Export Excel & PDF

**Catatan:** Ortu tidak perlu lihat presensi anak via Telegram

---

### 9. UJIAN ONLINE (CBT) - POWERFULL ✅
**Role:** Guru (buat), Siswa (kerjakan)

**Fitur Guru:**
- ✅ Bank soal (reusable, per mapel/kelas/tingkat kesukaran)
- ✅ Buat ujian (pilih soal dari bank / manual)
- ✅ Setting: durasi, token, acak soal, acak opsi
- ✅ Setting: tanggal mulai-selesai, attempt limit
- ✅ Monitoring real-time (siapa yang sedang ujian)
- ✅ Koreksi otomatis PG + manual esai
- ✅ Analisis butir soal (daya beda, tingkat kesukaran)
- ✅ Export hasil ke Excel/PDF

**Fitur Siswa:**
- ✅ Login ujian dengan token
- ✅ Timer countdown
- ✅ Navigasi soal + penanda ragu
- ✅ Auto-save setiap 5 detik
- ✅ Recovery jika disconnect
- ✅ Anti-cheat (deteksi pindah tab)
- ✅ Submit + lihat pembahasan (jika diizinkan)

**Fitur Advanced:**
- ✅ **Soal dengan video**
- ✅ **Soal interaktif** (drag-drop, matching)
- ✅ **Proctoring** (kamera aktif saat ujian)

---

### 10. SISWA (Portal Detail)
**Role:** Guru, Admin

**Per Siswa:**
- ✅ Data pribadi lengkap
- ✅ Data orang tua
- ✅ Riwayat kelas (per tahun)
- ✅ Riwayat nilai (per semester)
- ✅ Riwayat presensi
- ✅ Riwayat tugas
- ✅ Riwayat ujian
- ✅ Dokumen (SKHUN, ijazah, dll)

**Catatan:** Tidak perlu portal ortu terpisah, tidak perlu catatan perilaku

---

### 11. LAPORAN
**Role:** Semua (sesuai kewenangan)

**Jenis Laporan:**
- ✅ Rekap Nilai per Siswa / Kelas / Mapel
- ✅ Rekap Presensi
- ✅ Rapor Siswa (format Kurikulum Merdeka)
- ✅ Laporan Buku Induk
- ✅ Laporan Lulus
- ✅ Statistik Sekolah
- ✅ **Laporan periodik otomatis** (email ke ortu per bulan)

**Export:** Excel, PDF

---

### 12. INTEGRASI
**Role:** Super Admin, Admin Sekolah

| Integrasi | Status | Fungsi |
|-----------|--------|--------|
| Google Sheets | ✅ | Database utama |
| Google Drive | ✅ | Penyimpanan file |
| Google Apps Script | ✅ | Backend API |
| **Telegram Bot** | ✅ | Notifikasi ke siswa |

**Catatan:** Cukup Telegram saja, tidak perlu WhatsApp

---

### 13. PENGGUNA & HAK AKSES
**Role:** Super Admin, Admin Sekolah

**Fitur:**
- ✅ CRUD pengguna (guru, siswa, operator)
- ✅ Assign role (Super Admin / Admin / Kepsek / Guru / Siswa / Operator)
- ✅ Permission matrix granular (18+ permission)
- ✅ Multi-school assignment (1 guru bisa di beberapa sekolah)
- ✅ Status aktif/nonaktif
- ✅ Reset password
- ✅ Audit trail

**Catatan:** Tidak perlu role Orang Tua, Bendahara, atau 2FA

---

### 14. PENGATURAN
**Role:** Super Admin, Admin Sekolah

**Sub-menu:**
- ✅ **Umum:** Nama sekolah, NPSN, alamat, logo, visi-misi
- ✅ **Tampilan:** Dark mode, bahasa, timezone
- ✅ **Akademik:** Tahun ajaran aktif, semester aktif, KKM default
- ✅ **Notifikasi:** Enable/disable per event
- ✅ **Keamanan:** Ganti password, sesi aktif
- ✅ **Integrasi:** Token GAS, Telegram bot, Drive folder
- ✅ **Backup:** Export semua data, restore

**Fitur Advanced:**
- ✅ **Multi-bahasa** (ID/EN)
- ✅ **Whitelabel** (ganti logo/warna per sekolah)
- ✅ **Auto-backup harian** ke Google Drive

---

### 15. AUDIT AKTIVITAS
**Role:** Super Admin, Admin, Kepala Sekolah

**Log yang dicatat:**
- ✅ Login/logout
- ✅ CRUD data master
- ✅ Perubahan nilai
- ✅ Perubahan presensi
- ✅ Akses ujian
- ✅ Perubahan pengaturan
- ✅ Export data
- ✅ Failed login attempts

**Fitur:**
- ✅ Filter by user, modul, tanggal, aksi
- ✅ Export log ke Excel
- ✅ Alert untuk aktivitas mencurigakan

---

## 🎯 FITUR ANDALAN: AI CONTENT GENERATION

### **Goal:** Setiap semester bisa generate draf buku otomatis

### **Fitur AI:**

1. **Auto-Generate Materi**
   - Input: Mapel, Kelas, Bab, CP/TP
   - Output: Materi lengkap (teks, gambar, contoh soal)
   - Format: PDF, HTML, DOCX

2. **Auto-Generate Soal**
   - Input: Materi, tingkat kesukaran (Low/Medium/HOTS), jumlah soal
   - Output: Soal PG, esai, interaktif
   - Fitur: Auto-generate jawaban & pembahasan

3. **Auto-Generate Modul Ajar**
   - Input: CP, TP, alokasi waktu
   - Output: Modul ajar lengkap (tujuan, kegiatan, asesmen)
   - Format: PDF, DOCX

4. **Auto-Generate Bahan Ajar**
   - Input: Topik, level
   - Output: Bahan ajar (presentasi, handout, LKPD)

5. **Auto-Generate Draf Buku**
   - Input: Mapel, Kelas, Semester, Daftar Bab
   - Output: Draf buku lengkap (kata pengantar, daftar isi, bab, latihan, glosarium)
   - Format: PDF, DOCX, LaTeX

---

## 📊 STATUS IMPLEMENTASI

### ✅ SELESAI (Frontend)
- [x] 20+ halaman UI (responsive, dark mode)
- [x] API Service Layer (dengan IndexedDB cache)
- [x] CBT Engine (timer, auto-save, anti-cheat, session recovery)
- [x] CBT Analysis (analisis butir soal, daya beda)
- [x] Telegram Settings UI
- [x] AI Generator UI (wizard step-by-step)
- [x] Authentication & Authorization
- [x] Role-based access control

### ⏳ BELUM DIBUAT (Backend GAS)
- [ ] Code.gs (router utama)
- [ ] Auth.gs (login, session, token)
- [ ] Database.gs (CRUD ke Google Sheets)
- [ ] Students.gs, Assignments.gs, Exams.gs, Grades.gs, Attendance.gs
- [ ] Telegram.gs (kirim notifikasi)
- [ ] AIGenerator.gs (integrasi dengan AI API)
- [ ] Struktur Google Sheets (10+ sheet dengan header)

### ⏳ BELUM DIBUAT (Deployment)
- [ ] Deploy frontend ke Vercel
- [ ] Deploy backend ke Google Apps Script
- [ ] Setup Google Sheets database
- [ ] Setup Telegram Bot
- [ ] Setup custom domain (tupari.id)

---

## 🚀 RENCANA IMPLEMENTASI SELANJUTNYA

### **FASE 1: Backend GAS (Minggu 1-2)**
1. Setup project Google Apps Script
2. Buat struktur Google Sheets (10+ sheet)
3. Implementasi Auth (login, session, JWT)
4. Implementasi CRUD dasar (Students, Classes, Subjects)
5. Implementasi modul: Materi, Tugas, Presensi, Penilaian
6. Implementasi CBT backend (submit jawaban, koreksi otomatis)
7. Implementasi Telegram Bot (kirim notifikasi)

### **FASE 2: Integrasi Frontend-Backend (Minggu 3)**
1. Ganti mock data dengan API calls
2. Test login flow end-to-end
3. Test CRUD operations
4. Test CBT (siswa mengerjakan ujian)
5. Test notifikasi Telegram

### **FASE 3: AI Content Generation (Minggu 4)**
1. Integrasi dengan AI API (OpenAI / Gemini / Claude)
2. Implementasi generate materi
3. Implementasi generate soal
4. Implementasi generate modul ajar
5. Implementasi generate draf buku

### **FASE 4: Fitur Advanced (Minggu 5-6)**
1. Presensi QR/GPS
2. Soal interaktif (drag-drop, matching)
3. Proctoring (kamera)
4. Plagiarism check
5. Rubrik multi-kriteria
6. Kolaborasi modul
7. Multi-bahasa
8. Whitelabel
9. Auto-backup

### **FASE 5: Testing & Deployment (Minggu 7-8)**
1. Testing dengan 500 siswa simulasi
2. Performance optimization
3. Security audit
4. Deploy ke production
5. Training untuk guru
6. Dokumentasi user manual

---

## 🔐 KEAMANAN

### **Autentikasi & Otorisasi:**
- ✅ JWT token (session management)
- ✅ Role-based access control (6 role)
- ✅ Permission matrix granular (18+ permission)
- ✅ Multi-school isolation
- ✅ Audit trail

### **Data Protection:**
- ✅ Password hashing (bcrypt)
- ✅ Input validation (frontend + backend)
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ CSRF protection
- ✅ Rate limiting

### **Privacy:**
- ✅ Data siswa terenkripsi
- ✅ Akses berbasis role
- ✅ Audit log untuk data sensitif
- ✅ GDPR compliance (opsional)

---

## 📈 PERFORMA & SKALABILITAS

### **Optimasi yang Sudah Diterapkan:**
- ✅ IndexedDB cache (baca data instant)
- ✅ Optimistic UI updates
- ✅ Background sync
- ✅ Batch operations
- ✅ Debounced API calls
- ✅ Service Worker (cache static assets)

### **Kapasitas:**
- ✅ Target: 500 siswa aktif
- ✅ Target: 50+ guru
- ✅ Target: 5+ sekolah
- ✅ GAS limit: 20.000 request/hari (cukup)
- ✅ Sheets limit: 10 juta cells (cukup)

---

## 📝 CATATAN PENTING

### **Keputusan Desain:**
1. **Kurikulum:** Kurikulum Merdeka (bukan K13)
2. **Format Rapor:** Kurikulum Merdeka
3. **Bobot Nilai:** Default 20/30/20/30, bisa di-custom guru
4. **Notifikasi:** Telegram saja (tidak perlu WhatsApp)
5. **Presensi:** Manual + Auto (QR/GPS)
6. **Portal Ortu:** Tidak perlu (cukup notifikasi via Telegram)

### **Fitur yang TIDAK Diperlukan:**
- ❌ Portal orang tua terpisah
- ❌ Integrasi Dapodik
- ❌ Integrasi e-Rapor Kemendikbud
- ❌ WhatsApp integration
- ❌ Data ekstrakurikuler
- ❌ Data sarpras (ruang/lab)
- ❌ Catatan perilaku siswa
- ❌ 2FA (Two-Factor Auth)
- ❌ Multi-bahasa (kecuali ID/EN)

### **Fitur yang Diperlukan:**
- ✅ Ranking kelas (untuk siswa)
- ✅ Kolaborasi modul antar guru
- ✅ Bank soal terpisah
- ✅ Download materi
- ✅ Komentar/diskusi di materi
- ✅ Pretest & posttest
- ✅ Plagiarism check
- ✅ Rubrik multi-kriteria
- ✅ Submit tugas lebih dari 1 kali (conditional)
- ✅ Presensi guru
- ✅ Soal video
- ✅ Soal interaktif (drag-drop, matching)
- ✅ Proctoring (kamera)
- ✅ Laporan periodik ke ortu (email)
- ✅ Multi-bahasa (ID/EN)
- ✅ Whitelabel
- ✅ Auto-backup harian

---

## 🎯 KESIMPULAN

**TUPARI LMS** adalah platform pembelajaran digital yang:
- ✅ Berbasis arsitektur hybrid (React + GAS)
- ✅ Mendukung multi-sekolah, multi-guru, multi-siswa
- ✅ Memiliki fitur AI Content Generation (unggulan)
- ✅ CBT powerfull dengan anti-cheat & proctoring
- ✅ Terintegrasi dengan Telegram untuk notifikasi
- ✅ Performa tinggi (IndexedDB cache, optimistic UI)
- ✅ Aman (JWT, RBAC, audit trail)
- ✅ Skalabel (target 500+ siswa)

**Status:** Frontend selesai, Backend GAS belum dibuat.  
**Next Step:** Implementasi backend GAS sesuai blueprint ini.

---

**Dokumen ini adalah kontrak final antara developer dan client.**  
**Setiap perubahan harus melalui diskusi dan persetujuan kedua belah pihak.**

---

**Dibuat:** 2025  
**Versi:** 1.0  
**Status:** Final ✅
