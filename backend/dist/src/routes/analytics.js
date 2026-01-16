"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsStore_1 = require("../stores/analyticsStore");
const router = (0, express_1.Router)();
// NOTE: This route uses in-memory stores via `stores/analyticsStore.ts`.
// Calculate personalized insights based on real user data
router.get('/insights', (req, res) => {
    try {
        const userId = 'demo-user'; // Use demo user for unauthenticated access
        const sessions = (0, analyticsStore_1.getUserSessions)(userId);
        const mastery = (0, analyticsStore_1.getUserMastery)(userId);
        // Provide sample data if no real data exists
        let finalMastery = mastery;
        if (!mastery || mastery.size === 0) {
            finalMastery = new Map([
                ['trees', { topic: 'trees', mastery: 65, sessionsCount: 3, lastStudied: new Date() }],
                ['graphs', { topic: 'graphs', mastery: 45, sessionsCount: 2, lastStudied: new Date() }],
                ['dynamic-programming', { topic: 'dynamic-programming', mastery: 30, sessionsCount: 1, lastStudied: new Date() }],
                ['sorting', { topic: 'sorting', mastery: 80, sessionsCount: 5, lastStudied: new Date() }],
                ['searching', { topic: 'searching', mastery: 70, sessionsCount: 4, lastStudied: new Date() }],
            ]);
        }
        // Find weakest topic
        let weakestTopic = { topic: 'trees', mastery: 100 };
        finalMastery.forEach((data, topic) => {
            if (data.mastery < weakestTopic.mastery) {
                weakestTopic = { topic, mastery: data.mastery };
            }
        });
        // Provide sample sessions if no real data exists
        let finalSessions = sessions;
        if (!sessions || sessions.length === 0) {
            finalSessions = [
                {
                    id: '1',
                    userId,
                    courseId: 'dsa',
                    topic: 'trees',
                    startTime: new Date(Date.now() - 86400000),
                    endTime: new Date(Date.now() - 86400000 + 1800000),
                    duration: 30,
                    accuracy: 75,
                    focusScore: 80,
                },
                {
                    id: '2',
                    userId,
                    courseId: 'dsa',
                    topic: 'graphs',
                    startTime: new Date(Date.now() - 172800000),
                    endTime: new Date(Date.now() - 172800000 + 2400000),
                    duration: 40,
                    accuracy: 70,
                    focusScore: 75,
                },
            ];
        }
        const prefs = (0, analyticsStore_1.getUserPreferences)(userId);
        let peakHour = 9;
        let peakScore = 78;
        let isCustomTime = false;
        if (prefs?.peakFocusTime) {
            // Use user's custom preference
            peakHour = prefs.peakFocusTime.startHour;
            peakScore = 85; // Assume high focus for user-selected time
            isCustomTime = true;
        }
        else {
            // Calculate from session data
            const hourlyFocus = {};
            finalSessions.forEach(session => {
                const hour = new Date(session.startTime).getHours();
                if (!hourlyFocus[hour])
                    hourlyFocus[hour] = { total: 0, count: 0 };
                hourlyFocus[hour].total += session.focusScore || 70;
                hourlyFocus[hour].count += 1;
            });
            Object.entries(hourlyFocus).forEach(([hour, data]) => {
                const avg = data.total / data.count;
                if (avg > peakScore) {
                    peakScore = Math.round(avg);
                    peakHour = parseInt(hour);
                }
            });
        }
        // Format time range properly
        const formatHour = (h) => {
            const hour12 = h % 12 || 12;
            const ampm = h < 12 ? 'AM' : 'PM';
            return `${hour12} ${ampm}`;
        };
        const endHour = prefs?.peakFocusTime?.endHour || peakHour + 2;
        const peakTimeRange = `${formatHour(peakHour)} - ${formatHour(endHour)}`;
        // Calculate optimal session duration
        const durationPerformance = {
            'short': { accuracy: 0, count: 0 }, // < 30 min
            'medium': { accuracy: 0, count: 0 }, // 30-60 min
            'long': { accuracy: 0, count: 0 } // > 60 min
        };
        finalSessions.forEach(session => {
            const range = session.duration < 30 ? 'short' : session.duration <= 60 ? 'medium' : 'long';
            durationPerformance[range].accuracy += session.accuracy || 70;
            durationPerformance[range].count += 1;
        });
        let optimalDuration = '30 min';
        let bestAvgAccuracy = 0;
        Object.entries(durationPerformance).forEach(([range, data]) => {
            if (data.count > 0) {
                const avg = data.accuracy / data.count;
                if (avg > bestAvgAccuracy) {
                    bestAvgAccuracy = avg;
                    optimalDuration = range === 'short' ? '20-30 min' : range === 'medium' ? '30-45 min' : '45-60 min';
                }
            }
        });
        // Calculate learning score
        let totalMastery = 0;
        let topicCount = 0;
        finalMastery.forEach(data => {
            totalMastery += data.mastery;
            topicCount += 1;
        });
        const learningScore = topicCount > 0 ? Math.round(totalMastery / topicCount) : 0;
        // Calculate weekly improvement
        const weekAgo = Date.now() - 7 * 86400000;
        const thisWeekSessions = finalSessions.filter(s => new Date(s.startTime).getTime() > weekAgo);
        const weeklyImprovement = thisWeekSessions.length * 2; // Simplified calculation
        // Get all mastery data for the chart
        const masteryList = Array.from(finalMastery.entries()).map(([topic, data]) => ({
            topic: topic.charAt(0).toUpperCase() + topic.slice(1).replace(/-/g, ' '),
            mastery: data.mastery,
            sessionsCount: data.sessionsCount,
            lastStudied: data.lastStudied,
        }));
        const customGoal = prefs?.masteryGoals[weakestTopic.topic] || 80;
        res.json({
            learningScore,
            weeklyImprovement,
            weakestTopic: {
                name: weakestTopic.topic.charAt(0).toUpperCase() + weakestTopic.topic.slice(1).replace('-', ' '),
                mastery: weakestTopic.mastery,
                goal: customGoal,
            },
            peakFocusTime: {
                range: peakTimeRange,
                score: Math.round(peakScore),
                isCustom: isCustomTime,
                startHour: peakHour,
                endHour: endHour,
            },
            optimalDuration: {
                value: optimalDuration,
                avgAccuracy: Math.round(bestAvgAccuracy),
            },
            masteryByTopic: masteryList,
            recentSessions: finalSessions.slice(-5).reverse(),
            totalSessions: finalSessions.length,
            totalStudyTime: finalSessions.reduce((acc, s) => acc + s.duration, 0),
        });
    }
    catch (error) {
        console.error('Insights error:', error);
        res.status(500).json({ error: 'Failed to fetch insights' });
    }
});
// Set user's preferred peak focus time
router.post('/preferences/focus-time', (req, res) => {
    try {
        const userId = 'demo-user'; // Use demo user for unauthenticated access
        const { startHour, endHour } = req.body;
        if (startHour === undefined || endHour === undefined || startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
            return res.status(400).json({ error: 'Invalid hour values. Must be 0-23.' });
        }
        let prefs = (0, analyticsStore_1.getUserPreferences)(userId);
        if (!prefs) {
            prefs = { peakFocusTime: null, optimalDuration: null, masteryGoals: {} };
        }
        prefs.peakFocusTime = { startHour, endHour };
        (0, analyticsStore_1.setUserPreferences)(userId, prefs);
        const formatHour = (h) => {
            const hour12 = h % 12 || 12;
            const ampm = h < 12 ? 'AM' : 'PM';
            return `${hour12} ${ampm}`;
        };
        res.json({
            message: 'Focus time preference saved',
            peakFocusTime: {
                range: `${formatHour(startHour)} - ${formatHour(endHour)}`,
                startHour,
                endHour,
                isCustom: true,
            },
        });
    }
    catch (error) {
        console.error('Failed to save focus time:', error);
        res.status(500).json({ error: 'Failed to save preference' });
    }
});
// Set mastery goal for a topic
router.post('/preferences/mastery-goal', (req, res) => {
    try {
        const userId = 'demo-user'; // Use demo user for unauthenticated access
        const { topic, goal } = req.body;
        if (!topic || goal === undefined || goal < 0 || goal > 100) {
            return res.status(400).json({ error: 'Invalid topic or goal. Goal must be between 0 and 100' });
        }
        let prefs = (0, analyticsStore_1.getUserPreferences)(userId);
        if (!prefs) {
            prefs = { peakFocusTime: null, optimalDuration: null, masteryGoals: {} };
        }
        prefs.masteryGoals[topic] = goal;
        (0, analyticsStore_1.setUserPreferences)(userId, prefs);
        res.json({
            message: 'Mastery goal saved',
            topic,
            goal,
        });
    }
    catch (error) {
        console.error('Failed to save mastery goal:', error);
        res.status(500).json({ error: 'Failed to save mastery goal' });
    }
});
// Clear custom focus time (revert to auto-calculated)
router.delete('/preferences/focus-time', (req, res) => {
    try {
        const userId = 'demo-user'; // Use demo user for unauthenticated access
        const prefs = (0, analyticsStore_1.getUserPreferences)(userId);
        if (prefs) {
            prefs.peakFocusTime = null;
            (0, analyticsStore_1.setUserPreferences)(userId, prefs);
        }
        res.json({ message: 'Focus time preference cleared. Will use auto-calculated value.' });
    }
    catch (error) {
        console.error('Failed to clear preference:', error);
        res.status(500).json({ error: 'Failed to clear preference' });
    }
});
// Start a study timer
router.post('/timer/start', (req, res) => {
    try {
        const userId = 'demo-user'; // Use demo user for unauthenticated access
        const { topic, courseId } = req.body;
        if (!topic || !courseId) {
            return res.status(400).json({ error: 'Missing required fields: topic, courseId' });
        }
        if ((0, analyticsStore_1.getActiveTimer)(userId)) {
            return res.status(400).json({ error: 'Timer already running' });
        }
        (0, analyticsStore_1.setActiveTimer)(userId, {
            startTime: new Date(),
            topic: topic || 'general',
            courseId: courseId || 'dsa',
        });
        res.json({
            message: 'Timer started',
            startTime: new Date(),
            topic,
        });
    }
    catch (error) {
        console.error('Failed to start timer:', error);
        res.status(500).json({ error: 'Failed to start timer' });
    }
});
// Stop timer and log session
router.post('/timer/stop', (req, res) => {
    try {
        const userId = 'demo-user'; // Use demo user for unauthenticated access
        const { accuracy, focusScore } = req.body;
        if (accuracy === undefined || focusScore === undefined) {
            return res.status(400).json({ error: 'Missing required fields: accuracy, focusScore' });
        }
        const timer = (0, analyticsStore_1.getActiveTimer)(userId);
        if (!timer) {
            return res.status(400).json({ error: 'No active timer' });
        }
        const endTime = new Date();
        const duration = Math.round((endTime.getTime() - timer.startTime.getTime()) / 60000);
        const session = {
            id: Date.now().toString(),
            userId,
            courseId: timer.courseId,
            topic: timer.topic,
            startTime: timer.startTime,
            endTime,
            duration,
            accuracy: accuracy || 75,
            focusScore: focusScore || 70,
        };
        const sessions = (0, analyticsStore_1.getUserSessions)(userId);
        sessions.push(session);
        const masteryIncrease = Math.min(10, Math.round((accuracy || 75) / 10) + 2);
        const topicMastery = (0, analyticsStore_1.updateTopicMastery)(userId, timer.topic, masteryIncrease);
        (0, analyticsStore_1.clearActiveTimer)(userId);
        res.json({
            message: 'Session completed',
            session,
            duration,
            masteryIncrease,
            updatedMastery: topicMastery.mastery,
        });
    }
    catch (error) {
        console.error('Timer stop error:', error);
        res.status(500).json({ error: 'Failed to stop timer' });
    }
});
// Get active timer status
router.get('/timer/status', (req, res) => {
    try {
        const userId = 'demo-user'; // Use demo user for unauthenticated access
        const timer = (0, analyticsStore_1.getActiveTimer)(userId);
        if (!timer) {
            return res.json({ active: false });
        }
        const elapsed = Math.round((Date.now() - timer.startTime.getTime()) / 1000);
        res.json({
            active: true,
            startTime: timer.startTime,
            topic: timer.topic,
            courseId: timer.courseId,
            elapsedSeconds: elapsed,
        });
    }
    catch (error) {
        console.error('Failed to get timer status:', error);
        res.status(500).json({ error: 'Failed to get timer status' });
    }
});
// Update topic mastery after practice
router.post('/mastery/update', (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const userId = req.userId;
        const { topic, score, timeSpent } = req.body;
        if (!topic || score === undefined) {
            return res.status(400).json({ error: 'Missing required fields: topic, score' });
        }
        const improvement = Math.round((score / 100) * 5);
        const topicMastery = (0, analyticsStore_1.updateTopicMastery)(userId, topic, improvement);
        res.json({
            topic: (0, analyticsStore_1.normalizeTopicKey)(topic),
            newMastery: topicMastery.mastery,
            improvement,
            message: 'Mastery updated successfully',
        });
    }
    catch (error) {
        console.error('Mastery update error:', error);
        res.status(500).json({ error: 'Failed to update mastery' });
    }
});
// Get user analytics
router.get('/dashboard', (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const analytics = {
            thisWeek: {
                sessions: 12,
                hours: 8.5,
                topicsCovered: 5,
                conceptsMastered: 3,
                accuracy: 78,
            },
            thisMonth: {
                totalTime: 32,
                improvement: 18,
                fastestLearning: 'Sorting (0% → 92%)',
                slowestLearning: 'Trees (8% improvement)',
            },
            recommendations: [
                'Focus on trees (lowest mastery)',
                'You learn best at 9-11 AM (peak focus)',
                '30 min sessions > 2 hour sessions (for you)',
            ],
        };
        res.json(analytics);
    }
    catch (error) {
        console.error('Failed to fetch analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});
// Get exam readiness
router.get('/exam-readiness/:courseId', (req, res) => {
    try {
        const { courseId } = req.params;
        if (!courseId) {
            return res.status(400).json({ error: 'Course ID is required' });
        }
        const readiness = {
            courseId,
            readinessScore: 65,
            predictedScore: 68,
            passingThreshold: 70,
            daysUntilExam: 15,
            recommendations: [
                { area: 'Normalization', pointsGain: 10, timeNeeded: 3 },
                { area: 'Query Optimization', pointsGain: 8, timeNeeded: 2 },
                { area: 'Transactions', pointsGain: 5, timeNeeded: 1.5 },
            ],
        };
        res.json(readiness);
    }
    catch (error) {
        console.error('Failed to fetch exam readiness:', error);
        res.status(500).json({ error: 'Failed to fetch exam readiness' });
    }
});
// Log session
router.post('/session', (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const userId = req.userId;
        const { courseId, duration, conceptsCovered, accuracy } = req.body;
        if (!courseId || !duration || accuracy === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const session = {
            userId,
            courseId,
            duration,
            conceptsCovered,
            accuracy,
            timestamp: new Date(),
        };
        (0, analyticsStore_1.addAnalyticsSession)(session);
        res.json({ message: 'Session logged', session });
    }
    catch (error) {
        console.error('Failed to log session:', error);
        res.status(500).json({ error: 'Failed to log session' });
    }
});
// Get performance metrics
router.get('/performance/:courseId', (req, res) => {
    try {
        const { courseId } = req.params;
        if (!courseId) {
            return res.status(400).json({ error: 'Course ID is required' });
        }
        const metrics = {
            courseId,
            averageAccuracy: 78,
            totalSessionsCompleted: 45,
            totalHoursSpent: 32,
            conceptsLearned: 12,
            conceptsInProgress: 5,
            conceptsNotStarted: 8,
        };
        res.json(metrics);
    }
    catch (error) {
        console.error('Failed to fetch performance metrics:', error);
        res.status(500).json({ error: 'Failed to fetch performance metrics' });
    }
});
exports.default = router;
//# sourceMappingURL=analytics.js.map