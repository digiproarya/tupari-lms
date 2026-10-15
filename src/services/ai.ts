/**
 * AI Service Layer - Dua Lapis Arsitektur
 * 
 * Lapis 1: Core Content Engine (manual editor, selalu tersedia)
 * Lapis 2: AI Enhancement Layer (opsional, dengan fallback)
 */

import { api } from './api';

// ==================== TYPES ====================
export interface AIStatus {
  available: boolean;
  provider: 'openai' | 'gemini' | 'claude' | 'mock' | 'none';
  quotaRemaining?: number;
  lastError?: string;
  rateLimitHit?: boolean;
}

export interface GenerationRequest {
  type: 'materi' | 'soal' | 'lkpd' | 'buku';
  subject: string;
  grade: number;
  chapter?: string;
  topic?: string;
  cp?: string;
  tp?: string;
  difficulty?: 'low' | 'medium' | 'high' | 'hots';
  questionCount?: number;
  questionTypes?: string[];
  useAI?: boolean;
}

export interface GenerationResult {
  success: boolean;
  data?: any;
  error?: string;
  usedAI: boolean;
  cached: boolean;
  provider?: string;
}

// ==================== AI STATUS MANAGEMENT ====================
class AIService {
  private status: AIStatus = {
    available: false,
    provider: 'none',
    quotaRemaining: undefined,
    lastError: undefined,
    rateLimitHit: false,
  };

  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 jam

  /**
   * Check AI service status
   */
  async checkStatus(): Promise<AIStatus> {
    try {
      const response = await api.ai.checkStatus();
      
      if (response.success && response.data) {
        const data = response.data as any;
        this.status = {
          available: data.available ?? false,
          provider: data.provider ?? 'none',
          quotaRemaining: data.quotaRemaining,
          lastError: undefined,
          rateLimitHit: false,
        };
      } else {
        this.status = {
          available: false,
          provider: 'none',
          lastError: response.error || 'Service unavailable',
        };
      }
    } catch (error) {
      this.status = {
        available: false,
        provider: 'none',
        lastError: error instanceof Error ? error.message : 'Connection failed',
      };
    }

    return this.status;
  }

  /**
   * Get current status
   */
  getStatus(): AIStatus {
    return this.status;
  }

  /**
   * Generate content with fallback strategy
   */
  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const cacheKey = this.getCacheKey(request);
    
