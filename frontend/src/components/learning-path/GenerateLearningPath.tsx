import React, { useState } from 'react';
import { 
  Sparkles, 
  Target, 
  BookOpen, 
  Clock, 
  Star,
  ArrowRight,
  CheckCircle,
  Brain
} from 'lucide-react';
import { learningPathAPI } from '../../services/learningPathAPI';
import { LearningPathRequest, ExperienceLevel, LearningPace } from '../../types/learningPath';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      // Only send the essential learning path request data
      await learningPathAPI.generateLearningPath(formData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to generate learning path:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const popularSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'SQL',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'TypeScript'
  ];

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-2 rounded-full bg-gradient-to-r from-slate-600 to-slate-700">
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
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">AI-powered learning path generated successfully!</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-700">Your new learning path has been created.</span>
              <button
                onClick={() => window.location.href = '/learning-path/all-paths'}
                className="text-sm text-green-600 hover:text-green-700 font-medium underline"
              >
                View All Learning Paths
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Career Goal Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-slate-800">Career Goal</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="careerGoal" className="block text-sm font-medium text-slate-700 mb-2">
                  What is your primary career goal?
                </label>
                <input
                  type="text"
                  id="careerGoal"
                  value={formData.careerGoal}
                  onChange={(e) => setFormData(prev => ({ ...prev, careerGoal: e.target.value }))}
                  placeholder="e.g., Full Stack Developer, Data Scientist, DevOps Engineer"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="experienceLevel" className="block text-sm font-medium text-slate-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    id="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value as ExperienceLevel }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={ExperienceLevel.BEGINNER}>Beginner</option>
                    <option value={ExperienceLevel.INTERMEDIATE}>Intermediate</option>
                    <option value={ExperienceLevel.ADVANCED}>Advanced</option>
                    <option value={ExperienceLevel.EXPERT}>Expert</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="learningPace" className="block text-sm font-medium text-slate-700 mb-2">
                    Learning Pace
                  </label>
                  <select
                    id="learningPace"
                    value={formData.learningPace}
                    onChange={(e) => setFormData(prev => ({ ...prev, learningPace: e.target.value as LearningPace }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={LearningPace.SLOW}>Slow (1-2 hours/week)</option>
                    <option value={LearningPace.MODERATE}>Moderate (3-5 hours/week)</option>
                    <option value={LearningPace.FAST}>Fast (6+ hours/week)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Current Skills Section */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
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

          {/* Additional Notes */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="h-6 w-6 text-slate-600" />
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
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
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
              disabled={isGenerating || !formData.careerGoal}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 ${
                isGenerating || !formData.careerGoal
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  AI is analyzing your data...
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