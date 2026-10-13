import { User, School, Student, Class, Subject, Material, Assignment, Exam, Grade, Attendance, Notification, AuditLog, AcademicPeriod } from '../types';

// ==================== SCHOOLS ====================
export const schools: School[] = [
  { id: 'sch1', name: 'SD Negeri 1 Tupari', npsn: '20100001', address: 'Jl. Pendidikan No. 1, Jakarta', level: 'SD', curriculum: 'Kurikulum Merdeka', academicYear: '2025/2026', semester: 2 },
  { id: 'sch2', name: 'SMP Negeri 5 Tupari', npsn: '20200005', address: 'Jl. Merdeka No. 5, Jakarta', level: 'SMP', curriculum: 'Kurikulum Merdeka', academicYear: '2025/2026', semester: 2 },
  { id: 'sch3', name: 'SMA Negeri 3 Tupari', npsn: '20300003', address: 'Jl. Cendekia No. 3, Jakarta', level: 'SMA', curriculum: 'Kurikulum Merdeka', academicYear: '2025/2026', semester: 2 },
];

// ==================== USERS ====================
export const users: User[] = [
  { id: 'u1', name: 'Admin Pusat', email: 'admin@tupari.id', role: 'super_admin', schoolIds: ['sch1', 'sch2', 'sch3'], activeSchoolId: 'sch1', status: 'active', createdAt: '2024-01-01' },
  { id: 'u2', name: 'Budi Santoso, S.Pd', email: 'budi@tupari.id', role: 'admin_sekolah', schoolIds: ['sch1'], activeSchoolId: 'sch1', status: 'active', createdAt: '2024-01-15' },
  { id: 'u3', name: 'Dr. Siti Rahayu', email: 'kepsek@tupari.id', role: 'kepala_sekolah', schoolIds: ['sch1'], activeSchoolId: 'sch1', status: 'active', createdAt: '2024-02-01' },
  { id: 'u4', name: 'Ahmad Fauzi, M.Pd', email: 'ahmad@tupari.id', role: 'guru', schoolIds: ['sch1', 'sch2'], activeSchoolId: 'sch1', status: 'active', createdAt: '2024-02-15' },
  { id: 'u5', name: 'Dewi Lestari, S.Pd', email: 'dewi@tupari.id', role: 'guru', schoolIds: ['sch1'], activeSchoolId: 'sch1', status: 'active', createdAt: '2024-03-01' },
  { id: 'u6', name: 'Rizki Pratama', email: 'rizki@tupari.id', role: 'siswa', schoolIds: ['sch1'], activeSchoolId: 'sch1', status: 'active', createdAt: '2024-06-01' },
  { id: 'u7', name: 'Anisa Putri', email: 'anisa@tupari.id', role: 'siswa', schoolIds: ['sch1'], activeSchoolId: 'sch1', status: 'active', createdAt: '2024-06-01' },
  { id: 'u8', name: 'Operator Sekolah', email: 'operator@tupari.id', role: 'operator', schoolIds: ['sch1'], activeSchoolId: 'sch1', status: 'active', createdAt: '2024-04-01' },
];

