/**
 * API Service Layer dengan Caching & Performance Optimization
 * 
 * Strategi performa:
 * 1. IndexedDB cache untuk data yang sering dibaca
 * 2. Optimistic UI updates
 * 3. Batch operations untuk mengurangi round-trip
 * 4. Debounced calls untuk operasi频繁
 * 5. Stale-while-revalidate pattern
 */

import { db } from './db';

// Konfigurasi - URL backend Google Apps Script Anda
const CONFIG = {
  GAS_URL: (import.meta as any).env?.VITE_GAS_URL || 'https://script.google.com/macros/s/AKfycbx9Uhi7GFtdWSFUwAGZIq7k1XflvcC0b1GeVus9m0n6vlKH5-1PPlTQKJ3k9ilLcxNvOg/exec',
  CACHE_TTL: {
    students: 5 * 60 * 1000,    // 5 menit
    classes: 30 * 60 * 1000,    // 30 menit
    subjects: 60 * 60 * 1000,   // 1 jam
    materials: 5 * 60 * 1000,   // 5 menit
    assignments: 2 * 60 * 1000, // 2 menit
    exams: 1 * 60 * 1000,       // 1 menit (lebih fresh karena ujian)
    grades: 2 * 60 * 1000,      // 2 menit
    attendance: 5 * 60 * 1000,  // 5 menit
  },
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  BATCH_SIZE: 50, // max items per batch request
};

// ==================== TYPES ====================
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

interface RequestOptions {
  cache?: boolean;
  forceRefresh?: boolean;
  priority?: 'high' | 'normal' | 'low';
  timeout?: number;
}

// ==================== CORE FETCH WITH RETRY ====================
async function fetchWithRetry<T>(
  action: string,
  payload: Record<string, any> = {},
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { timeout = 30000 } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  for (let attempt = 1; attempt <= CONFIG.RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(CONFIG.GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, payload }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: result.success !== false,
        data: result.data as T,
        error: result.error,
        timestamp: Date.now(),
      };
    } catch (error) {
      if (attempt === CONFIG.RETRY_ATTEMPTS) {
        clearTimeout(timeoutId);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now(),
        };
      }
      // Exponential backoff
      await new Promise(r => setTimeout(r, CONFIG.RETRY_DELAY * attempt));
    }
  }

  return { success: false, error: 'Max retries exceeded', timestamp: Date.now() };
}

// ==================== CACHE-AWARE READ ====================
async function getCachedData<T>(
  cacheKey: string,
  fetchFn: () => Promise<ApiResponse<T>>,
  ttl: number,
  options: RequestOptions = {}
): Promise<T | null> {
  const { forceRefresh = false } = options;

  // 1. Check IndexedDB cache first (INSTANT)
  if (!forceRefresh) {
    const cached = await db.get('cache', cacheKey);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data as T;
    }
  }

  // 2. Fetch from server
  const response = await fetchFn();
  
  if (response.success && response.data) {
    // 3. Update cache in background (non-blocking)
    db.put('cache', {
      key: cacheKey,
      data: response.data,
      timestamp: Date.now(),
    }).catch(console.error); // fire-and-forget
    
    return response.data;
  }

  // 4. Fallback to stale cache if available
  if (!forceRefresh) {
    const stale = await db.get('cache', cacheKey);
    if (stale) return stale.data as T;
  }

  return null;
}

