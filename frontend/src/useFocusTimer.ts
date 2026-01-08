import { useEffect, useRef, useState, useCallback } from 'react';

interface FocusTimerState {
  totalTime: number;
  activeTime: number;
  focusScore: number;
  isActive: boolean;
}

const INACTIVITY_THRESHOLD = 5000;

export const useFocusTimer = () => {
  const [state, setState] = useState<FocusTimerState>({
    totalTime: 0,
    activeTime: 0,
    focusScore: 0,
    isActive: true,
  });

  const timerRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());
  const isVisibleRef = useRef<boolean>(true);

  const updateFocusScore = useCallback((active: number, total: number) => {
    const score = total > 0 ? Math.round((active / total) * 100) : 0;
    setState(prev => ({ ...prev, focusScore: Math.min(score, 100) }));
  }, []);

  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      setState(prev => ({ ...prev, isActive: true }));
    };

    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      if (!document.hidden) {
        lastActivityRef.current = Date.now();
      }
    };

    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('keydown', handleActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    timerRef.current = setInterval(() => {
      setState(prev => {
        const newTotal = prev.totalTime + 1;
        const timeSinceActivity = Date.now() - lastActivityRef.current;
        const isCurrentlyActive = isVisibleRef.current && timeSinceActivity < INACTIVITY_THRESHOLD;
        const newActive = isCurrentlyActive ? prev.activeTime + 1 : prev.activeTime;

        updateFocusScore(newActive, newTotal);

        return {
          ...prev,
          totalTime: newTotal,
          activeTime: newActive,
          isActive: isCurrentlyActive,
        };
      });
    }, 1000);

    return () => {
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [updateFocusScore]);

  const reset = useCallback(() => {
    setState({ totalTime: 0, activeTime: 0, focusScore: 0, isActive: true });
    lastActivityRef.current = Date.now();
  }, []);

  return { ...state, reset };
};