// ==================== STUDENTS ====================
export const students: Student[] = [
  { id: 'st1', nis: '2024001', nisn: '0012345001', name: 'Rizki Pratama', classId: 'c1', schoolId: 'sch1', gender: 'L', birthDate: '2013-05-15', parentName: 'Hadi Pratama', parentPhone: '081234567890', status: 'active' },
  { id: 'st2', nis: '2024002', nisn: '0012345002', name: 'Anisa Putri', classId: 'c1', schoolId: 'sch1', gender: 'P', birthDate: '2013-08-22', parentName: 'Putri Handayani', parentPhone: '081234567891', status: 'active' },
  { id: 'st3', nis: '2024003', nisn: '0012345003', name: 'Bima Sakti', classId: 'c1', schoolId: 'sch1', gender: 'L', birthDate: '2013-03-10', parentName: 'Sakti Wibowo', parentPhone: '081234567892', status: 'active' },
  { id: 'st4', nis: '2024004', nisn: '0012345004', name: 'Citra Dewi', classId: 'c1', schoolId: 'sch1', gender: 'P', birthDate: '2013-11-05', parentName: 'Dewi Anggraini', parentPhone: '081234567893', status: 'active' },
  { id: 'st5', nis: '2024005', nisn: '0012345005', name: 'Dimas Arya', classId: 'c2', schoolId: 'sch1', gender: 'L', birthDate: '2013-07-18', parentName: 'Arya Nugraha', parentPhone: '081234567894', status: 'active' },
  { id: 'st6', nis: '2024006', nisn: '0012345006', name: 'Eka Safitri', classId: 'c2', schoolId: 'sch1', gender: 'P', birthDate: '2013-02-28', parentName: 'Safitri Rahma', parentPhone: '081234567895', status: 'active' },
  { id: 'st7', nis: '2024007', nisn: '0012345007', name: 'Farhan Maulana', classId: 'c2', schoolId: 'sch1', gender: 'L', birthDate: '2013-09-12', parentName: 'Maulana Ibrahim', parentPhone: '081234567896', status: 'active' },
  { id: 'st8', nis: '2024008', nisn: '0012345008', name: 'Gita Permata', classId: 'c2', schoolId: 'sch1', gender: 'P', birthDate: '2013-04-20', parentName: 'Permata Sari', parentPhone: '081234567897', status: 'active' },
  { id: 'st9', nis: '2024009', nisn: '0012345009', name: 'Hendra Wijaya', classId: 'c3', schoolId: 'sch1', gender: 'L', birthDate: '2013-06-30', parentName: 'Wijaya Kusuma', parentPhone: '081234567898', status: 'active' },
  { id: 'st10', nis: '2024010', nisn: '0012345010', name: 'Indah Permadi', classId: 'c3', schoolId: 'sch1', gender: 'P', birthDate: '2013-12-01', parentName: 'Permadi Setia', parentPhone: '081234567899', status: 'active' },
  { id: 'st11', nis: '2024011', nisn: '0012345011', name: 'Joko Susilo', classId: 'c1', schoolId: 'sch1', gender: 'L', birthDate: '2013-01-15', parentName: 'Susilo Bambang', parentPhone: '081234567900', status: 'active' },
  { id: 'st12', nis: '2024012', nisn: '0012345012', name: 'Kartika Sari', classId: 'c1', schoolId: 'sch1', gender: 'P', birthDate: '2013-10-08', parentName: 'Sari Wulandari', parentPhone: '081234567901', status: 'active' },
];

// ==================== CLASSES ====================
export const classes: Class[] = [
  { id: 'c1', name: '4A', grade: 4, schoolId: 'sch1', homeroomTeacherId: 'u4', academicYearId: 'ap1', studentCount: 6 },
  { id: 'c2', name: '4B', grade: 4, schoolId: 'sch1', homeroomTeacherId: 'u5', academicYearId: 'ap1', studentCount: 4 },
  { id: 'c3', name: '5A', grade: 5, schoolId: 'sch1', homeroomTeacherId: 'u4', academicYearId: 'ap1', studentCount: 2 },
  { id: 'c4', name: '5B', grade: 5, schoolId: 'sch1', homeroomTeacherId: 'u5', academicYearId: 'ap1', studentCount: 0 },
  { id: 'c5', name: '6A', grade: 6, schoolId: 'sch1', homeroomTeacherId: 'u4', academicYearId: 'ap1', studentCount: 0 },
];

// ==================== SUBJECTS ====================
export const subjects: Subject[] = [
  { id: 'sb1', name: 'Matematika', code: 'MTK', grade: 4, schoolId: 'sch1' },
  { id: 'sb2', name: 'Bahasa Indonesia', code: 'BIN', grade: 4, schoolId: 'sch1' },
  { id: 'sb3', name: 'IPA', code: 'IPA', grade: 4, schoolId: 'sch1' },
  { id: 'sb4', name: 'IPS', code: 'IPS', grade: 4, schoolId: 'sch1' },
  { id: 'sb5', name: 'Pendidikan Pancasila', code: 'PPN', grade: 4, schoolId: 'sch1' },
  { id: 'sb6', name: 'Seni Budaya', code: 'SBD', grade: 4, schoolId: 'sch1' },
  { id: 'sb7', name: 'PJOK', code: 'PJK', grade: 4, schoolId: 'sch1' },
  { id: 'sb8', name: 'Bahasa Inggris', code: 'BIG', grade: 4, schoolId: 'sch1' },
];

