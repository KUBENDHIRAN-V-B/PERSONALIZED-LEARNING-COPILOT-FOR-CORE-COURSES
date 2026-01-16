import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5002');

// Create axios instance with optimized config
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    try {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { status: number } };
        if (axiosError.response?.status === 401) {
          console.error('Unauthorized access');
        }
      }
    } catch (err) {
      console.error('Error in response interceptor:', err);
    }
    // Return a rejected promise with additional context
    return Promise.reject(error);
  }
);

// Helper function to check if we should use mock data
const shouldUseMockData = () => {
  return process.env.NODE_ENV === 'production' && !process.env.REACT_APP_API_URL;
};

// Mock courses data
const getMockCourses = () => ({
  courses: [
    {
      id: 'dsa',
      name: 'Data Structures & Algorithms',
      description: 'Master fundamental data structures and algorithms for efficient problem-solving',
      topics: ['Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Graphs', 'Sorting', 'Searching', 'Dynamic Programming'],
      difficulty: 'Intermediate',
      category: 'CS',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'programming',
      name: 'Programming Fundamentals',
      description: 'Learn the basics of programming with hands-on projects',
      topics: ['Variables', 'Control Flow', 'Functions', 'Objects', 'Error Handling'],
      difficulty: 'Beginner',
      category: 'CS',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'discrete-math',
      name: 'Discrete Mathematics',
      description: 'Explore mathematical foundations of computer science',
      topics: ['Sets', 'Logic', 'Graphs', 'Combinatorics', 'Number Theory'],
      difficulty: 'Advanced',
      category: 'CS',
      color: 'from-purple-500 to-violet-600'
    },
    {
      id: 'coa',
      name: 'Computer Organization & Architecture',
      description: 'Understand how computers work at the hardware level',
      topics: ['CPU Architecture', 'Memory Hierarchy', 'I/O Systems', 'Pipelining'],
      difficulty: 'Intermediate',
      category: 'CS',
      color: 'from-slate-500 to-gray-700'
    },
    {
      id: 'os',
      name: 'Operating Systems',
      description: 'Learn about process management, memory management, and system calls',
      topics: ['Processes', 'Threads', 'Memory Management', 'File Systems', 'Scheduling'],
      difficulty: 'Intermediate',
      category: 'CS',
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'dbms',
      name: 'Database Management Systems',
      description: 'Master SQL, database design, and data management principles',
      topics: ['SQL', 'Normalization', 'Indexing', 'Transactions', 'NoSQL'],
      difficulty: 'Intermediate',
      category: 'CS',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'cn',
      name: 'Computer Networks',
      description: 'Understand networking protocols, TCP/IP, and network security',
      topics: ['TCP/IP', 'HTTP', 'Routing', 'Network Security', 'Wireless Networks'],
      difficulty: 'Intermediate',
      category: 'CS',
      color: 'from-teal-500 to-cyan-600'
    },
    {
      id: 'se',
      name: 'Software Engineering',
      description: 'Learn software development methodologies and best practices',
      topics: ['SDLC', 'Agile', 'Testing', 'Requirements', 'Design Patterns'],
      difficulty: 'Intermediate',
      category: 'CS',
      color: 'from-amber-500 to-orange-600'
    },
    // ECE Courses
    {
      id: 'digital-electronics',
      name: 'Digital Electronics',
      description: 'Learn digital logic circuits, gates, and digital system design',
      topics: ['Logic Gates', 'Boolean Algebra', 'Combinational Circuits', 'Sequential Circuits', 'Flip-Flops'],
      difficulty: 'Intermediate',
      category: 'ECE',
      color: 'from-red-500 to-pink-600'
    },
    {
      id: 'analog-electronics',
      name: 'Analog Electronics',
      description: 'Master analog circuits, amplifiers, and signal processing',
      topics: ['Diodes', 'Transistors', 'Amplifiers', 'Oscillators', 'Filters'],
      difficulty: 'Intermediate',
      category: 'ECE',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      id: 'signals-systems',
      name: 'Signals & Systems',
      description: 'Understand signal processing, Fourier analysis, and system theory',
      topics: ['Continuous Signals', 'Discrete Signals', 'Fourier Transform', 'Laplace Transform', 'Z-Transform'],
      difficulty: 'Advanced',
      category: 'ECE',
      color: 'from-indigo-500 to-purple-600'
    },
    {
      id: 'communication-systems',
      name: 'Communication Systems',
      description: 'Learn modulation, transmission, and communication protocols',
      topics: ['AM/FM Modulation', 'Digital Communication', 'Channel Coding', 'Wireless Communication', 'Optical Communication'],
      difficulty: 'Advanced',
      category: 'ECE',
      color: 'from-green-500 to-teal-600'
    },
    {
      id: 'control-systems',
      name: 'Control Systems',
      description: 'Study feedback systems, stability analysis, and controller design',
      topics: ['Transfer Functions', 'Stability Analysis', 'PID Controllers', 'State Space', 'Frequency Response'],
      difficulty: 'Advanced',
      category: 'ECE',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'microprocessors',
      name: 'Microprocessors & Microcontrollers',
      description: 'Learn embedded systems programming and microcontroller architecture',
      topics: ['8085/8086 Architecture', '8051 Microcontroller', 'ARM Processors', 'Assembly Language', 'Embedded C'],
      difficulty: 'Intermediate',
      category: 'ECE',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      id: 'electromagnetic-theory',
      name: 'Electromagnetic Theory',
      description: 'Understand electromagnetic waves, transmission lines, and antennas',
      topics: ['Maxwell Equations', 'Wave Propagation', 'Transmission Lines', 'Antenna Theory', 'Microwave Engineering'],
      difficulty: 'Advanced',
      category: 'ECE',
      color: 'from-slate-500 to-stone-600'
    },
    {
      id: 'power-electronics',
      name: 'Power Electronics',
      description: 'Learn power conversion, motor drives, and renewable energy systems',
      topics: ['Power Semiconductor Devices', 'DC-DC Converters', 'Inverters', 'Motor Drives', 'Renewable Energy'],
      difficulty: 'Advanced',
      category: 'ECE',
      color: 'from-orange-500 to-amber-600'
    },
    {
      id: 'vlsi-design',
      name: 'VLSI Design',
      description: 'Master integrated circuit design and semiconductor technology',
      topics: ['CMOS Technology', 'Logic Design', 'Layout Design', 'Timing Analysis', 'FPGA Design'],
      difficulty: 'Advanced',
      category: 'ECE',
      color: 'from-cyan-500 to-teal-600'
    },
    {
      id: 'embedded-systems',
      name: 'Embedded Systems',
      description: 'Design and program embedded systems for real-world applications',
      topics: ['Real-time Systems', 'RTOS', 'IoT', 'Sensor Networks', 'System-on-Chip'],
      difficulty: 'Intermediate',
      category: 'ECE',
      color: 'from-emerald-500 to-green-600'
    }
  ]
});

