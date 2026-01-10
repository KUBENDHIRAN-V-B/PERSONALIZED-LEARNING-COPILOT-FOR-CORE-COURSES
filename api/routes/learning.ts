import { Router, Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Mock learning profiles
const learningProfiles: any[] = [];

// Get learning profile
router.get('/profile', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    let profile = learningProfiles.find(p => p.userId === userId);

    if (!profile) {
      profile = {
        userId,
        learningStyle: 'mixed',
        preferredPace: 'normal',
        weakAreas: [],
        strongAreas: [],
        masteryScores: {},
        sessionMetrics: {
          avgSessionDuration: 0,
          sessionsPerWeek: 0,
          engagementScore: 0,
        },
      };
      learningProfiles.push(profile);
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update learning profile
router.put('/profile', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { learningStyle, preferredPace } = req.body;

    let profile = learningProfiles.find(p => p.userId === userId);

    if (!profile) {
      profile = {
        userId,
        learningStyle: learningStyle || 'mixed',
        preferredPace: preferredPace || 'normal',
        weakAreas: [],
        strongAreas: [],
        masteryScores: {},
        sessionMetrics: {
          avgSessionDuration: 0,
          sessionsPerWeek: 0,
          engagementScore: 0,
        },
      };
      learningProfiles.push(profile);
    } else {
      if (learningStyle) profile.learningStyle = learningStyle;
      if (preferredPace) profile.preferredPace = preferredPace;
    }

    res.json({ message: 'Profile updated', profile });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get mastery scores
router.get('/mastery/:courseId', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { courseId } = req.params;

    const profile = learningProfiles.find(p => p.userId === userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const masteryScores = profile.masteryScores[courseId] || {};

    res.json({
      courseId,
      masteryScores,
      overallMastery: calculateOverallMastery(masteryScores),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mastery scores' });
  }
});

// Update mastery score
router.post('/mastery/:courseId/:concept', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { courseId, concept } = req.params;
    const { score } = req.body;

    let profile = learningProfiles.find(p => p.userId === userId);

    if (!profile) {
      profile = {
        userId,
        learningStyle: 'mixed',
        preferredPace: 'normal',
        weakAreas: [],
        strongAreas: [],
        masteryScores: {},
        sessionMetrics: {
          avgSessionDuration: 0,
          sessionsPerWeek: 0,
          engagementScore: 0,
        },
      };
      learningProfiles.push(profile);
    }

    if (!profile.masteryScores[courseId]) {
      profile.masteryScores[courseId] = {};
    }

    profile.masteryScores[courseId][concept] = score;

    res.json({
      message: 'Mastery score updated',
      concept,
      score,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update mastery score' });
  }
});

// Get learning path
router.get('/path/:courseId', (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;

    const learningPaths: { [key: string]: any } = {
      dsa: {
        basics: ['Arrays', 'Linked Lists', 'Complexity Analysis'],
        core: ['Stacks', 'Queues', 'Trees', 'Graphs'],
        advanced: ['Dynamic Programming', 'Greedy Algorithms'],
      },
      dbms: {
        basics: ['SQL Basics', 'Tables', 'Queries'],
        core: ['Normalization', 'Indexing', 'Transactions'],
        advanced: ['Query Optimization', 'Distributed Databases'],
      },
    };

    const path = learningPaths[courseId.toLowerCase()] || {
      basics: [],
      core: [],
      advanced: [],
    };

    res.json({
      courseId,
      learningPath: path,
      estimatedCompletionWeeks: 8,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch learning path' });
  }
});

function calculateOverallMastery(scores: { [key: string]: number }): number {
  const values = Object.values(scores);
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export default router;