// ==================== MATERIALS ====================
export const materials: Material[] = [
  { id: 'm1', title: 'Pecahan dan Desimal', description: 'Materi tentang konsep pecahan dan konversi ke desimal', subjectId: 'sb1', classId: 'c1', teacherId: 'u4', type: 'pdf', content: '/files/pecahan.pdf', status: 'published', publishDate: '2025-01-15', createdAt: '2025-01-14' },
  { id: 'm2', title: 'Kalimat Utama dan Penjelas', description: 'Materi mengidentifikasi kalimat utama dalam paragraf', subjectId: 'sb2', classId: 'c1', teacherId: 'u5', type: 'text', content: 'Kalimat utama adalah kalimat yang mengandung gagasan pokok...', status: 'published', publishDate: '2025-01-20', createdAt: '2025-01-19' },
  { id: 'm3', title: 'Siklus Air', description: 'Video pembelajaran tentang siklus air', subjectId: 'sb3', classId: 'c1', teacherId: 'u4', type: 'video', content: 'https://youtube.com/watch?v=example', status: 'published', publishDate: '2025-02-01', createdAt: '2025-01-28' },
  { id: 'm4', title: 'Peta Indonesia', description: 'Materi mengenal peta dan letak geografis Indonesia', subjectId: 'sb4', classId: 'c2', teacherId: 'u5', type: 'image', content: '/files/peta-indonesia.jpg', status: 'published', publishDate: '2025-02-10', createdAt: '2025-02-08' },
  { id: 'm5', title: 'Operasi Hitung Campuran', description: 'Draft materi operasi hitung campuran', subjectId: 'sb1', classId: 'c1', teacherId: 'u4', type: 'text', content: 'Operasi hitung campuran melibatkan penjumlahan, pengurangan, perkalian, dan pembagian...', status: 'draft', publishDate: '', createdAt: '2025-02-15' },
];

// ==================== ASSIGNMENTS ====================
export const assignments: Assignment[] = [
  { id: 'a1', title: 'Latihan Soal Pecahan', description: 'Kerjakan soal-soal latihan tentang pecahan halaman 45-47', subjectId: 'sb1', classId: 'c1', teacherId: 'u4', dueDate: '2025-02-20', maxScore: 100, status: 'active', submissions: [
    { id: 'as1', assignmentId: 'a1', studentId: 'st1', content: 'Jawaban soal nomor 1-10', submittedAt: '2025-02-18', status: 'graded', score: 85, feedback: 'Bagus, perhatikan penyederhanaan pecahan' },
    { id: 'as2', assignmentId: 'a1', studentId: 'st2', content: 'Jawaban soal nomor 1-10', submittedAt: '2025-02-19', status: 'graded', score: 92, feedback: 'Sempurna!' },
    { id: 'as3', assignmentId: 'a1', studentId: 'st3', content: '', submittedAt: '', status: 'pending' },
    { id: 'as4', assignmentId: 'a1', studentId: 'st4', content: 'Jawaban terlambat', submittedAt: '2025-02-21', status: 'late', score: 70 },
  ]},
  { id: 'a2', title: 'Menulis Paragraf', description: 'Tulis sebuah paragraf deskripsi tentang hewan kesukaanmu', subjectId: 'sb2', classId: 'c1', teacherId: 'u5', dueDate: '2025-02-25', maxScore: 100, status: 'active', submissions: [
    { id: 'as5', assignmentId: 'a2', studentId: 'st1', content: '', submittedAt: '', status: 'pending' },
    { id: 'as6', assignmentId: 'a2', studentId: 'st2', content: 'Hewan kesukaanku adalah kucing...', submittedAt: '2025-02-22', status: 'submitted' },
  ]},
  { id: 'a3', title: 'Diagram Siklus Air', description: 'Buat diagram siklus air dengan label yang benar', subjectId: 'sb3', classId: 'c1', teacherId: 'u4', dueDate: '2025-02-15', maxScore: 100, status: 'closed', submissions: [] },
];

