// ==================== TYPES ====================
export type Role = 'super_admin' | 'admin_sekolah' | 'kepala_sekolah' | 'guru' | 'siswa' | 'operator';

export type Permission = 
  | 'school.view' | 'school.manage'
  | 'user.view' | 'user.create' | 'user.update' | 'user.delete'
  | 'role.manage' | 'student.manage' | 'class.manage'
  | 'material.manage' | 'assignment.manage' | 'exam.manage'
  | 'attendance.manage' | 'grade.view' | 'grade.edit'
  | 'report.export' | 'settings.manage' | 'audit.view';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  schoolIds: string[];
  activeSchoolId: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface School {
  id: string;
  name: string;
  npsn: string;
  address: string;
  logo?: string;
  level: 'SD' | 'SMP' | 'SMA' | 'SMK';
  curriculum: string;
  academicYear: string;
  semester: 1 | 2;
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  classId: string;
  schoolId: string;
  gender: 'L' | 'P';
  birthDate: string;
  parentName: string;
  parentPhone: string;
  status: 'active' | 'inactive';
}

export interface Class {
  id: string;
  name: string;
  grade: number;
  schoolId: string;
  homeroomTeacherId: string;
  academicYearId: string;
  studentCount: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  grade: number;
  schoolId: string;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  type: 'text' | 'pdf' | 'video' | 'link' | 'image';
  content: string;
  status: 'draft' | 'published' | 'archived';
  publishDate: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  dueDate: string;
  maxScore: number;
  status: 'draft' | 'active' | 'closed';
  submissions: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  fileUrl?: string;
  submittedAt: string;
  status: 'pending' | 'submitted' | 'late' | 'graded' | 'revised';
  score?: number;
  feedback?: string;
}

export interface Exam {
  id: string;
  title: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  duration: number; // minutes
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'closed';
  questions: Question[];
  token?: string;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
}

export interface Question {
  id: string;
  examId: string;
  type: 'multiple_choice' | 'essay';
  question: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
  order: number;
  difficulty?: 'low' | 'medium' | 'high' | 'hots';
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  type: 'tugas' | 'uh' | 'uts' | 'uas' | 'praktik';
  score: number;
  maxScore: number;
  weight: number;
  semester: number;
  academicYear: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  subjectId?: string;
  status: 'hadir' | 'sakit' | 'izin' | 'alpa';
  note?: string;
  recordedBy: string;
}

export interface AcademicPeriod {
  id: string;
  name: string;
  schoolId: string;
  startDate: string;
  endDate: string;
  semester: 1 | 2;
  isActive: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
  userId: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: ['school.view', 'school.manage', 'user.view', 'user.create', 'user.update', 'user.delete', 'role.manage', 'student.manage', 'class.manage', 'material.manage', 'assignment.manage', 'exam.manage', 'attendance.manage', 'grade.view', 'grade.edit', 'report.export', 'settings.manage', 'audit.view'],
  admin_sekolah: ['school.view', 'user.view', 'user.create', 'user.update', 'student.manage', 'class.manage', 'material.manage', 'assignment.manage', 'exam.manage', 'attendance.manage', 'grade.view', 'grade.edit', 'report.export', 'settings.manage', 'audit.view'],
  kepala_sekolah: ['school.view', 'user.view', 'student.manage', 'class.manage', 'grade.view', 'report.export', 'audit.view'],
  guru: ['school.view', 'material.manage', 'assignment.manage', 'exam.manage', 'attendance.manage', 'grade.view', 'grade.edit', 'report.export'],
  siswa: ['school.view', 'grade.view'],
  operator: ['school.view', 'user.view', 'student.manage', 'class.manage', 'report.export'],
};
