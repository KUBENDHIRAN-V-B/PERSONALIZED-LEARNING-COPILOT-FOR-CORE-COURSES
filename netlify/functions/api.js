exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path.replace('/.netlify/functions/', '').split('/');
  
  try {
    if (path[0] === 'chat' && path[1] === 'message') {
      const { message } = JSON.parse(event.body || '{}');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: `Demo response to: "${message}". Configure API keys for real responses.`,
          conversationId: 'demo-conversation'
        })
      };
    }
    
    if (path[0] === 'analytics') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
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
        })
      };
    }
    
    if (path[0] === 'courses') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          courses: [
            {
              id: 'cs-dsa',
              name: 'Data Structures & Algorithms',
              description: 'Master fundamental data structures and algorithms essential for programming interviews and software development.',
              category: 'CS',
              difficulty: 'Intermediate',
              icon: '🔗',
              topics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Sorting', 'Searching']
            },
            {
              id: 'cs-dbms',
              name: 'Database Management Systems',
              description: 'Learn database design, SQL, normalization, and transaction management for robust data systems.',
              category: 'CS',
              difficulty: 'Intermediate',
              icon: '🗄️',
              topics: ['SQL', 'Normalization', 'Transactions', 'Indexing', 'Query Optimization']
            },
            {
              id: 'cs-os',
              name: 'Operating Systems',
              description: 'Understand process management, memory allocation, file systems, and system calls.',
              category: 'CS',
              difficulty: 'Advanced',
              icon: '💻',
              topics: ['Processes', 'Memory Management', 'File Systems', 'Scheduling', 'Deadlocks']
            },
            {
              id: 'ece-digital',
              name: 'Digital Electronics',
              description: 'Master logic gates, Boolean algebra, and digital circuit design fundamentals.',
              category: 'ECE',
              difficulty: 'Beginner',
              icon: '⚡',
              topics: ['Logic Gates', 'Boolean Algebra', 'Combinational Circuits', 'Sequential Circuits']
            },
            {
              id: 'ece-signals',
              name: 'Signals & Systems',
              description: 'Analyze continuous and discrete signals, Fourier transforms, and system responses.',
              category: 'ECE',
              difficulty: 'Intermediate',
              icon: '📊',
              topics: ['Signal Analysis', 'Fourier Transform', 'Laplace Transform', 'System Response']
            },
            {
              id: 'ece-communication',
              name: 'Communication Systems',
              description: 'Study modulation techniques, channel coding, and wireless communication principles.',
              category: 'ECE',
              difficulty: 'Advanced',
              icon: '📡',
              topics: ['Modulation', 'Channel Coding', 'Wireless Systems', 'Network Protocols']
            }
          ]
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