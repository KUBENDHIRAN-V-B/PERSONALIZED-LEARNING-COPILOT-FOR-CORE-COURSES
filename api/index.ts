import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { path } = req.query;
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Route handling
  if (path && path[0] === 'chat' && path[1] === 'message') {
    return handleChat(req, res);
  }
  
  if (path && path[0] === 'analytics') {
    return handleAnalytics(req, res);
  }
  
  if (path && path[0] === 'courses') {
    return handleCourses(req, res);
  }
  
  return res.status(404).json({ error: 'Not found' });
}

function handleChat(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { message, apiKeys } = req.body;
  
  // Mock response for demo
  return res.json({
    response: `This is a demo response to: "${message}". Please configure your API keys in the frontend to get real AI responses.`,
    conversationId: 'demo-conversation'
  });
}

function handleAnalytics(req: VercelRequest, res: VercelResponse) {
  // Mock analytics data
  return res.json({
    insights: {
      peakFocusTime: {
        range: "9:00 AM - 11:00 AM",
        score: 85,
        isCustom: false,
        startHour: 9,
        endHour: 11
      },
      optimalDuration: {
        value: "25-minute",
        reason: "Based on your focus patterns"
      },
      masteryByTopic: [
        { topic: "Data Structures", mastery: 75 },
        { topic: "Algorithms", mastery: 60 },
        { topic: "Database Systems", mastery: 80 }
      ]
    }
  });
}

function handleCourses(req: VercelRequest, res: VercelResponse) {
  // Mock courses data
  return res.json([
    {
      id: 'cs-dsa',
      name: 'Data Structures & Algorithms',
      category: 'Computer Science',
      topics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Sorting', 'Searching']
    },
    {
      id: 'cs-dbms',
      name: 'Database Management Systems',
      category: 'Computer Science', 
      topics: ['SQL', 'Normalization', 'Transactions', 'Indexing']
    }
  ]);
}