// Simple cache for GET requests
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds
const MAX_CACHE_SIZE = 50; // Prevent unbounded memory growth

// Cached GET request with performance optimization
export const cachedGet = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const cacheKey = `${url}:${JSON.stringify(config?.params || {})}`;
  const cachedEntry = cache.get(cacheKey);
  const now = Date.now();
  
  if (cachedEntry && now - cachedEntry.timestamp < CACHE_DURATION) {
    return cachedEntry.data;
  }
  
  try {
    const response = await api.get<T>(url, config);
    
    if (cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) cache.delete(oldestKey);
    }
    
    cache.set(cacheKey, { data: response.data, timestamp: now });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    throw error;
  }
};

// Clear cache
export const clearCache = () => cache.clear();

// API methods with clear naming
export const authAPI = {
  login: (email: string, password: string) => {
    if (!email || !password) throw new Error('Email and password are required');
    return api.post('/api/auth/login', { email, password });
  },
  register: (email: string, password: string, name: string) => {
    if (!email || !password || !name) throw new Error('All fields are required');
    return api.post('/api/auth/register', { email, password, name });
  },
};

export const chatAPI = {
  sendMessage: async (courseId: string, message: string, conversationId?: string) => {
    if (!courseId || !message) throw new Error('Course ID and message are required');

    // Get API keys from localStorage
    const savedKeys = localStorage.getItem('api_keys');
    let apiKeys: Array<{ key: string; provider: string }> = [];

    if (savedKeys) {
      try {
        const parsedKeys = JSON.parse(savedKeys);
        apiKeys = parsedKeys.map((key: any) => ({
          key: key.key,
          provider: key.provider || key.name.toLowerCase() // Fallback for backward compatibility
        }));
      } catch (error) {
        console.error('Error parsing API keys:', error);
        throw new Error('Invalid API keys format. Please re-enter your API keys.');
      }
    }

    // Check if we have any API keys
    if (apiKeys.length === 0) {
      throw new Error('API keys are required for chat functionality. Please add your API keys in the settings.');
    }

    try {
      const response = await api.post('/api/chat/message', {
        courseId,
        message,
        conversationId,
        apiKeys
      });
      
      // Return response with aiResponse field for compatibility
      return {
        data: {
          aiResponse: response.data.response || response.data.aiResponse,
          conversationId: response.data.conversationId || conversationId || 'demo',
          provider: response.data.provider,
          sanitized: response.data.sanitized
        }
      };
    } catch (error: any) {
      console.error('Chat API failed:', error);
      
      // If backend is not available, show a clear error message
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        throw new Error('Backend server not available. The chat feature requires a deployed backend with your API keys configured.');
      }
      
      throw error;
    }
  },
  getHistory: (conversationId: string) => {
    if (!conversationId) throw new Error('Conversation ID is required');
    return api.get('/api/chat/history/' + conversationId);
  },
};