// ==================== EXAMS ====================
export const exams: Exam[] = [
  { id: 'e1', title: 'Ulangan Harian Matematika Bab 3', subjectId: 'sb1', classId: 'c1', teacherId: 'u4', duration: 60, startDate: '2025-03-01', endDate: '2025-03-01', status: 'active', shuffleQuestions: true, shuffleOptions: true, token: 'MTK4A001', questions: [
    { id: 'q1', examId: 'e1', type: 'multiple_choice', question: 'Hasil dari 1/2 + 1/4 adalah...', options: ['1/6', '3/4', '2/6', '1/4'], correctAnswer: '3/4', points: 10, order: 1 },
    { id: 'q2', examId: 'e1', type: 'multiple_choice', question: 'Pecahan yang senilai dengan 2/3 adalah...', options: ['4/6', '3/4', '2/6', '4/9'], correctAnswer: '4/6', points: 10, order: 2 },
    { id: 'q3', examId: 'e1', type: 'multiple_choice', question: '0,75 dalam bentuk pecahan adalah...', options: ['1/2', '3/4', '2/3', '7/5'], correctAnswer: '3/4', points: 10, order: 3 },
    { id: 'q4', examId: 'e1', type: 'essay', question: 'Jelaskan cara mengubah pecahan biasa menjadi desimal!', points: 20, order: 4 },
    { id: 'q5', examId: 'e1', type: 'multiple_choice', question: 'Hasil dari 3/4 - 1/2 adalah...', options: ['1/4', '2/4', '1/2', '2/6'], correctAnswer: '1/4', points: 10, order: 5 },
  ]},
  { id: 'e2', title: 'UTS Bahasa Indonesia', subjectId: 'sb2', classId: 'c1', teacherId: 'u5', duration: 90, startDate: '2025-03-10', endDate: '2025-03-10', status: 'draft', shuffleQuestions: false, shuffleOptions: false, questions: [] },
];

// ==================== GRADES ====================
export const grades: Grade[] = [
  { id: 'g1', studentId: 'st1', subjectId: 'sb1', classId: 'c1', type: 'tugas', score: 85, maxScore: 100, weight: 20, semester: 2, academicYear: '2025/2026' },
  { id: 'g2', studentId: 'st1', subjectId: 'sb1', classId: 'c1', type: 'uh', score: 78, maxScore: 100, weight: 30, semester: 2, academicYear: '2025/2026' },
  { id: 'g3', studentId: 'st2', subjectId: 'sb1', classId: 'c1', type: 'tugas', score: 92, maxScore: 100, weight: 20, semester: 2, academicYear: '2025/2026' },
  { id: 'g4', studentId: 'st2', subjectId: 'sb1', classId: 'c1', type: 'uh', score: 88, maxScore: 100, weight: 30, semester: 2, academicYear: '2025/2026' },
  { id: 'g5', studentId: 'st3', subjectId: 'sb1', classId: 'c1', type: 'tugas', score: 70, maxScore: 100, weight: 20, semester: 2, academicYear: '2025/2026' },
  { id: 'g6', studentId: 'st4', subjectId: 'sb2', classId: 'c1', type: 'tugas', score: 88, maxScore: 100, weight: 20, semester: 2, academicYear: '2025/2026' },
  { id: 'g7', studentId: 'st1', subjectId: 'sb2', classId: 'c1', type: 'tugas', score: 75, maxScore: 100, weight: 20, semester: 2, academicYear: '2025/2026' },
  { id: 'g8', studentId: 'st1', subjectId: 'sb3', classId: 'c1', type: 'uh', score: 82, maxScore: 100, weight: 30, semester: 2, academicYear: '2025/2026' },
];

// ==================== ATTENDANCE ====================
export const attendance: Attendance[] = [
  { id: 'at1', studentId: 'st1', classId: 'c1', date: '2025-02-17', subjectId: 'sb1', status: 'hadir', recordedBy: 'u4' },
  { id: 'at2', studentId: 'st2', classId: 'c1', date: '2025-02-17', subjectId: 'sb1', status: 'hadir', recordedBy: 'u4' },
  { id: 'at3', studentId: 'st3', classId: 'c1', date: '2025-02-17', subjectId: 'sb1', status: 'sakit', note: 'Demam', recordedBy: 'u4' },
  { id: 'at4', studentId: 'st4', classId: 'c1', date: '2025-02-17', subjectId: 'sb1', status: 'hadir', recordedBy: 'u4' },
  { id: 'at5', studentId: 'st11', classId: 'c1', date: '2025-02-17', subjectId: 'sb1', status: 'izin', note: 'Acara keluarga', recordedBy: 'u4' },
  { id: 'at6', studentId: 'st12', classId: 'c1', date: '2025-02-17', subjectId: 'sb1', status: 'hadir', recordedBy: 'u4' },
  { id: 'at7', studentId: 'st1', classId: 'c1', date: '2025-02-18', subjectId: 'sb2', status: 'hadir', recordedBy: 'u5' },
  { id: 'at8', studentId: 'st2', classId: 'c1', date: '2025-02-18', subjectId: 'sb2', status: 'hadir', recordedBy: 'u5' },
  { id: 'at9', studentId: 'st3', classId: 'c1', date: '2025-02-18', subjectId: 'sb2', status: 'hadir', recordedBy: 'u5' },
  { id: 'at10', studentId: 'st4', classId: 'c1', date: '2025-02-18', subjectId: 'sb2', status: 'alpa', recordedBy: 'u5' },
];

