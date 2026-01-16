"use strict";
/**
 * AI Quiz Generation Service
 *
 * Secure, provider-agnostic quiz generation using user-provided API keys.
 * Features:
 * - Dynamic prompt construction
 * - Multi-provider support with failover
 * - Comprehensive error handling
 * - Rate limiting and security
 * - JSON schema validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuizQuestions = generateQuizQuestions;
const aiProvider_1 = require("./aiProvider");
// Rate limiting store (in-memory, per user)
const userRateLimits = new Map();
const RATE_LIMIT_REQUESTS = 30; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
/**
 * Check and update rate limit for a user
 */
function checkRateLimit(userId) {
    const now = Date.now();
    const userLimit = userRateLimits.get(userId);
    if (!userLimit || now > userLimit.resetTime) {
        // Reset or initialize rate limit
        userRateLimits.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return { allowed: true, remaining: RATE_LIMIT_REQUESTS - 1, resetIn: RATE_LIMIT_WINDOW };
    }
    if (userLimit.count >= RATE_LIMIT_REQUESTS) {
        const resetIn = userLimit.resetTime - now;
        return { allowed: false, remaining: 0, resetIn };
    }
    userLimit.count++;
    return {
        allowed: true,
        remaining: RATE_LIMIT_REQUESTS - userLimit.count,
        resetIn: userLimit.resetTime - now
    };
}
/**
 * Validate quiz generation inputs
 */
function validateInputs(request) {
    const { subject, topic, difficulty, count, apiKeys } = request;
    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
        return { valid: false, error: 'Subject is required and must be a non-empty string' };
    }
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
        return { valid: false, error: 'Topic is required and must be a non-empty string' };
    }
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
        return { valid: false, error: 'Difficulty must be one of: easy, medium, hard' };
    }
    if (!Number.isInteger(count) || count < 1 || count > 50) {
        return { valid: false, error: 'Question count must be an integer between 1 and 50' };
    }
    if (!Array.isArray(apiKeys) || apiKeys.length === 0) {
        return { valid: false, error: 'At least one API key is required' };
    }
    // Validate API keys format
    for (const keyData of apiKeys) {
        if (!keyData.key || !keyData.provider) {
            return { valid: false, error: 'Each API key must have a key and provider' };
        }
    }
    return { valid: true };
}
/**
 * Construct the AI prompt according to specifications
 */
function constructPrompt(request) {
    const { subject, topic, difficulty, count } = request;
    return `Generate exactly ${count} multiple-choice questions on the topic "${topic}" from the subject "${subject}".
Difficulty level: ${difficulty}.

IMPORTANT: You must generate exactly ${count} questions. Do not generate fewer or more.

Each question must include:
- One clear question
- Four distinct answer options labeled A, B, C, and D
- Exactly one correct answer
- A short explanation for why the answer is correct

Return the response in valid JSON only, using this format:

{
  "questions": [
    {
      "question": "",
      "options": {
        "A": "",
        "B": "",
        "C": "",
        "D": ""
      },
      "correctAnswer": "A | B | C | D",
      "explanation": ""
    }
  ]
}

Generate exactly ${count} questions in the array. The questions array must contain exactly ${count} items.`;
}
/**
 * Validate AI response against expected schema
 */
