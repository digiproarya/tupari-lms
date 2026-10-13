/**
 * IndexedDB Wrapper untuk Offline-First & Performance
 * 
 * Menyimpan data lokal untuk:
 * 1. Cache API responses (baca instant tanpa network)
 * 2. Exam answers (auto-save, recovery setelah disconnect)
 * 3. User preferences
 * 4. Draft data
 */

const DB_NAME = 'tupari_lms_db';
const DB_VERSION = 1;

// Store definitions
const STORES = {
  cache: 'cache',           // API response cache
  exam_answers: 'exam_answers', // Jawaban ujian (auto-save)
  exam_sessions: 'exam_sessions', // Session ujian aktif
  user_prefs: 'user_prefs', // Preferensi user
  drafts: 'drafts',         // Draft data (tugas, materi, dll)
  notifications: 'notifications', // Notifikasi lokal
} as const;

type StoreName = keyof typeof STORES;

class IndexedDBWrapper {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.init();
  }

  private init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        console.warn('IndexedDB not supported, falling back to memory storage');
        resolve();
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        resolve(); // Don't block app
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains(STORES.cache)) {
          const cacheStore = db.createObjectStore(STORES.cache, { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.exam_answers)) {
          const answersStore = db.createObjectStore(STORES.exam_answers, { 
            keyPath: ['examId', 'studentId', 'questionId'] 
          });
          answersStore.createIndex('examId', 'examId', { unique: false });
          answersStore.createIndex('synced', 'synced', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.exam_sessions)) {
          db.createObjectStore(STORES.exam_sessions, { keyPath: 'examId' });
        }

        if (!db.objectStoreNames.contains(STORES.user_prefs)) {
          db.createObjectStore(STORES.user_prefs, { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains(STORES.drafts)) {
          const draftsStore = db.createObjectStore(STORES.drafts, { keyPath: 'id' });
          draftsStore.createIndex('type', 'type', { unique: false });
          draftsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.notifications)) {
          const notifStore = db.createObjectStore(STORES.notifications, { keyPath: 'id' });
          notifStore.createIndex('read', 'read', { unique: false });
          notifStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  private async getStore(storeName: StoreName, mode: IDBTransactionMode = 'readonly') {
    await this.initPromise;
    if (!this.db) throw new Error('Database not initialized');
    
    const tx = this.db.transaction(STORES[storeName], mode);
    return tx.objectStore(STORES[storeName]);
  }

  // ==================== GENERIC OPERATIONS ====================
  
  async get(storeName: StoreName, key: IDBValidKey | IDBKeyRange): Promise<any> {
    const store = await this.getStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName: StoreName): Promise<any[]> {
    const store = await this.getStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put(storeName: StoreName, value: any): Promise<IDBValidKey> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: StoreName, key: IDBValidKey | IDBKeyRange): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: StoreName): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== CACHE SPECIFIC ====================
  
  async getCache(key: string): Promise<any | null> {
    const result = await this.get('cache', key);
    return result?.data || null;
  }

  async setCache(key: string, data: any, ttl: number = 5 * 60 * 1000): Promise<void> {
    await this.put('cache', {
      key,
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  async isCacheValid(key: string, ttl: number): Promise<boolean> {
    const cached = await this.get('cache', key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < ttl;
  }

  // ==================== EXAM SPECIFIC ====================
  
  async saveExamAnswer(examId: string, studentId: string, questionId: string, answer: string): Promise<void> {
    await this.put('exam_answers', {
      examId,
      studentId,
      questionId,
      answer,
      timestamp: Date.now(),
      synced: false,
    });
  }

  async getExamAnswers(examId: string, studentId: string): Promise<any[]> {
    const all = await this.getAll('exam_answers');
    return all.filter((a: any) => a.examId === examId && a.studentId === studentId);
  }

  async getUnsyncedAnswers(examId?: string): Promise<any[]> {
    const all = await this.getAll('exam_answers');
    return all.filter((a: any) => {
      if (!a.synced) {
        return examId ? a.examId === examId : true;
      }
      return false;
    });
  }

  async markAnswersSynced(examId: string, studentId: string): Promise<void> {
    const answers = await this.getExamAnswers(examId, studentId);
    for (const answer of answers) {
      await this.put('exam_answers', { ...answer, synced: true });
    }
  }

  // ==================== EXAM SESSION ====================
  
  async saveExamSession(examId: string, data: any): Promise<void> {
    await this.put('exam_sessions', {
      examId,
      ...data,
      updatedAt: Date.now(),
    });
  }

  async getExamSession(examId: string): Promise<any | null> {
    return this.get('exam_sessions', examId);
  }

  async clearExamSession(examId: string): Promise<void> {
    await this.delete('exam_sessions', examId);
  }

  // ==================== USER PREFERENCES ====================
  
  async getPreference(key: string): Promise<any> {
    const result = await this.get('user_prefs', key);
    return result?.value;
  }

  async setPreference(key: string, value: any): Promise<void> {
    await this.put('user_prefs', { key, value });
  }

  // ==================== DRAFTS ====================
  
  async saveDraft(type: string, id: string, data: any): Promise<void> {
    await this.put('drafts', {
      id: `${type}_${id}`,
      type,
      data,
      updatedAt: Date.now(),
    });
  }

  async getDraft(type: string, id: string): Promise<any | null> {
    const result = await this.get('drafts', `${type}_${id}`);
    return result?.data || null;
  }

  async getDraftsByType(type: string): Promise<any[]> {
    const all = await this.getAll('drafts');
    return all.filter((d: any) => d.type === type);
  }

  async deleteDraft(type: string, id: string): Promise<void> {
    await this.delete('drafts', `${type}_${id}`);
  }

  // ==================== NOTIFICATIONS ====================
  
  async saveNotification(notification: any): Promise<void> {
    await this.put('notifications', notification);
  }

  async getUnreadNotifications(): Promise<any[]> {
    const all = await this.getAll('notifications');
    return all.filter((n: any) => !n.read);
  }

  async markNotificationRead(id: string): Promise<void> {
    const notif = await this.get('notifications', id);
    if (notif) {
      await this.put('notifications', { ...notif, read: true });
    }
  }

  // ==================== MAINTENANCE ====================
  
  async clearExpiredCache(): Promise<number> {
    const all = await this.getAll('cache');
    let cleared = 0;
    const now = Date.now();
    
    for (const item of all) {
      if (now - item.timestamp > (item.ttl || 5 * 60 * 1000)) {
        await this.delete('cache', item.key);
        cleared++;
      }
    }
    
    return cleared;
  }

  async getStorageStats(): Promise<{ stores: Record<string, number>; totalSize: number }> {
    const stores: Record<string, number> = {};
    let totalSize = 0;

    for (const storeName of Object.values(STORES)) {
      const items = await this.getAll(storeName as StoreName);
      stores[storeName] = items.length;
      totalSize += JSON.stringify(items).length;
    }

    return { stores, totalSize };
  }

  async clearAll(): Promise<void> {
    for (const storeName of Object.values(STORES)) {
      await this.clear(storeName as StoreName);
    }
  }
}

// Singleton instance
export const db = new IndexedDBWrapper();
