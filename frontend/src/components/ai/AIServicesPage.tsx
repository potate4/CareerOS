import React, { useState } from 'react';
import { aiAPI } from '../../services/api';
import { AIAnalysisRequest, CareerRecommendationRequest, FileUploadRequest, FileUpload } from '../../types/ai';
import { Brain, Target, Zap, CheckCircle, AlertCircle, Upload, File, Download } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import AuthenticatedLayout from '../layout/AuthenticatedLayout';

const AIServicesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'analysis' | 'recommendations' | 'fileUpload'>('analysis');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  // Analysis form state
  const [analysisForm, setAnalysisForm] = useState({
    content: '',
    analysisType: 'general'
  });

  // Recommendations form state
  const [recommendationsForm, setRecommendationsForm] = useState({
    skills: ['Python', 'React', 'Spring Boot'],
    experienceYears: 3,
    interests: ['Web Development', 'AI/ML', 'Cloud Computing'],
    location: 'Remote'
  });

  // File upload state
  const [fileUploadForm, setFileUploadForm] = useState({
    file: null as File | null,
    description: '',
    category: 'interview'
  });
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleAnalysisSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const request: AIAnalysisRequest = {
        userId: user?.id ?? 0,
        content: analysisForm.content,
        analysisType: analysisForm.analysisType
      };

      const response = await aiAPI.analyzeContent(request);
      setResult(response);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommendationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const request: CareerRecommendationRequest = {
        skills: recommendationsForm.skills,
        experienceYears: recommendationsForm.experienceYears,
        interests: recommendationsForm.interests,
        location: recommendationsForm.location
      };

      const response = await aiAPI.getCareerRecommendations(request);
      setResult(response);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Recommendations failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUploadForm.file) {
      setError('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const request: FileUploadRequest = {
        file: fileUploadForm.file,
        description: fileUploadForm.description || undefined,
        category: fileUploadForm.category || undefined
      };

      const response = await aiAPI.uploadFile(request);
      setResult(response);
      
      if (response.success) {
        // Reset form
        setFileUploadForm({
          file: null,
          description: '',
          category: 'interview'
        });
        // Refresh uploaded files list
        loadUploadedFiles();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'File upload failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUploadedFiles = async () => {
    try {
      const files = await aiAPI.getMyUploads();
      setUploadedFiles(files);
    } catch (err: unknown) {
      console.error('Failed to load uploaded files:', err);
    }
  };

  const handleFileSelect = (file: File) => {
    setFileUploadForm(prev => ({ ...prev, file }));
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const testAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      console.log('Token:', token);
      console.log('User:', user);
      
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('http://localhost:8080/api/ai/test-auth', {
        headers
      });
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Auth test failed');
    }
  };

  const addSkill = () => {
    setRecommendationsForm(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const updateSkill = (index: number, value: string) => {
    setRecommendationsForm(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => i === index ? value : skill)
    }));
  };

  const removeSkill = (index: number) => {
    setRecommendationsForm(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  // Load uploaded files when component mounts
  React.useEffect(() => {
    if (activeTab === 'fileUpload') {
      loadUploadedFiles();
    }
  }, [activeTab]);

  return (
    <AuthenticatedLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#384959' }}>
              <Brain className="h-8 w-8" style={{ color: '#88BDF2' }} />
              AI Services
            </h1>
            <p className="mt-2" style={{ color: '#6A89A7' }}>
              Test the AI integration workflow between FastAPI, Spring Boot, and React
            </p>
            <div className="mt-4 space-x-4">
              <button
                onClick={testAuth}
                className="px-4 py-2 rounded-md text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: '#88BDF2' }}
              >
                Test Authentication
              </button>
              <button
                onClick={() => {
                  console.log('Current token:', localStorage.getItem('token'));
                  console.log('Current user:', localStorage.getItem('user'));
                  setResult({
                    token: localStorage.getItem('token'),
                    user: localStorage.getItem('user'),
                    message: 'Check browser console for details'
                  });
                }}
                className="px-4 py-2 rounded-md text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: '#6A89A7' }}
              >
                Debug Token
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b" style={{ borderColor: '#6A89A7 ' }}>
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'analysis'
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  style={{
                    borderColor: activeTab === 'analysis' ? '#88BDF2' : 'transparent'
                  }}
                >
                  <Zap className="inline h-4 w-4 mr-2" />
                  Content Analysis
                </button>
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'recommendations'
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  style={{
                    borderColor: activeTab === 'recommendations' ? '#88BDF2' : 'transparent'
                  }}
                >
                  <Target className="inline h-4 w-4 mr-2" />
                  Career Recommendations
                </button>
                <button
                  onClick={() => setActiveTab('fileUpload')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'fileUpload'
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  style={{
                    borderColor: activeTab === 'fileUpload' ? '#88BDF2' : 'transparent'
                  }}
                >
                  <Upload className="inline h-4 w-4 mr-2" />
                  File Upload
                </button>
              </nav>
            </div>
          </div>

          {/* Content Analysis Tab */}
          {activeTab === 'analysis' && (
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#384959' }}>Content Analysis</h2>
              
              <form onSubmit={handleAnalysisSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#384959' }}>
                    Content to Analyze
                  </label>
                  <textarea
                    value={analysisForm.content}
                    onChange={(e) => setAnalysisForm(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                
                    rows={4}
                    placeholder="Enter content to analyze..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#384959' }}>
                    Analysis Type
                  </label>
                  <select
                    value={analysisForm.analysisType}
                    onChange={(e) => setAnalysisForm(prev => ({ ...prev, analysisType: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
               
                  >
                    <option value="general">General Analysis</option>
                    <option value="sentiment">Sentiment Analysis</option>
                    <option value="skills">Skills Analysis</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-white transition-colors"
                  style={{ backgroundColor: '#88BDF2' }}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Analyze Content
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Career Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#384959' }}>Career Recommendations</h2>
              
              <form onSubmit={handleRecommendationsSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#384959' }}>
                    Skills
                  </label>
                  <div className="space-y-2">
                    {recommendationsForm.skills.map((skill, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) => updateSkill(index, e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                     
                          placeholder="Enter a skill"
                        />
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="px-3 py-2 text-white rounded-md transition-colors"
                          style={{ backgroundColor: '#6A89A7' }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-2 text-white rounded-md transition-colors"
                      style={{ backgroundColor: '#88BDF2' }}
                    >
                      Add Skill
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#384959' }}>
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      value={recommendationsForm.experienceYears}
                      onChange={(e) => setRecommendationsForm(prev => ({ ...prev, experienceYears: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    
                      min="0"
                      max="50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#384959' }}>
                      Interests
                    </label>
                    <input
                      type="text"
                      value={recommendationsForm.interests.join(', ')}
                      onChange={(e) => setRecommendationsForm(prev => ({ 
                        ...prev, 
                        interests: e.target.value.split(',').map(i => i.trim()).filter(i => i)
                      }))}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    
                      placeholder="Web Development, AI/ML, Cloud Computing"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#384959' }}>
                      Preferred Location
                    </label>
                    <select
                      value={recommendationsForm.location}
                      onChange={(e) => setRecommendationsForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    
                    >
                      <option value="Remote">Remote</option>
                      <option value="On-site">On-site</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-white transition-colors"
                  style={{ backgroundColor: '#88BDF2' }}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Getting Recommendations...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4" />
                      Get Recommendations
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* File Upload Tab */}
          {activeTab === 'fileUpload' && (
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#384959' }}>File Upload</h2>
              
              <form onSubmit={handleFileUpload} className="space-y-4">
                {/* File Upload Area */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#384959' }}>
                    Upload File
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className="mx-auto h-12 w-12 mb-4" style={{ color: '#6A89A7' }} />
                    <p className="text-sm" style={{ color: '#6A89A7' }}>
                      Drag and drop a file here, or{' '}
                      <label className="text-blue-600 hover:text-blue-500 cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileInputChange}
                          accept="*/*"
                        />
                        browse
                      </label>
                    </p>
                    {fileUploadForm.file && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <File className="h-5 w-5" style={{ color: '#88BDF2' }} />
                          <span className="text-sm font-medium" style={{ color: '#384959' }}>
                            {fileUploadForm.file.name}
                          </span>
                          <span className="text-xs" style={{ color: '#6A89A7' }}>
                            ({(fileUploadForm.file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#384959' }}>
                    Description (Optional)
                  </label>
                  <textarea
                    value={fileUploadForm.description}
                    onChange={(e) => setFileUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    rows={3}
                    placeholder="Describe the file content..."
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#384959' }}>
                    Category
                  </label>
                  <select
                    value={fileUploadForm.category}
                    onChange={(e) => setFileUploadForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  >
                    <option value="interview">Interview Materials</option>
                    <option value="resume">Resume</option>
                    <option value="cover-letter">Cover Letter</option>
                    <option value="portfolio">Portfolio</option>
                    <option value="certificate">Certificate</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !fileUploadForm.file}
                  className="px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-white transition-colors"
                  style={{ backgroundColor: '#88BDF2' }}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload File
                    </>
                  )}
                </button>
              </form>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#384959' }}>
                    Your Uploaded Files
                  </h3>
                  <div className="space-y-3">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                        style={{ borderColor: '#6A89A7' }}
                      >
                        <div className="flex items-center gap-3">
                          <File className="h-5 w-5" style={{ color: '#88BDF2' }} />
                          <div>
                            <p className="font-medium" style={{ color: '#384959' }}>
                              {file.originalFileName}
                            </p>
                            <p className="text-sm" style={{ color: '#6A89A7' }}>
                              {file.category} • {new Date(file.uploadDate).toLocaleDateString()}
                            </p>
                            {file.description && (
                              <p className="text-sm mt-1" style={{ color: '#6A89A7' }}>
                                {file.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-md transition-colors"
                            style={{ backgroundColor: '#88BDF2', color: 'white' }}
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results */}
          {(result || error) && (
            <div className="mt-6 bg-white shadow-lg rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#384959' }}>
                {error ? 'Error' : 'Results'}
              </h3>
              
              {error ? (
                <div className="flex items-center gap-2 p-4 rounded-md" style={{ backgroundColor: '#FEE2E2' }}>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700">{error}</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" style={{ color: '#88BDF2' }} />
                    <span className="font-medium" style={{ color: '#384959' }}>
                      {activeTab === 'fileUpload' ? 'File uploaded successfully!' : 'Analysis completed successfully!'}
                    </span>
                  </div>
                  <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm" style={{ color: '#384959' }}>
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default AIServicesPage; 