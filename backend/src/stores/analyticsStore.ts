export interface StudySession {
  id: string;
  userId: string;
  courseId: string;
  topic: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  accuracy?: number;
  focusScore?: number;
}

export interface TopicMastery {
  topic: string;
  mastery: number; // 0-100
  sessionsCount: number;
  lastStudied: Date;
}

export interface UserPreferences {
  peakFocusTime: { startHour: number; endHour: number } | null;
  optimalDuration: number | null; // in minutes
  masteryGoals: { [topic: string]: number }; // Custom goals per topic
}

export interface AnalyticsSession {
  userId: string;
  courseId: string;
  duration: number;
  conceptsCovered: string[];
  accuracy: number;
  timestamp: Date;
}

// In-memory storage (replace with MongoDB in production)
const userSessions: Map<string, StudySession[]> = new Map();
const userMastery: Map<string, Map<string, TopicMastery>> = new Map();
const activeTimers: Map<string, { startTime: Date; topic: string; courseId: string }> = new Map();
const userPreferences: Map<string, UserPreferences> = new Map();
const analyticsData: AnalyticsSession[] = [];

export const normalizeTopicKey = (topic: string) =>
  topic.toLowerCase().trim().replace(/\s+/g, '-');

export const getUserSessions = (userId: string): StudySession[] => {
  if (!userSessions.has(userId)) {
    const demoSessions: StudySession[] = [
      { id: '1', userId, courseId: 'dsa', topic: 'arrays', startTime: new Date(Date.now() - 86400000 * 2), duration: 35, accuracy: 82, focusScore: 78 },
      { id: '2', userId, courseId: 'dsa', topic: 'sorting', startTime: new Date(Date.now() - 86400000), duration: 28, accuracy: 90, focusScore: 85 },
      { id: '3', userId, courseId: 'dsa', topic: 'trees', startTime: new Date(Date.now() - 3600000 * 5), duration: 45, accuracy: 45, focusScore: 60 },
      { id: '4', userId, courseId: 'dsa', topic: 'graphs', startTime: new Date(Date.now() - 3600000 * 10), duration: 30, accuracy: 72, focusScore: 75 },
    ];
    userSessions.set(userId, demoSessions);
  }
  return userSessions.get(userId)!;
};

export const getUserMastery = (userId: string): Map<string, TopicMastery> => {
  if (!userMastery.has(userId)) {
    const masteryData = new Map<string, TopicMastery>([
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
  return userMastery.get(userId)!;
};

export const getUserPreferences = (userId: string) => userPreferences.get(userId);
export const setUserPreferences = (userId: string, prefs: UserPreferences) => userPreferences.set(userId, prefs);

export const getActiveTimer = (userId: string) => activeTimers.get(userId);
export const setActiveTimer = (userId: string, timer: { startTime: Date; topic: string; courseId: string }) =>
  activeTimers.set(userId, timer);
export const clearActiveTimer = (userId: string) => activeTimers.delete(userId);

export const addAnalyticsSession = (s: AnalyticsSession) => analyticsData.push(s);
export const getAnalyticsData = () => analyticsData;

export const updateTopicMastery = (userId: string, topic: string, delta: number) => {
  const mastery = getUserMastery(userId);
  const topicKey = normalizeTopicKey(topic);
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

