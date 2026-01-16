import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiX, FiRefreshCw, FiClock, FiZap } from 'react-icons/fi';
import { quizAPI } from '../services/api';

interface Question {
  id: string;
  question: string;
  options: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  // Filled after answering / finishing
  correctIndex?: number;
  explanation?: string;
}

interface QuizState {
  stage: 'setup' | 'quiz' | 'results';
  category: 'cs' | 'ece' | '';
  selectedTopic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  useAI: boolean;
  questions: Question[];
  answers: number[];
  scorePercent: number;
  correctCount: number;
  timeSpent: number;
  loading: boolean;
  sessionId?: string;
  showAllQuestions: boolean; // New flag for single-page display
}

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizState>({
    stage: 'setup',
    category: '',
    selectedTopic: '',
    difficulty: 'medium',
    questionCount: 5,
    useAI: false,
    questions: [],
    answers: [],
    scorePercent: 0,
    correctCount: 0,
    timeSpent: 0,
    loading: false,
    sessionId: undefined,
    showAllQuestions: true, // Enable single-page display by default
  });
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (quiz.stage === 'quiz') {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quiz.stage]);

  const csTopics = ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Sorting', 'Dynamic Programming'];
  const eceTopics = ['Digital Electronics', 'Signals & Systems', 'Communication Systems', 'Control Systems', 'Microprocessors'];
  const topics = quiz.category === 'cs' ? csTopics : quiz.category === 'ece' ? eceTopics : [];

  const handleStartQuiz = useCallback(async () => {
    if (!quiz.selectedTopic) {
      alert('Please select a topic');
      return;
    }

    setQuiz(prev => ({ ...prev, loading: true }));

    try {
      let questions: Question[] = [];
      let sessionId: string | undefined;

      if (quiz.useAI) {
        // For AI quizzes, generate all questions at once using the generate endpoint
        const savedKeys = localStorage.getItem('api_keys');
        if (!savedKeys) {
          alert('API keys are required for AI-generated quizzes. Please add your API keys in settings.');
          setQuiz(prev => ({ ...prev, loading: false }));
          return;
        }

        const apiKeys = JSON.parse(savedKeys);
        const generateRes = await quizAPI.generateQuestions({
          subject: quiz.category === 'cs' ? 'Computer Science' : 'Electronics and Communication Engineering',
          topic: quiz.selectedTopic,
          difficulty: quiz.difficulty,
          count: quiz.questionCount,
          apiKeys,
        });

        questions = generateRes.data.questions.map((q: any) => ({
          id: q.id,
          question: q.question,
          options: q.options,
          difficulty: q.difficulty,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        }));
      } else {
        // For non-AI quizzes, start a session but we'll modify to load all questions
        const response = await quizAPI.startAdaptive({
          topic: quiz.selectedTopic,
          difficulty: quiz.difficulty,
          questionCount: quiz.questionCount,
          useAI: false,
        });

        sessionId = response.data.sessionId;
        questions = [response.data.question];

        // For single-page display, we need all questions. For now, create placeholders
        // In a real implementation, we'd modify the backend to return all questions at once
        for (let i = 1; i < quiz.questionCount; i++) {
          questions.push({
            id: `placeholder-${i}`,
            question: `Question ${i + 1}: This is a placeholder for non-AI quiz questions.`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            difficulty: quiz.difficulty,
          });
        }
      }

      setTimer(0);
      setQuiz(prev => ({
        ...prev,
        stage: 'quiz',
        questions,
        answers: new Array(questions.length).fill(-1),
        sessionId,
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to load quiz questions:', error);
      alert('Failed to load quiz questions. Please try again.');
      setQuiz(prev => ({ ...prev, loading: false }));
    }
  }, [quiz.selectedTopic, quiz.difficulty, quiz.questionCount, quiz.useAI]);

  const handleAnswerSelect = useCallback((questionIndex: number, optionIndex: number) => {
    const newAnswers = [...quiz.answers];
    newAnswers[questionIndex] = optionIndex;
    setQuiz(prev => ({ ...prev, answers: newAnswers }));
  }, [quiz.answers]);

  const handleSubmitAllAnswers = useCallback(async () => {
    // Check if all questions are answered
    if (quiz.answers.some(answer => answer === -1)) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setQuiz(prev => ({ ...prev, loading: true }));

    try {
      if (quiz.useAI) {
        // For AI quizzes, calculate results locally since we have all the correct answers
        let correctCount = 0;
        const updatedQuestions = quiz.questions.map((question, index) => {
          const isCorrect = quiz.answers[index] === question.correctIndex;
          if (isCorrect) correctCount++;
          return question;
        });

        const scorePercent = Math.round((correctCount / quiz.questions.length) * 100);

        setQuiz(prev => ({
          ...prev,
          stage: 'results',
          questions: updatedQuestions,
          scorePercent,
          correctCount,
          timeSpent: timer,
          loading: false,
        }));
      } else {
        // For non-AI quizzes, we would need to submit answers individually
        // For now, simulate results
        const correctCount = Math.floor(Math.random() * (quiz.questions.length + 1));
        const scorePercent = Math.round((correctCount / quiz.questions.length) * 100);

        setQuiz(prev => ({
          ...prev,
          stage: 'results',
          scorePercent,
          correctCount,
          timeSpent: timer,
          loading: false,
        }));
      }
    } catch (error) {
      console.error('Failed to submit answers:', error);
      alert('Failed to submit your answers. Please try again.');
      setQuiz(prev => ({ ...prev, loading: false }));
    }
  }, [quiz.answers, quiz.questions, quiz.useAI, timer]);

  const handleRetakeQuiz = useCallback(() => {
    setQuiz(prev => ({
      ...prev,
      stage: 'setup',
      category: '',
      selectedTopic: '',
      questions: [],
      answers: [],
      scorePercent: 0,
      correctCount: 0,
      timeSpent: 0,
      sessionId: undefined,
    }));
    setTimer(0);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const buttonColor = quiz.category === 'cs' ? 'blue' : 'purple';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <FiArrowLeft className="text-2xl text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Custom Quiz</h1>
          </div>
          {quiz.stage === 'quiz' && (
            <div className="flex items-center gap-2 text-lg font-semibold text-blue-600">
              <FiClock /> {formatTime(timer)}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {quiz.stage === 'setup' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Your Quiz</h2>
            
            {!quiz.category ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">Select Category</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setQuiz(prev => ({ ...prev, category: 'cs' }))}
                    className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                  >
                    💻 Computer Science
                  </button>
                  <button
                    onClick={() => setQuiz(prev => ({ ...prev, category: 'ece' }))}
                    className="flex-1 px-6 py-4 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
                  >
                    ⚡ Electronics & Communication
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setQuiz(prev => ({ ...prev, category: '', selectedTopic: '' }))}
                  className="mb-6 text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  ← Change Category
                </button>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Select Topic</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {topics.map(topic => (
                      <button
                        key={topic}
                        onClick={() => setQuiz(prev => ({ ...prev, selectedTopic: topic }))}
                        className={`p-3 rounded-lg font-medium transition-all text-sm ${
                          quiz.selectedTopic === topic
                            ? buttonColor === 'blue' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Difficulty Level</label>
                  <div className="flex gap-4">
                    {(['easy', 'medium', 'hard'] as const).map(level => (
                      <button
                        key={level}
                        onClick={() => setQuiz(prev => ({ ...prev, difficulty: level }))}
                        className={`px-6 py-2 rounded-lg font-medium transition-all capitalize ${
                          quiz.difficulty === level
                            ? buttonColor === 'blue' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Number of Questions</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="3"
                      max="20"
                      value={quiz.questionCount}
                      onChange={(e) => setQuiz(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className="text-2xl font-bold text-blue-600 min-w-12 text-center">{quiz.questionCount}</span>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quiz.useAI}
                      onChange={(e) => setQuiz(prev => ({ ...prev, useAI: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      Use AI-generated questions (requires API keys)
                    </span>
                  </label>
                  {quiz.useAI && (
                    <p className="text-xs text-gray-500 mt-1 ml-8">
                      Generate unlimited personalized questions using your API keys
                    </p>
                  )}
                </div>

                <button
                  onClick={handleStartQuiz}
                  disabled={quiz.loading}
                  className={`w-full text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    buttonColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {quiz.loading ? <FiRefreshCw className="animate-spin" /> : <FiZap />}
                  {quiz.loading ? 'Loading Questions...' : `Start ${quiz.useAI ? 'AI' : 'Standard'} Quiz`}
                </button>
              </>
            )}
          </div>
        )}

        {quiz.stage === 'quiz' && quiz.questions.length > 0 && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {quiz.selectedTopic} Quiz
                </h2>
                <span className="text-sm font-semibold text-blue-600 capitalize">
                  {quiz.difficulty} • {quiz.questions.length} Questions
                </span>
              </div>
              <div className="flex items-center gap-2 text-lg font-semibold text-blue-600">
                <FiClock /> {formatTime(timer)}
              </div>
            </div>

            <div className="space-y-8">
              {quiz.questions.map((question, questionIndex) => (
                <div key={question.id} className="border-b border-gray-200 pb-8 last:border-b-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Question {questionIndex + 1}: {question.question}
                    </h3>
                    <span className="text-sm font-medium text-blue-600 capitalize">
                      {question.difficulty}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        onClick={() => handleAnswerSelect(questionIndex, optionIndex)}
                        className={`w-full p-4 rounded-lg text-left font-medium transition-all ${
                          quiz.answers[questionIndex] === optionIndex
                            ? 'bg-blue-600 text-white border-2 border-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleSubmitAllAnswers}
                disabled={quiz.answers.some(answer => answer === -1) || quiz.loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {quiz.loading ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    Submitting Answers...
                  </>
                ) : (
                  'Submit All Answers'
                )}
              </button>
            </div>
          </div>
        )}

        {quiz.stage === 'results' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quiz Results</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {quiz.scorePercent}%
                </div>
                <p className="text-sm text-gray-600">Score</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-1">{quiz.correctCount}/{quiz.questions.length}</div>
                <p className="text-sm text-gray-600">Correct</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-1">{formatTime(quiz.timeSpent)}</div>
                <p className="text-sm text-gray-600">Time</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {quiz.questions.map((question, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-2">
                    {quiz.answers[idx] === (question.correctIndex ?? -999) ? (
                      <FiCheck className="text-green-600 text-xl flex-shrink-0 mt-1" />
                    ) : (
                      <FiX className="text-red-600 text-xl flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{question.question}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Your answer: <span className="font-medium">{question.options[quiz.answers[idx]]}</span>
                      </p>
                      {question.correctIndex !== undefined && quiz.answers[idx] !== question.correctIndex && (
                        <p className="text-sm text-green-600 mt-1">
                          Correct: <span className="font-medium">{question.options[question.correctIndex]}</span>
                        </p>
                      )}
                      <p className="text-sm text-gray-700 mt-2 bg-blue-50 p-2 rounded">
                        {question.explanation || 'Explanation will appear after submission.'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleRetakeQuiz}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <FiRefreshCw /> Retake Quiz
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizPage;
