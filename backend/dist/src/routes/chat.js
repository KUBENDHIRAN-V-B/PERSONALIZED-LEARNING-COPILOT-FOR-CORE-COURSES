"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = chatRoutes;
const express_1 = require("express");
const inputValidation_1 = require("../middleware/inputValidation");
const security_1 = require("../middleware/security");
const security_2 = require("../middleware/security");
const aiProvider_1 = require("../services/aiProvider");
const keywordMappings = {
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
const knowledgeBase = {
    'hello': 'Welcome to your engineering learning assistant!',
    'help': 'I can help you with engineering topics. Try asking about data structures, algorithms, databases, or other CS concepts.',
    'thanks': 'You\'re welcome! Happy learning!'
};
function findBestMatch(message) {
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
function generateResponse(message, context) {
    const topic = findBestMatch(message);
    if (topic && knowledgeBase[topic]) {
        return knowledgeBase[topic];
    }
    return ''; // Return empty to trigger AI fallback
}
// Preserve markdown formatting, only clean up HTML entities and extra whitespace
function cleanMarkdown(text) {
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
// Build system prompt for course
function buildSystemPrompt(courseName, courseTopics, courseCategory) {
    return "You are an expert AI tutor for " + courseName + ". Focus on engineering education with clear, technical explanations.";
}
function checkKnowledgeBase(message, context) {
    const kbResponse = generateResponse(message, context);
    if (kbResponse) {
        return cleanMarkdown(kbResponse);
    }
    return null;
}
function chatRoutes(io) {
    const router = (0, express_1.Router)();
    const conversationHistories = new Map();
    // Secure chat endpoint with comprehensive validation and security
    router.post('/message', security_1.enforceHTTPS, (0, security_2.limitRequestSize)(1024 * 1024), // 1MB limit
    inputValidation_1.validateChatRequest, async (req, res) => {
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
            // Build system prompt based on course
            const systemPrompt = buildSystemPrompt(courseId || 'General', [], 'CS');
            // Call AI provider with fallback
            const aiResult = await (0, aiProvider_1.callAIProvider)({
                message,
                systemPrompt,
                history,
                apiKey: '', // Will be set by provider
                provider: 'gemini' // Will be overridden
            }, apiKeys);
            if (!aiResult.success) {
                return res.status(500).json({
                    error: aiResult.error || 'All AI providers failed. Please check your API keys.'
                });
            }
            // Store conversation
            if (!conversationHistories.has(convId)) {
                conversationHistories.set(convId, []);
            }
            conversationHistories.get(convId).push({ role: 'user', content: message }, { role: 'assistant', content: aiResult.content || '' });
            res.json({
                response: aiResult.content,
                conversationId: convId,
                provider: aiResult.provider,
                sanitized: aiResult.sanitized,
                source: 'ai'
            });
        }
        catch (error) {
            console.error('Chat error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // Get conversation history
    router.get('/conversations/:courseId', security_1.enforceHTTPS, async (req, res) => {
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
        }
        catch (error) {
            console.error('Failed to fetch conversations:', error);
            res.status(500).json({ error: 'Failed to fetch conversations' });
        }
    });
    return router;
}
//# sourceMappingURL=chat.js.map