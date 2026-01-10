import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiX, FiRefreshCw, FiClock, FiZap } from 'react-icons/fi';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizState {
  stage: 'setup' | 'quiz' | 'results';
  category: 'cs' | 'ece' | '';
  selectedTopic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  questions: Question[];
  currentQuestion: number;
  answers: number[];
  score: number;
  timeSpent: number;
}

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizState>({
    stage: 'setup',
    category: '',
    selectedTopic: '',
    difficulty: 'medium',
    questionCount: 5,
    questions: [],
    currentQuestion: 0,
    answers: [],
    score: 0,
    timeSpent: 0,
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

  const csTopics = ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Sorting', 'Searching', 'Dynamic Programming', 'Stacks & Queues', 'DBMS', 'Operating Systems', 'Computer Networks', 'OOP', 'Database Design', 'SQL', 'Algorithms', 'Compiler Design', 'Theory of Computation', 'Software Engineering'];
  const eceTopics = ['Digital Electronics', 'Signals & Systems', 'Communication Systems', 'Electromagnetic Theory', 'Control Systems', 'Microprocessors', 'VLSI Design', 'Embedded Systems', 'DSP', 'Wireless Communication'];
  const topics = quiz.category === 'cs' ? csTopics : quiz.category === 'ece' ? eceTopics : [];

  const questionBank: { [key: string]: { [key: string]: Question[] } } = {
    'Arrays': {
      'easy': [
        { id: 1, question: 'What is the time complexity of accessing an element in an array?', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'], correct: 1, explanation: 'Arrays provide constant time O(1) access using index.' },
        { id: 2, question: 'Which operation is most efficient in an array?', options: ['Insertion at beginning', 'Deletion from middle', 'Access by index', 'Searching'], correct: 2, explanation: 'Accessing by index is O(1), the most efficient operation.' },
      ],
      'medium': [
        { id: 3, question: 'Time complexity of inserting at the beginning of an array?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'], correct: 1, explanation: 'Requires shifting all elements, resulting in O(n).' },
      ],
      'hard': [
        { id: 4, question: 'Space complexity of 2D array m×n?', options: ['O(1)', 'O(m+n)', 'O(m*n)', 'O(log(m*n))'], correct: 2, explanation: 'A 2D array stores m*n elements, so space is O(m*n).' },
      ],
    },
    'Linked Lists': {
      'easy': [
        { id: 1, question: 'What is a linked list node?', options: ['Array element', 'Data + pointer', 'Only data', 'Only pointer'], correct: 1, explanation: 'A node contains data and a pointer to the next node.' },
      ],
      'medium': [
        { id: 2, question: 'Time complexity of accessing nth element?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correct: 1, explanation: 'Must traverse from head, so O(n) time.' },
      ],
      'hard': [
        { id: 3, question: 'Time to detect cycle in linked list?', options: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'], correct: 1, explanation: 'Floyd cycle detection uses O(n) time and O(1) space.' },
      ],
    },
    'Trees': {
      'easy': [
        { id: 1, question: 'What is the root of a tree?', options: ['Deepest node', 'Topmost node', 'Leftmost node', 'Any node'], correct: 1, explanation: 'Root is the topmost node with no parent.' },
      ],
      'medium': [
        { id: 2, question: 'Time complexity of search in balanced BST?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correct: 1, explanation: 'Balanced BST provides O(log n) search time.' },
      ],
      'hard': [
        { id: 3, question: 'What is tree balancing?', options: ['Sorting nodes', 'Maintaining height difference', 'Removing nodes', 'Adding nodes'], correct: 1, explanation: 'Balancing maintains height difference ≤ 1 for efficiency.' },
      ],
    },
    'Digital Electronics': {
      'easy': [
        { id: 1, question: 'What is a logic gate?', options: ['Physical gate', 'Electronic circuit', 'Software program', 'Network device'], correct: 1, explanation: 'Logic gates are electronic circuits that perform Boolean operations.' },
      ],
      'medium': [
        { id: 2, question: 'What is Boolean algebra?', options: ['Algebra of numbers', 'Algebra of logic', 'Algebra of sets', 'Algebra of functions'], correct: 1, explanation: 'Boolean algebra deals with binary variables and logic operations.' },
      ],
      'hard': [
        { id: 3, question: 'What is Karnaugh map?', options: ['Geographic map', 'Logic simplification tool', 'Circuit diagram', 'Truth table'], correct: 1, explanation: 'Karnaugh map simplifies Boolean expressions graphically.' },
      ],
    },
    'Signals & Systems': {
      'easy': [
        { id: 1, question: 'What is a signal?', options: ['Noise', 'Information-bearing function', 'Frequency', 'Amplitude'], correct: 1, explanation: 'A signal is a function that carries information.' },
      ],
      'medium': [
        { id: 2, question: 'What is a system?', options: ['Computer', 'Process that transforms signals', 'Device', 'Network'], correct: 1, explanation: 'A system processes input signals to produce output signals.' },
      ],
      'hard': [
        { id: 3, question: 'What is Fourier transform?', options: ['Signal rotation', 'Time to frequency domain conversion', 'Signal amplification', 'Signal filtering'], correct: 1, explanation: 'Fourier transform converts signals from time to frequency domain.' },
      ],
    },
  };

  const handleStartQuiz = useCallback(() => {
    if (!quiz.selectedTopic) {
      alert('Please select a topic');
      return;
    }
    const generateQuestions = (topic: string, difficulty: string): Question[] => {
      const questions = questionBank[topic]?.[difficulty] || questionBank[topic]?.['easy'] || [];
      return questions.sort(() => Math.random() - 0.5);
    };
    let questions = generateQuestions(quiz.selectedTopic, quiz.difficulty);
    questions = questions.slice(0, quiz.questionCount);
    setTimer(0);
    setQuiz(prev => ({
      ...prev,
      stage: 'quiz',
      questions,
      answers: new Array(questions.length).fill(-1),
    }));
  }, [quiz.selectedTopic, quiz.difficulty, quiz.questionCount]);

  const handleAnswerSelect = useCallback((optionIndex: number) => {
    const newAnswers = [...quiz.answers];
    newAnswers[quiz.currentQuestion] = optionIndex;
    setQuiz(prev => ({ ...prev, answers: newAnswers }));
  }, [quiz.answers, quiz.currentQuestion]);

  const handleNextQuestion = useCallback(() => {
    if (quiz.currentQuestion < quiz.questions.length - 1) {
      setQuiz(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }));
    } else {
      const score = quiz.answers.reduce((acc, answer, idx) => {
        return acc + (answer === quiz.questions[idx].correct ? 1 : 0);
      }, 0);
      setQuiz(prev => ({ ...prev, stage: 'results', score, timeSpent: timer }));
    }
  }, [quiz.currentQuestion, quiz.answers, quiz.questions, timer]);

  const handleRetakeQuiz = useCallback(() => {
    setQuiz(prev => ({
      ...prev,
      stage: 'setup',
      category: '',
      selectedTopic: '',
      currentQuestion: 0,
      answers: [],
      score: 0,
      timeSpent: 0,
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

                <button
                  onClick={handleStartQuiz}
                  className={`w-full text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
                    buttonColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  <FiZap /> Start Quiz
                </button>
              </>
            )}
          </div>
        )}

        {quiz.stage === 'quiz' && quiz.questions.length > 0 && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-600">
                  Question {quiz.currentQuestion + 1} of {quiz.questions.length}
                </span>
                <span className="text-sm font-semibold text-blue-600 capitalize">
                  {quiz.selectedTopic} • {quiz.difficulty}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${((quiz.currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                />
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {quiz.questions[quiz.currentQuestion].question}
            </h3>

            <div className="space-y-3 mb-8">
              {quiz.questions[quiz.currentQuestion].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  className={`w-full p-4 rounded-lg text-left font-medium transition-all ${
                    quiz.answers[quiz.currentQuestion] === idx
                      ? 'bg-blue-600 text-white border-2 border-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextQuestion}
              disabled={quiz.answers[quiz.currentQuestion] === -1}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {quiz.currentQuestion === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </button>
          </div>
        )}

        {quiz.stage === 'results' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quiz Results</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {Math.round((quiz.score / quiz.questions.length) * 100)}%
                </div>
                <p className="text-sm text-gray-600">Score</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-1">{quiz.score}/{quiz.questions.length}</div>
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
                    {quiz.answers[idx] === question.correct ? (
                      <FiCheck className="text-green-600 text-xl flex-shrink-0 mt-1" />
                    ) : (
                      <FiX className="text-red-600 text-xl flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{question.question}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Your answer: <span className="font-medium">{question.options[quiz.answers[idx]]}</span>
                      </p>
                      {quiz.answers[idx] !== question.correct && (
                        <p className="text-sm text-green-600 mt-1">
                          Correct: <span className="font-medium">{question.options[question.correct]}</span>
                        </p>
                      )}
                      <p className="text-sm text-gray-700 mt-2 bg-blue-50 p-2 rounded">
                        {question.explanation}
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
