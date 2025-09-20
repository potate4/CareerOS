import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, Flag, Award } from 'lucide-react';
import { jobAssessmentAPI } from '../../services/jobPostingAPI';
import { 
  JobAssessmentQuestion, 
  JobAssessmentSession, 
  JobAssessmentAnswer, 
  JobAssessmentResult
} from '../../types/jobPosting';
import LoadingSpinner from '../common/LoadingSpinner';
import Alert from '../common/Alert';
import AuthenticatedLayout from '../layout/AuthenticatedLayout';

export const JobAssessment: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [session, setSession] = useState<JobAssessmentSession | null>(null);
  const [questions, setQuestions] = useState<JobAssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JobAssessmentResult | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30 * 60); // 30 minutes
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  useEffect(() => {
    if (jobId) {
      initializeAssessment();
    }
  }, [jobId]);

  // Timer effect
  useEffect(() => {
    if (result) return; // Stop timer if assessment is completed
    
    if (timeLeft <= 0) {
      handleSubmitAssessment();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, result]);

  const initializeAssessment = async () => {
    try {
      setLoading(true);
      
      // Check if we have a result in location state (from submission)
      if (location.state?.result) {
        setResult(location.state.result);
        setLoading(false);
        return;
      }
      
      // Create assessment session
      const sessionResponse = await jobAssessmentAPI.createAssessment(parseInt(jobId!), {
        num_questions: 10,
        difficulty: 'medium'
      });
      
      if (sessionResponse.success) {
        setSession(sessionResponse);
        setQuestions(sessionResponse.questions);
        console.log('✅ Assessment created with', sessionResponse.questions.length, 'questions');
      } else {
        throw new Error(sessionResponse.message || 'Failed to create assessment');
      }
      
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'message' in err 
        ? (err as { message: string }).message 
        : 'Failed to start assessment';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (question: string, answer: string) => {
    setAnswers(prev => new Map(prev.set(question, answer)));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitAssessment = useCallback(async () => {
    if (!session || submitting) return;
    
    try {
      setSubmitting(true);
      
      // Prepare answers in the format expected by the AI service
      const assessmentAnswers: JobAssessmentAnswer[] = questions.map(question => ({
        question: question.question,
        correct_answer: question.correct_answer || '',
        provided_answer: answers.get(question.question) || ''
      }));
      
      const assessmentResult = await jobAssessmentAPI.submitAssessment(
        session.job_id,
        session.assessment_id,
        assessmentAnswers
      );
      
      if (assessmentResult.success) {
        setResult(assessmentResult);
        console.log('✅ Assessment submitted successfully');
      } else {
        throw new Error(assessmentResult.message || 'Failed to submit assessment');
      }
      
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'message' in err 
        ? (err as { message: string }).message 
        : 'Failed to submit assessment';
      setError(errorMessage);
      setSubmitting(false);
    }
  }, [session, questions, answers, submitting]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = (): number => {
    return questions.filter(q => answers.has(q.question) && answers.get(q.question)?.trim()).length;
  };

  const renderQuestion = (question: JobAssessmentQuestion) => {
    const currentAnswer = answers.get(question.question) || '';
    
    // Handle different question types
    if (question.question_type === 'multiple_choice' && question.options) {
      const optionsArray = Array.isArray(question.options) ? question.options : JSON.parse(question.options);
      return (
        <div className="space-y-3">
          {optionsArray.map((option: string, index: number) => (
            <label key={index} className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
              <input
                type="radio"
                name={`question-${question.question}`}
                value={option}
                checked={currentAnswer === option}
                onChange={(e) => handleAnswerChange(question.question, e.target.value)}
                className="mr-3 text-blue-600"
              />
              <span className="text-slate-700">{option}</span>
            </label>
          ))}
        </div>
      );
    } else if (question.question_type === 'true_false') {
      return (
        <div className="space-y-3">
          {['True', 'False'].map((option) => (
            <label key={option} className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
              <input
                type="radio"
                name={`question-${question.question}`}
                value={option}
                checked={currentAnswer === option}
                onChange={(e) => handleAnswerChange(question.question, e.target.value)}
                className="mr-3 text-blue-600"
              />
              <span className="text-slate-700">{option}</span>
            </label>
          ))}
        </div>
      );
    } else {
      // Text-based questions
      return (
        <textarea
          value={currentAnswer}
          onChange={(e) => handleAnswerChange(question.question, e.target.value)}
          rows={4}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your answer..."
        />
      );
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout>
        <div className="max-w-4xl mx-auto p-6">
          <Alert type="error" message={error} />
          <button
            onClick={() => navigate('/candidate-dashboard')}
            className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </button>
        </div>
      </AuthenticatedLayout>
    );
  }

  // Show results if assessment is completed
  if (result) {
    const isPassed = result.percentage >= 70;
    
    return (
      <AuthenticatedLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg border p-8">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${
                isPassed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {isPassed ? <CheckCircle className="h-8 w-8" /> : <AlertCircle className="h-8 w-8" />}
              </div>
              
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Assessment Completed!</h1>
              <p className="text-slate-600 mb-8">Your assessment has been submitted successfully.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-50 rounded-lg p-6">
                  <div className="text-3xl font-bold text-slate-900 mb-2">{Math.round(result.percentage)}%</div>
                  <div className="text-slate-600">Final Score</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-6">
                  <div className="text-3xl font-bold text-slate-900 mb-2">{result.total_score}/{result.max_score}</div>
                  <div className="text-slate-600">Points Earned</div>
                </div>
                <div className={`rounded-lg p-6 ${isPassed ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  <div className="text-3xl font-bold mb-2">{isPassed ? 'PASSED' : 'FAILED'}</div>
                  <div className="text-sm">Assessment Status</div>
                </div>
              </div>
              
              {result.overall_feedback && (
                <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
                  <h3 className="font-semibold text-blue-900 mb-2">Feedback</h3>
                  <p className="text-blue-800">{result.overall_feedback}</p>
                </div>
              )}
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigate('/candidate-dashboard')}
                  className="px-6 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => navigate('/jobs')}
                  className="px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Browse More Jobs
                </button>
              </div>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!session || questions.length === 0) {
    return (
      <AuthenticatedLayout>
        <div className="max-w-4xl mx-auto p-6">
          <Alert type="info" message="No assessment questions available for this job." />
          <button
            onClick={() => navigate('/candidate-dashboard')}
            className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </button>
        </div>
      </AuthenticatedLayout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = getAnsweredCount();

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg border mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Job Assessment</h1>
              <p className="text-slate-600 mt-1">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Clock className={`h-5 w-5 ${timeLeft < 300 ? 'text-red-500' : 'text-slate-500'}`} />
                <span className={`font-mono text-lg ${timeLeft < 300 ? 'text-red-500' : 'text-slate-700'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Progress</p>
                <p className="font-semibold text-slate-900">{answeredCount}/{questions.length} answered</p>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-4 sticky top-6">
              <h3 className="font-semibold text-slate-900 mb-4">Questions</h3>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {questions.map((question, index) => {
                  const isAnswered = answers.has(question.question) && answers.get(question.question)?.trim();
                  const isCurrent = index === currentQuestionIndex;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuestionNavigation(index)}
                      className={`
                        w-10 h-10 rounded-lg text-sm font-medium transition-colors
                        ${isCurrent 
                          ? 'bg-blue-600 text-white' 
                          : isAnswered 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }
                      `}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="w-full mt-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center"
              >
                <Flag className="h-4 w-4 mr-2" />
                Submit Assessment
              </button>
            </div>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Question {currentQuestionIndex + 1}
                </h2>
                
                <p className="text-slate-800 text-lg leading-relaxed mb-6">
                  {currentQuestion.question}
                </p>
              </div>

              {renderQuestion(currentQuestion)}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </button>
                
                <div className="text-sm text-slate-500">
                  {answers.has(currentQuestion.question) && answers.get(currentQuestion.question)?.trim() ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Answered
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Not answered
                    </div>
                  )}
                </div>

                <button
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="flex items-center px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Submit Assessment?</h3>
              <p className="text-slate-600 mb-6">
                You have answered {answeredCount} out of {questions.length} questions. 
                {answeredCount < questions.length && (
                  <span className="block mt-2 text-amber-600 font-medium">
                    Warning: {questions.length - answeredCount} questions remain unanswered.
                  </span>
                )}
                Once submitted, you cannot make changes.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAssessment}
                  disabled={submitting}
                  className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-md transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Assessment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

