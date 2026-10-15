/**
 * Upload Utility untuk TUPARI LMS
 * Upload file ke Google Drive via GAS backend
 */

import { api } from '../services/api';

export interface UploadResult {
  success: boolean;
  fileId?: string;
  fileUrl?: string;
  fileName?: string;
  error?: string;
}

/**
 * Upload file ke Google Drive
 */
export async function uploadFile(
  file: File,
  folder: 'materi' | 'tugas' | 'ujian' | 'lainnya' = 'lainnya'
): Promise<UploadResult> {
  try {
    // Validasi ukuran file (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: `Ukuran file terlalu besar. Maksimal 50MB. Ukuran file: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      };
    }

    // Validasi tipe file
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/webm',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'application/zip',
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png|gif|mp4|webm|doc|docx|xls|xlsx|ppt|pptx|txt|zip)$/i)) {
      return {
        success: false,
        error: 'Tipe file tidak didukung. Gunakan PDF, gambar, video, atau dokumen Office.'
      };
    }

    // Convert file to base64
    const base64 = await fileToBase64(file);

    // Upload via API (akan diimplementasi di backend)
    // Untuk sekarang, return mock success
    // TODO: Implement actual upload endpoint di GAS
    
    return {
      success: true,
      fileId: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fileUrl: `https://drive.google.com/file/d/${Date.now()}/view`,
      fileName: file.name,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal upload file'
    };
  }
}

/**
 * Convert File to Base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file icon based on type
 */
export function getFileIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return '📄';
    case 'doc':
    case 'docx': return '📝';
    case 'xls':
    case 'xlsx': return '📊';
    case 'ppt':
    case 'pptx': return '📽️';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif': return '🖼️';
    case 'mp4':
    case 'webm': return '🎬';
    case 'zip': return '📦';
    case 'txt': return '📃';
    default: return '📎';
  }
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024;
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Ukuran file terlalu besar (${formatFileSize(file.size)}). Maksimal 50MB.`
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'File kosong'
    };
  }

  return { valid: true };
}
