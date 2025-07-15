import React, { useState } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
import { aiAPI } from '../../services/api';
import { AIAnalysisRequest, CareerRecommendationRequest } from '../../types/ai';
import { Brain, TrendingUp, BookOpen, Target, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
const AIServicesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'analysis' | 'recommendations'>('analysis');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
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

  const handleAnalysisSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const request: AIAnalysisRequest = {
        userId: user?.id,
        content: analysisForm.content,
        analysisType: analysisForm.analysisType
      };

      const response = await aiAPI.analyzeContent(request);
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
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
    } catch (err: any) {
      setError(err.message || 'Recommendations failed');
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Brain className="h-8 w-8 text-indigo-600" />
              AI Services
            </h1>
            <p className="mt-2 text-gray-600">
              Test the AI integration workflow between FastAPI, Spring Boot, and React
            </p>
            <div className="mt-4 space-x-4">
              <button
                onClick={testAuth}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Debug Token
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'analysis'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Zap className="inline h-4 w-4 mr-2" />
                  Content Analysis
                </button>
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'recommendations'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Target className="inline h-4 w-4 mr-2" />
                  Career Recommendations
                </button>
              </nav>
            </div>
          </div>

          {/* Content Analysis Tab */}
          {activeTab === 'analysis' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Analysis</h2>
              
              <form onSubmit={handleAnalysisSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content to Analyze
                  </label>
                  <textarea
                    value={analysisForm.content}
                    onChange={(e) => setAnalysisForm(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    rows={4}
                    placeholder="Enter content to analyze..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Analysis Type
                  </label>
                  <select
                    value={analysisForm.analysisType}
                    onChange={(e) => setAnalysisForm(prev => ({ ...prev, analysisType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="general">General Analysis</option>
                    <option value="sentiment">Sentiment Analysis</option>
                    <option value="skills">Skills Analysis</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Career Recommendations</h2>
              
              <form onSubmit={handleRecommendationsSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills
                  </label>
                  <div className="space-y-2">
                    {recommendationsForm.skills.map((skill, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) => updateSkill(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Enter skill"
                        />
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSkill}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      + Add Skill
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      value={recommendationsForm.experienceYears}
                      onChange={(e) => setRecommendationsForm(prev => ({ ...prev, experienceYears: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location Preference
                    </label>
                    <input
                      type="text"
                      value={recommendationsForm.location}
                      onChange={(e) => setRecommendationsForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Remote, San Francisco"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Generating...
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

          {/* Results Section */}
          {result && (
            <div className="mt-8 bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Results
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800 overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800">Error</h3>
              </div>
              <p className="mt-2 text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIServicesPage; 