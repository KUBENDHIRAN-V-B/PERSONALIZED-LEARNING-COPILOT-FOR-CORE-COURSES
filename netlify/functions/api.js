exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path.replace('/.netlify/functions/api/', '');

  try {
    if (path === 'courses' || path.startsWith('courses')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          courses: [
            { id: 'cs-dsa', name: 'Data Structures & Algorithms', description: 'Master fundamental data structures and algorithms', category: 'CS', difficulty: 'Intermediate', icon: '🔢', topics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Sorting', 'Searching'] },
            { id: 'cs-dbms', name: 'Database Management Systems', description: 'Learn database design, SQL, and data management', category: 'CS', difficulty: 'Intermediate', icon: '🗄️', topics: ['SQL', 'Normalization', 'Transactions', 'Indexing'] },
            { id: 'cs-os', name: 'Operating Systems', description: 'Understand process management and system calls', category: 'CS', difficulty: 'Advanced', icon: '💻', topics: ['Processes', 'Memory Management', 'File Systems', 'Scheduling'] },
            { id: 'ece-digital', name: 'Digital Electronics', description: 'Master logic gates and digital circuits', category: 'ECE', difficulty: 'Beginner', icon: '⚡', topics: ['Logic Gates', 'Boolean Algebra', 'Combinational Circuits'] },
            { id: 'ece-signals', name: 'Signals & Systems', description: 'Analyze signals and system responses', category: 'ECE', difficulty: 'Intermediate', icon: '📊', topics: ['Signal Analysis', 'Fourier Transform', 'System Response'] },
            { id: 'ece-communication', name: 'Communication Systems', description: 'Study modulation and wireless communication', category: 'ECE', difficulty: 'Advanced', icon: '📡', topics: ['Modulation', 'Channel Coding', 'Wireless Systems'] }
          ]
        })
      };
    }

    if (path === 'analytics/insights' || path.startsWith('analytics')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          insights: {
            peakFocusTime: { range: '9:00 AM - 11:00 AM', score: 85, isCustom: false, startHour: 9, endHour: 11 },
            optimalDuration: { value: '25-minute', reason: 'Based on your focus patterns' },
            masteryByTopic: [
              { topic: 'Data Structures', mastery: 75, sessionsCount: 12 },
              { topic: 'Algorithms', mastery: 60, sessionsCount: 8 },
              { topic: 'Database Systems', mastery: 80, sessionsCount: 15 }
            ]
          }
        })
      };
    }

    if (path === 'chat/message' || path.startsWith('chat')) {
      const body = JSON.parse(event.body || '{}');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: `Demo response to: "${body.message}". Configure your API keys in settings for real AI responses.`,
          conversationId: 'demo-conversation'
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};
