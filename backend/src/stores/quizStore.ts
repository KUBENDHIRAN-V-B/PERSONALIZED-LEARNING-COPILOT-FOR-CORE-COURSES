import { normalizeTopicKey, updateTopicMastery, getUserMastery } from './analyticsStore';

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export interface QuizQuestion {
  id: string;
  topicKey: string;
  difficulty: QuizDifficulty;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizQuestionPublic {
  id: string;
  topic: string;
  difficulty: QuizDifficulty;
  question: string;
  options: string[];
}

export interface QuizAttemptItem {
  questionId: string;
  difficulty: QuizDifficulty;
  selectedIndex: number;
  correct: boolean;
  correctIndex: number;
  explanation: string;
}

export interface QuizSession {
  id: string;
  userId: string;
  courseId: string;
  topic: string;
  topicKey: string;
  targetCount: number;
  baseDifficulty: QuizDifficulty;
  currentDifficulty: QuizDifficulty;
  createdAt: Date;
  currentIndex: number;
  askedQuestionIds: Set<string>;
  items: QuizAttemptItem[];
  completed: boolean;
  useAI?: boolean;
}

export interface QuizHistoryEntry {
  id: string;
  userId: string;
  courseId: string;
  topic: string;
  topicKey: string;
  baseDifficulty: QuizDifficulty;
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  createdAt: Date;
}

const sessionsById: Map<string, QuizSession> = new Map();
const historyByUser: Map<string, QuizHistoryEntry[]> = new Map();

const difficultyOrder: QuizDifficulty[] = ['easy', 'medium', 'hard'];
const clampDifficulty = (idx: number): QuizDifficulty =>
  difficultyOrder[Math.max(0, Math.min(difficultyOrder.length - 1, idx))];

// Small curated bank (can be expanded or replaced by LLM generation later)
const questionBank: QuizQuestion[] = [
  // Arrays
  {
    id: 'arrays-e-1',
    topicKey: 'arrays',
    difficulty: 'easy',
    question: 'What is the time complexity of accessing an element in an array by index?',
    options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    correctIndex: 1,
    explanation: 'Arrays provide constant time O(1) access using direct indexing.',
  },
  {
    id: 'arrays-m-1',
    topicKey: 'arrays',
    difficulty: 'medium',
    question: 'Time complexity of inserting an element at the beginning of an array?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
    correctIndex: 1,
    explanation: 'Inserting at the beginning requires shifting existing elements → O(n).',
  },
  {
    id: 'arrays-h-1',
    topicKey: 'arrays',
    difficulty: 'hard',
    question: 'In dynamic arrays, what typically happens when capacity is exceeded?',
    options: ['Elements are lost', 'Array resizes (often doubles)', 'Program crashes', 'Elements are compressed'],
    correctIndex: 1,
    explanation: 'Dynamic arrays usually grow (commonly doubling) to keep amortized append near O(1).',
  },

  // Trees
  {
    id: 'trees-e-1',
    topicKey: 'trees',
    difficulty: 'easy',
    question: 'What is a leaf node in a tree?',
    options: ['Root node', 'Node with children', 'Node with no children', 'Any internal node'],
    correctIndex: 2,
    explanation: 'A leaf node has no children.',
  },
  {
    id: 'trees-m-1',
    topicKey: 'trees',
    difficulty: 'medium',
    question: 'Time complexity of search in a balanced Binary Search Tree (BST)?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correctIndex: 1,
    explanation: 'Balanced BST height is O(log n), so search is O(log n).',
  },
  {
    id: 'trees-h-1',
    topicKey: 'trees',
    difficulty: 'hard',
    question: 'What does an AVL tree maintain to stay balanced?',
    options: ['Complete balance', 'Height difference ≤ 1', 'Perfect balance', 'Equal subtree node counts'],
    correctIndex: 1,
    explanation: 'AVL trees enforce balance factors in {-1,0,1} (height diff ≤ 1).',
  },

  // Graphs
  {
    id: 'graphs-e-1',
    topicKey: 'graphs',
    difficulty: 'easy',
    question: 'In graph theory, what is a vertex?',
    options: ['Edge', 'Node', 'Path', 'Cycle'],
    correctIndex: 1,
    explanation: 'Vertices are the nodes of the graph.',
  },
  {
    id: 'graphs-m-1',
    topicKey: 'graphs',
    difficulty: 'medium',
    question: 'Which graph representation uses O(V²) space?',
    options: ['Adjacency List', 'Adjacency Matrix', 'Edge List', 'Incidence List'],
    correctIndex: 1,
    explanation: 'Adjacency matrices store a V×V table → O(V²).',
  },
  {
    id: 'graphs-h-1',
    topicKey: 'graphs',
    difficulty: 'hard',
    question: 'Using a binary heap, the time complexity of Dijkstra’s algorithm is:',
    options: ['O(V)', 'O(E log V)', 'O(V²)', 'O(E)'],
    correctIndex: 1,
    explanation: 'With a heap, the dominant operations are extract-min/decrease-key → O(E log V).',
  },

  // Linked Lists
  {
    id: 'll-e-1',
    topicKey: 'linked-lists',
    difficulty: 'easy',
    question: 'What does a linked list node contain?',
    options: ['Only data', 'Only pointer', 'Data and pointer', 'Multiple pointers'],
    correctIndex: 2,
    explanation: 'A basic node contains data and a pointer to the next node.',
  },
  {
    id: 'll-m-1',
    topicKey: 'linked-lists',
    difficulty: 'medium',
    question: 'Time complexity of accessing the nth element in a linked list?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correctIndex: 1,
    explanation: 'Must traverse from the head node, requiring O(n) time in the worst case.',
  },
  {
    id: 'll-h-1',
    topicKey: 'linked-lists',
    difficulty: 'hard',
    question: 'Space complexity of reversing a linked list iteratively?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correctIndex: 0,
    explanation: 'Iterative reversal uses only a few pointer variables, achieving O(1) space complexity.',
  },

  // Sorting
  {
    id: 'sort-e-1',
    topicKey: 'sorting',
    difficulty: 'easy',
    question: 'Which sort is stable?',
    options: ['Quick Sort', 'Heap Sort', 'Merge Sort', 'Selection Sort'],
    correctIndex: 2,
    explanation: 'Merge Sort maintains relative order of equal elements, making it stable.',
  },
  {
    id: 'sort-m-1',
    topicKey: 'sorting',
    difficulty: 'medium',
    question: 'Which sort uses divide and conquer?',
    options: ['Bubble Sort', 'Quick Sort', 'Insertion Sort', 'Selection Sort'],
    correctIndex: 1,
    explanation: 'Quick Sort divides array around a pivot and recursively sorts subarrays.',
  },
  {
    id: 'sort-h-1',
    topicKey: 'sorting',
    difficulty: 'hard',
    question: 'Best case time complexity of Quick Sort?',
    options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    correctIndex: 1,
    explanation: 'When pivot divides array equally, Quick Sort achieves O(n log n) in best case.',
  },

  // Dynamic Programming
  {
    id: 'dp-e-1',
    topicKey: 'dynamic-programming',
    difficulty: 'easy',
    question: 'What does DP stand for?',
    options: ['Data Processing', 'Dynamic Programming', 'Direct Path', 'Data Points'],
    correctIndex: 1,
    explanation: 'DP stands for Dynamic Programming, a method for solving complex problems.',
  },
  {
    id: 'dp-m-1',
    topicKey: 'dynamic-programming',
    difficulty: 'medium',
    question: 'What is memoization?',
    options: ['Memory allocation', 'Storing computed results', 'Variable naming', 'Code optimization'],
    correctIndex: 1,
    explanation: 'Memoization stores results of expensive function calls to avoid recomputation.',
  },
  {
    id: 'dp-h-1',
    topicKey: 'dynamic-programming',
    difficulty: 'hard',
    question: 'What is the knapsack problem?',
    options: ['Sorting items', 'Resource allocation', 'Path finding', 'String matching'],
    correctIndex: 1,
    explanation: '0/1 Knapsack is a resource allocation problem solved with DP.',
  },

  // Digital Electronics
  {
    id: 'dig-e-1',
    topicKey: 'digital-electronics',
    difficulty: 'easy',
    question: 'What does an AND gate output?',
    options: ['1 only if both inputs are 1', '1 if any input is 1', 'Always 1', 'Always 0'],
    correctIndex: 0,
    explanation: 'AND outputs 1 only when both inputs are 1.',
  },
  {
    id: 'dig-m-1',
    topicKey: 'digital-electronics',
    difficulty: 'medium',
    question: 'What is a flip-flop primarily used for?',
    options: ['Amplification', 'Memory storage', 'Signal filtering', 'Oscillation'],
    correctIndex: 1,
    explanation: 'Flip-flops are bistable elements used to store 1 bit of state.',
  },
  {
    id: 'dig-h-1',
    topicKey: 'digital-electronics',
    difficulty: 'hard',
    question: 'A Karnaugh map is used for:',
    options: ['Drawing circuits', 'Logic simplification', 'Power calculation', 'Timing analysis only'],
    correctIndex: 1,
    explanation: 'K-maps simplify Boolean expressions to minimal SOP/POS forms.',
  },

  // Signals & Systems
  {
    id: 'sig-e-1',
    topicKey: 'signals-&-systems',
    difficulty: 'easy',
    question: 'What is a signal?',
    options: ['Noise', 'Information function', 'Frequency', 'Amplitude'],
    correctIndex: 1,
    explanation: 'A signal is a function that carries information, varying with time or space.',
  },
  {
    id: 'sig-m-1',
    topicKey: 'signals-&-systems',
    difficulty: 'medium',
    question: 'What does Fourier transform do?',
    options: ['Time to frequency', 'Frequency to time', 'Amplitude scaling', 'Phase shifting'],
    correctIndex: 0,
    explanation: 'Fourier transform converts signals from time domain to frequency domain.',
  },
  {
    id: 'sig-h-1',
    topicKey: 'signals-&-systems',
    difficulty: 'hard',
    question: 'What is sampling theorem?',
    options: ['Signal storage', 'Frequency limit', 'Nyquist rate', 'Both B and C'],
    correctIndex: 3,
    explanation: 'Sampling theorem states sampling frequency must be at least twice signal bandwidth (Nyquist rate).',
  },

  // Communication Systems
  {
    id: 'comm-e-1',
    topicKey: 'communication-systems',
    difficulty: 'easy',
    question: 'What is modulation?',
    options: ['Signal mixing', 'Carrier variation', 'Noise addition', 'Signal filtering'],
    correctIndex: 1,
    explanation: 'Modulation varies a carrier signal property (amplitude, frequency, phase) with message.',
  },
  {
    id: 'comm-m-1',
    topicKey: 'communication-systems',
    difficulty: 'medium',
    question: 'What is bandwidth?',
    options: ['Signal strength', 'Frequency range', 'Power consumption', 'Distance covered'],
    correctIndex: 1,
    explanation: 'Bandwidth is the range of frequencies occupied by a signal.',
  },
  {
    id: 'comm-h-1',
    topicKey: 'communication-systems',
    difficulty: 'hard',
    question: 'What is Shannon capacity?',
    options: ['Channel speed', 'Maximum data rate', 'Signal power', 'Noise level'],
    correctIndex: 1,
    explanation: 'Shannon capacity formula gives maximum error-free data transmission rate.',
  },

  // Control Systems
  {
    id: 'ctrl-e-1',
    topicKey: 'control-systems',
    difficulty: 'easy',
    question: 'What is feedback in control systems?',
    options: ['Forward path', 'Output to input', 'Input amplification', 'Error correction'],
    correctIndex: 1,
    explanation: 'Feedback feeds output signal back to input for comparison and correction.',
  },
  {
    id: 'ctrl-m-1',
    topicKey: 'control-systems',
    difficulty: 'medium',
    question: 'What is transfer function?',
    options: ['Input function', 'Output/Input ratio', 'Error function', 'Control function'],
    correctIndex: 1,
    explanation: 'Transfer function is Laplace transform of output over input for LTI systems.',
  },
  {
    id: 'ctrl-h-1',
    topicKey: 'control-systems',
    difficulty: 'hard',
    question: 'What does PID stand for?',
    options: ['Proportional Integral Derivative', 'Primary Input Device', 'Process Identification Data', 'Parameter Input Delay'],
    correctIndex: 0,
    explanation: 'PID controller uses Proportional, Integral, and Derivative terms for control.',
  },

  // Microprocessors
  {
    id: 'micro-e-1',
    topicKey: 'microprocessors',
    difficulty: 'easy',
    question: 'What is a microprocessor?',
    options: ['Memory chip', 'CPU on chip', 'Storage device', 'Input device'],
    correctIndex: 1,
    explanation: 'Microprocessor is a CPU implemented on a single integrated circuit chip.',
  },
  {
    id: 'micro-m-1',
    topicKey: 'microprocessors',
    difficulty: 'medium',
    question: 'What is pipelining?',
    options: ['Parallel processing', 'Sequential execution', 'Memory access', 'I/O operation'],
    correctIndex: 0,
    explanation: 'Pipelining allows simultaneous execution of multiple instructions in different stages.',
  },
  {
    id: 'micro-h-1',
    topicKey: 'microprocessors',
    difficulty: 'hard',
    question: 'What is cache memory?',
    options: ['Main memory', 'Fast buffer memory', 'Secondary storage', 'Register file'],
    correctIndex: 1,
    explanation: 'Cache is high-speed memory that stores frequently accessed data and instructions.',
  },
];

const getQuestionsFor = (topicKey: string, difficulty: QuizDifficulty) =>
  questionBank.filter(q => q.topicKey === topicKey && q.difficulty === difficulty);

const pickNextQuestion = (session: QuizSession): QuizQuestion | null => {
  const topicKey = session.topicKey;
  const pool = getQuestionsFor(topicKey, session.currentDifficulty).filter(q => !session.askedQuestionIds.has(q.id));
  if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)];

  // Fallback: try other difficulties (closest first)
  const curIdx = difficultyOrder.indexOf(session.currentDifficulty);
  const alt = [
    clampDifficulty(curIdx - 1),
    clampDifficulty(curIdx + 1),
    clampDifficulty(curIdx - 2),
    clampDifficulty(curIdx + 2),
  ];
  for (const d of alt) {
    const p = getQuestionsFor(topicKey, d).filter(q => !session.askedQuestionIds.has(q.id));
    if (p.length > 0) {
      session.currentDifficulty = d;
      return p[Math.floor(Math.random() * p.length)];
    }
  }
  return null;
};

