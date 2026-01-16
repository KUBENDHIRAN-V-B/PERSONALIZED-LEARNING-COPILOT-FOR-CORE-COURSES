/**
 * Test script for the AI Quiz Generation System
 *
 * This script tests the quiz generation functionality with mock API keys.
 * Run with: npx ts-node test-quiz-generation.ts
 */

import { generateQuizQuestions } from './src/services/quizGenerator';
import { ProviderType } from './src/services/apiKeyManager';

async function testQuizGeneration() {
  console.log('🧪 Testing AI Quiz Generation System...\n');

  // Mock API keys for testing (replace with real keys for actual testing)
  const mockApiKeys = [
    { key: 'mock-gemini-key', provider: 'gemini' as ProviderType },
    { key: 'mock-groq-key', provider: 'groq' as ProviderType },
  ];

  const testCases = [
    {
      name: 'Basic Quiz Generation',
      request: {
        subject: 'Computer Science',
        topic: 'Data Structures',
        difficulty: 'medium' as const,
        count: 3,
        apiKeys: mockApiKeys,
      },
      userId: 'test-user-1',
    },
    {
      name: 'Easy Difficulty Quiz',
      request: {
        subject: 'Mathematics',
        topic: 'Basic Algebra',
        difficulty: 'easy' as const,
        count: 2,
        apiKeys: mockApiKeys,
      },
      userId: 'test-user-2',
    },
    {
      name: 'Hard Difficulty Quiz',
      request: {
        subject: 'Physics',
        topic: 'Quantum Mechanics',
        difficulty: 'hard' as const,
        count: 2,
        apiKeys: mockApiKeys,
      },
      userId: 'test-user-3',
    },
  ];

  for (const testCase of testCases) {
    console.log(`📋 Running test: ${testCase.name}`);
    console.log(`   Subject: ${testCase.request.subject}`);
    console.log(`   Topic: ${testCase.request.topic}`);
    console.log(`   Difficulty: ${testCase.request.difficulty}`);
    console.log(`   Count: ${testCase.request.count}`);

    try {
      const result = await generateQuizQuestions(testCase.request, testCase.userId);

      if (result.success) {
        console.log(`✅ Success! Generated ${result.questions.length} questions`);
        console.log(`   Provider: ${result.provider}`);
        console.log(`   Generation time: ${result.generationTime}ms`);

        // Validate question structure
        result.questions.forEach((q, index) => {
          console.log(`   Question ${index + 1}: ${q.question.substring(0, 50)}...`);
          console.log(`   Options: A) ${q.options.A.substring(0, 30)}... B) ${q.options.B.substring(0, 30)}...`);
          console.log(`   Correct: ${q.correctAnswer}`);
          console.log(`   Explanation: ${q.explanation.substring(0, 50)}...`);
        });
      } else {
        // Type assertion for error case
        const errorResult = result as any;
        console.log(`❌ Failed: ${errorResult.error}`);
        console.log(`   Code: ${errorResult.code}`);
        console.log(`   Retryable: ${errorResult.retryable}`);
      }
    } catch (error) {
      console.log(`💥 Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log(''); // Empty line between tests
  }

  console.log('🎉 Quiz generation testing completed!');
}

// Test input validation
async function testValidation() {
  console.log('🔍 Testing Input Validation...\n');

  const invalidCases = [
    {
      name: 'Missing Subject',
      request: {
        topic: 'Data Structures',
        difficulty: 'medium' as const,
        count: 3,
        apiKeys: [{ key: 'test', provider: 'gemini' as ProviderType }],
      },
      expectedError: 'Subject is required',
    },
    {
      name: 'Invalid Difficulty',
      request: {
        subject: 'CS',
        topic: 'Data Structures',
        difficulty: 'invalid' as any,
        count: 3,
        apiKeys: [{ key: 'test', provider: 'gemini' as ProviderType }],
      },
      expectedError: 'Difficulty must be one of: easy, medium, hard',
    },
    {
      name: 'Count Too High',
      request: {
        subject: 'CS',
        topic: 'Data Structures',
        difficulty: 'medium' as const,
        count: 100,
        apiKeys: [{ key: 'test', provider: 'gemini' as ProviderType }],
      },
      expectedError: 'Question count must be an integer between 1 and 50',
    },
  ];

  for (const testCase of invalidCases) {
    console.log(`📋 Testing validation: ${testCase.name}`);

    try {
      const result = await generateQuizQuestions(testCase.request as any, 'test-user');

      if (!result.success && (result as any).error.includes(testCase.expectedError)) {
        console.log(`✅ Correctly rejected: ${(result as any).error}`);
      } else {
        console.log(`❌ Unexpected result: ${JSON.stringify(result)}`);
      }
    } catch (error) {
      console.log(`💥 Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log('');
  }
}

// Run tests
async function runTests() {
  await testValidation();
  await testQuizGeneration();
}

if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests };