import { Router } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { AuthRequest } from '../middleware/auth';
import { validateChatRequest } from '../middleware/inputValidation';
import { enforceHTTPS } from '../middleware/security';
import { limitRequestSize } from '../middleware/security';
import { Response } from 'express';
import { callAIProvider } from '../services/aiProvider';

const keywordMappings: { [key: string]: string[] } = {
  'dsa': ['data structures', 'algorithms', 'dsa', 'data structure', 'algorithm'],
  'array': ['array', 'arrays', 'fixed size array', 'dynamic array'],
  'linked_list': ['linked list', 'linkedlist', 'singly linked', 'doubly linked', 'circular linked'],
  'stack': ['stack', 'lifo', 'push', 'pop'],
  'queue': ['queue', 'fifo', 'enqueue', 'dequeue'],
  'binary_tree': ['binary tree', 'tree', 'bst', 'binary search tree'],
  'algorithm': ['algorithm', 'complexity', 'big o', 'time complexity', 'space complexity', 'o(n)', 'o(1)', 'o(log n)'],
  'database': ['database', 'db', 'dbms', 'rdbms', 'nosql', 'mongodb', 'mysql', 'postgresql'],
  'hello': ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good evening'],
  'help': ['help', 'what can you', 'how to use', 'guide', 'tutorial'],
  'thanks': ['thank', 'thanks', 'thank you', 'thx', 'appreciate']
};

// Comprehensive knowledge base
const knowledgeBase: { [key: string]: string } = {
  'hello': 'Welcome to your engineering learning assistant!',
  'help': 'I can help you with engineering topics. Try asking about data structures, algorithms, databases, or other CS concepts.',
  'thanks': 'You\'re welcome! Happy learning!'
};

function findBestMatch(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  // Check each topic's keywords
  for (const [topic, keywords] of Object.entries(keywordMappings)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        return topic;
      }
    }
  }
  
  return null;
}

// Generate response
function generateResponse(message: string, context: string): string {
  const topic = findBestMatch(message);
  
  if (topic && knowledgeBase[topic]) {
    return knowledgeBase[topic];
  }
  
  return ''; // Return empty to trigger AI fallback
}

