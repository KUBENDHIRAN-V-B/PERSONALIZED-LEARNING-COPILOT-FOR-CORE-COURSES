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

// Mock response generator for DSA questions
const generateDSAResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();

  // DSA Concepts
  if (lowerMessage.includes('what is dsa') || lowerMessage.includes('data structures and algorithms')) {
    return `**Data Structures and Algorithms (DSA)** is the foundation of computer science and programming. It involves:

## Key Areas:
- **Data Structures**: Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Hash Tables
- **Algorithms**: Sorting, Searching, Dynamic Programming, Greedy Algorithms, Graph Algorithms

## Why Learn DSA?
- Essential for technical interviews at top companies (FAANG)
- Improves problem-solving skills
- Makes you a better programmer
- Foundation for advanced topics like Machine Learning and System Design

**Ready to start learning?** Try asking about specific data structures like "Explain Binary Trees" or algorithms like "How does Quick Sort work?"`;
  }

  if (lowerMessage.includes('binary tree') || lowerMessage.includes('tree')) {
    return `**Binary Trees** are hierarchical data structures where each node has at most two children (left and right).

## Key Concepts:
- **Root**: Topmost node
- **Leaf**: Node with no children
- **Height**: Longest path from root to leaf
- **Balanced Tree**: Heights of subtrees differ by at most 1

## Common Operations:
- **Traversal**: Inorder, Preorder, Postorder, Level-order
- **Insertion/Deletion**: O(log n) in balanced trees
- **Search**: O(log n) average case

## Applications:
- Expression parsing, File systems, Database indexing
- Binary Search Trees (BST) for ordered data

**Example**: A balanced binary tree with height h can store up to 2^(h+1) - 1 nodes!`;
  }

  if (lowerMessage.includes('sorting') || lowerMessage.includes('sort')) {
    return `**Sorting Algorithms** arrange elements in a specific order (ascending/descending).

## Popular Algorithms:

### **Quick Sort** (Divide & Conquer)
- **Time**: O(n log n) average, O(n²) worst
- **Space**: O(log n)
- **Stable**: No
- **Best for**: General purpose sorting

### **Merge Sort**
- **Time**: O(n log n) always
- **Space**: O(n)
- **Stable**: Yes
- **Best for**: Large datasets, external sorting

### **Bubble Sort**
- **Time**: O(n²)
- **Space**: O(1)
- **Stable**: Yes
- **Best for**: Educational purposes, small arrays

**Pro Tip**: For interviews, know the trade-offs between time/space complexity and stability!`;
  }

  if (lowerMessage.includes('dynamic programming') || lowerMessage.includes('dp')) {
    return `**Dynamic Programming (DP)** solves complex problems by breaking them into simpler subproblems.

## Key Principles:
1. **Optimal Substructure**: Solution built from optimal solutions of subproblems
2. **Overlapping Subproblems**: Same subproblems solved multiple times

## Famous DP Problems:
- **Fibonacci**: Memoization vs Tabulation
- **Knapsack**: 0/1 and Unbounded variants
- **Longest Common Subsequence**
- **Matrix Chain Multiplication**

## Steps to Solve DP:
1. Define the problem state
2. Identify recurrence relation
3. Determine base cases
4. Choose memoization or tabulation
5. Handle edge cases

**Example**: Coin Change problem - Find minimum coins needed for a given amount!

DP is challenging but mastering it will level up your problem-solving skills significantly!`;
  }

  if (lowerMessage.includes('graph') || lowerMessage.includes('graphs')) {
    return `**Graphs** represent relationships between objects using nodes (vertices) and edges.

## Types:
- **Directed**: Edges have direction (one-way)
- **Undirected**: Edges are bidirectional
- **Weighted**: Edges have costs/weights
- **Unweighted**: All edges equal

## Representations:
- **Adjacency Matrix**: 2D array, O(V²) space
- **Adjacency List**: Array of lists, O(V + E) space

## Algorithms:
- **BFS/DFS**: Traversal
- **Dijkstra**: Shortest path (weighted)
- **Bellman-Ford**: Negative weights
- **Floyd-Warshall**: All-pairs shortest path
- **Kruskal/Prim**: Minimum Spanning Tree

## Applications:
- Social networks, GPS navigation, web crawling, dependency resolution

Graphs are everywhere in computer science! 🌐`;
  }

  if (lowerMessage.includes('array') || lowerMessage.includes('arrays')) {
    return `**Arrays** are the most fundamental data structure - contiguous memory blocks storing elements of the same type.

## Key Operations:
- **Access**: O(1) - Direct indexing
- **Search**: O(n) linear, O(log n) binary (if sorted)
- **Insert/Delete**: O(n) - Shifting elements

## Common Problems:
- **Two Sum**: Find pairs that sum to target
- **Maximum Subarray**: Kadane's algorithm
- **Rotate Array**: In-place rotation
- **Merge Intervals**: Overlapping ranges

## Multi-dimensional Arrays:
- **2D Arrays**: Matrices, grids
- **Applications**: Image processing, game boards, spreadsheets

**Fun Fact**: Array indexing starts at 0 in most languages because memory is byte-addressable!

Arrays are simple but powerful - master them first!`;
  }

  if (lowerMessage.includes('linked list') || lowerMessage.includes('linkedlist')) {
    return `**Linked Lists** are dynamic data structures where elements are connected via pointers.

## Types:
- **Singly Linked List**: Each node points to next
- **Doubly Linked List**: Nodes point to both next and previous
- **Circular Linked List**: Last node points back to first

## Operations:
- **Insert/Delete**: O(1) at head, O(n) at tail (singly)
- **Search**: O(n)
- **Reverse**: O(n) time

## Advantages over Arrays:
- Dynamic size (no fixed capacity)
- Efficient insertions/deletions
- No memory waste

## Common Problems:
- **Reverse a Linked List**
- **Detect Cycle** (Floyd's algorithm)
- **Merge Two Sorted Lists**
- **Remove Nth Node from End**

Linked Lists teach pointer manipulation - crucial for interviews!`;
  }

  if (lowerMessage.includes('stack') || lowerMessage.includes('stacks')) {
    return `**Stacks** are LIFO (Last In, First Out) data structures.

## Core Operations:
- **Push**: Add element to top - O(1)
- **Pop**: Remove top element - O(1)
- **Peek/Top**: View top element - O(1)

## Implementations:
- **Array-based**: Fixed size, fast access
- **Linked List**: Dynamic size, more flexible

## Applications:
- **Function Call Stack**: Recursion
- **Expression Evaluation**: Infix to Postfix
- **Browser History**: Back button
- **Undo/Redo**: Text editors

## Famous Problems:
- **Valid Parentheses**: Stack-based validation
- **Next Greater Element**
- **Largest Rectangle in Histogram**

**Stack Principle**: Last element added is first to be removed!`;
  }

  if (lowerMessage.includes('queue') || lowerMessage.includes('queues')) {
    return `**Queues** are FIFO (First In, First Out) data structures.

## Core Operations:
- **Enqueue**: Add to rear - O(1)
- **Dequeue**: Remove from front - O(1)
- **Front**: View front element - O(1)

## Variants:
- **Circular Queue**: Wraps around when full
- **Priority Queue**: Elements dequeued by priority
- **Deque**: Double-ended queue

## Implementations:
- **Array**: Fixed size, circular for efficiency
- **Linked List**: Dynamic size

## Applications:
- **Task Scheduling**: CPU scheduling
- **Breadth-First Search**: Level-order traversal
- **Print Queue**: Document printing
- **Message Queues**: Inter-process communication

**Queue Principle**: First element added is first to be removed!`;
  }

  // Default educational response
  return `I'm your DSA Learning Assistant! 🤖

**"${message}"** is a great question for learning Data Structures and Algorithms!

## What I can help you with:
- **Data Structures**: Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Hash Tables
- **Algorithms**: Sorting, Searching, Dynamic Programming, Greedy, Graph algorithms
- **Problem Solving**: Interview questions, coding challenges, complexity analysis
- **Concepts**: Time/Space complexity, Big O notation, optimization techniques

## Try asking:
- "Explain Binary Trees"
- "How does Quick Sort work?"
- "What is Dynamic Programming?"
- "Graph traversal algorithms"

**Ready to dive deep into DSA?** Let's start with the fundamentals and build up to advanced topics! 🚀

*Note: This is a demo response. Deploy the backend server with AI API keys for full interactive learning experience.*`;
};

