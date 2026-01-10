import React, { useState, useEffect, useCallback } from 'react';
import { FiClock, FiZap, FiSun, FiPlay, FiPause, FiX, FiBell, FiCheck, FiEdit2 } from 'react-icons/fi';
import { analyticsAPI } from '../services/api';

interface InsightsData {
  peakFocusTime: {
    range: string;
    score: number;
    isCustom?: boolean;
    startHour?: number;
    endHour?: number;
  };
  optimalDuration: {
    value: string;
    avgAccuracy: number;
  };
  masteryByTopic: Array<{
    topic: string;
    mastery: number;
    sessionsCount: number;
  }>;
}

interface TimerState {
  active: boolean;
  topic: string;
  elapsedSeconds: number;
  startTime?: Date;
}

export const PersonalizedInsights: React.FC = () => {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState<TimerState>({ active: false, topic: '', elapsedSeconds: 0 });
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showFocusTimeModal, setShowFocusTimeModal] = useState(false);
  const [selectedStartHour, setSelectedStartHour] = useState(9);
  const [selectedEndHour, setSelectedEndHour] = useState(11);
  const [selectedTopic, setSelectedTopic] = useState('trees');
  const [reminderSet, setReminderSet] = useState(false);
  const [showReminderToast, setShowReminderToast] = useState(false);

  const fetchInsights = useCallback(async () => {
    try {
      const response = await analyticsAPI.getInsights();
      setInsights(response.data);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
      setInsights({
        peakFocusTime: { range: '9 AM - 11 AM', score: 78, isCustom: false, startHour: 9, endHour: 11 },
        optimalDuration: { value: '30-45 min', avgAccuracy: 75 },
        masteryByTopic: [],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const checkTimerStatus = useCallback(async () => {
    try {
      const response = await analyticsAPI.getTimerStatus();
      if (response?.data?.active) {
        setTimer({
          active: true,
          topic: response.data.topic || '',
          elapsedSeconds: response.data.elapsedSeconds || 0,
          startTime: response.data.startTime ? new Date(response.data.startTime) : undefined,
        });
      }
    } catch (error) {
      console.error('Failed to check timer:', error);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
    checkTimerStatus();
  }, [fetchInsights, checkTimerStatus]);

  useEffect(() => {
    let interval: number | undefined;
    if (timer.active) {
      interval = window.setInterval(() => {
        setTimer(prev => ({
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1,
        }));
      }, 1000);
    }
    return () => {
      if (interval !== undefined) clearInterval(interval);
    };
  }, [timer.active]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = async () => {
    try {
      if (!selectedTopic) return;
      await analyticsAPI.startTimer(selectedTopic, 'dsa');
      setTimer({ active: true, topic: selectedTopic, elapsedSeconds: 0, startTime: new Date() });
      setShowTimerModal(false);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || 'Failed to start timer';
      alert(errorMsg);
    }
  };

  const handleStopTimer = async () => {
    try {
      if (!timer.active) return;
      const focusScore = Math.min(100, 70 + Math.floor(timer.elapsedSeconds / 60));
      const response = await analyticsAPI.stopTimer(75, focusScore);
      if (response?.data) {
        setTimer({ active: false, topic: '', elapsedSeconds: 0 });
        await fetchInsights();
      }
    } catch (error) {
      alert('Failed to complete session. Please try again.');
    }
  };

  const handleSetReminder = () => {
    try {
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            setReminderSet(true);
            setShowReminderToast(true);
            setTimeout(() => setShowReminderToast(false), 3000);
          }
        });
      }
    } catch (error) {
      console.error('Failed to set reminder:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-200 animate-pulse rounded-xl h-24" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showReminderToast && insights?.peakFocusTime?.range && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-in">
          <FiCheck /> Reminder set for {insights.peakFocusTime.range}!
        </div>
      )}

      {timer.active && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white animate-pulse-slow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <FiClock className="text-2xl" />
              </div>
              <div>
                <div className="text-sm opacity-80">Currently Studying</div>
                <div className="text-xl font-bold capitalize">{timer.topic}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-mono font-bold">
                {formatTime(timer.elapsedSeconds)}
              </div>
              <button
                onClick={handleStopTimer}
                className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors"
              >
                <FiPause className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-start gap-4">
          <div className="bg-green-500 w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
            <FiSun className="text-xl" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-gray-900">Peak Focus: {insights?.peakFocusTime.range}</h4>
                {insights?.peakFocusTime.isCustom && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Custom</span>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-gray-900">{insights?.peakFocusTime.range}</div>
                <div className="text-xs text-gray-500">Best Study Time</div>
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-1">
              Your focus score is {insights?.peakFocusTime?.score ?? 78}% during these hours. Schedule important learning sessions then for maximum retention.
            </p>

            <div className="flex items-center gap-4 mt-3">
              <button 
                onClick={() => {
                  if (insights?.peakFocusTime) {
                    setSelectedStartHour(insights.peakFocusTime.startHour || 9);
                    setSelectedEndHour(insights.peakFocusTime.endHour || 11);
                    setShowFocusTimeModal(true);
                  }
                }}
                className="text-sm font-medium text-green-600 hover:text-green-800 transition-colors hover:underline flex items-center gap-1"
              >
                <FiEdit2 className="text-xs" /> {insights?.peakFocusTime?.isCustom ? 'Change Time' : 'Set Your Time'} →
              </button>
              <button 
                onClick={handleSetReminder}
                disabled={reminderSet}
                className={`text-sm font-medium transition-colors flex items-center gap-1 ${reminderSet ? 'text-green-600 cursor-default' : 'text-green-600 hover:text-green-800 hover:underline'}`}
              >
                {reminderSet ? (
                  <><FiCheck className="text-xs" /> Reminder Set!</>
                ) : (
                  <><FiBell className="text-xs" /> Set Reminder →</>
                )}
              </button>
              <button 
                onClick={() => setShowTimerModal(true)}
                disabled={timer.active}
                className={`text-sm font-medium transition-colors flex items-center gap-1 ${timer.active ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:text-green-800 hover:underline'}`}
              >
                <FiPlay className="text-xs" /> {timer.active ? 'Timer Running' : 'Start Timer'} →
              </button>
            </div>
          </div>
        </div>
      </div>

      {showTimerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Start Study Session</h3>
              <button 
                onClick={() => setShowTimerModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FiX />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Topic to Study
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {insights?.masteryByTopic.map((topic, idx) => (
                  <option key={idx} value={topic.topic.toLowerCase().replace(/\s+/g, '-')}>
                    {topic.topic} ({topic.mastery}% mastery)
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-blue-700">
                <FiZap />
                <span className="text-sm font-medium">Recommended: {insights?.optimalDuration.value} session</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Based on your learning patterns, shorter sessions with breaks work best for you.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTimerModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartTimer}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <FiPlay /> Start Timer
              </button>
            </div>
          </div>
        </div>
      )}

      {showFocusTimeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Set Your Peak Focus Time</h3>
              <button 
                onClick={() => setShowFocusTimeModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FiX />
              </button>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">
              Choose the time when you feel most focused and productive.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <select
                  value={selectedStartHour}
                  onChange={(e) => setSelectedStartHour(parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour12 = i % 12 || 12;
                    const ampm = i < 12 ? 'AM' : 'PM';
                    return (
                      <option key={i} value={i}>
                        {hour12}:00 {ampm}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <select
                  value={selectedEndHour}
                  onChange={(e) => setSelectedEndHour(parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour12 = i % 12 || 12;
                    const ampm = i < 12 ? 'AM' : 'PM';
                    return (
                      <option key={i} value={i}>
                        {hour12}:00 {ampm}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFocusTimeModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (selectedEndHour <= selectedStartHour) {
                    alert('End time must be after start time');
                    return;
                  }
                  try {
                    await analyticsAPI.setFocusTime(selectedStartHour, selectedEndHour);
                    setShowFocusTimeModal(false);
                    setReminderSet(false);
                    await fetchInsights();
                  } catch (error) {
                    alert('Failed to save focus time');
                  }
                }}
                disabled={selectedEndHour <= selectedStartHour}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <FiCheck /> Save Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalizedInsights;