// ==================== ACADEMIC PERIODS ====================
export const academicPeriods: AcademicPeriod[] = [
  { id: 'ap1', name: 'Tahun Ajaran 2025/2026 - Semester 2', schoolId: 'sch1', startDate: '2025-01-06', endDate: '2025-06-28', semester: 2, isActive: true },
  { id: 'ap2', name: 'Tahun Ajaran 2025/2026 - Semester 1', schoolId: 'sch1', startDate: '2024-07-15', endDate: '2024-12-20', semester: 1, isActive: false },
];

// ==================== NOTIFICATIONS ====================
export const notifications: Notification[] = [
  { id: 'n1', title: 'Tugas Baru', message: 'Tugas "Latihan Soal Pecahan" telah dipublikasikan untuk kelas 4A', type: 'info', read: false, createdAt: '2025-02-17T08:00:00', userId: 'u4' },
  { id: 'n2', title: 'Tenggat Mendekati', message: 'Tugas "Menulis Paragraf" tenggat besok', type: 'warning', read: false, createdAt: '2025-02-24T07:00:00', userId: 'u5' },
  { id: 'n3', title: 'Ujian Aktif', message: 'Ulangan Harian Matematika Bab 3 dimulai hari ini', type: 'success', read: false, createdAt: '2025-03-01T07:00:00', userId: 'u4' },
  { id: 'n4', title: 'Nilai Diperbarui', message: 'Nilai tugas Matematika telah diperbarui', type: 'info', read: true, createdAt: '2025-02-20T10:00:00', userId: 'u4' },
];

// ==================== AUDIT LOGS ====================
export const auditLogs: AuditLog[] = [
  { id: 'al1', userId: 'u4', userName: 'Ahmad Fauzi, M.Pd', action: 'CREATE', module: 'Material', details: 'Membuat materi "Pecahan dan Desimal"', ipAddress: '192.168.1.100', timestamp: '2025-01-14T09:30:00' },
  { id: 'al2', userId: 'u4', userName: 'Ahmad Fauzi, M.Pd', action: 'CREATE', module: 'Assignment', details: 'Membuat tugas "Latihan Soal Pecahan"', ipAddress: '192.168.1.100', timestamp: '2025-02-10T14:20:00' },
  { id: 'al3', userId: 'u2', userName: 'Budi Santoso, S.Pd', action: 'UPDATE', module: 'Student', details: 'Memperbarui data siswa Rizki Pratama', ipAddress: '192.168.1.101', timestamp: '2025-02-15T11:00:00' },
  { id: 'al4', userId: 'u5', userName: 'Dewi Lestari, S.Pd', action: 'CREATE', module: 'Attendance', details: 'Mencatat presensi kelas 4A tanggal 18 Feb 2025', ipAddress: '192.168.1.102', timestamp: '2025-02-18T08:15:00' },
  { id: 'al5', userId: 'u4', userName: 'Ahmad Fauzi, M.Pd', action: 'UPDATE', module: 'Grade', details: 'Memperbarui nilai tugas Matematika Rizki Pratama: 85', ipAddress: '192.168.1.100', timestamp: '2025-02-20T10:30:00' },
  { id: 'al6', userId: 'u1', userName: 'Admin Pusat', action: 'CREATE', module: 'School', details: 'Menambahkan sekolah SMP Negeri 5 Tupari', ipAddress: '192.168.1.1', timestamp: '2025-01-05T09:00:00' },
];
