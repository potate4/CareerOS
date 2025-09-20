import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Award,
  TrendingUp,
  BookOpen,
  FileText,
  Star,
  Target,
  X
} from 'lucide-react';
import { learningPathAPI } from '../../services/learningPathAPI';
import { useAuthStore } from '../../stores/authStore';

interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'practical' | 'conceptual';
  options?: string[];
  correct_answer?: string;
  points: number;
  difficulty: string;
}

interface Assessment {
  assessment_id: string;
  module_id: number;
  skill_focus: string;
  difficulty_level: string;
  questions: Question[];
  estimated_time_minutes: number;
  total_points: number;
  passing_score: number;
  instructions: string;
}

interface AssessmentResult {
  overall_score: number;
  section_scores: { [key: string]: number };
  detailed_feedback: { [key: string]: string };
  strengths: string[];
  improvement_areas: string[];
  recommended_actions: string[];
  knowledge_gaps: string[];
  grade: string;
}

interface AssessmentModalProps {
  moduleId: number;
  moduleName: string;
  skillFocus: string;
  isOpen: boolean;
  onClose: () => void;
}

const AssessmentModal: React.FC<AssessmentModalProps> = ({
  moduleId,
  moduleName,
  skillFocus,
  isOpen,
  onClose
}) => {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<'loading' | 'instructions' | 'questions' | 'results'>('loading');
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [responses, setResponses] = useState<{ [key: string]: string }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (isOpen) {
      generateAssessment();
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentStep === 'questions' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitAssessment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, timeRemaining]);

  const generateAssessment = async () => {
    try {
      setCurrentStep('loading');
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Call real API to generate module-specific assessment
      const response = await learningPathAPI.generateAssessment({
        moduleId,
        userId: user.id,
        assessmentType: 'quiz',
        numQuestions: 5,
        difficulty: 'medium'
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to generate assessment');
      }

      // Convert API response to component format
      const apiAssessment: Assessment = {
        assessment_id: response.assessment_id,
        module_id: response.module_id,
        skill_focus: skillFocus,
        difficulty_level: response.difficulty.toUpperCase(),
        estimated_time_minutes: 20,
        total_points: response.questions.reduce((sum: number, q: any) => sum + (q.points || 20), 0),
        passing_score: 70,
        instructions: "Complete all questions to the best of your ability. This assessment will help evaluate your understanding of the module concepts.",
        questions: response.questions.map((q: any, index: number) => ({
          id: q.id || `q${index + 1}`,
          question: q.question,
          type: q.question_type === 'multiple_choice' ? 'multiple_choice' : 'conceptual',
          options: q.options || undefined,
          correct_answer: q.correct_answer,
          points: q.points || 20,
          difficulty: q.difficulty?.toUpperCase() || 'INTERMEDIATE'
        }))
      };

      console.log('🎯 Generated real assessment for module:', moduleId, apiAssessment);
      setAssessment(apiAssessment);
      setTimeRemaining(apiAssessment.estimated_time_minutes * 60);
      setCurrentStep('instructions');
    } catch (error) {
      console.error('❌ Failed to generate assessment:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        moduleId,
        userId: user?.id
      });
      
      // Show more detailed error message
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error occurred';
      alert(`Assessment generation failed: ${errorMessage}`);
      onClose();
    }
  };

  const startAssessment = () => {
    setCurrentStep('questions');
    setStartTime(new Date());
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (assessment && currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitAssessment = async () => {
    if (!assessment || !startTime || !user?.id) return;
    
    setIsSubmitting(true);
    
    try {
      const timeTaken = Math.floor((new Date().getTime() - startTime.getTime()) / 1000 / 60);
      
      // Prepare assessment answers for API
      const assessmentAnswers = assessment.questions.map(question => ({
        question: question.question,
        correct_answer: question.correct_answer || '',
        provided_answer: responses[question.id] || ''
      }));

      // Submit to real API for scoring
      const result = await learningPathAPI.submitAssessment({
        assessmentId: assessment.assessment_id,
        userId: user.id,
        moduleId: assessment.module_id,
        assessmentAnswers
      });

      if (!result.success) {
        throw new Error(result.message || 'Failed to score assessment');
      }

      // Convert API response to component format
      const apiResults: AssessmentResult = {
        overall_score: result.percentage,
        section_scores: {
          'overall': result.percentage
        },
        detailed_feedback: {
          'overall': result.detailed_feedback || `You scored ${result.percentage}% on this assessment.`
        },
        strengths: result.strengths || ['Good effort on completing the assessment'],
        improvement_areas: result.improvement_areas || ['Continue studying the module content'],
        recommended_actions: result.recommended_actions || ['Review the module materials and practice more'],
        knowledge_gaps: result.knowledge_gaps || [],
        grade: result.percentage >= 90 ? 'A' : result.percentage >= 80 ? 'B' : result.percentage >= 70 ? 'C' : 'D'
      };

      console.log('📊 Assessment scored:', apiResults);
      setResults(apiResults);
      setCurrentStep('results');
    } catch (error) {
      console.error('❌ Failed to submit assessment:', error);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-50';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-50';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-800">AI-Generated Assessment</h3>
              <p className="text-sm text-slate-600">{moduleName} - {skillFocus}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {currentStep === 'questions' && (
              <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className={`text-sm font-medium ${timeRemaining < 300 ? 'text-red-600' : 'text-slate-700'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white transition-colors"
              disabled={currentStep === 'questions' && !isSubmitting}
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {currentStep === 'loading' && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="text-lg font-medium text-slate-700">Generating AI Assessment...</span>
              </div>
              <p className="text-slate-600">
                Our AI is creating personalized questions based on your learning progress and module content.
              </p>
            </div>
          )}

          {currentStep === 'instructions' && assessment && (
            <div className="p-8">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-slate-800 mb-2">Assessment Instructions</h4>
                  <p className="text-slate-600">{assessment.instructions}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-blue-800">Time Limit</span>
                    </div>
                    <p className="text-blue-700">{assessment.estimated_time_minutes} minutes</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">Total Points</span>
                    </div>
                    <p className="text-green-700">{assessment.total_points} points</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold text-purple-800">Passing Score</span>
                    </div>
                    <p className="text-purple-700">{assessment.passing_score}%</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border">
                  <h5 className="font-semibold text-slate-800 mb-2">Question Types:</h5>
                  <ul className="space-y-1 text-sm text-slate-600">
                    <li>• Multiple Choice: Test your understanding of key concepts</li>
                    <li>• Practical: Apply knowledge to real-world scenarios</li>
                    <li>• Conceptual: Explain relationships and deeper understanding</li>
                  </ul>
                </div>

                <div className="text-center">
                  <button
                    onClick={startAssessment}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-colors font-semibold"
                  >
                    <Brain className="h-5 w-5" />
                    Start Assessment
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'questions' && assessment && (
            <div className="p-8">
              <div className="max-w-3xl mx-auto">
                {/* Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      Question {currentQuestionIndex + 1} of {assessment.questions.length}
                    </span>
                    <span className="text-sm text-slate-500">
                      {assessment.questions[currentQuestionIndex].points} points
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${((currentQuestionIndex + 1) / assessment.questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                          {assessment.questions[currentQuestionIndex].type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {assessment.questions[currentQuestionIndex].difficulty}
                        </span>
                      </div>
                      <h5 className="text-lg font-semibold text-slate-800 mb-4">
                        {assessment.questions[currentQuestionIndex].question}
                      </h5>
                      
                      {/* Answer Input */}
                      {assessment.questions[currentQuestionIndex].type === 'multiple_choice' && (
                        <div className="space-y-3">
                          {assessment.questions[currentQuestionIndex].options?.map((option, idx) => (
                            <label key={idx} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border hover:bg-slate-50">
                              <input
                                type="radio"
                                name={`question_${assessment.questions[currentQuestionIndex].id}`}
                                value={option}
                                checked={responses[assessment.questions[currentQuestionIndex].id] === option}
                                onChange={(e) => handleAnswerChange(assessment.questions[currentQuestionIndex].id, e.target.value)}
                                className="w-4 h-4 text-purple-600"
                              />
                              <span className="text-slate-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {(assessment.questions[currentQuestionIndex].type === 'practical' || 
                        assessment.questions[currentQuestionIndex].type === 'conceptual') && (
                        <textarea
                          value={responses[assessment.questions[currentQuestionIndex].id] || ''}
                          onChange={(e) => handleAnswerChange(assessment.questions[currentQuestionIndex].id, e.target.value)}
                          placeholder="Enter your detailed answer here..."
                          rows={6}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentQuestionIndex === 0
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    Previous
                  </button>

                  <div className="flex gap-2">
                    {assessment.questions.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                          idx === currentQuestionIndex
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                            : responses[assessment.questions[idx].id]
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>

                  {currentQuestionIndex === assessment.questions.length - 1 ? (
                    <button
                      onClick={handleSubmitAssessment}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors font-semibold disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Submit Assessment
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-colors"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 'results' && results && (
            <div className="p-8">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Overall Score */}
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getGradeColor(results.grade)} mb-4`}>
                    <Award className="h-5 w-5" />
                    <span className="font-semibold">Grade: {results.grade}</span>
                  </div>
                  <h4 className="text-3xl font-bold text-slate-800 mb-2">{results.overall_score}%</h4>
                  <p className="text-slate-600">Overall Assessment Score</p>
                </div>

                {/* Section Scores */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(results.section_scores).map(([section, score]) => (
                    <div key={section} className="bg-slate-50 p-4 rounded-lg border">
                      <div className="text-center">
                        <h5 className="font-semibold text-slate-800 capitalize mb-1">
                          {section.replace('_', ' ')}
                        </h5>
                        <p className="text-2xl font-bold text-slate-700">{score}%</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detailed Feedback */}
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-slate-800">Detailed Feedback</h5>
                  {Object.entries(results.detailed_feedback).map(([section, feedback]) => (
                    <div key={section} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h6 className="font-semibold text-blue-800 capitalize mb-2">
                        {section.replace('_', ' ')}
                      </h6>
                      <p className="text-blue-700">{feedback}</p>
                    </div>
                  ))}
                </div>

                {/* Strengths and Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-600" />
                      Strengths
                    </h5>
                    <ul className="space-y-2">
                      {results.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                      Areas for Improvement
                    </h5>
                    <ul className="space-y-2">
                      {results.improvement_areas.map((area, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommended Actions */}
                <div>
                  <h5 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    Recommended Next Steps
                  </h5>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <ul className="space-y-2">
                      {results.recommended_actions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                            {idx + 1}
                          </div>
                          <span className="text-purple-800">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-lg hover:from-slate-600 hover:to-slate-700 transition-colors"
                  >
                    Close Assessment
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentModal; 