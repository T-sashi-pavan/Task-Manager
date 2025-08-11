import React, { useState } from 'react';
import { Play, Pause, Square, RotateCcw, Timer } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';

const FloatingTimer: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isActive, seconds, startTimer, pauseTimer, stopTimer, resetTimer, formatTime } = useTimer();

  const progress = seconds > 0 ? ((seconds % 3600) / 3600) * 100 : 0;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Expanded Panel */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 w-80 p-6 bg-slate-800/95 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl shadow-cyan-500/20 animate-slideUp">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Focus Timer</h3>
            <div className="text-4xl font-mono text-cyan-400 mb-4">
              {formatTime(seconds)}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-orange-500 transition-all duration-1000 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => isActive ? pauseTimer() : startTimer()}
              className="p-3 bg-gradient-to-r from-cyan-500 to-orange-500 text-white rounded-full hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-cyan-500/50"
            >
              {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            
            <button
              onClick={stopTimer}
              disabled={seconds === 0}
              className="p-3 bg-slate-700 text-white rounded-full hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Square className="w-5 h-5" />
            </button>
            
            <button
              onClick={resetTimer}
              className="p-3 bg-slate-700 text-white rounded-full hover:scale-110 transition-all duration-200"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`relative w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-orange-500 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group ${
          isActive ? 'animate-pulse' : ''
        }`}
      >
        {/* Ripple Effect */}
        {isActive && (
          <div className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping" />
        )}
        
        <Timer className="w-6 h-6 relative z-10" />
        
        {/* Time Display */}
        {seconds > 0 && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-mono text-white bg-slate-900 px-2 py-1 rounded whitespace-nowrap">
            {formatTime(seconds)}
          </div>
        )}
      </button>
    </div>
  );
};

export default FloatingTimer;