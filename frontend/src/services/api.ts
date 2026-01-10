import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
    return Promise.reject(error);
  }
);

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
  sendMessage: (courseId: string, message: string, conversationId?: string) => {
    if (!courseId || !message) throw new Error('Course ID and message are required');
    
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
  getAll: () => cachedGet<{ courses: any[] }>('/api/courses'),
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
  getDashboard: () => cachedGet<any>('/api/analytics/dashboard'),
  getExamReadiness: (courseId: string) => {
    if (!courseId) throw new Error('Course ID is required');
    return cachedGet<any>(`/api/analytics/exam-readiness/${courseId}`);
  },
  logSession: (data: any) => {
    if (!data) throw new Error('Session data is required');
    return api.post('/api/analytics/session', data);
  },
  getInsights: () => api.get('/api/analytics/insights'),
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
