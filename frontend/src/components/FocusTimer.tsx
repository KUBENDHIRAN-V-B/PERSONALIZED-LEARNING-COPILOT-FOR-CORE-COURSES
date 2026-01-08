import React from 'react';
import { FiZap } from 'react-icons/fi';

interface FocusTimerProps {
  totalTime: number;
  activeTime: number;
  focusScore: number;
  isActive: boolean;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getFocusColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export const FocusTimer: React.FC<FocusTimerProps> = ({ totalTime, activeTime, focusScore, isActive }) => {
  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-lg p-3 border ${isActive ? 'border-green-200' : 'border-gray-200'}`}>
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
          <FiZap className={`text-sm ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
        </div>
        <div className="text-xs">
          <div className="text-gray-600">{formatTime(activeTime)}</div>
          <div className={`font-bold ${getFocusColor(focusScore)}`}>{focusScore}%</div>
        </div>
      </div>
    </div>
  );
};
