"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inputValidation_1 = require("../middleware/inputValidation");
const quizStore_1 = require("../stores/quizStore");
const quizGenerator_1 = require("../services/quizGenerator");
// Middleware to validate API keys for quiz routes
const validateQuizApiKeys = (req, res, next) => {
    try {
        const { apiKeys } = req.body;
        if (apiKeys) {
            const keysValidation = (0, inputValidation_1.validateApiKeysRuntime)(apiKeys);
            if (!keysValidation.valid) {
                return res.status(400).json({ error: keysValidation.error });
            }
            req.validatedApiKeys = keysValidation.keys;
        }
        next();
    }
    catch (error) {
        console.error('API key validation error:', error);
        res.status(400).json({ error: 'Invalid API keys format' });
    }
};
const router = (0, express_1.Router)();
router.post('/start', async (req, res) => {
    try {
        const userId = req.userId || 'demo-user';
        const { topic, difficulty, questionCount, courseId, useAI = false, apiKeys } = req.body;
        console.log('Quiz start request:', { userId, topic, difficulty, questionCount, courseId, useAI });
        if (!topic || !difficulty) {
            return res.status(400).json({ error: 'Missing required fields: topic, difficulty' });
        }
        // If AI generation requested, validate API keys
        if (useAI) {
            const apiKeysValidation = (0, inputValidation_1.validateApiKeysRuntime)(apiKeys);
            if (!apiKeysValidation.valid) {
                return res.status(400).json({ error: apiKeysValidation.error || 'Valid API keys required for AI-generated quizzes' });
            }
            req.validatedApiKeys = apiKeysValidation.keys;
        }
        const { session, firstQuestion } = (0, quizStore_1.createQuizSession)({
            userId,
            courseId: courseId || 'general',
            topic,
            baseDifficulty: difficulty,
            questionCount: Number(questionCount) || 5,
            useAI,
        });
        console.log('Quiz session created:', { sessionId: session.id, topicKey: session.topicKey, useAI });
        return res.json({
            sessionId: session.id,
            topic: session.topic,
            baseDifficulty: session.baseDifficulty,
            totalQuestions: session.targetCount,
            question: firstQuestion,
            progress: { current: 0, total: session.targetCount },
            useAI,
        });
    }
    catch (error) {
        console.error('Quiz start error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to start quiz';
        return res.status(500).json({ error: errorMessage });
    }
});
router.post('/answer', (req, res) => {
    try {
        const userId = req.userId || 'demo-user';
        const { sessionId, questionId, selectedIndex } = req.body;
        if (!sessionId || !questionId || selectedIndex === undefined) {
            return res.status(400).json({ error: 'Missing required fields: sessionId, questionId, selectedIndex' });
        }
        const result = (0, quizStore_1.submitAnswerAndAdvance)({
            sessionId,
            userId,
            questionId,
            selectedIndex: Number(selectedIndex),
        });
        return res.json(result);
    }
    catch (error) {
        console.error('Quiz answer error:', error);
        return res.status(500).json({ error: 'Failed to submit answer' });
    }
});
router.post('/finish', (req, res) => {
    try {
        const userId = req.userId || 'demo-user';
        const { sessionId, timeSpentSeconds } = req.body;
        if (!sessionId)
            return res.status(400).json({ error: 'Missing required field: sessionId' });
        const result = (0, quizStore_1.finalizeQuiz)({
            sessionId,
            userId,
            timeSpentSeconds: Number(timeSpentSeconds) || 0,
        });
        return res.json(result);
    }
    catch (error) {
        console.error('Quiz finish error:', error);
        return res.status(500).json({ error: 'Failed to finish quiz' });
    }
});
router.get('/history', (req, res) => {
    try {
        const userId = req.userId || 'demo-user';
        return res.json({ quizzes: (0, quizStore_1.getQuizHistory)(userId) });
    }
    catch (error) {
        console.error('Quiz history error:', error);
        return res.status(500).json({ error: 'Failed to fetch quiz history' });
    }
});
router.get('/session/:sessionId', (req, res) => {
    try {
        const userId = req.userId || 'demo-user';
        const { sessionId } = req.params;
        const session = (0, quizStore_1.getQuizSession)(sessionId);
        if (!session)
            return res.status(404).json({ error: 'Session not found' });
        if (session.userId !== userId)
            return res.status(403).json({ error: 'Forbidden' });
        return res.json({
            sessionId: session.id,
            topic: session.topic,
            baseDifficulty: session.baseDifficulty,
            currentDifficulty: session.currentDifficulty,
            progress: { current: session.currentIndex, total: session.targetCount },
            completed: session.completed,
        });
    }
    catch (error) {
        console.error('Quiz session error:', error);
        return res.status(500).json({ error: 'Failed to fetch session' });
    }
});
router.post('/generate', async (req, res) => {
    try {
        const userId = req.userId || 'demo-user';
        const { subject, topic, difficulty, count = 5, apiKeys, preferredProvider } = req.body;
        if (!subject || !topic || !difficulty) {
            return res.status(400).json({
                error: 'Missing required fields: subject, topic, difficulty'
            });
        }
        // Validate API keys
        const apiKeysValidation = (0, inputValidation_1.validateApiKeysRuntime)(apiKeys);
        if (!apiKeysValidation.valid) {
            return res.status(400).json({
                error: apiKeysValidation.error || 'Valid API keys required for AI-generated quizzes'
            });
        }
        // Prepare the quiz generation request
        const quizRequest = {
            subject,
            topic,
            difficulty,
            count: Math.min(Math.max(count, 1), 50), // Clamp between 1-50
            apiKeys: apiKeysValidation.keys,
            preferredProvider: preferredProvider,
        };
        // Generate quiz questions using the dedicated service
        const result = await (0, quizGenerator_1.generateQuizQuestions)(quizRequest, userId);
        if (!result.success) {
            // Type assertion since we know it's an error when success is false
            const errorResult = result;
            const statusCode = errorResult.code === 'RATE_LIMIT_EXCEEDED' ? 429 :
                errorResult.code === 'VALIDATION_ERROR' ? 400 : 500;
            return res.status(statusCode).json({
                error: errorResult.error,
                code: errorResult.code,
                retryable: errorResult.retryable,
                suggestedProvider: errorResult.suggestedProvider
            });
        }
        // Transform questions to match the expected format for the quiz store
        const formattedQuestions = result.questions.map((q, index) => ({
            id: `ai-${Date.now()}-${index}`,
            topicKey: topic.toLowerCase().replace(/\s+/g, '-'),
            difficulty: difficulty,
            question: q.question,
            options: [q.options.A, q.options.B, q.options.C, q.options.D],
            correctIndex: q.correctAnswer === 'A' ? 0 :
                q.correctAnswer === 'B' ? 1 :
                    q.correctAnswer === 'C' ? 2 : 3,
            explanation: q.explanation,
        }));
        return res.json({
            questions: formattedQuestions,
            subject,
            topic,
            difficulty,
            count: formattedQuestions.length,
            generated: true,
            provider: result.provider,
            generationTime: result.generationTime,
            success: true,
        });
    }
    catch (error) {
        console.error('AI quiz generation error:', error);
        return res.status(500).json({
            error: 'Failed to generate quiz questions with AI',
            code: 'INTERNAL_ERROR',
            retryable: true
        });
    }
});
exports.default = router;
//# sourceMappingURL=quiz.js.map