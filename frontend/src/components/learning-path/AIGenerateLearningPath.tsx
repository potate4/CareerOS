import React, { useState } from 'react';
import { 
  Sparkles, 
  Target, 
  BookOpen, 
  Clock, 
  Star,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Brain,
  TrendingUp,
  Zap,
  Lightbulb,
  BarChart3,
  Users,
  Calendar
} from 'lucide-react';
import { learningPathAPI } from '../../services/learningPathAPI';
import { 
  AILearningPathRequest, 
  ExperienceLevel, 
  LearningPace,
  InterviewPerformance,
  MarketTrend,
  LearningHistory,
  LearningPathRequest
} from '../../types/learningPath';

const AIGenerateLearningPath: React.FC = () => {
  const [formData, setFormData] = useState<AILearningPathRequest>({
    userId: 1, // Default user ID for testing
    username: 'testuser', // Default username for testing
    careerGoal: '',
    currentSkills: {},
    experienceLevel: ExperienceLevel.BEGINNER,
    learningPace: LearningPace.MODERATE,
    additionalNotes: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentSkillLevel, setCurrentSkillLevel] = useState(0.5);
  const [showSuccess, setShowSuccess] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [useAI, setUseAI] = useState(true);

  // Interview performance state
  const [interviewPerformance, setInterviewPerformance] = useState<InterviewPerformance>({
    overallScore: undefined,
    technicalScore: undefined,
    communicationScore: undefined,
    problemSolvingScore: undefined,
    lastInterviewDate: undefined
  });

  // Market trends state
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [currentMarketSkill, setCurrentMarketSkill] = useState('');
  const [currentMarketDemand, setCurrentMarketDemand] = useState(7.0);

  // Learning history state
  const [learningHistory, setLearningHistory] = useState<LearningHistory>({
    completedModules: 0,
    totalHoursSpent: 0,
    averageRating: 0,
    lastActivityDate: undefined
  });

  const handleAddSkill = () => {
    if (currentSkill.trim() && !(currentSkill.trim() in formData.currentSkills)) {
      setFormData(prev => ({
        ...prev,
        currentSkills: {
          ...prev.currentSkills,
          [currentSkill.trim()]: currentSkillLevel
        }
      }));
      setCurrentSkill('');
      setCurrentSkillLevel(0.5);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => {
      const newSkills = { ...prev.currentSkills };
      delete newSkills[skillToRemove];
      return { ...prev, currentSkills: newSkills };
    });
  };

  const handleUpdateSkillLevel = (skill: string, level: number) => {
    setFormData(prev => ({
      ...prev,
      currentSkills: {
        ...prev.currentSkills,
        [skill]: level
      }
    }));
  };

  const handleAddMarketTrend = () => {
    if (currentMarketSkill.trim()) {
      const newTrend: MarketTrend = {
        skillName: currentMarketSkill.trim(),
        demandScore: currentMarketDemand,
        salaryTrend: 'STABLE',
        trendingDirection: 'STABLE'
      };
      setMarketTrends(prev => [...prev, newTrend]);
      setCurrentMarketSkill('');
      setCurrentMarketDemand(7.0);
    }
  };

  const handleRemoveMarketTrend = (skillToRemove: string) => {
    setMarketTrends(prev => prev.filter(trend => trend.skillName !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      let response;
      
      if (useAI) {
        // Prepare AI request with additional data
        const aiRequest: AILearningPathRequest = {
          ...formData,
          interviewPerformance: Object.values(interviewPerformance).some(v => v !== undefined) ? interviewPerformance : undefined,
          marketTrends: marketTrends.length > 0 ? marketTrends : undefined,
          learningHistory: Object.values(learningHistory).some(v => v !== 0) ? learningHistory : undefined
        };
        
        response = await learningPathAPI.generateAILearningPath(aiRequest);
        setAiResponse(response);
      } else {
        // Convert to traditional format for Java backend
        const traditionalRequest: LearningPathRequest = {
          careerGoal: formData.careerGoal,
          currentSkills: Object.keys(formData.currentSkills), // Convert to array of skill names
          experienceLevel: formData.experienceLevel,
          learningPace: formData.learningPace,
          additionalNotes: formData.additionalNotes
        };
        
        response = await learningPathAPI.generateLearningPath(traditionalRequest);
      }
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
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

  const getMarketDemandColor = (score: number) => {
    if (score >= 8.5) return 'text-green-600';
    if (score >= 7.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMarketDemandLabel = (score: number) => {
    if (score >= 8.5) return 'High Demand';
    if (score >= 7.0) return 'Moderate Demand';
    return 'Low Demand';
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">AI-Powered Learning Path Generator</h2>
          </div>
          <p className="text-slate-600 max-w-3xl mx-auto">
            Our advanced AI analyzes your career goals, current skills, interview performance, and market trends 
            to create a personalized learning journey that adapts to your progress and market changes.
          </p>
        </div>

        {/* AI Toggle */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-3 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setUseAI(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                useAI
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI-Powered
              </div>
            </button>
            <button
              type="button"
              onClick={() => setUseAI(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                !useAI
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Traditional
              </div>
            </button>
          </div>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">
              {useAI ? 'AI learning path generated successfully!' : 'Learning path generated successfully!'}
            </span>
          </div>
        )}

        {aiResponse && (
          <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-slate-800">AI Analysis Results</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3">
                <div className="text-sm text-slate-600">Market Demand Score</div>
                <div className="text-lg font-semibold text-purple-600">{aiResponse.marketDemandScore}/10</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-sm text-slate-600">Estimated Time</div>
                <div className="text-lg font-semibold text-blue-600">{aiResponse.estimatedWeeks} weeks</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-sm text-slate-600">Skills to Learn</div>
                <div className="text-lg font-semibold text-green-600">{aiResponse.skillGapAnalysis.skillsToLearn}</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-slate-600 mb-2">Learning Strategy</div>
              <div className="text-slate-800">{aiResponse.learningStrategy}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
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
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    placeholder="e.g., JavaScript"
                    className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.1"
                    value={currentSkillLevel}
                    onChange={(e) => setCurrentSkillLevel(Number(e.target.value))}
                    className="w-24 h-1 bg-slate-300 rounded-full appearance-none cursor-pointer"
                    title={`Skill Level: ${currentSkillLevel.toFixed(1)}`}
                  />
                  <span className="flex items-center px-3 text-sm text-slate-600 min-w-[60px]">
                    {currentSkillLevel.toFixed(1)}
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Skill level: 0.0 (Beginner) to 1.0 (Expert)
                </p>
              </div>
              
              {Object.keys(formData.currentSkills).length > 0 && (
                <div>
                  <p className="text-sm text-slate-600 mb-2">Your skills:</p>
                  <div className="space-y-2">
                    {Object.entries(formData.currentSkills).map(([skill, level]) => (
                      <div key={skill} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-slate-800">{skill}</span>
                          <input
                            type="range"
                            min="0.0"
                            max="1.0"
                            step="0.1"
                            value={level}
                            onChange={(e) => handleUpdateSkillLevel(skill, Number(e.target.value))}
                            className="w-24 h-1 bg-slate-300 rounded-full appearance-none cursor-pointer"
                          />
                          <span className="text-sm text-slate-600">{level.toFixed(1)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
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
                        if (!(skill in formData.currentSkills)) {
                          setFormData(prev => ({ ...prev, currentSkills: { ...prev.currentSkills, [skill]: 0.5 } }));
                        }
                      }}
                      disabled={skill in formData.currentSkills}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        skill in formData.currentSkills
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

          {/* AI-Enhanced Sections (only show when AI is enabled) */}
          {useAI && (
            <>
              {/* Interview Performance Section */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-6 w-6 text-orange-600" />
                  <h3 className="text-xl font-semibold text-slate-800">Interview Performance (Optional)</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Overall Score (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={interviewPerformance.overallScore || ''}
                      onChange={(e) => setInterviewPerformance(prev => ({ ...prev, overallScore: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., 7"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Technical Score (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={interviewPerformance.technicalScore || ''}
                      onChange={(e) => setInterviewPerformance(prev => ({ ...prev, technicalScore: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., 8"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Communication Score (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={interviewPerformance.communicationScore || ''}
                      onChange={(e) => setInterviewPerformance(prev => ({ ...prev, communicationScore: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., 6"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Problem Solving Score (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={interviewPerformance.problemSolvingScore || ''}
                      onChange={(e) => setInterviewPerformance(prev => ({ ...prev, problemSolvingScore: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., 7"
                    />
                  </div>
                </div>
              </div>

              {/* Market Trends Section */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                  <h3 className="text-xl font-semibold text-slate-800">Market Trends (Optional)</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Skill Name</label>
                      <input
                        type="text"
                        value={currentMarketSkill}
                        onChange={(e) => setCurrentMarketSkill(e.target.value)}
                        placeholder="e.g., React"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Demand Score (1-10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        step="0.1"
                        value={currentMarketDemand}
                        onChange={(e) => setCurrentMarketDemand(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAddMarketTrend}
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Add Trend
                      </button>
                    </div>
                  </div>
                  
                  {marketTrends.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-600 mb-2">Market trends:</p>
                      <div className="space-y-2">
                        {marketTrends.map((trend) => (
                          <div key={trend.skillName} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-slate-800">{trend.skillName}</span>
                              <span className={`text-sm font-medium ${getMarketDemandColor(trend.demandScore)}`}>
                                {getMarketDemandLabel(trend.demandScore)}
                              </span>
                              <span className="text-sm text-slate-600">({trend.demandScore}/10)</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMarketTrend(trend.skillName)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Learning History Section */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="h-6 w-6 text-emerald-600" />
                  <h3 className="text-xl font-semibold text-slate-800">Learning History (Optional)</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Completed Modules</label>
                    <input
                      type="number"
                      min="0"
                      value={learningHistory.completedModules}
                      onChange={(e) => setLearningHistory(prev => ({ ...prev, completedModules: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Total Hours Spent</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={learningHistory.totalHoursSpent}
                      onChange={(e) => setLearningHistory(prev => ({ ...prev, totalHoursSpent: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Average Rating (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={learningHistory.averageRating}
                      onChange={(e) => setLearningHistory(prev => ({ ...prev, averageRating: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

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

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isGenerating || !formData.careerGoal}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 ${
                isGenerating || !formData.careerGoal
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : useAI
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {useAI ? 'AI is generating your path...' : 'Generating Path...'}
                </>
              ) : (
                <>
                  {useAI ? (
                    <>
                      <Brain className="h-5 w-5" />
                      Generate AI Learning Path
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Generate Learning Path
                    </>
                  )}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIGenerateLearningPath;