// ==================== API METHODS ====================
export const api = {
  // ---------- AUTH ----------
  auth: {
    login: async (email: string, password: string) => {
      return fetchWithRetry<{ token: string; user: any }>('login', { email, password }, { priority: 'high' });
    },
    logout: async (token: string) => {
      return fetchWithRetry('logout', { token });
    },
    verifySession: async (token: string) => {
      return fetchWithRetry<{ valid: boolean; user: any }>('verifySession', { token });
    },
  },

  // ---------- STUDENTS (with cache) ----------
  students: {
    getAll: async (schoolId: string, options: RequestOptions = {}) => {
      return getCachedData(
        `students_${schoolId}`,
        () => fetchWithRetry('getStudents', { schoolId }),
        CONFIG.CACHE_TTL.students,
        options
      );
    },
    getById: async (studentId: string) => {
      return getCachedData(
        `student_${studentId}`,
        () => fetchWithRetry('getStudent', { studentId }),
        CONFIG.CACHE_TTL.students
      );
    },
    create: async (data: any) => {
      const result = await fetchWithRetry('createStudent', data, { priority: 'high' });
      if (result.success) {
        // Invalidate cache
        await db.delete('cache', `students_${data.schoolId}`);
      }
      return result;
    },
    update: async (studentId: string, data: any) => {
      const result = await fetchWithRetry('updateStudent', { studentId, ...data });
      if (result.success) {
        await db.delete('cache', `student_${studentId}`);
        await db.delete('cache', `students_${data.schoolId}`);
      }
      return result;
    },
    bulkImport: async (schoolId: string, students: any[]) => {
      // Batch import untuk performa
      const batches = [];
      for (let i = 0; i < students.length; i += CONFIG.BATCH_SIZE) {
        batches.push(students.slice(i, i + CONFIG.BATCH_SIZE));
      }
      
      const results = await Promise.all(
        batches.map(batch => fetchWithRetry('bulkImportStudents', { schoolId, students: batch }))
      );
      
      await db.delete('cache', `students_${schoolId}`);
      return results;
    },
  },

  // ---------- EXAMS / CBT ----------
  exams: {
    getActive: async (classId: string) => {
      return getCachedData(
        `active_exams_${classId}`,
        () => fetchWithRetry('getActiveExams', { classId }),
        CONFIG.CACHE_TTL.exams
      );
    },
    getExamDetail: async (examId: string) => {
      return fetchWithRetry('getExamDetail', { examId }, { priority: 'high' });
    },
    validateToken: async (examId: string, token: string, studentId: string) => {
      return fetchWithRetry('validateExamToken', { examId, token, studentId }, { priority: 'high' });
    },
    startExam: async (examId: string, studentId: string) => {
      return fetchWithRetry('startExam', { examId, studentId }, { priority: 'high' });
    },
    submitAnswer: async (examId: string, studentId: string, questionId: string, answer: string) => {
      // Auto-save: simpan lokal dulu, sync ke server
      await db.put('exam_answers', {
        examId,
        studentId,
        questionId,
        answer,
        timestamp: Date.now(),
        synced: false,
      });
      
      // Sync ke server di background (non-blocking)
      fetchWithRetry('submitAnswer', { examId, studentId, questionId, answer }).then(result => {
        if (result.success) {
          db.put('exam_answers', {
            examId,
            studentId,
            questionId,
            answer,
            timestamp: Date.now(),
            synced: true,
          });
        }
      }).catch(console.error);
      
      return { success: true }; // Optimistic: anggap sukses
    },
    syncPendingAnswers: async (examId: string, studentId: string) => {
      const pending = await db.getAll('exam_answers');
      const toSync = pending.filter(a => 
        a.examId === examId && 
        a.studentId === studentId && 
        !a.synced
      );
      
      if (toSync.length === 0) return { success: true, synced: 0 };
      
      // Batch sync
      const result = await fetchWithRetry('batchSubmitAnswers', {
        examId,
        studentId,
        answers: toSync.map(a => ({
          questionId: a.questionId,
          answer: a.answer,
        })),
      });
      
      if (result.success) {
        // Mark as synced
        for (const ans of toSync) {
          await db.put('exam_answers', { ...ans, synced: true });
        }
      }
      
      return { success: result.success, synced: toSync.length };
    },
    submitExam: async (examId: string, studentId: string) => {
      // Sync semua pending answers dulu
      await api.exams.syncPendingAnswers(examId, studentId);
      
      // Submit final
      return fetchWithRetry('submitExam', { examId, studentId }, { priority: 'high' });
    },
    getResults: async (examId: string) => {
      return fetchWithRetry('getExamResults', { examId });
    },
    getItemAnalysis: async (examId: string) => {
      return fetchWithRetry('getItemAnalysis', { examId });
    },
  },

  // ---------- ASSIGNMENTS ----------
  assignments: {
    getAll: async (classId: string, options: RequestOptions = {}) => {
      return getCachedData(
        `assignments_${classId}`,
        () => fetchWithRetry('getAssignments', { classId }),
        CONFIG.CACHE_TTL.assignments,
        options
      );
    },
    submit: async (assignmentId: string, studentId: string, data: any) => {
      return fetchWithRetry('submitAssignment', { assignmentId, studentId, ...data }, { priority: 'high' });
    },
  },

  // ---------- GRADES ----------
  grades: {
    getByStudent: async (studentId: string) => {
      return getCachedData(
        `grades_${studentId}`,
        () => fetchWithRetry('getStudentGrades', { studentId }),
        CONFIG.CACHE_TTL.grades
      );
    },
    getByClass: async (classId: string, subjectId?: string) => {
      return getCachedData(
        `grades_class_${classId}_${subjectId || 'all'}`,
        () => fetchWithRetry('getClassGrades', { classId, subjectId }),
        CONFIG.CACHE_TTL.grades
      );
    },
  },

  // ---------- ATTENDANCE ----------
  attendance: {
    getByDate: async (classId: string, date: string) => {
      return getCachedData(
        `attendance_${classId}_${date}`,
        () => fetchWithRetry('getAttendance', { classId, date }),
        CONFIG.CACHE_TTL.attendance
      );
    },
    submit: async (classId: string, date: string, records: any[]) => {
      // Batch submit untuk performa
      return fetchWithRetry('submitAttendance', { classId, date, records }, { priority: 'high' });
    },
  },

  // ---------- MATERIALS ----------
  materials: {
    getAll: async (classId: string) => {
      return getCachedData(
        `materials_${classId}`,
        () => fetchWithRetry('getMaterials', { classId }),
        CONFIG.CACHE_TTL.materials
      );
    },
  },

  // ---------- TELEGRAM ----------
  telegram: {
    linkAccount: async (userId: string, telegramChatId: string) => {
      return fetchWithRetry('linkTelegram', { userId, telegramChatId });
    },
    unlinkAccount: async (userId: string) => {
      return fetchWithRetry('unlinkTelegram', { userId });
    },
    sendNotification: async (chatId: string, message: string, parseMode: 'HTML' | 'Markdown' = 'HTML') => {
      return fetchWithRetry('sendTelegramMessage', { chatId, message, parseMode });
    },
    broadcastToClass: async (classId: string, message: string) => {
      return fetchWithRetry('broadcastTelegram', { classId, message });
    },
    getBotStatus: async () => {
      return fetchWithRetry('getTelegramBotStatus', {});
    },
  },

  // ---------- UTILITIES ----------
  utils: {
    clearAllCache: async () => {
      await db.clear('cache');
    },
    getCacheStats: async () => {
      const all = await db.getAll('cache');
      return {
        totalEntries: all.length,
        totalSize: JSON.stringify(all).length,
      };
    },
  },
};

// ==================== BACKGROUND SYNC ====================
// Sync pending data setiap 30 detik
let syncInterval: ReturnType<typeof setInterval> | null = null;

export function startBackgroundSync() {
  if (syncInterval) return;
  
  syncInterval = setInterval(async () => {
    try {
      // Sync exam answers
      const pendingAnswers = await db.getAll('exam_answers');
      const unsynced = pendingAnswers.filter(a => !a.synced);
      
      if (unsynced.length > 0) {
        // Group by examId + studentId
        const grouped = unsynced.reduce((acc, ans) => {
          const key = `${ans.examId}_${ans.studentId}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(ans);
          return acc;
        }, {} as Record<string, any[]>);
        
        // Sync each group
        for (const [key, answers] of Object.entries(grouped)) {
          const [examId, studentId] = key.split('_');
          await api.exams.syncPendingAnswers(examId, studentId);
        }
      }
    } catch (error) {
      console.error('Background sync error:', error);
    }
  }, 30000); // 30 detik
}

export function stopBackgroundSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}
