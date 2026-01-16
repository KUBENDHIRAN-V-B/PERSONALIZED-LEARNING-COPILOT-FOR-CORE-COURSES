# AI Quiz Generation System

A secure, provider-agnostic quiz generation system that creates high-quality multiple-choice questions using user-provided API keys.

## Features

- **Multi-Provider Support**: Works with Gemini, Groq, Cerebras, and OpenRouter
- **Automatic Failover**: Falls back to alternative providers if one fails
- **Rate Limiting**: 30 requests per minute per user to prevent abuse
- **Input Validation**: Comprehensive validation of all inputs
- **Structured Output**: Consistent JSON format with A/B/C/D options
- **Security**: API keys are never stored, logged, or exposed

## API Endpoint

### POST `/api/quiz/generate`

Generates AI-powered quiz questions based on specified parameters.

#### Request Body

```json
{
  "subject": "Computer Science",
  "topic": "Data Structures",
  "difficulty": "easy" | "medium" | "hard",
  "count": 5,
  "apiKeys": [
    {
      "key": "your-api-key-here",
      "provider": "gemini" | "groq" | "cerebras" | "openrouter"
    }
  ],
  "preferredProvider": "gemini"
}
```

#### Parameters

- `subject` (required): The academic subject (e.g., "Computer Science", "Mathematics")
- `topic` (required): Specific topic within the subject (e.g., "Data Structures", "Calculus")
- `difficulty` (required): Question difficulty level
- `count` (optional): Number of questions to generate (1-50, default: 5)
- `apiKeys` (required): Array of API key objects with provider information
- `preferredProvider` (optional): Preferred AI provider to use first

#### Response

**Success Response (200):**
```json
{
  "questions": [
    {
      "id": "ai-1234567890-0",
      "topicKey": "data-structures",
      "difficulty": "medium",
      "question": "What is the time complexity of inserting an element into a balanced binary search tree?",
      "options": [
        "O(1)",
        "O(log n)",
        "O(n)",
        "O(n log n)"
      ],
      "correctIndex": 1,
      "explanation": "In a balanced binary search tree, insertion takes O(log n) time because we need to traverse the height of the tree."
    }
  ],
  "subject": "Computer Science",
  "topic": "Data Structures",
  "difficulty": "medium",
  "count": 1,
  "generated": true,
  "provider": "gemini",
  "generationTime": 2450,
  "success": true
}
```

**Error Responses:**

**Rate Limit Exceeded (429):**
```json
{
  "error": "Rate limit exceeded. 0 requests remaining. Try again in 45 seconds.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryable": true
}
```

**Validation Error (400):**
```json
{
  "error": "Subject is required and must be a non-empty string",
  "code": "VALIDATION_ERROR",
  "retryable": false
}
```

**Provider Failure (500):**
```json
{
  "error": "All AI providers failed. Please check your API keys and try again.",
  "code": "ALL_PROVIDERS_FAILED",
  "retryable": true,
  "suggestedProvider": "groq"
}
```

## Security Features

- **API Key Handling**: Keys are validated at runtime but never stored
- **Rate Limiting**: Prevents abuse with per-user request limits
- **Input Sanitization**: All inputs are validated and sanitized
- **Error Handling**: Sensitive information is never exposed in error messages
- **HTTPS Only**: All communications must use HTTPS in production

## Supported AI Providers

### Gemini (Google)
- Provider ID: `gemini`
- Requires: Google AI API key
- Model: gemini-pro

### Groq
- Provider ID: `groq`
- Requires: Groq API key
- Model: llama3-8b-8192 or similar

### Cerebras
- Provider ID: `cerebras`
- Requires: Cerebras API key
- Model: llama3.1-8b

### OpenRouter
- Provider ID: `openrouter`
- Requires: OpenRouter API key
- Supports multiple models through unified API

## Question Format

All generated questions follow this exact structure:

```json
{
  "question": "Clear, concise question text ending with a question mark",
  "options": {
    "A": "First option text",
    "B": "Second option text",
    "C": "Third option text",
    "D": "Fourth option text"
  },
  "correctAnswer": "A" | "B" | "C" | "D",
  "explanation": "Brief explanation of why the answer is correct"
}
```

## Rate Limiting

- **Limit**: 30 requests per minute per user
- **Window**: 60 seconds
- **Reset**: Automatic reset after window expires
- **Headers**: Rate limit information is not exposed (security measure)

## Error Handling

The system includes comprehensive error handling:

- **Network Errors**: Automatic retry with different providers
- **Invalid Responses**: JSON validation and schema checking
- **API Key Issues**: Clear error messages without exposing keys
- **Timeout Handling**: 45-second timeout per provider request
- **Graceful Degradation**: Falls back to alternative providers

## Question Count Guarantee

The system now guarantees that you receive the exact number of questions requested:

- **Enhanced Prompts**: AI prompts are more explicit about generating exact counts
- **Follow-up Requests**: If AI generates fewer questions, the system automatically makes follow-up requests
- **Question Deduplication**: Follow-up requests exclude already generated questions
- **Provider Failover**: If one provider can't deliver, others are tried automatically

### Example Behavior

**Request**: 10 questions  
**AI Response**: 3 questions generated  
**System Action**: Makes follow-up request for 7 more questions  
**Final Result**: 10 questions delivered

## Troubleshooting

### Common Issues

**"Getting fewer questions than requested"**
- **Cause**: AI providers may have token limits or may not follow exact count instructions
- **Solution**: System now automatically makes follow-up requests to get remaining questions
- **Fallback**: If follow-up fails, tries next AI provider

**"Questions seem repetitive"**
- **Cause**: AI generating similar questions in follow-up requests
- **Solution**: Follow-up prompts explicitly exclude previously generated questions

**"Generation takes longer than expected"**
- **Cause**: Multiple requests needed to reach desired question count
- **Solution**: This is normal behavior - the system prioritizes quality and completeness

## Integration Example

```javascript
// Frontend integration example
const generateQuiz = async (params) => {
  try {
    const response = await fetch('/api/quiz/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        subject: params.subject,
        topic: params.topic,
        difficulty: params.difficulty,
        count: params.count,
        apiKeys: userApiKeys, // Never store these on frontend
        preferredProvider: params.preferredProvider
      })
    });

    const result = await response.json();

    if (result.success) {
      // Use generated questions
      displayQuestions(result.questions);
    } else {
      // Handle error
      showError(result.error, result.retryable);
    }
  } catch (error) {
    showError('Network error occurred', true);
  }
};
```

## Best Practices

1. **API Key Management**: Store keys securely and rotate regularly
2. **Error Handling**: Always check `success` field and handle errors gracefully
3. **Rate Limiting**: Respect rate limits and implement client-side throttling
4. **User Feedback**: Provide clear feedback for all error conditions
5. **Fallback UI**: Have fallback content ready if AI generation fails
6. **Validation**: Validate all inputs before sending to API
7. **Security**: Never log or expose API keys in client-side code

## Troubleshooting

### Common Issues

**"All AI providers failed"**
- Check API keys are valid and have sufficient credits
- Verify network connectivity
- Try different providers

**"Rate limit exceeded"**
- Wait for the rate limit window to reset
- Implement exponential backoff for retries
- Consider upgrading API plans for higher limits

**"Invalid quiz format"**
- This is usually a temporary AI provider issue
- Try again with a different provider
- Check if the topic is too specific or complex

### Debug Mode

Enable debug logging by setting environment variable:
```bash
DEBUG=quiz-generator npm start
```