export const coursesAPI = {
  getAll: async () => {
    // If in production without backend URL, use mock data immediately
    if (shouldUseMockData()) {
      return getMockCourses();
    }

    // Try real API first, fall back to mock data if it fails
    try {
      const result = await cachedGet<{ courses: any[] }>('/api/courses');
      return result;
    } catch (error) {
      console.warn('API call failed, falling back to mock data:', error);
      return getMockCourses();
    }
  },
  getById: (courseId: string) => {
    if (!courseId) throw new Error('Course ID is required');
    return cachedGet<any>(`/api/courses/${courseId}`);
  },
  enroll: (courseId: string) => {
    if (!courseId) throw new Error('Course ID is required');
    return api.post(`/api/courses/${courseId}/enroll`);
  },
};

export const analyticsAPI = {
  getDashboard: async () => {
    if (shouldUseMockData()) {
      // Return mock dashboard data for production deployment without backend
      return {
        totalSessions: 24,
        totalTimeSpent: 1800, // 30 minutes in seconds
        averageAccuracy: 82,
        coursesCompleted: 1,
        currentStreak: 5,
        weeklyGoal: 7,
        weeklyProgress: 5,
        recentSessions: [
          { date: '2024-01-10', duration: 1800, accuracy: 85, topic: 'Binary Trees' },
          { date: '2024-01-09', duration: 1500, accuracy: 78, topic: 'Graph Algorithms' },
          { date: '2024-01-08', duration: 2100, accuracy: 90, topic: 'Dynamic Programming' }
        ],
        topicMastery: [
          { topic: 'trees', mastery: 75, sessions: 12 },
          { topic: 'graphs', mastery: 60, sessions: 8 },
          { topic: 'sorting', mastery: 90, sessions: 15 },
          { topic: 'dynamic programming', mastery: 45, sessions: 6 }
        ]
      };
    }
    try {
      return await cachedGet<any>('/api/analytics/dashboard');
    } catch (error) {
      console.warn('Analytics API failed, using mock data:', error);
      return {
        totalSessions: 24,
        totalTimeSpent: 1800,
        averageAccuracy: 82,
        coursesCompleted: 1,
        currentStreak: 5,
        weeklyGoal: 7,
        weeklyProgress: 5,
        recentSessions: [
          { date: '2024-01-10', duration: 1800, accuracy: 85, topic: 'Binary Trees' },
          { date: '2024-01-09', duration: 1500, accuracy: 78, topic: 'Graph Algorithms' },
          { date: '2024-01-08', duration: 2100, accuracy: 90, topic: 'Dynamic Programming' }
        ],
        topicMastery: [
          { topic: 'trees', mastery: 75, sessions: 12 },
          { topic: 'graphs', mastery: 60, sessions: 8 },
          { topic: 'sorting', mastery: 90, sessions: 15 },
          { topic: 'dynamic programming', mastery: 45, sessions: 6 }
        ]
      };
    }
  },
  getExamReadiness: (courseId: string) => {
    if (!courseId) throw new Error('Course ID is required');
    return cachedGet<any>(`/api/analytics/exam-readiness/${courseId}`);
  },
  logSession: (data: any) => {
    if (!data) throw new Error('Session data is required');
    return api.post('/api/analytics/session', data);
  },
  getInsights: async () => {
    if (shouldUseMockData()) {
      // Return mock data for production deployment without backend
      return {
        data: {
          peakFocusTime: { range: '9 AM - 11 AM', score: 78, isCustom: false, startHour: 9, endHour: 11 },
          optimalDuration: { value: '25 minutes', avgAccuracy: 85 },
          masteryByTopic: [
            { topic: 'trees', mastery: 75, sessionsCount: 12 },
            { topic: 'graphs', mastery: 60, sessionsCount: 8 },
            { topic: 'sorting', mastery: 90, sessionsCount: 15 },
            { topic: 'dynamic programming', mastery: 45, sessionsCount: 6 }
          ]
        }
      };
    }
    try {
      return await api.get('/api/analytics/insights');
    } catch (error) {
      console.warn('Insights API failed, using mock data:', error);
      return {
        data: {
          peakFocusTime: { range: '9 AM - 11 AM', score: 78, isCustom: false, startHour: 9, endHour: 11 },
          optimalDuration: { value: '25 minutes', avgAccuracy: 85 },
          masteryByTopic: [
            { topic: 'trees', mastery: 75, sessionsCount: 12 },
            { topic: 'graphs', mastery: 60, sessionsCount: 8 },
            { topic: 'sorting', mastery: 90, sessionsCount: 15 },
            { topic: 'dynamic programming', mastery: 45, sessionsCount: 6 }
          ]
        }
      };
    }
  },
  startTimer: (topic: string, courseId: string) => {
    if (!topic || !courseId) throw new Error('Topic and course ID are required');
    return api.post('/api/analytics/timer/start', { topic, courseId });
  },
  stopTimer: (accuracy?: number, focusScore?: number) =>
    api.post('/api/analytics/timer/stop', { accuracy, focusScore }),
  getTimerStatus: () => api.get('/api/analytics/timer/status'),
  updateMastery: (topic: string, score: number, timeSpent: number) => {
    if (!topic || score === undefined) throw new Error('Topic and score are required');
    return api.post('/api/analytics/mastery/update', { topic, score, timeSpent });
  },
  setFocusTime: (startHour: number, endHour: number) =>
    api.post('/api/analytics/preferences/focus-time', { startHour, endHour }),
  clearFocusTime: () =>
    api.delete('/api/analytics/preferences/focus-time'),
  setMasteryGoal: (topic: string, goal: number) => {
    if (!topic || goal === undefined) throw new Error('Topic and goal are required');
    return api.post('/api/analytics/preferences/mastery-goal', { topic, goal });
  },
};