function validateQuizResponse(response) {
    try {
        if (!response || typeof response !== 'object') {
            return { valid: false, error: 'Response is not a valid object' };
        }
        if (!Array.isArray(response.questions)) {
            return { valid: false, error: 'Response missing questions array' };
        }
        const questions = [];
        for (let i = 0; i < response.questions.length; i++) {
            const q = response.questions[i];
            if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) {
                return { valid: false, error: `Question ${i + 1}: missing or invalid question text` };
            }
            if (!q.options || typeof q.options !== 'object') {
                return { valid: false, error: `Question ${i + 1}: missing or invalid options object` };
            }
            const { A, B, C, D } = q.options;
            if (!A || !B || !C || !D) {
                return { valid: false, error: `Question ${i + 1}: all four options (A, B, C, D) are required` };
            }
            if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
                return { valid: false, error: `Question ${i + 1}: correctAnswer must be A, B, C, or D` };
            }
            if (!q.explanation || typeof q.explanation !== 'string' || q.explanation.trim().length === 0) {
                return { valid: false, error: `Question ${i + 1}: missing or invalid explanation` };
            }
            // Check for duplicate options
            const options = [A, B, C, D];
            if (new Set(options).size !== 4) {
                return { valid: false, error: `Question ${i + 1}: all options must be distinct` };
            }
            questions.push({
                question: q.question.trim(),
                options: { A: A.trim(), B: B.trim(), C: C.trim(), D: D.trim() },
                correctAnswer: q.correctAnswer,
                explanation: q.explanation.trim()
            });
        }
        if (questions.length === 0) {
            return { valid: false, error: 'No valid questions found' };
        }
        return { valid: true, questions };
    }
    catch (error) {
        return { valid: false, error: `JSON validation error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
}
/**
 * Generate quiz questions using AI with provider failover
 */
async function generateQuizQuestions(request, userId) {
    const startTime = Date.now();
    // Validate inputs
    const validation = validateInputs(request);
    if (!validation.valid) {
        return {
            success: false,
            error: validation.error,
            code: 'VALIDATION_ERROR',
            retryable: false
        };
    }
    // Check rate limit
    const rateLimit = checkRateLimit(userId);
    if (!rateLimit.allowed) {
        return {
            success: false,
            error: `Rate limit exceeded. ${rateLimit.remaining} requests remaining. Try again in ${Math.ceil(rateLimit.resetIn / 1000)} seconds.`,
            code: 'RATE_LIMIT_EXCEEDED',
            retryable: true
        };
    }
    const prompt = constructPrompt(request);
    // Try providers in order of preference
    const providersToTry = request.preferredProvider
        ? [request.preferredProvider, ...request.apiKeys.filter(k => k.provider !== request.preferredProvider).map(k => k.provider)]
        : request.apiKeys.map(k => k.provider);
    for (const provider of providersToTry) {
        try {
            const apiKeyData = request.apiKeys.find(k => k.provider === provider);
            if (!apiKeyData)
                continue;
            const aiResponse = await (0, aiProvider_1.callAIProvider)({
                message: prompt,
                systemPrompt: 'You are an expert educator creating high-quality quiz questions. Always respond with valid JSON only.',
                history: [],
                apiKey: apiKeyData.key,
                provider: provider,
                timeout: 45000, // 45 second timeout for quiz generation
            }, request.apiKeys);
            if (!aiResponse.success || !aiResponse.content) {
                continue; // Try next provider
            }
            // Parse and validate response
            let parsedResponse;
            try {
                const content = aiResponse.content.trim();
                // Remove markdown code blocks if present
                const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
                parsedResponse = JSON.parse(jsonMatch[1] || content);
            }
            catch (parseError) {
                console.error(`Failed to parse ${provider} response as JSON:`, aiResponse.content);
                continue; // Try next provider
            }
            const validation = validateQuizResponse(parsedResponse);
            if (!validation.valid) {
                console.error(`Invalid quiz format from ${provider}:`, validation.error);
                continue; // Try next provider
            }
            const generatedQuestions = validation.questions;
            const neededQuestions = request.count - generatedQuestions.length;
            // If we got exactly the right number or more, return them
            if (generatedQuestions.length >= request.count) {
                const questions = generatedQuestions.slice(0, request.count);
                return {
                    success: true,
                    questions,
                    provider: aiResponse.provider,
                    generationTime: Date.now() - startTime
                };
            }
            // If we got fewer questions, try to generate more with a follow-up request
            if (generatedQuestions.length > 0 && neededQuestions > 0 && neededQuestions <= request.count) {
                console.log(`Got ${generatedQuestions.length} questions, need ${neededQuestions} more. Making follow-up request.`);
                const followUpPrompt = `Generate exactly ${neededQuestions} more multiple-choice questions on the topic "${request.topic}" from the subject "${request.subject}".
Difficulty level: ${request.difficulty}.

IMPORTANT: Generate exactly ${neededQuestions} additional questions that are different from these existing questions:
${generatedQuestions.map((q, i) => `${i + 1}. ${q.question}`).join('\n')}

Each question must include:
- One clear question
- Four distinct answer options labeled A, B, C, and D
- Exactly one correct answer
- A short explanation for why the answer is correct

Return the response in valid JSON only, using this format:

{
  "questions": [
    {
      "question": "",
      "options": {
        "A": "",
        "B": "",
        "C": "",
        "D": ""
      },
      "correctAnswer": "A | B | C | D",
      "explanation": ""
    }
  ]
}

Generate exactly ${neededQuestions} questions in the array.`;
                try {
                    const followUpResponse = await (0, aiProvider_1.callAIProvider)({
                        message: followUpPrompt,
                        systemPrompt: 'You are an expert educator creating high-quality quiz questions. Always respond with valid JSON only.',
                        history: [],
                        apiKey: apiKeyData.key,
                        provider: provider,
                        timeout: 30000, // Shorter timeout for follow-up
                    }, request.apiKeys);
                    if (followUpResponse.success && followUpResponse.content) {
                        let followUpParsed;
                        try {
                            const content = followUpResponse.content.trim();
                            const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
                            followUpParsed = JSON.parse(jsonMatch[1] || content);
                        }
                        catch (parseError) {
                            console.error(`Failed to parse follow-up ${provider} response as JSON:`, followUpResponse.content);
                        }
                        if (followUpParsed) {
                            const followUpValidation = validateQuizResponse(followUpParsed);
                            if (followUpValidation.valid && followUpValidation.questions) {
                                const additionalQuestions = followUpValidation.questions.slice(0, neededQuestions);
                                const allQuestions = [...generatedQuestions, ...additionalQuestions];
                                if (allQuestions.length >= request.count) {
                                    const questions = allQuestions.slice(0, request.count);
                                    return {
                                        success: true,
                                        questions,
                                        provider: aiResponse.provider,
                                        generationTime: Date.now() - startTime
                                    };
                                }
                            }
                        }
                    }
                }
                catch (followUpError) {
                    console.error(`Follow-up request failed for ${provider}:`, followUpError);
                }
            }
            // If we still don't have enough questions, continue to next provider
            console.log(`Provider ${provider} generated ${generatedQuestions.length} questions, but ${request.count} were requested. Trying next provider.`);
            continue;
        }
        catch (error) {
            console.error(`Error with ${provider}:`, error);
            continue; // Try next provider
        }
    }
    // All providers failed
    return {
        success: false,
        error: 'All AI providers failed. Please check your API keys and try again.',
        code: 'ALL_PROVIDERS_FAILED',
        retryable: true,
        suggestedProvider: request.apiKeys.length > 0 ? request.apiKeys[0].provider : undefined
    };
}
//# sourceMappingURL=quizGenerator.js.map