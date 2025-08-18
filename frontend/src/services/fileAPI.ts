// File API service for learning module file operations
import axios from 'axios';
import { handleApiError } from '../utils/apiErrorHandler';
import { config } from '../config/env';

// Create API instance with proper configuration
const api = axios.create({
  baseURL: config.apiUrl,
  timeout: config.requestTimeout,
});

// Add token to requests if it exists
api.interceptors.request.use((requestConfig) => {
  const token = localStorage.getItem(config.tokenKey);
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = handleApiError(error);
    return Promise.reject(apiError);
  }
);

export interface FileUpload {
  id: number;
  userId: number;
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
  description: string;
  category: string;
  moduleId?: number;
  indexingStatus: 'not_indexed' | 'processing' | 'completed' | 'failed';
  uploadedAt: string;
  indexedAt?: string;
}

export interface BulkUploadResponse {
  success: boolean;
  message: string;
  totalFiles: number;
  successCount: number;
  failCount: number;
  results: Array<{
    success: boolean;
    message: string;
    fileId?: number;
    fileName?: string;
    fileUrl?: string;
  }>;
}

export const fileAPI = {
  // Bulk upload files for a learning module
  bulkUploadModuleFiles: async (files: FileList, moduleId: number): Promise<BulkUploadResponse> => {
    try {
      console.log('📁 Bulk uploading', files.length, 'files for module:', moduleId);
      
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      formData.append('moduleId', moduleId.toString());
      
      const response = await api.post('/files/bulk-upload-module', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Bulk upload completed:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Bulk upload failed:', error.response?.data);
      throw handleApiError(error);
    }
  },

  // Get files for a specific learning module
  getModuleFiles: async (moduleId: number): Promise<FileUpload[]> => {
    try {
      console.log('📚 Getting files for module:', moduleId);
      const response = await api.get(`/files/module/${moduleId}`);
      return response.data.files || [];
    } catch (error: any) {
      console.error('❌ Failed to get module files:', error.response?.data);
      throw handleApiError(error);
    }
  },

  // Index a file using the Python AI service
  indexFile: async (fileId: number): Promise<{ success: boolean; message: string; status: string }> => {
    try {
      console.log('🔍 Starting indexing for file:', fileId);
      const response = await api.post(`/files/index-file/${fileId}`);
      console.log('✅ File indexing started:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to start file indexing:', error.response?.data);
      throw handleApiError(error);
    }
  },

  // Update indexing status (for manual status updates)
  updateIndexingStatus: async (fileId: number, status: string): Promise<FileUpload> => {
    try {
      const response = await api.post(`/files/update-indexing-status/${fileId}?status=${status}`);
      return response.data.file;
    } catch (error: any) {
      console.error('❌ Failed to update indexing status:', error.response?.data);
      throw handleApiError(error);
    }
  }
}; 