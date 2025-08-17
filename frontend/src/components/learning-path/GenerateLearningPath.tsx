import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Target, 
  BookOpen, 
  Clock, 
  Star,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Upload,
  FileText,
  X,
  Brain
} from 'lucide-react';
import { learningPathAPI } from '../../services/learningPathAPI';
import { LearningPathRequest, ExperienceLevel, LearningPace } from '../../types/learningPath';

interface UploadedFile {
  file: File;
  id: string;
  status: 'uploading' | 'completed' | 'error';
}

const GenerateLearningPath: React.FC = () => {
  const [formData, setFormData] = useState<LearningPathRequest>({
    careerGoal: '',
    currentSkills: [],
    experienceLevel: ExperienceLevel.BEGINNER,
    learningPace: LearningPace.MODERATE,
    additionalNotes: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSkill, setCurrentSkill] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddSkill = () => {
    if (currentSkill.trim() && !formData.currentSkills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        currentSkills: [...prev.currentSkills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      currentSkills: prev.currentSkills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                         'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                         'application/msword', 'application/vnd.ms-powerpoint'];
    
    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} is not supported. Please upload PDF, DOCX, or PPTX files.`);
        continue;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`File ${file.name} is too large. Please upload files smaller than 10MB.`);
        continue;
      }
      
      newFiles.push({
        file,
        id: Math.random().toString(36),
        status: 'uploading'
      });
    }
    
    if (newFiles.length === 0) return;
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsUploadingFiles(true);
    
    try {
      // Simulate file upload to backend
      const formData = new FormData();
      newFiles.forEach(fileObj => {
        formData.append('files', fileObj.file);
      });
      
      // TODO: Implement actual file upload to backend
      // await learningPathAPI.uploadLearningMaterials(formData);
      
      // For now, simulate successful upload
      setTimeout(() => {
        setUploadedFiles(prev => 
          prev.map(f => 
            newFiles.some(nf => nf.id === f.id) 
              ? { ...f, status: 'completed' as const }
              : f
          )
        );
        setIsUploadingFiles(false);
      }, 2000);
      
    } catch (error) {
      console.error('File upload failed:', error);
      setUploadedFiles(prev => 
        prev.map(f => 
          newFiles.some(nf => nf.id === f.id) 
            ? { ...f, status: 'error' as const }
            : f
        )
      );
      setIsUploadingFiles(false);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      // Include uploaded files in the request
      const requestData = {
        ...formData,
        uploadedFiles: uploadedFiles
          .filter(f => f.status === 'completed')
          .map(f => ({
            filename: f.file.name,
            fileType: f.file.type,
            fileSize: f.file.size
          }))
      };
      
      await learningPathAPI.generateLearningPath(requestData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to generate learning path:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const popularCareerGoals = [
    'Full Stack Developer',
    'Data Scientist',
    'DevOps Engineer',
    'Product Manager',
    'UX/UI Designer',
    'Machine Learning Engineer',
    'Cloud Architect',
    'Cybersecurity Specialist'
  ];

  const popularSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'SQL',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'TypeScript'
  ];

  const getFileIcon = (fileType: string) => {
    return <FileText className="h-5 w-5" />;
  };

  const getFileStatusColor = (status: string) => {
    switch (status) {
      case 'uploading': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">AI-Powered Learning Path</h2>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Tell us about your career goals, upload your learning materials, and our AI will create a 
            personalized learning journey with intelligent content analysis and recommendations.
          </p>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">AI-powered learning path generated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Learning Materials Upload Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-xl p-6 border border-indigo-100">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="h-6 w-6 text-indigo-600" />
              <h3 className="text-xl font-semibold text-slate-800">Learning Materials (Optional)</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-slate-600 mb-4">
                Upload your existing learning materials (PDF, DOCX, PPTX) to help our AI understand your current knowledge and create more personalized recommendations.
              </p>
              
              <div className="border-2 border-dashed border-indigo-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.pptx,.doc,.ppt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Click to upload
                  </button>
                  {' '}or drag and drop
                </p>
                <p className="text-sm text-slate-500">
                  PDF, DOCX, PPTX files up to 10MB each
                </p>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-700">Uploaded Files:</h4>
                  {uploadedFiles.map((fileObj) => (
                    <div key={fileObj.id} className={`flex items-center justify-between p-3 rounded-lg border ${getFileStatusColor(fileObj.status)}`}>
                      <div className="flex items-center gap-3">
                        {getFileIcon(fileObj.file.type)}
                        <div>
                          <p className="text-sm font-medium">{fileObj.file.name}</p>
                          <p className="text-xs opacity-75">
                            {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {fileObj.status === 'uploading' && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        )}
                        {fileObj.status === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {fileObj.status === 'error' && (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(fileObj.id)}
                          className="p-1 hover:bg-white rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Career Goal Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <Target className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-slate-800">Career Goal</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  What's your target career?
                </label>
                <input
                  type="text"
                  value={formData.careerGoal}
                  onChange={(e) => setFormData(prev => ({ ...prev, careerGoal: e.target.value }))}
                  placeholder="e.g., Full Stack Developer"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              
              <div>
                <p className="text-sm text-slate-600 mb-3">Popular career goals:</p>
                <div className="flex flex-wrap gap-2">
                  {popularCareerGoals.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, careerGoal: goal }))}
                      className="px-3 py-1 text-sm bg-white border border-slate-300 rounded-full hover:border-blue-500 hover:text-blue-600 transition-colors"
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Current Skills Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-semibold text-slate-800">Current Skills</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Add your current skills
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    placeholder="e.g., JavaScript"
                    className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              {formData.currentSkills.length > 0 && (
                <div>
                  <p className="text-sm text-slate-600 mb-2">Your skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.currentSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-1 hover:text-green-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-sm text-slate-600 mb-3">Popular skills:</p>
                <div className="flex flex-wrap gap-2">
                  {popularSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        if (!formData.currentSkills.includes(skill)) {
                          setFormData(prev => ({ ...prev, currentSkills: [...prev.currentSkills, skill] }));
                        }
                      }}
                      disabled={formData.currentSkills.includes(skill)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        formData.currentSkills.includes(skill)
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-white border border-slate-300 hover:border-green-500 hover:text-green-600'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Experience & Pace Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <div className="flex items-center gap-3 mb-4">
                <Star className="h-6 w-6 text-purple-600" />
                <h3 className="text-xl font-semibold text-slate-800">Experience Level</h3>
              </div>
              
              <div className="space-y-3">
                {Object.values(ExperienceLevel).map((level) => (
                  <label key={level} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="experienceLevel"
                      value={level}
                      checked={formData.experienceLevel === level}
                      onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value as ExperienceLevel }))}
                      className="w-4 h-4 text-purple-600 border-slate-300 focus:ring-purple-500"
                    />
                    <span className="text-slate-700 capitalize">{level.toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-6 w-6 text-orange-600" />
                <h3 className="text-xl font-semibold text-slate-800">Learning Pace</h3>
              </div>
              
              <div className="space-y-3">
                {Object.values(LearningPace).map((pace) => (
                  <label key={pace} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="learningPace"
                      value={pace}
                      checked={formData.learningPace === pace}
                      onChange={(e) => setFormData(prev => ({ ...prev, learningPace: e.target.value as LearningPace }))}
                      className="w-4 h-4 text-orange-600 border-slate-300 focus:ring-orange-500"
                    />
                    <span className="text-slate-700 capitalize">{pace.toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-slate-600" />
              <h3 className="text-xl font-semibold text-slate-800">Additional Notes (Optional)</h3>
            </div>
            
            <textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
              placeholder="Any specific requirements, preferences, or additional context..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* AI Features Notice */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100">
            <div className="flex items-start gap-3">
              <Brain className="h-6 w-6 text-cyan-600 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-2">AI-Powered Features</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Intelligent skill gap analysis based on your career goal</li>
                  <li>• Content extraction and indexing from your uploaded materials</li>
                  <li>• Personalized resource recommendations using RAG technology</li>
                  <li>• Interactive chat with your learning materials for each module</li>
                  <li>• AI-generated assessments and progress tracking</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isGenerating || !formData.careerGoal || isUploadingFiles}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 ${
                isGenerating || !formData.careerGoal || isUploadingFiles
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  AI is analyzing your data...
                </>
              ) : isUploadingFiles ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing files...
                </>
              ) : (
                <>
                  Generate AI Learning Path
                  <Brain className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateLearningPath; 