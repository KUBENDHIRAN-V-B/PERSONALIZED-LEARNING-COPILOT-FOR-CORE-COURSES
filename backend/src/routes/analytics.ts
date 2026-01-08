import { Router, Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// In-memory storage for sessions (replace with MongoDB in production)
interface StudySession {
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

interface TopicMastery {
  topic: string;
  mastery: number;
  sessionsCount: number;
  lastStudied: Date;
}

// Store sessions per user
const userSessions: Map<string, StudySession[]> = new Map();
const userMastery: Map<string, Map<string, TopicMastery>> = new Map();
const activeTimers: Map<string, { startTime: Date; topic: string; courseId: string }> = new Map();

interface UserPreferences {
  peakFocusTime: { startHour: number; endHour: number } | null;
  optimalDuration: number | null; // in minutes
  masteryGoals: { [topic: string]: number }; // Custom goals per topic
}
const userPreferences: Map<string, UserPreferences> = new Map();

// Analytics data storage
interface AnalyticsSession {
  userId: string;
  courseId: string;
  duration: number;
  conceptsCovered: string[];
  accuracy: number;
  timestamp: Date;
}
const analyticsData: AnalyticsSession[] = [];

const getUserSessions = (userId: string): StudySession[] => {
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

const getUserMastery = (userId: string): Map<string, TopicMastery> => {
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

// Calculate personalized insights based on real user data
router.get('/insights', (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.userId;
    const sessions = getUserSessions(userId);
    const mastery = getUserMastery(userId);

    if (!sessions || !mastery) {
      return res.status(500).json({ error: 'Failed to retrieve user data' });
    }

    // Find weakest topic
    let weakestTopic = { topic: 'trees', mastery: 100 };
    mastery.forEach((data, topic) => {
      if (data.mastery < weakestTopic.mastery) {
        weakestTopic = { topic, mastery: data.mastery };
      }
    });

    // Calculate optimal study time based on session focus scores OR user preference
    const prefs = userPreferences.get(userId);
    let peakHour = 9;
    let peakScore = 78;
    let isCustomTime = false;

    if (prefs?.peakFocusTime) {
      // Use user's custom preference
      peakHour = prefs.peakFocusTime.startHour;
      peakScore = 85; // Assume high focus for user-selected time
      isCustomTime = true;
    } else {
      // Calculate from session data
      const hourlyFocus: { [hour: number]: { total: number; count: number } } = {};
      sessions.forEach(session => {
        const hour = new Date(session.startTime).getHours();
        if (!hourlyFocus[hour]) hourlyFocus[hour] = { total: 0, count: 0 };
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
    const formatHour = (h: number) => {
      const hour12 = h % 12 || 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      return `${hour12} ${ampm}`;
    };
    const endHour = prefs?.peakFocusTime?.endHour || peakHour + 2;
    const peakTimeRange = `${formatHour(peakHour)} - ${formatHour(endHour)}`;

    // Calculate optimal session duration
    const durationPerformance: { [range: string]: { accuracy: number; count: number } } = {
      'short': { accuracy: 0, count: 0 },  // < 30 min
      'medium': { accuracy: 0, count: 0 }, // 30-60 min
      'long': { accuracy: 0, count: 0 }    // > 60 min
    };

    sessions.forEach(session => {
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
    mastery.forEach(data => {
      totalMastery += data.mastery;
      topicCount += 1;
    });
    const learningScore = Math.round(totalMastery / topicCount);

    // Calculate weekly improvement
    const weekAgo = Date.now() - 7 * 86400000;
    const thisWeekSessions = sessions.filter(s => new Date(s.startTime).getTime() > weekAgo);
    const weeklyImprovement = thisWeekSessions.length * 2; // Simplified calculation

    // Get all mastery data for the chart
    const masteryList = Array.from(mastery.entries()).map(([topic, data]) => ({
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
      recentSessions: sessions.slice(-5).reverse(),
      totalSessions: sessions.length,
      totalStudyTime: sessions.reduce((acc, s) => acc + s.duration, 0),
    });
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

// Set user's preferred peak focus time
router.post('/preferences/focus-time', (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.userId;
    const { startHour, endHour } = req.body;

    if (startHour === undefined || endHour === undefined || startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
      return res.status(400).json({ error: 'Invalid hour values. Must be 0-23.' });
    }

    let prefs = userPreferences.get(userId);
    if (!prefs) {
      prefs = { peakFocusTime: null, optimalDuration: null, masteryGoals: {} };
    }
    prefs.peakFocusTime = { startHour, endHour };
    userPreferences.set(userId, prefs);

    const formatHour = (h: number) => {
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
  } catch (error) {
    console.error('Failed to save focus time:', error);
    res.status(500).json({ error: 'Failed to save preference' });
  }
});

// Set mastery goal for a topic
router.post('/preferences/mastery-goal', (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.userId;
    const { topic, goal } = req.body;

    if (!topic || goal === undefined || goal < 0 || goal > 100) {
      return res.status(400).json({ error: 'Invalid topic or goal. Goal must be between 0 and 100' });
    }

    let prefs = userPreferences.get(userId);
    if (!prefs) {
      prefs = { peakFocusTime: null, optimalDuration: null, masteryGoals: {} };
    }
    prefs.masteryGoals[topic] = goal;
    userPreferences.set(userId, prefs);

    res.json({
      message: 'Mastery goal saved',
      topic,
      goal,
    });
  } catch (error) {
    console.error('Failed to save mastery goal:', error);
    res.status(500).json({ error: 'Failed to save mastery goal' });
  }
});

// Clear custom focus time (revert to auto-calculated)
router.delete('/preferences/focus-time', (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.userId;
    const prefs = userPreferences.get(userId);
    if (prefs) {
      prefs.peakFocusTime = null;
      userPreferences.set(userId, prefs);
    }
    res.json({ message: 'Focus time preference cleared. Will use auto-calculated value.' });
  } catch (error) {
    console.error('Failed to clear preference:', error);
    res.status(500).json({ error: 'Failed to clear preference' });
  }
});

// Start a study timer
router.post('/timer/start', (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.userId;
    const { topic, courseId } = req.body;

    if (!topic || !courseId) {
      return res.status(400).json({ error: 'Missing required fields: topic, courseId' });
    }

    if (activeTimers.has(userId)) {
      return res.status(400).json({ error: 'Timer already running' });
    }

    activeTimers.set(userId, {
      startTime: new Date(),
      topic: topic || 'general',
      courseId: courseId || 'dsa',
    });

    res.json({ 
      message: 'Timer started',
      startTime: new Date(),
      topic,
    });
  } catch (error) {
    console.error('Failed to start timer:', error);
    res.status(500).json({ error: 'Failed to start timer' });
  }
});

// Stop timer and log session
router.post('/timer/stop', (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.userId;
    const { accuracy, focusScore } = req.body;

    if (accuracy === undefined || focusScore === undefined) {
      return res.status(400).json({ error: 'Missing required fields: accuracy, focusScore' });
    }

    const timer = activeTimers.get(userId);
    if (!timer) {
      return res.status(400).json({ error: 'No active timer' });
    }

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - timer.startTime.getTime()) / 60000);

    const session: StudySession = {
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

    const sessions = getUserSessions(userId);
    sessions.push(session);

    const mastery = getUserMastery(userId);
    const topicKey = timer.topic.toLowerCase().replace(/\s+/g, '-');
    let topicMastery = mastery.get(topicKey);
    
    if (!topicMastery) {
      topicMastery = { topic: topicKey, mastery: 0, sessionsCount: 0, lastStudied: new Date() };
      mastery.set(topicKey, topicMastery);
    }
    
    const masteryIncrease = Math.min(10, Math.round((accuracy || 75) / 10) + 2);
    topicMastery.mastery = Math.min(100, topicMastery.mastery + masteryIncrease);
    topicMastery.sessionsCount += 1;
    topicMastery.lastStudied = endTime;

    activeTimers.delete(userId);

    res.json({
      message: 'Session completed',
      session,
      duration,
      masteryIncrease,
      updatedMastery: topicMastery.mastery,
    });
  } catch (error) {
    console.error('Timer stop error:', error);
    res.status(500).json({ error: 'Failed to stop timer' });
  }
});

// Get active timer status
router.get('/timer/status', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId || 'demo-user';
    const timer = activeTimers.get(userId);

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
  } catch (error) {
    console.error('Failed to get timer status:', error);
    res.status(500).json({ error: 'Failed to get timer status' });
  }
});

// Update topic mastery after practice
router.post('/mastery/update', (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.userId;
    const { topic, score, timeSpent } = req.body;

    if (!topic || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields: topic, score' });
    }

    const mastery = getUserMastery(userId);
    const topicKey = topic.toLowerCase().replace(/\s+/g, '-');
    
    let topicMastery = mastery.get(topicKey);
    if (!topicMastery) {
      topicMastery = { topic: topicKey, mastery: 0, sessionsCount: 0, lastStudied: new Date() };
      mastery.set(topicKey, topicMastery);
    }

    const improvement = Math.round((score / 100) * 5);
    topicMastery.mastery = Math.min(100, topicMastery.mastery + improvement);
    topicMastery.sessionsCount += 1;
    topicMastery.lastStudied = new Date();

    res.json({
      topic: topicKey,
      newMastery: topicMastery.mastery,
      improvement,
      message: 'Mastery updated successfully',
    });
  } catch (error) {
    console.error('Mastery update error:', error);
    res.status(500).json({ error: 'Failed to update mastery' });
  }
});

// Get user analytics
router.get('/dashboard', (req: AuthRequest, res: Response) => {
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
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get exam readiness
router.get('/exam-readiness/:courseId', (req: AuthRequest, res: Response) => {
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
  } catch (error) {
    console.error('Failed to fetch exam readiness:', error);
    res.status(500).json({ error: 'Failed to fetch exam readiness' });
  }
});

// Log session
router.post('/session', (req: AuthRequest, res: Response) => {
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

    analyticsData.push(session);

    res.json({ message: 'Session logged', session });
  } catch (error) {
    console.error('Failed to log session:', error);
    res.status(500).json({ error: 'Failed to log session' });
  }
});

// Get performance metrics
router.get('/performance/:courseId', (req: AuthRequest, res: Response) => {
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
  } catch (error) {
    console.error('Failed to fetch performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

export default router;
