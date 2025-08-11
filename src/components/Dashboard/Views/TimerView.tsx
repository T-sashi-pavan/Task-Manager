import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../../context/AppContext';
import { Play, Pause, Square, Clock, Target } from 'lucide-react';
import { format } from 'date-fns';

export function TimerView() {
  const { state, startTimer, stopTimer } = useApp();
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.activeTimer) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - state.activeTimer!.startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.activeTimer]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeTask = state.activeTimer ? 
    state.tasks.find(t => t.id === state.activeTimer?.taskId) : null;

  const availableTasks = state.tasks.filter(t => t.status !== 'completed');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Time Tracker</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track time spent on your tasks with precision
        </p>
      </div>

      {/* Main Timer */}
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-3xl p-8 text-center shadow-2xl"
        >
          {/* Timer Display */}
          <motion.div
            key={elapsedTime}
            initial={{ scale: 1 }}
            animate={{ scale: state.activeTimer ? [1, 1.02, 1] : 1 }}
            transition={{ duration: 1, repeat: state.activeTimer ? Infinity : 0 }}
            className="mb-8"
          >
            <div className="text-6xl md:text-8xl font-mono font-bold text-gray-900 dark:text-white mb-4">
              {formatTime(elapsedTime)}
            </div>
            
            {activeTask && (
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {activeTask.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {activeTask.category} • {activeTask.priority} priority
                </p>
              </div>
            )}
          </motion.div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            {!state.activeTimer ? (
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Select a task to start tracking time
                </p>
                {availableTasks.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-500">
                    No active tasks available
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto">
                    {availableTasks.slice(0, 4).map((task) => (
                      <motion.button
                        key={task.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => startTimer(task.id)}
                        className="p-3 text-left bg-white/50 dark:bg-gray-800/50 rounded-xl hover:bg-white/70 dark:hover:bg-gray-700/70 transition-all duration-200 border border-gray-200 dark:border-gray-600"
                      >
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {task.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {task.category}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopTimer}
                className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 glow-effect flex items-center space-x-2"
              >
                <Square size={20} />
                <span>Stop Timer</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Sessions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Sessions</h2>
        
        {state.timeSessions.length === 0 ? (
          <div className="text-center py-12">
            <Clock size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No time sessions yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start tracking time on your tasks to see sessions here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.timeSessions
              .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
              .slice(0, 6)
              .map((session, index) => {
                const task = state.tasks.find(t => t.id === session.taskId);
                if (!task) return null;

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-effect rounded-xl p-4 hover:glow-effect transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {task.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                          {Math.floor(session.duration / 60)}h {session.duration % 60}m
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {format(session.startTime, 'MMM dd, yyyy • HH:mm')}
                    </div>
                  </motion.div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}