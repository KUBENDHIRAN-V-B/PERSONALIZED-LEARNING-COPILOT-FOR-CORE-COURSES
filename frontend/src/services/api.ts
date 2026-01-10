import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

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

// Helper function to check if we're in production without backend
const isProductionWithoutBackend = () => {
  return process.env.NODE_ENV === 'production' && !process.env.REACT_APP_API_URL;
};

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
    
    if (isProductionWithoutBackend()) {
      // Return mock response for production deployment without backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      return {
        data: {
          conversationId: conversationId || `conv_${Date.now()}`,
          aiResponse: `This is a demo response for "${message}". The backend is not currently deployed. To enable full AI chat functionality, please deploy the backend server and set the REACT_APP_API_URL environment variable.`
        }
      };
    }
    
    // Get API keys from localStorage
    const savedKeys = localStorage.getItem('api_keys');
    let apiKeys = {};
    
    if (savedKeys) {
      try {
        const parsedKeys = JSON.parse(savedKeys);
        // Convert array to object for backward compatibility
        apiKeys = parsedKeys.reduce((acc: any, key: any) => {
          acc[key.name.toLowerCase()] = key.key;
          return acc;
        }, {});
      } catch (error) {
        console.error('Error parsing API keys:', error);
      }
    }
    
    return api.post('/api/chat/message', { 
      courseId, 
      message, 
      conversationId,
      apiKeys
    });
  },
  getHistory: (conversationId: string) => {
    if (!conversationId) throw new Error('Conversation ID is required');
    return api.get(`/api/chat/history/${conversationId}`);
  },
};

export const coursesAPI = {
  getAll: async () => {
    if (isProductionWithoutBackend()) {
      // Return mock courses data for production deployment without backend
      return {
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
          }
        ]
      };
    }
    return cachedGet<{ courses: any[] }>('/api/courses');
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
    if (isProductionWithoutBackend()) {
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
    return cachedGet<any>('/api/analytics/dashboard');
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
    if (isProductionWithoutBackend()) {
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
    return api.get('/api/analytics/insights');
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

export const learningAPI = {
  getProfile: () => cachedGet<any>('/api/learning/profile'),
  updateProfile: (data: any) => {
    if (!data) throw new Error('Profile data is required');
    return api.put('/api/learning/profile', data);
  },
  getMastery: (courseId: string) => {
    if (!courseId) throw new Error('Course ID is required');
    return cachedGet<any>(`/api/learning/mastery/${courseId}`);
  },
};

export const statusAPI = {
  getStatus: () => api.get('/api/status'),
};

export default api;
