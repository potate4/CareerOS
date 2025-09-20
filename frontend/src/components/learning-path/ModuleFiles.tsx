import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, X, Play, RefreshCw } from 'lucide-react';
import { fileAPI, FileUpload, BulkUploadResponse } from '../../services/fileAPI';

interface ModuleFilesProps {
  moduleId: number;
  moduleName: string;
  isExpanded: boolean;
  onToggle: () => void;
}

const ModuleFiles: React.FC<ModuleFilesProps> = ({ moduleId, moduleName, isExpanded, onToggle }) => {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded) {
      loadModuleFiles();
    }
  }, [isExpanded, moduleId]);

  const loadModuleFiles = async () => {
    try {
      setLoading(true);
      const moduleFiles = await fileAPI.getModuleFiles(moduleId);
      setFiles(moduleFiles);
    } catch (error: any) {
      console.error('Failed to load module files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    try {
      setUploading(true);
      setUploadProgress(`Uploading ${selectedFiles.length} files...`);

      const response: BulkUploadResponse = await fileAPI.bulkUploadModuleFiles(selectedFiles, moduleId);
      
      setUploadProgress(`Upload completed: ${response.successCount} successful, ${response.failCount} failed`);
      
      // Refresh the file list
      await loadModuleFiles();
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setTimeout(() => setUploadProgress(''), 3000);
    } catch (error: any) {
      setUploadProgress(`Upload failed: ${error.message}`);
      setTimeout(() => setUploadProgress(''), 5000);
    } finally {
      setUploading(false);
    }
  };

  const handleIndexFile = async (fileId: number) => {
    try {
      await fileAPI.indexFile(fileId);
      
      // Update file status locally
      setFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, indexingStatus: 'processing' }
          : file
      ));
      
      // Set up periodic refresh to check for callback updates
      setTimeout(() => {
        loadModuleFiles(); // Refresh file list to get updated status
      }, 5000); // Check after 5 seconds
      
      setTimeout(() => {
        loadModuleFiles(); // Check again after 15 seconds
      }, 15000);
      
    } catch (error: any) {
      console.error('Failed to start file indexing:', error);
      // Update status to failed locally
      setFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, indexingStatus: 'failed' }
          : file
      ));
    }
  };

  const handleRefreshFiles = async () => {
    await loadModuleFiles();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Loader className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'processing':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-600';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="border-t border-slate-100 bg-slate-50">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h5 className="font-medium text-slate-800 flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Learning Files ({files.length})
          </h5>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshFiles}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh file status"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload Files'}
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.ppt,.pptx"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {uploadProgress && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">{uploadProgress}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="h-6 w-6 animate-spin text-slate-400" />
            <span className="ml-2 text-slate-600">Loading files...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <FileText className="h-12 w-12 mx-auto mb-2 text-slate-300" />
            <p>No files uploaded yet</p>
            <p className="text-sm">Upload PDF, DOC, or PPT files to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(file.indexingStatus)}`}>
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(file.indexingStatus)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.originalFileName}</p>
                    <p className="text-xs opacity-75">
                      {formatFileSize(file.fileSize)} • {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-white bg-opacity-50">
                    {file.indexingStatus.replace('_', ' ')}
                  </span>
                  
                  {file.indexingStatus === 'not_indexed' && (
                    <button
                      onClick={() => handleIndexFile(file.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                    >
                      <Play className="h-3 w-3" />
                      Index It
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleFiles; 