    // Strategy 1: Check cache
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return {
        success: true,
        data: cached,
        usedAI: false,
        cached: true,
      };
    }

    // Strategy 2: Try AI if available and requested
    if (request.useAI !== false && this.status.available) {
      try {
        const aiResult = await this.generateWithAI(request);
        if (aiResult.success && aiResult.data) {
          this.saveToCache(cacheKey, aiResult.data);
          return {
            ...aiResult,
            cached: false,
          };
        }
      } catch (error) {
        console.error('AI generation failed:', error);
        this.handleAIError(error);
      }
    }

    // Strategy 3: Fallback to template/manual
    return this.generateWithTemplate(request);
  }

  /**
   * Generate with AI provider
   */
  private async generateWithAI(request: GenerationRequest): Promise<GenerationResult> {
    try {
      const response = await api.ai.generate(request);
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          usedAI: true,
          cached: false,
          provider: this.status.provider,
        };
      }

      // Handle rate limit
      if (response.error?.includes('429') || response.error?.includes('rate limit')) {
        this.status.rateLimitHit = true;
        this.status.available = false;
      }

      return {
        success: false,
        error: response.error || 'AI generation failed',
        usedAI: true,
        cached: false,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate with template (fallback)
   */
  private generateWithTemplate(request: GenerationRequest): GenerationResult {
    const template = this.getTemplate(request);
    
    return {
      success: true,
      data: template,
      usedAI: false,
      cached: false,
      provider: 'template',
    };
  }

  /**
   * Get template based on request type
   */
  private getTemplate(request: GenerationRequest): any {
    switch (request.type) {
      case 'materi':
        return this.getMateriTemplate(request);
      case 'soal':
        return this.getSoalTemplate(request);
      case 'lkpd':
        return this.getLKPDTemplate(request);
      case 'buku':
        return this.getBukuTemplate(request);
      default:
        return {};
    }
  }

  private getMateriTemplate(request: GenerationRequest) {
    return {
      title: `${request.topic || request.chapter} - ${request.subject} Kelas ${request.grade}`,
      subject: request.subject,
      grade: request.grade,
      sections: [
        {
          title: 'Pendahuluan',
          content: `[Silakan isi pendahuluan untuk topik ${request.topic || request.chapter}]`,
        },
        {
          title: 'Tujuan Pembelajaran',
          content: request.tp || '[Silakan isi tujuan pembelajaran]',
        },
        {
          title: 'Materi Inti',
          content: `[Silakan isi materi inti]`,
        },
        {
          title: 'Contoh',
          content: `[Silakan berikan contoh]`,
        },
        {
          title: 'Latihan',
          content: `[Silakan berikan latihan]`,
        },
      ],
      createdAt: new Date().toISOString(),
      status: 'draft',
    };
  }

  private getSoalTemplate(request: GenerationRequest) {
    const count = request.questionCount || 5;
    const questions = Array.from({ length: count }, (_, i) => ({
      id: `q_${Date.now()}_${i}`,
      type: i % 2 === 0 ? 'multiple_choice' : 'essay',
      question: `[Soal ${i + 1} tentang ${request.topic || request.chapter}]`,
      options: i % 2 === 0 ? ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'] : undefined,
      correctAnswer: i % 2 === 0 ? 'Opsi A' : undefined,
      explanation: `[Pembahasan untuk soal ${i + 1}]`,
      difficulty: request.difficulty || 'medium',
      points: 10,
    }));

    return {
      title: `Bank Soal ${request.subject} Kelas ${request.grade}`,
      subject: request.subject,
      grade: request.grade,
      topic: request.topic,
      questions,
      createdAt: new Date().toISOString(),
      status: 'draft',
    };
  }

  private getLKPDTemplate(request: GenerationRequest) {
    return {
      title: `LKPD ${request.topic || request.chapter} - ${request.subject}`,
      subject: request.subject,
      grade: request.grade,
      sections: [
        {
          title: 'Tujuan',
          content: request.tp || '[Silakan isi tujuan]',
        },
        {
          title: 'Petunjuk',
          content: '[Silakan isi petunjuk pengerjaan]',
        },
        {
          title: 'Aktivitas',
          content: '[Silakan isi aktivitas]',
        },
        {
          title: 'Pertanyaan',
          content: '[Silakan isi pertanyaan]',
        },
        {
          title: 'Rubrik Penilaian',
          content: '[Silakan isi rubrik]',
        },
      ],
      createdAt: new Date().toISOString(),
      status: 'draft',
    };
  }

  private getBukuTemplate(request: GenerationRequest) {
    return {
      title: `Buku ${request.subject} Kelas ${request.grade}`,
      subject: request.subject,
      grade: request.grade,
      chapters: [
        {
          number: 1,
          title: '[Bab 1]',
          sections: [
            { title: 'Pendahuluan', content: '[Silakan isi]' },
            { title: 'Materi', content: '[Silakan isi]' },
            { title: 'Latihan', content: '[Silakan isi]' },
          ],
        },
      ],
      createdAt: new Date().toISOString(),
      status: 'draft',
    };
  }

  /**
   * Handle AI errors
   */
  private handleAIError(error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      this.status.rateLimitHit = true;
      this.status.available = false;
      this.status.lastError = 'Rate limit reached. AI temporarily unavailable.';
    } else if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
      this.status.available = false;
      this.status.lastError = 'AI quota exhausted. Using fallback mode.';
    } else {
      this.status.lastError = errorMessage;
    }
  }

  /**
   * Cache management
   */
  private getCacheKey(request: GenerationRequest): string {
    return `${request.type}_${request.subject}_${request.grade}_${request.topic || ''}_${request.difficulty || ''}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private saveToCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const aiService = new AIService();
