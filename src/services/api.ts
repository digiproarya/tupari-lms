/**
 * TUPARI LMS - API Service Layer
 * 
 * PERBAIKAN KEAMANAN:
 * ✅ Token autentikasi dikirim di setiap request
 * ✅ Handle 401/403 dengan benar (no infinite retry)
 * ✅ Token divalidasi di backend
 * ✅ Auto-logout jika token expired
 */

import { db } from './db';

// ==================== CONFIG ====================
const CONFIG = {
  GAS_URL: (import.meta as any).env?.VITE_GAS_URL || 'https://script.google.com/macros/s/AKfycbx9Uhi7GFtdWSFUwAGZIq7k1XflvcC0b1GeVus9m0n6vlKH5-1PPlTQKJ3k9ilLcxNvOg/exec',
  CACHE_TTL: {
    students: 5 * 60 * 1000,
    classes: 30 * 60 * 1000,
    subjects: 60 * 60 * 1000,
    materials: 5 * 60 * 1000,
    assignments: 2 * 60 * 1000,
    exams: 1 * 60 * 1000,
    grades: 2 * 60 * 1000,
    attendance: 5 * 60 * 1000,
  },
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  BATCH_SIZE: 50,
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

// ==================== TOKEN MANAGEMENT ====================
function getToken(): string | null {
  return localStorage.getItem('tupari_token');
}

function clearAuth(): void {
  localStorage.removeItem('tupari_token');
  localStorage.removeItem('tupari_user');
}

// ==================== CORE FETCH WITH AUTH ====================
async function fetchWithRetry<T>(
  action: string,
  payload: Record<string, any> = {},
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { timeout = 30000 } = options;
  const token = getToken();
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  for (let attempt = 1; attempt <= CONFIG.RETRY_ATTEMPTS; attempt++) {
    try {
      // CRITICAL: Add token to payload for backend validation
      const requestPayload = token ? { ...payload, token } : payload;
      
      const response = await fetch(CONFIG.GAS_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'text/plain;charset=utf-8',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ action, payload: requestPayload }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // CRITICAL: Handle 401/403 - DO NOT RETRY
      if (response.status === 401 || response.status === 403) {
        const result = await response.json().catch(() => ({ error: 'Unauthorized' }));
        
        // Clear invalid token on 401
        if (response.status === 401) {
          clearAuth();
          // Redirect to login if on protected page
          if (window.location.hash !== '#/login') {
            window.location.hash = '#/login';
          }
        }
        
        return {
          success: false,
          error: result.error || 'Unauthorized',
          timestamp: Date.now(),
        };
      }

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
      // Don't retry on abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout',
          timestamp: Date.now(),
        };
      }
      
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
    }).catch(console.error);
    
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
      const response = await fetchWithRetry<{ token: string; user: any }>('login', { email, password }, { priority: 'high' });
      
      // Store token on successful login
      if (response.success && response.data?.token) {
        localStorage.setItem('tupari_token', response.data.token);
        localStorage.setItem('tupari_user', JSON.stringify(response.data.user));
      }
      
      return response;
    },
    logout: async () => {
      const token = getToken();
      if (token) {
        await fetchWithRetry('logout', { token });
      }
      clearAuth();
    },
    verifySession: async () => {
      const token = getToken();
      if (!token) return { success: false, error: 'No token' };
      
      const response = await fetchWithRetry<{ valid: boolean; user: any }>('verifyToken', { token });
      
      // Clear auth if token invalid
      if (!response.success) {
        clearAuth();
      }
      
      return response;
    },
  },

  // ---------- STUDENTS ----------
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

  // ---------- CLASSES ----------
  classes: {
    getAll: async (schoolId: string, options: RequestOptions = {}) => {
      return getCachedData(
        `classes_${schoolId}`,
        () => fetchWithRetry('getClasses', { schoolId }),
        CONFIG.CACHE_TTL.classes,
        options
      );
    },
    getById: async (classId: string) => {
      return getCachedData(
        `class_${classId}`,
        () => fetchWithRetry('getClass', { classId }),
        CONFIG.CACHE_TTL.classes
      );
    },
    create: async (data: any) => {
      const result = await fetchWithRetry('createClass', data, { priority: 'high' });
      if (result.success) {
        await db.delete('cache', `classes_${data.schoolId}`);
      }
      return result;
    },
    update: async (classId: string, data: any) => {
      const result = await fetchWithRetry('updateClass', { classId, ...data });
      if (result.success) {
        await db.delete('cache', `class_${classId}`);
        await db.delete('cache', `classes_${data.schoolId}`);
      }
      return result;
    },
  },

  // ---------- SUBJECTS ----------
  subjects: {
    getAll: async (schoolId: string, options: RequestOptions = {}) => {
      return getCachedData(
        `subjects_${schoolId}`,
        () => fetchWithRetry('getSubjects', { schoolId }),
        CONFIG.CACHE_TTL.subjects,
        options
      );
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
      return fetchWithRetry('getExam', { examId }, { priority: 'high' });
    },
    validateToken: async (examId: string, token: string, studentId: string) => {
      return fetchWithRetry('validateExamToken', { examId, token, studentId }, { priority: 'high' });
    },
    startExam: async (examId: string, studentId: string) => {
      return fetchWithRetry('startExam', { examId, studentId }, { priority: 'high' });
    },
    submitAnswer: async (examId: string, studentId: string, questionId: string, answer: string) => {
      await db.put('exam_answers', {
        examId,
        studentId,
        questionId,
        answer,
        timestamp: Date.now(),
        synced: false,
      });
      
      const syncPromise = fetchWithRetry('submitAnswer', { 
        examId, 
        studentId, 
        questionId, 
        answer 
      }).then(result => {
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
        return result;
      }).catch(error => {
        console.error('Sync error:', error);
        return { success: false, error: error.message };
      });
      
      return { 
        success: true, 
        syncStatus: 'pending',
        syncPromise 
      };
    },
    batchSubmitAnswers: async (examId: string, studentId: string, answers: Array<{questionId: string, answer: string}>) => {
      const pending = await db.getAll('exam_answers');
      const toSync = pending.filter((a: any) => 
        a.examId === examId && 
        a.studentId === studentId && 
        !a.synced
      );
      
      if (toSync.length === 0) return { success: true, synced: 0 };
      
      const result = await fetchWithRetry('batchSubmitAnswers', {
        examId,
        studentId,
        answers: toSync.map((a: any) => ({
          questionId: a.questionId,
          answer: a.answer,
        })),
      });
      
      if (result.success) {
        for (const ans of toSync) {
          await db.put('exam_answers', { ...ans, synced: true });
        }
      }
      
      return { success: result.success, synced: toSync.length };
    },
    submitExam: async (examId: string, studentId: string) => {
      await api.exams.batchSubmitAnswers(examId, studentId, []);
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
    create: async (data: any) => {
      const result = await fetchWithRetry('createAssignment', data, { priority: 'high' });
      if (result.success && data.classId) {
        await db.delete('cache', `assignments_${data.classId}`);
      }
      return result;
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
    getBySchool: async (schoolId: string) => {
      return getCachedData(
        `grades_school_${schoolId}`,
        () => fetchWithRetry('getSchoolGrades', { schoolId }),
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
    getByStudent: async (studentId: string) => {
      return getCachedData(
        `attendance_student_${studentId}`,
        () => fetchWithRetry('getStudentAttendance', { studentId }),
        CONFIG.CACHE_TTL.attendance
      );
    },
    submit: async (classId: string, date: string, records: any[]) => {
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
    create: async (data: any) => {
      const result = await fetchWithRetry('createMaterial', data, { priority: 'high' });
      if (result.success) {
        await db.delete('cache', `materials_${data.classId}`);
      }
      return result;
    },
    update: async (materialId: string, data: any) => {
      const result = await fetchWithRetry('updateMaterial', { materialId, ...data });
      if (result.success) {
        await db.delete('cache', `materials_${data.classId}`);
      }
      return result;
    },
    delete: async (materialId: string) => {
      return fetchWithRetry('deleteMaterial', { materialId });
    },
  },

  // ---------- UPLOAD ----------
  upload: {
    file: async (file: File, folder: string = 'lainnya') => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64 = (reader.result as string).split(',')[1];
            const result = await fetchWithRetry('uploadFile', {
              base64Data: base64,
              fileName: file.name,
              mimeType: file.type,
              folder: folder,
            }, { priority: 'high' });
            resolve(result);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
  },

  // ---------- COMMENTS ----------
  comments: {
    getByMaterial: async (materialId: string) => {
      return fetchWithRetry('getComments', { materialId });
    },
    save: async (materialId: string, userId: string, content: string) => {
      return fetchWithRetry('saveComment', { materialId, userId, content }, { priority: 'high' });
    },
  },

  // ---------- SUBMISSIONS ----------
  submissions: {
    submit: async (assignmentId: string, studentId: string, content: string, fileUrl?: string) => {
      return fetchWithRetry('submitTask', { assignmentId, studentId, content, fileUrl }, { priority: 'high' });
    },
    grade: async (submissionId: string, score: number, feedback: string) => {
      return fetchWithRetry('gradeSubmission', { submissionId, score, feedback }, { priority: 'high' });
    },
  },

  // ---------- PLANNING ----------
  planning: {
    getAll: async (schoolId: string, type?: string) => {
      return fetchWithRetry('getPlanningDocs', { schoolId, type });
    },
    getById: async (docId: string) => {
      return fetchWithRetry('getPlanningDoc', { docId });
    },
    create: async (data: any) => {
      return fetchWithRetry('createPlanningDoc', data, { priority: 'high' });
    },
    update: async (docId: string, data: any) => {
      return fetchWithRetry('updatePlanningDoc', { docId, ...data }, { priority: 'high' });
    },
    delete: async (docId: string) => {
      return fetchWithRetry('deletePlanningDoc', { docId });
    },
  },

  // ---------- QUESTIONS (Bank Soal) ----------
  questions: {
    getAll: async (schoolId: string, filters?: any) => {
      return fetchWithRetry('getQuestions', { schoolId, ...filters });
    },
    getById: async (questionId: string) => {
      return fetchWithRetry('getQuestion', { questionId });
    },
    create: async (data: any) => {
      return fetchWithRetry('createQuestion', data, { priority: 'high' });
    },
    update: async (questionId: string, data: any) => {
      return fetchWithRetry('updateQuestion', { questionId, ...data }, { priority: 'high' });
    },
    delete: async (questionId: string) => {
      return fetchWithRetry('deleteQuestion', { questionId });
    },
  },

  // ---------- RUBRICS ----------
  rubrics: {
    getAll: async (schoolId: string) => {
      return fetchWithRetry('getRubrics', { schoolId });
    },
    getById: async (rubricId: string) => {
      return fetchWithRetry('getRubric', { rubricId });
    },
    create: async (data: any) => {
      return fetchWithRetry('createRubric', data, { priority: 'high' });
    },
    update: async (rubricId: string, data: any) => {
      return fetchWithRetry('updateRubric', { rubricId, ...data }, { priority: 'high' });
    },
    delete: async (rubricId: string) => {
      return fetchWithRetry('deleteRubric', { rubricId });
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

  // ---------- AI ----------
  ai: {
    checkStatus: async () => {
      return fetchWithRetry('checkAIStatus', {});
    },
    generate: async (request: any) => {
      return fetchWithRetry('generateContent', request, { 
        priority: 'high',
        timeout: 60000
      });
    },
  },

  // ---------- PROCTORING ----------
  proctoring: {
    logEvent: async (eventData: any) => {
      return fetchWithRetry('logProctoringEvent', eventData, { priority: 'low' });
    },
    logTabSwitch: async (examId: string, studentId: string, attemptId: string) => {
      return fetchWithRetry('logTabSwitch', { examId, studentId, attemptId }, { priority: 'low' });
    },
    logFullscreenExit: async (examId: string, studentId: string, attemptId: string) => {
      return fetchWithRetry('logFullscreenExit', { examId, studentId, attemptId }, { priority: 'low' });
    },
    logConnectionLost: async (examId: string, studentId: string, attemptId: string) => {
      return fetchWithRetry('logConnectionLost', { examId, studentId, attemptId }, { priority: 'low' });
    },
    logConnectionRestored: async (examId: string, studentId: string, attemptId: string) => {
      return fetchWithRetry('logConnectionRestored', { examId, studentId, attemptId }, { priority: 'low' });
    },
    getExamLogs: async (examId: string) => {
      return fetchWithRetry('getExamLogs', { examId });
    },
    getStudentLogs: async (studentId: string, examId?: string) => {
      return fetchWithRetry('getStudentLogs', { studentId, examId });
    },
    getExamSummary: async (examId: string) => {
      return fetchWithRetry('getExamSummary', { examId });
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

  // ---------- CONFIG ----------
  getConfig: () => {
    return CONFIG;
  },
};

// ==================== BACKGROUND SYNC ====================
let syncInterval: ReturnType<typeof setInterval> | null = null;

export function startBackgroundSync() {
  if (syncInterval) return;
  
  syncInterval = setInterval(async () => {
    try {
      const pendingAnswers = await db.getAll('exam_answers');
      const unsynced = pendingAnswers.filter((a: any) => !a.synced);
      
      if (unsynced.length > 0) {
        const grouped = unsynced.reduce((acc: any, ans: any) => {
          const key = `${ans.examId}_${ans.studentId}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(ans);
          return acc;
        }, {} as Record<string, any[]>);
        
        for (const [key, answers] of Object.entries(grouped)) {
          const [examId, studentId] = key.split('_');
          await api.exams.batchSubmitAnswers(examId, studentId, []);
        }
      }
    } catch (error) {
      console.error('Background sync error:', error);
    }
  }, 30000);
}

export function stopBackgroundSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}