export const toPublicQuestion = (q: QuizQuestion, topic: string): QuizQuestionPublic => ({
  id: q.id,
  topic,
  difficulty: q.difficulty,
  question: q.question,
  options: q.options,
});

export const createQuizSession = (params: {
  userId: string;
  courseId: string;
  topic: string;
  baseDifficulty: QuizDifficulty;
  questionCount: number;
  useAI?: boolean;
}): { session: QuizSession; firstQuestion: QuizQuestionPublic } => {
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const topicKey = normalizeTopicKey(params.topic);
  const session: QuizSession = {
    id,
    userId: params.userId,
    courseId: params.courseId,
    topic: params.topic,
    topicKey,
    targetCount: Math.max(3, Math.min(20, params.questionCount)),
    baseDifficulty: params.baseDifficulty,
    currentDifficulty: params.baseDifficulty,
    createdAt: new Date(),
    currentIndex: 0,
    askedQuestionIds: new Set(),
    items: [],
    completed: false,
    useAI: params.useAI || false,
  };

  const next = pickNextQuestion(session);
  if (!next) {
    throw new Error(`No questions available for topic "${params.topic}"`);
  }
  session.askedQuestionIds.add(next.id);
  sessionsById.set(id, session);
  return { session, firstQuestion: toPublicQuestion(next, params.topic) };
};