export const chatAPI = {
  sendMessage: async (courseId: string, message: string, conversationId?: string) => {
    if (!courseId || !message) throw new Error('Course ID and message are required');

    if (shouldUseMockData()) {
      // Return educational mock response for production deployment without backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      return {
        data: {
          conversationId: conversationId || `conv_${Date.now()}`,
          aiResponse: generateDSAResponse(message)
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

    try {
      return await api.post('/api/chat/message', {
        courseId,
        message,
        conversationId,
        apiKeys
      });
    } catch (error) {
      console.warn('Chat API failed, using mock response:', error);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      return {
        data: {
          conversationId: conversationId || `conv_${Date.now()}`,
          aiResponse: generateDSAResponse(message)
        }
      };
    }
  },
  getHistory: (conversationId: string) => {
    if (!conversationId) throw new Error('Conversation ID is required');
    return api.get(`/api/chat/history/${conversationId}`);
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

export const learningAPI = {
  getProfile: async () => {
    if (shouldUseMockData()) {
      return {
        data: {
          name: 'Demo User',
          email: 'demo@example.com',
          preferences: {
            focusDuration: 25,
            breakDuration: 5,
            notifications: true
          },
          stats: {
            totalStudyTime: 3600,
            coursesCompleted: 2,
            averageScore: 85
          }
        }
      };
    }
    try {
      return await cachedGet<any>('/api/learning/profile');
    } catch (error) {
      console.warn('Learning profile API failed, using mock data:', error);
      return {
        data: {
          name: 'Demo User',
          email: 'demo@example.com',
          preferences: {
            focusDuration: 25,
            breakDuration: 5,
            notifications: true
          },
          stats: {
            totalStudyTime: 3600,
            coursesCompleted: 2,
            averageScore: 85
          }
        }
      };
    }
  },
  updateProfile: (data: any) => {
    if (!data) throw new Error('Profile data is required');
    return api.put('/api/learning/profile', data);
  },
  getMastery: async (courseId: string) => {
    if (!courseId) throw new Error('Course ID is required');
    if (shouldUseMockData()) {
      return {
        data: {
          courseId,
          overallMastery: 75,
          topics: [
            { name: 'Basic Concepts', mastery: 90, completed: true },
            { name: 'Advanced Topics', mastery: 60, completed: false },
            { name: 'Practice Problems', mastery: 80, completed: true }
          ]
        }
      };
    }
    try {
      return await cachedGet<any>(`/api/learning/mastery/${courseId}`);
    } catch (error) {
      console.warn('Learning mastery API failed, using mock data:', error);
      return {
        data: {
          courseId,
          overallMastery: 75,
          topics: [
            { name: 'Basic Concepts', mastery: 90, completed: true },
            { name: 'Advanced Topics', mastery: 60, completed: false },
            { name: 'Practice Problems', mastery: 80, completed: true }
          ]
        }
      };
    }
  },
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

export default api;
