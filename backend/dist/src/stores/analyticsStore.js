"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTopicMastery = exports.getAnalyticsData = exports.addAnalyticsSession = exports.clearActiveTimer = exports.setActiveTimer = exports.getActiveTimer = exports.setUserPreferences = exports.getUserPreferences = exports.getUserMastery = exports.getUserSessions = exports.normalizeTopicKey = void 0;
// In-memory storage (replace with MongoDB in production)
const userSessions = new Map();
const userMastery = new Map();
const activeTimers = new Map();
const userPreferences = new Map();
const analyticsData = [];
const normalizeTopicKey = (topic) => topic.toLowerCase().trim().replace(/\s+/g, '-');
exports.normalizeTopicKey = normalizeTopicKey;
const getUserSessions = (userId) => {
    if (!userSessions.has(userId)) {
        const demoSessions = [
            { id: '1', userId, courseId: 'dsa', topic: 'arrays', startTime: new Date(Date.now() - 86400000 * 2), duration: 35, accuracy: 82, focusScore: 78 },
            { id: '2', userId, courseId: 'dsa', topic: 'sorting', startTime: new Date(Date.now() - 86400000), duration: 28, accuracy: 90, focusScore: 85 },
            { id: '3', userId, courseId: 'dsa', topic: 'trees', startTime: new Date(Date.now() - 3600000 * 5), duration: 45, accuracy: 45, focusScore: 60 },
            { id: '4', userId, courseId: 'dsa', topic: 'graphs', startTime: new Date(Date.now() - 3600000 * 10), duration: 30, accuracy: 72, focusScore: 75 },
        ];
        userSessions.set(userId, demoSessions);
    }
    return userSessions.get(userId);
};
exports.getUserSessions = getUserSessions;
const getUserMastery = (userId) => {
    if (!userMastery.has(userId)) {
        const masteryData = new Map([
            ['arrays', { topic: 'arrays', mastery: 78, sessionsCount: 8, lastStudied: new Date(Date.now() - 86400000) }],
            ['sorting', { topic: 'sorting', mastery: 92, sessionsCount: 12, lastStudied: new Date(Date.now() - 43200000) }],
            ['trees', { topic: 'trees', mastery: 15, sessionsCount: 1, lastStudied: new Date(Date.now() - 172800000) }],
            ['graphs', { topic: 'graphs', mastery: 58, sessionsCount: 5, lastStudied: new Date(Date.now() - 259200000) }],
            ['linked-lists', { topic: 'linked-lists', mastery: 85, sessionsCount: 10, lastStudied: new Date(Date.now() - 86400000) }],
            ['stacks-queues', { topic: 'stacks-queues', mastery: 88, sessionsCount: 9, lastStudied: new Date(Date.now() - 129600000) }],
            ['recursion', { topic: 'recursion', mastery: 65, sessionsCount: 6, lastStudied: new Date(Date.now() - 216000000) }],
            ['dynamic-programming', { topic: 'dynamic-programming', mastery: 42, sessionsCount: 4, lastStudied: new Date(Date.now() - 345600000) }],
        ]);
        userMastery.set(userId, masteryData);
    }
    return userMastery.get(userId);
};
exports.getUserMastery = getUserMastery;
const getUserPreferences = (userId) => userPreferences.get(userId);
exports.getUserPreferences = getUserPreferences;
const setUserPreferences = (userId, prefs) => userPreferences.set(userId, prefs);
exports.setUserPreferences = setUserPreferences;
const getActiveTimer = (userId) => activeTimers.get(userId);
exports.getActiveTimer = getActiveTimer;
const setActiveTimer = (userId, timer) => activeTimers.set(userId, timer);
exports.setActiveTimer = setActiveTimer;
const clearActiveTimer = (userId) => activeTimers.delete(userId);
exports.clearActiveTimer = clearActiveTimer;
const addAnalyticsSession = (s) => analyticsData.push(s);
exports.addAnalyticsSession = addAnalyticsSession;
const getAnalyticsData = () => analyticsData;
exports.getAnalyticsData = getAnalyticsData;
const updateTopicMastery = (userId, topic, delta) => {
    const mastery = (0, exports.getUserMastery)(userId);
    const topicKey = (0, exports.normalizeTopicKey)(topic);
    let topicMastery = mastery.get(topicKey);
    if (!topicMastery) {
        topicMastery = { topic: topicKey, mastery: 0, sessionsCount: 0, lastStudied: new Date() };
        mastery.set(topicKey, topicMastery);
    }
    topicMastery.mastery = Math.min(100, Math.max(0, topicMastery.mastery + delta));
    topicMastery.sessionsCount += 1;
    topicMastery.lastStudied = new Date();
    return topicMastery;
};
exports.updateTopicMastery = updateTopicMastery;
//# sourceMappingURL=analyticsStore.js.map