export const getQuizSession = (sessionId: string) => sessionsById.get(sessionId) || null;

export const submitAnswerAndAdvance = (params: {
  sessionId: string;
  userId: string;
  questionId: string;
  selectedIndex: number;
}): {
  correct: boolean;
  correctIndex: number;
  explanation: string;
  nextQuestion: QuizQuestionPublic | null;
  progress: { current: number; total: number };
  updatedDifficulty: QuizDifficulty;
} => {
  const session = sessionsById.get(params.sessionId);
  if (!session) throw new Error('Quiz session not found');
  if (session.userId !== params.userId) throw new Error('Unauthorized for this quiz session');
  if (session.completed) throw new Error('Quiz session already completed');

  const q = questionBank.find(x => x.id === params.questionId);
  if (!q) throw new Error('Question not found');
  if (q.topicKey !== session.topicKey) throw new Error('Question does not match session topic');

  const selected = Number.isFinite(params.selectedIndex) ? params.selectedIndex : -1;
  const correct = selected === q.correctIndex;

  session.items.push({
    questionId: q.id,
    difficulty: q.difficulty,
    selectedIndex: selected,
    correct,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
  });
  session.currentIndex += 1;

  // Adaptive difficulty update
  const curIdx = difficultyOrder.indexOf(session.currentDifficulty);
  session.currentDifficulty = correct ? clampDifficulty(curIdx + 1) : clampDifficulty(curIdx - 1);

  if (session.currentIndex >= session.targetCount) {
    return {
      correct,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      nextQuestion: null,
      progress: { current: session.currentIndex, total: session.targetCount },
      updatedDifficulty: session.currentDifficulty,
    };
  }

  const next = pickNextQuestion(session);
  if (!next) {
    // If we run out, end early.
    session.completed = true;
    return {
      correct,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      nextQuestion: null,
      progress: { current: session.currentIndex, total: session.targetCount },
      updatedDifficulty: session.currentDifficulty,
    };
  }
  session.askedQuestionIds.add(next.id);
  return {
    correct,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    nextQuestion: toPublicQuestion(next, session.topic),
    progress: { current: session.currentIndex, total: session.targetCount },
    updatedDifficulty: session.currentDifficulty,
  };
};

