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
        body: JSON.stringify([
          {
            id: 'cs-dsa',
            name: 'Data Structures & Algorithms',
            category: 'Computer Science',
            topics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs']
          }
        ])
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