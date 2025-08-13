import React, { useState } from 'react';
import { 
  Sparkles, 
  Target, 
  BookOpen, 
  Clock, 
  Star,
  ArrowRight,
  CheckCircle,
  AlertCircle
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
      await learningPathAPI.generateLearningPath(formData);
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

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Generate Your Learning Path</h2>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Tell us about your career goals and current skills. Our AI will create a personalized 
            learning journey tailored just for you.
          </p>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Learning path generated successfully!</span>
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

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isGenerating || !formData.careerGoal}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 ${
                isGenerating || !formData.careerGoal
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating Path...
                </>
              ) : (
                <>
                  Generate My Learning Path
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

export default GenerateLearningPath; 