export const finalizeQuiz = (params: {
  sessionId: string;
  userId: string;
  timeSpentSeconds: number;
}): {
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  items: QuizAttemptItem[];
  updatedMastery: { topicKey: string; newMastery: number; delta: number };
  historyEntry: QuizHistoryEntry;
} => {
  const session = sessionsById.get(params.sessionId);
  if (!session) throw new Error('Quiz session not found');
  if (session.userId !== params.userId) throw new Error('Unauthorized for this quiz session');

  // If session is already completed, return the existing results
  if (session.completed) {
    const correctCount = session.items.filter(i => i.correct).length;
    const totalQuestions = session.items.length;
    const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // Find existing history entry
    const hist = historyByUser.get(session.userId) || [];
    const existingEntry = hist.find(h => h.id === session.id);

    if (existingEntry) {
      // Return existing results
      const masteryMap = getUserMastery(session.userId);
      const topicMastery = masteryMap.get(session.topic) || { topic: session.topic, mastery: 0, sessionsCount: 0, lastStudied: new Date() };
      return {
        scorePercent,
        correctCount,
        totalQuestions,
        timeSpentSeconds: existingEntry.timeSpentSeconds,
        items: session.items,
        updatedMastery: { topicKey: session.topic, newMastery: topicMastery.mastery, delta: 0 },
        historyEntry: existingEntry,
      };
    }
  }

  session.completed = true;

  const correctCount = session.items.filter(i => i.correct).length;
  const totalQuestions = session.items.length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Mastery delta: small bounded bump, scaled by score
  const delta = Math.max(1, Math.min(8, Math.round((scorePercent / 100) * 8)));
  const updated = updateTopicMastery(params.userId, session.topic, delta);

  const historyEntry: QuizHistoryEntry = {
    id: session.id,
    userId: session.userId,
    courseId: session.courseId,
    topic: session.topic,
    topicKey: session.topicKey,
    baseDifficulty: session.baseDifficulty,
    scorePercent,
    correctCount,
    totalQuestions,
    timeSpentSeconds: Math.max(0, Math.round(params.timeSpentSeconds || 0)),
    createdAt: new Date(),
  };

  const hist = historyByUser.get(session.userId) || [];
  hist.push(historyEntry);
  historyByUser.set(session.userId, hist);

  return {
    scorePercent,
    correctCount,
    totalQuestions,
    timeSpentSeconds: historyEntry.timeSpentSeconds,
    items: session.items,
    updatedMastery: { topicKey: updated.topic, newMastery: updated.mastery, delta },
    historyEntry,
  };
};

export const getQuizHistory = (userId: string) => (historyByUser.get(userId) || []).slice().reverse();

