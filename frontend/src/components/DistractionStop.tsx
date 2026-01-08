import React, { useState, useEffect, useCallback } from 'react';
import { FiZap, FiX, FiMoon, FiVolume2, FiVolumeX, FiMaximize, FiMinimize, FiClock, FiTarget } from 'react-icons/fi';

interface DistractionStopProps {
  onFocusModeChange?: (isActive: boolean) => void;
}

export const DistractionStop: React.FC<DistractionStopProps> = ({ onFocusModeChange }) => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusTime, setFocusTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Focus session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isFocusMode) {
      interval = setInterval(() => {
        setFocusTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFocusMode]);

  // Handle fullscreen
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Activate focus mode
  const activateFocusMode = useCallback(() => {
    setIsFocusMode(true);
    setFocusTime(0);
    onFocusModeChange?.(true);
    
    // Request fullscreen
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    
    // Play activation sound
    if (soundEnabled) {
      const audio = new Audio('data:audio/wav;base64,UklGRl9vT19teleXBhdmVmbXQgEAAAAAQAABAAgIAABAAgAAAAAAAA');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
    
    // Request notification permission and block notifications
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [soundEnabled, onFocusModeChange]);

  // Deactivate focus mode
  const deactivateFocusMode = useCallback(() => {
    setIsFocusMode(false);
    onFocusModeChange?.(false);
    
    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [onFocusModeChange]);

  // Format time
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Focus Mode Active UI
  if (isFocusMode) {
    return (
      <>
        {/* Dark overlay for reduced distractions */}
        <div className="fixed inset-0 bg-black/5 pointer-events-none z-40" />
        
        {/* Focus Mode Control Bar - Top Right */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          {/* Focus Timer */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
            <FiTarget className="text-lg" />
            <span className="font-mono font-bold">{formatTime(focusTime)}</span>
            <span className="text-xs opacity-80">Focus Time</span>
          </div>
          
          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <FiMinimize className="text-gray-700" /> : <FiMaximize className="text-gray-700" />}
          </button>
          
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all"
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
          >
            {soundEnabled ? <FiVolume2 className="text-gray-700" /> : <FiVolumeX className="text-gray-700" />}
          </button>
          
          {/* Exit Focus Mode */}
          <button
            onClick={deactivateFocusMode}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all"
          >
            <FiX />
            <span className="text-sm font-medium">Exit Focus</span>
          </button>
        </div>
        
        {/* Breathing reminder - bottom center */}
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-sm text-gray-600 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
            <span>Focus Mode Active • Stay concentrated!</span>
          </div>
        </div>
      </>
    );
  }

  // Normal State - Distraction Stop Button
  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Main Button */}
      <div className="relative">
        <button
          onClick={activateFocusMode}
          onMouseEnter={() => setShowSettings(true)}
          onMouseLeave={() => setShowSettings(false)}
          className="group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
        >
          <FiZap className="text-lg group-hover:animate-pulse" />
          <span className="font-medium">Focus Mode</span>
        </button>
        
        {/* Tooltip on hover */}
        {showSettings && (
          <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl p-4 w-64 animate-fade-in">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <FiZap className="text-purple-600" />
              Distraction Stop
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Activate to enter a distraction-free learning environment:
            </p>
            <ul className="text-xs text-gray-500 space-y-1.5">
              <li className="flex items-center gap-2">
                <FiMaximize className="text-blue-500" /> Full-screen immersion
              </li>
              <li className="flex items-center gap-2">
                <FiMoon className="text-purple-500" /> Reduced visual clutter
              </li>
              <li className="flex items-center gap-2">
                <FiClock className="text-green-500" /> Focus time tracking
              </li>
              <li className="flex items-center gap-2">
                <FiTarget className="text-orange-500" /> Distraction blocking
              </li>
            </ul>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Press <kbd className="bg-gray-100 px-1 rounded">Esc</kbd> to exit focus mode
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DistractionStop;