// Mock quiz questions database

// Mock quiz questions database
const getMockQuizQuestions = (topic: string, difficulty: string, count: number = 5) => {
  const questionBank: { [key: string]: { [key: string]: any[] } } = {
    // CS Topics
    'Arrays': {
      'easy': [
        { id: 1, question: 'What is the time complexity of accessing an element in an array by index?', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'], correct: 1, explanation: 'Arrays provide constant time O(1) access using direct indexing.' },
        { id: 2, question: 'Which operation is most efficient in an array?', options: ['Insertion at beginning', 'Deletion from middle', 'Access by index', 'Linear search'], correct: 2, explanation: 'Accessing by index is O(1), making it the most efficient operation.' },
        { id: 3, question: 'What is the space complexity of a static array?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correct: 1, explanation: 'Static arrays have fixed size, so space complexity is O(1) for the array structure.' },
      ],
      'medium': [
        { id: 4, question: 'Time complexity of inserting an element at the beginning of an array?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'], correct: 1, explanation: 'Requires shifting all elements to the right, resulting in O(n) time.' },
        { id: 5, question: 'Which array operation requires shifting elements?', options: ['Access', 'Update', 'Insert/Delete', 'Search'], correct: 2, explanation: 'Insert and delete operations require shifting elements to maintain contiguous storage.' },
      ],
      'hard': [
        { id: 6, question: 'Space complexity of a 2D array of size m×n?', options: ['O(1)', 'O(m+n)', 'O(m*n)', 'O(log(m*n))'], correct: 2, explanation: 'A 2D array stores m*n elements, so space complexity is O(m*n).' },
        { id: 7, question: 'In dynamic arrays, what happens when capacity is exceeded?', options: ['Elements are lost', 'Array doubles in size', 'Program crashes', 'Elements are compressed'], correct: 1, explanation: 'Dynamic arrays typically double their capacity when full to maintain amortized O(1) insertions.' },
      ],
    },
    'Linked Lists': {
      'easy': [
        { id: 1, question: 'What does a linked list node contain?', options: ['Only data', 'Only pointer', 'Data and pointer', 'Multiple pointers'], correct: 2, explanation: 'A basic node contains data and a pointer to the next node.' },
        { id: 2, question: 'What is the advantage of linked lists over arrays?', options: ['Faster access', 'Dynamic size', 'Less memory', 'Simpler implementation'], correct: 1, explanation: 'Linked lists can grow and shrink dynamically without contiguous memory allocation.' },
      ],
      'medium': [
        { id: 3, question: 'Time complexity of accessing the nth element in a linked list?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correct: 1, explanation: 'Must traverse from the head node, requiring O(n) time in the worst case.' },
        { id: 4, question: 'Which type of linked list allows traversal in both directions?', options: ['Singly', 'Doubly', 'Circular', 'Static'], correct: 1, explanation: 'Doubly linked lists have pointers to both next and previous nodes.' },
      ],
      'hard': [
        { id: 5, question: 'Time complexity of Floyd cycle detection algorithm?', options: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'], correct: 1, explanation: 'Floyd algorithm uses two pointers moving at different speeds, detecting cycles in O(n) time.' },
        { id: 6, question: 'Space complexity of reversing a linked list iteratively?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correct: 0, explanation: 'Iterative reversal uses only a few pointer variables, achieving O(1) space complexity.' },
      ],
    },
    'Trees': {
      'easy': [
        { id: 1, question: 'What is the root of a tree?', options: ['Deepest node', 'Topmost node', 'Leftmost node', 'Any leaf node'], correct: 1, explanation: 'The root is the topmost node with no parent in a tree structure.' },
        { id: 2, question: 'What is a leaf node?', options: ['Root node', 'Node with children', 'Node with no children', 'Middle node'], correct: 2, explanation: 'A leaf node has no children in the tree structure.' },
      ],
      'medium': [
        { id: 3, question: 'Time complexity of search in a balanced Binary Search Tree?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correct: 1, explanation: 'Balanced BSTs maintain O(log n) height, providing logarithmic search time.' },
        { id: 4, question: 'What is tree traversal?', options: ['Sorting nodes', 'Visiting all nodes', 'Deleting nodes', 'Adding nodes'], correct: 1, explanation: 'Traversal means visiting each node in the tree exactly once.' },
      ],
      'hard': [
        { id: 5, question: 'What is the height of a balanced binary tree with n nodes?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correct: 1, explanation: 'A balanced binary tree has height O(log n) for n nodes.' },
        { id: 6, question: 'What does AVL tree maintain?', options: ['Complete balance', 'Height difference ≤ 1', 'Perfect balance', 'Node count balance'], correct: 1, explanation: 'AVL trees maintain balance by ensuring height difference between subtrees is at most 1.' },
      ],
    },
    'Graphs': {
      'easy': [
        { id: 1, question: 'What represents relationships between objects?', options: ['Arrays', 'Trees', 'Graphs', 'Lists'], correct: 2, explanation: 'Graphs represent relationships between objects using nodes and edges.' },
        { id: 2, question: 'What is a vertex in graph theory?', options: ['Edge', 'Node', 'Path', 'Cycle'], correct: 1, explanation: 'Vertices (or nodes) are the fundamental units that graphs are built from.' },
      ],
      'medium': [
        { id: 3, question: 'Which representation uses O(V²) space?', options: ['Adjacency List', 'Adjacency Matrix', 'Edge List', 'Incidence Matrix'], correct: 1, explanation: 'Adjacency Matrix uses a 2D array of size V×V, requiring O(V²) space.' },
        { id: 4, question: 'What is BFS used for?', options: ['Sorting', 'Shortest path', 'Level-order traversal', 'Both B and C'], correct: 3, explanation: 'BFS finds shortest paths in unweighted graphs and performs level-order traversal.' },
      ],
      'hard': [
        { id: 5, question: 'Time complexity of Dijkstra algorithm?', options: ['O(V)', 'O(E log V)', 'O(V²)', 'O(E)'], correct: 1, explanation: 'Using binary heap, Dijkstra runs in O((V+E) log V) time.' },
        { id: 6, question: 'What does topological sort do?', options: ['Sorts nodes', 'Orders dependencies', 'Finds cycles', 'Calculates paths'], correct: 1, explanation: 'Topological sort orders nodes such that for every edge u→v, u comes before v.' },
      ],
    },
    'Sorting': {
      'easy': [
        { id: 1, question: 'Which sort is stable?', options: ['Quick Sort', 'Heap Sort', 'Merge Sort', 'Selection Sort'], correct: 2, explanation: 'Merge Sort maintains relative order of equal elements, making it stable.' },
        { id: 2, question: 'Time complexity of Bubble Sort?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], correct: 2, explanation: 'Bubble Sort compares adjacent elements, giving O(n²) in worst case.' },
      ],
      'medium': [
        { id: 3, question: 'Which sort uses divide and conquer?', options: ['Bubble Sort', 'Quick Sort', 'Insertion Sort', 'Selection Sort'], correct: 1, explanation: 'Quick Sort divides array around a pivot and recursively sorts subarrays.' },
        { id: 4, question: 'Space complexity of Merge Sort?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correct: 1, explanation: 'Merge Sort requires O(n) additional space for merging arrays.' },
      ],
      'hard': [
        { id: 5, question: 'Best case time complexity of Quick Sort?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], correct: 1, explanation: 'When pivot divides array equally, Quick Sort achieves O(n log n) in best case.' },
        { id: 6, question: 'Which sort is in-place?', options: ['Merge Sort', 'Quick Sort', 'Both', 'Neither'], correct: 1, explanation: 'Quick Sort is in-place, while Merge Sort requires additional space.' },
      ],
    },
    'Dynamic Programming': {
      'easy': [
        { id: 1, question: 'What does DP stand for?', options: ['Data Processing', 'Dynamic Programming', 'Direct Path', 'Data Points'], correct: 1, explanation: 'DP stands for Dynamic Programming, a method for solving complex problems.' },
        { id: 2, question: 'What is optimal substructure?', options: ['Smallest solution', 'Solution from subsolutions', 'Fastest solution', 'Memory efficient'], correct: 1, explanation: 'Optimal substructure means optimal solution is built from optimal subsolutions.' },
      ],
      'medium': [
        { id: 3, question: 'What is memoization?', options: ['Memory allocation', 'Storing computed results', 'Variable naming', 'Code optimization'], correct: 1, explanation: 'Memoization stores results of expensive function calls to avoid recomputation.' },
        { id: 4, question: 'Time complexity of Fibonacci with DP?', options: ['O(2^n)', 'O(n)', 'O(n²)', 'O(log n)'], correct: 1, explanation: 'DP reduces Fibonacci from exponential O(2^n) to linear O(n) time.' },
      ],
      'hard': [
        { id: 5, question: 'What is the knapsack problem?', options: ['Sorting items', 'Resource allocation', 'Path finding', 'String matching'], correct: 1, explanation: '0/1 Knapsack is a resource allocation problem solved with DP.' },
        { id: 6, question: 'Space optimization in DP?', options: ['Use more memory', 'Use only current row', 'Store everything', 'Use recursion'], correct: 1, explanation: 'Many DP problems can be optimized to use O(min(n,m)) space instead of O(n*m).' },
      ],
    },
    // ECE Topics
    'Digital Electronics': {
      'easy': [
        { id: 1, question: 'What is a logic gate?', options: ['Physical gate', 'Electronic circuit performing logic', 'Software function', 'Network device'], correct: 1, explanation: 'Logic gates are electronic circuits that perform Boolean logic operations.' },
        { id: 2, question: 'What does AND gate output?', options: ['1 only if both inputs 1', '1 if any input 1', 'Always 1', 'Always 0'], correct: 0, explanation: 'AND gate outputs 1 only when both inputs are 1.' },
      ],
      'medium': [
        { id: 3, question: 'What is Boolean algebra?', options: ['Number algebra', 'Logic algebra', 'String algebra', 'Matrix algebra'], correct: 1, explanation: 'Boolean algebra deals with binary variables and logic operations (AND, OR, NOT).' },
        { id: 4, question: 'What is a flip-flop?', options: ['Logic gate', 'Memory element', 'Amplifier', 'Oscillator'], correct: 1, explanation: 'Flip-flops are bistable multivibrators used as memory elements in digital circuits.' },
      ],
      'hard': [
        { id: 5, question: 'What is Karnaugh map used for?', options: ['Circuit drawing', 'Logic simplification', 'Signal analysis', 'Power calculation'], correct: 1, explanation: 'K-maps provide a graphical method to simplify Boolean expressions.' },
        { id: 6, question: 'What is race condition in digital circuits?', options: ['Fast running', 'Unpredictable output', 'Power issue', 'Heat problem'], correct: 1, explanation: 'Race conditions occur when output depends on signal propagation delays.' },
      ],
    },
    'Signals & Systems': {
      'easy': [
        { id: 1, question: 'What is a signal?', options: ['Noise', 'Information function', 'Frequency', 'Amplitude'], correct: 1, explanation: 'A signal is a function that carries information, varying with time or space.' },
        { id: 2, question: 'What is a system?', options: ['Computer', 'Signal processor', 'Device', 'Network'], correct: 1, explanation: 'A system processes input signals to produce output signals.' },
      ],
      'medium': [
        { id: 3, question: 'What does Fourier transform do?', options: ['Time to frequency', 'Frequency to time', 'Amplitude scaling', 'Phase shifting'], correct: 0, explanation: 'Fourier transform converts signals from time domain to frequency domain.' },
        { id: 4, question: 'What is convolution?', options: ['Addition', 'Multiplication', 'Signal combination', 'Division'], correct: 2, explanation: 'Convolution combines two signals to show how one influences the other.' },
      ],
      'hard': [
        { id: 5, question: 'What is Laplace transform used for?', options: ['Time signals', 'Complex analysis', 'Differential equations', 'Both B and C'], correct: 3, explanation: 'Laplace transform converts differential equations to algebraic equations.' },
        { id: 6, question: 'What is sampling theorem?', options: ['Signal storage', 'Frequency limit', 'Nyquist rate', 'Both B and C'], correct: 3, explanation: 'Sampling theorem states sampling frequency must be at least twice signal bandwidth.' },
      ],
    },
    'Communication Systems': {
      'easy': [
        { id: 1, question: 'What is modulation?', options: ['Signal mixing', 'Carrier variation', 'Noise addition', 'Signal filtering'], correct: 1, explanation: 'Modulation varies a carrier signal property (amplitude, frequency, phase) with message.' },
        { id: 2, question: 'What is AM?', options: ['Audio Modulation', 'Amplitude Modulation', 'Angle Modulation', 'Analog Modulation'], correct: 1, explanation: 'AM varies carrier amplitude according to modulating signal.' },
      ],
      'medium': [
        { id: 3, question: 'What is bandwidth?', options: ['Signal strength', 'Frequency range', 'Power consumption', 'Distance covered'], correct: 1, explanation: 'Bandwidth is the range of frequencies occupied by a signal.' },
        { id: 4, question: 'What is multiplexing?', options: ['Signal division', 'Multiple signals on one channel', 'Signal amplification', 'Noise reduction'], correct: 1, explanation: 'Multiplexing combines multiple signals for transmission over single channel.' },
      ],
      'hard': [
        { id: 5, question: 'What is Shannon capacity?', options: ['Channel speed', 'Maximum data rate', 'Signal power', 'Noise level'], correct: 1, explanation: 'Shannon capacity formula gives maximum error-free data transmission rate.' },
        { id: 6, question: 'What is OFDM?', options: ['Single carrier', 'Multiple carriers', 'Analog modulation', 'Digital coding'], correct: 1, explanation: 'OFDM divides signal into multiple subcarriers for efficient transmission.' },
      ],
    },
    'Control Systems': {
      'easy': [
        { id: 1, question: 'What is feedback in control systems?', options: ['Forward path', 'Output to input', 'Input amplification', 'Error correction'], correct: 1, explanation: 'Feedback feeds output signal back to input for comparison and correction.' },
        { id: 2, question: 'What is stability?', options: ['System speed', 'Bounded output', 'High gain', 'Low noise'], correct: 1, explanation: 'Stability means system output remains bounded for bounded inputs.' },
      ],
      'medium': [
        { id: 3, question: 'What is transfer function?', options: ['Input function', 'Output/Input ratio', 'Error function', 'Control function'], correct: 1, explanation: 'Transfer function is Laplace transform of output over input for LTI systems.' },
        { id: 4, question: 'What does PID stand for?', options: ['Proportional Integral Derivative', 'Primary Input Device', 'Process Identification Data', 'Parameter Input Delay'], correct: 0, explanation: 'PID controller uses Proportional, Integral, and Derivative terms for control.' },
      ],
      'hard': [
        { id: 5, question: 'What is root locus?', options: ['System roots', 'Pole-zero plot', 'Stability analysis', 'Both B and C'], correct: 3, explanation: 'Root locus plots closed-loop poles as gain varies for stability analysis.' },
        { id: 6, question: 'What is state space representation?', options: ['Single equation', 'Differential equations', 'Transfer function', 'Block diagram'], correct: 1, explanation: 'State space uses first-order differential equations to represent system dynamics.' },
      ],
    },
    'Microprocessors': {
      'easy': [
        { id: 1, question: 'What is a microprocessor?', options: ['Memory chip', 'CPU on chip', 'Storage device', 'Input device'], correct: 1, explanation: 'Microprocessor is a CPU implemented on a single integrated circuit chip.' },
        { id: 2, question: 'What is ALU?', options: ['Address unit', 'Arithmetic Logic Unit', 'Array Logic Unit', 'Analog Logic Unit'], correct: 1, explanation: 'ALU performs arithmetic and logical operations in the CPU.' },
      ],
      'medium': [
        { id: 3, question: 'What is pipelining?', options: ['Parallel processing', 'Sequential execution', 'Memory access', 'I/O operation'], correct: 0, explanation: 'Pipelining allows simultaneous execution of multiple instructions in different stages.' },
        { id: 4, question: 'What is interrupt?', options: ['CPU stop', 'External signal', 'Program end', 'Error condition'], correct: 1, explanation: 'Interrupt is a signal that causes CPU to suspend current task and service request.' },
      ],
      'hard': [
        { id: 5, question: 'What is cache memory?', options: ['Main memory', 'Fast buffer memory', 'Secondary storage', 'Register file'], correct: 1, explanation: 'Cache is high-speed memory that stores frequently accessed data and instructions.' },
        { id: 6, question: 'What is RISC architecture?', options: ['Complex instructions', 'Reduced instruction set', 'Register intensive', 'Memory oriented'], correct: 1, explanation: 'RISC uses simple instructions that execute quickly, with more registers.' },
      ],
    },
  };

  const questions = questionBank[topic]?.[difficulty] || questionBank[topic]?.['easy'] || [];
  return questions.sort(() => Math.random() - 0.5).slice(0, count);
};

export const statusAPI = {
  getStatus: async () => {
    if (shouldUseMockData()) {
      return {
        data: {
          status: 'mock',
          message: 'Using mock data - backend not deployed',
          timestamp: new Date().toISOString()
        }
      };
    }
    try {
      return await api.get('/api/status');
    } catch (error) {
      console.warn('Status API failed, using mock data:', error);
      return {
        data: {
          status: 'mock',
          message: 'Using mock data - backend not deployed',
          timestamp: new Date().toISOString()
        }
      };
    }
  },
};

export const quizAPI = {
  getQuestions: async (topic: string, difficulty: string, count: number = 5) => {
    if (!topic || !difficulty) throw new Error('Topic and difficulty are required');

    if (shouldUseMockData()) {
      // Return mock questions for production deployment without backend
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      return {
        data: {
          questions: getMockQuizQuestions(topic, difficulty, count),
          topic,
          difficulty,
          count: Math.min(count, getMockQuizQuestions(topic, difficulty, count).length)
        }
      };
    }

    try {
      return await api.get('/api/quiz/questions', {
        params: { topic, difficulty, count }
      });
    } catch (error) {
      console.warn('Quiz API failed, using mock questions:', error);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      return {
        data: {
          questions: getMockQuizQuestions(topic, difficulty, count),
          topic,
          difficulty,
          count: Math.min(count, getMockQuizQuestions(topic, difficulty, count).length)
        }
      };
    }
  },
  submitQuiz: async (quizData: any) => {
    if (!quizData) throw new Error('Quiz data is required');

    if (shouldUseMockData()) {
      // Return mock results for production deployment without backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      const score = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
      return {
        data: {
          score,
          totalQuestions: quizData.answers?.length || 5,
          correctAnswers: Math.floor((score / 100) * (quizData.answers?.length || 5)),
          timeSpent: quizData.timeSpent || 300,
          feedback: score >= 80 ? 'Excellent performance!' : score >= 60 ? 'Good job! Keep practicing.' : 'Needs more practice.',
          topicMastery: Math.min(100, score + Math.floor(Math.random() * 20))
        }
      };
    }

    try {
      return await api.post('/api/quiz/submit', quizData);
    } catch (error) {
      console.warn('Quiz submission API failed, using mock results:', error);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      const score = Math.floor(Math.random() * 40) + 60;
      return {
        data: {
          score,
          totalQuestions: quizData.answers?.length || 5,
          correctAnswers: Math.floor((score / 100) * (quizData.answers?.length || 5)),
          timeSpent: quizData.timeSpent || 300,
          feedback: score >= 80 ? 'Excellent performance!' : score >= 60 ? 'Good job! Keep practicing.' : 'Needs more practice.',
          topicMastery: Math.min(100, score + Math.floor(Math.random() * 20))
        }
      };
    }
  },
  generateQuestions: async (params: { subject: string; topic: string; difficulty: 'easy' | 'medium' | 'hard'; count: number; apiKeys: any[] }) => {
    if (!params?.subject || !params?.topic || !params?.difficulty || !params?.count) {
      throw new Error('subject, topic, difficulty, and count are required');
    }
    return api.post('/api/quiz/generate', params);
  },
  startAdaptive: async (params: { topic: string; difficulty: 'easy' | 'medium' | 'hard'; questionCount: number; courseId?: string; useAI?: boolean; apiKeys?: any }) => {
    if (!params?.topic || !params?.difficulty) throw new Error('Topic and difficulty are required');
    return api.post('/api/quiz/start', params);
  },
  submitAnswer: async (params: { sessionId: string; questionId: string; selectedIndex: number }) => {
    if (!params?.sessionId || !params?.questionId || params.selectedIndex === undefined) {
      throw new Error('sessionId, questionId, and selectedIndex are required');
    }
    return api.post('/api/quiz/answer', params);
  },
  finishAdaptive: async (params: { sessionId: string; timeSpentSeconds: number }) => {
    if (!params?.sessionId) throw new Error('sessionId is required');
    return api.post('/api/quiz/finish', params);
  },
  getQuizHistory: async (userId?: string) => {
    if (shouldUseMockData()) {
      return {
        data: {
          quizzes: [
            { id: 1, topic: 'Arrays', score: 85, date: '2024-01-10', difficulty: 'medium' },
            { id: 2, topic: 'Linked Lists', score: 78, date: '2024-01-09', difficulty: 'easy' },
            { id: 3, topic: 'Trees', score: 92, date: '2024-01-08', difficulty: 'hard' }
          ]
        }
      };
    }

    try {
      return await api.get('/api/quiz/history', { params: { userId } });
    } catch (error) {
      console.warn('Quiz history API failed, using mock data:', error);
      return {
        data: {
          quizzes: [
            { id: 1, topic: 'Arrays', score: 85, date: '2024-01-10', difficulty: 'medium' },
            { id: 2, topic: 'Linked Lists', score: 78, date: '2024-01-09', difficulty: 'easy' },
            { id: 3, topic: 'Trees', score: 92, date: '2024-01-08', difficulty: 'hard' }
          ]
        }
      };
    }
  }
};

export default api;