// Preserve markdown formatting, only clean up HTML entities and extra whitespace
function cleanMarkdown(text: string): string {
  return text
    // Clean HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Course-specific knowledge base
const courseKnowledge: { [key: string]: { name: string; topics: string[]; description: string } } = {
  'dsa': { 
    name: 'Data Structures & Algorithms', 
    topics: ['Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Graphs', 'Sorting', 'Searching', 'Dynamic Programming', 'Greedy Algorithms', 'Backtracking'], 
    description: 'fundamental data structures and algorithmic problem-solving techniques' 
  },
  'coa': { 
    name: 'Computer Organization & Architecture', 
    topics: ['CPU Architecture', 'Memory Hierarchy', 'I/O Systems', 'Pipelining', 'Cache Memory', 'Instruction Set', 'Assembly Language', 'Von Neumann Architecture'], 
    description: 'computer hardware organization, instruction execution, and low-level system design' 
  },
  'os': { 
    name: 'Operating Systems', 
    topics: ['Processes', 'Threads', 'Memory Management', 'File Systems', 'Scheduling', 'Deadlocks', 'Synchronization', 'Virtual Memory'], 
    description: 'operating system concepts, process management, and system programming' 
  },
  'dbms': { 
    name: 'Database Management Systems', 
    topics: ['SQL', 'Normalization', 'Indexing', 'Transactions', 'Query Optimization', 'NoSQL', 'ACID Properties', 'ER Diagrams'], 
    description: 'database design, SQL queries, and data management principles' 
  },
  'cn': { 
    name: 'Computer Networks', 
    topics: ['TCP/IP', 'HTTP', 'Routing', 'Network Security', 'OSI Model', 'Protocols', 'DNS', 'Subnetting'], 
    description: 'networking protocols, data transmission, and distributed systems' 
  },
  'digital-electronics': { 
    name: 'Digital Electronics', 
    topics: ['Logic Gates', 'Boolean Algebra', 'Combinational Circuits', 'Sequential Circuits', 'Flip-Flops', 'Counters', 'Multiplexers'], 
    description: 'digital logic design, circuit analysis, and Boolean operations' 
  },
  'signals-systems': { 
    name: 'Signals & Systems', 
    topics: ['Signal Analysis', 'Fourier Transform', 'Laplace Transform', 'Z-Transform', 'Convolution', 'Sampling', 'Filters'], 
    description: 'signal processing, system analysis, and frequency domain techniques' 
  },
  'programming': {
    name: 'Programming Fundamentals',
    topics: ['Variables', 'Control Flow', 'Functions', 'Objects', 'Error Handling', 'Data Types', 'Loops'],
    description: 'basic programming concepts and software development fundamentals'
  },
  'se': {
    name: 'Software Engineering',
    topics: ['SDLC', 'Agile', 'Testing', 'Requirements', 'Design Patterns', 'Version Control'],
    description: 'software development methodologies and engineering best practices'
  }
};

// Build enhanced system prompt for course
function buildSystemPrompt(courseId: string): string {
  const course = courseKnowledge[courseId] || { name: 'Engineering', topics: [], description: 'engineering concepts' };
  
  return `You are an expert engineering tutor and AI teaching assistant specialized in Computer Science and Electronics & Communication Engineering. Your role is to provide accurate, structured, and learner-centric answers tailored to each user's preferences and academic level.

**Core Behavior Rules:**
- Always answer in a clear, step-by-step manner
- Adapt explanations based on the subject: ${course.name}
- Prefer conceptual understanding over rote answers
- Never assume prior knowledge unless specified
- Avoid unnecessary verbosity; be detailed but focused

**Current Course Context:**
You are teaching ${course.name}, which covers ${course.description}.
Key topics include: ${course.topics.join(', ')}.

**Answer Structure:**
1. Begin with a simple definition or overview
2. Break the explanation into logical sections with headings
3. Use examples, analogies, or pseudo-code where applicable
4. For technical topics, include:
   - Key points
   - Important formulas (if relevant)
   - Common mistakes
5. End with a short summary or takeaway

**Formatting Requirements:**
- Use Markdown formatting
- Use bullet points for clarity
- Use code blocks for programming examples
- Use mathematical notation only when necessary
- Highlight important terms in **bold**

**Engineering-Specific Guidelines:**
For CS subjects:
- Include time/space complexity where relevant
- Explain data flow or execution steps

For ECE subjects:
- Explain signals, blocks, or hardware behavior conceptually
- Keep mathematics intuitive unless advanced level is requested

**Teaching Style:**
- Use simple language with analogies
- Provide real-world examples
- Explain the "why" behind concepts, not just the "what"
- Include practical applications
- Highlight common mistakes and best practices

**Tone:** Friendly, encouraging, and patient. Make learning engaging and accessible.

**Error-Safe Rules:**
- If the question is ambiguous, ask a clarifying question
- If the topic is outside CS/ECE, state the limitation politely
- Never hallucinate formulas or facts
- If unsure, say so clearly and suggest verification

**Output Goal:**
Produce a high-quality, personalized educational answer that feels like it was written by a skilled human tutor, not a generic AI response.`;
}

function checkKnowledgeBase(message: string, context: string): string | null {
  const kbResponse = generateResponse(message, context);
  if (kbResponse) {
    return cleanMarkdown(kbResponse);
  }
  return null;
}

export default function chatRoutes(io: SocketIOServer) {
  const router = Router();

  const conversationHistories: Map<string, Array<{ role: 'user' | 'assistant'; content: string }>> = new Map();

  // Secure chat endpoint with comprehensive validation and security
  router.post('/message', 
    enforceHTTPS,
    limitRequestSize(1024 * 1024), // 1MB limit
    validateChatRequest,
    async (req: any, res: Response) => {
    try {
      const { conversationId, message, courseId, apiKeys } = req.body;
      const userId = req.userId || 'anonymous';

      // Validate API keys
      if (!apiKeys || !Array.isArray(apiKeys) || apiKeys.length === 0) {
        return res.status(400).json({ error: 'At least one API key is required for chat functionality' });
      }

      // Get or create conversation ID
      const convId = conversationId || `conv_${userId}_${Date.now()}`;
      
      // Get conversation history
      const history = conversationHistories.get(convId) || [];

      // Build enhanced system prompt based on course
      const systemPrompt = buildSystemPrompt(courseId || 'dsa');

      // Call AI provider with fallback
      const aiResult = await callAIProvider(
        {
          message,
          systemPrompt,
          history,
          apiKey: '', // Will be set by provider
          provider: 'gemini' // Will be overridden
        },
        apiKeys
      );

      if (!aiResult.success) {
        return res.status(500).json({ 
          error: aiResult.error || 'All AI providers failed. Please check your API keys.'
        });
      }

      // Store conversation
      if (!conversationHistories.has(convId)) {
        conversationHistories.set(convId, []);
      }
      conversationHistories.get(convId)!.push(
        { role: 'user', content: message },
        { role: 'assistant', content: aiResult.content || '' }
      );

      res.json({ 
        response: aiResult.content,
        conversationId: convId,
        provider: aiResult.provider,
        sanitized: aiResult.sanitized,
        source: 'ai'
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get conversation history
  router.get('/conversations/:courseId', 
    enforceHTTPS,
    async (req: any, res: Response) => {
    try {
      const { courseId } = req.params;
      const userId = req.userId || 'anonymous';

      // Filter conversations for this course and user
      const conversations = Array.from(conversationHistories.entries())
        .filter(([key]) => key.includes(userId))
        .map(([key, messages]) => ({
          conversationId: key,
          messageCount: messages.length,
        }));

      res.json({ conversations });
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });

  return router;
}
