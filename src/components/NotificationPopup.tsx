import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Clock, AlertCircle, VolumeX, Volume2 } from 'lucide-react';
import { Task } from '../types';

interface NotificationPopupProps {
  task: Task | null;
  soundController: { stop: () => void } | null;
  onClose: () => void;
}

export function NotificationPopup({ task, soundController, onClose }: NotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isSoundPlaying, setIsSoundPlaying] = useState(true);

  useEffect(() => {
    if (task) {
      setIsVisible(true);
      setIsSoundPlaying(true);
      // Auto close after 60 seconds (but sound continues until user interaction)
      const timer = setTimeout(() => {
        handleClose();
      }, 60000);

      return () => clearTimeout(timer);
    }
  }, [task]);

  const handleClose = () => {
    // Stop the continuous sound when user interacts with popup
    if (soundController && isSoundPlaying) {
      soundController.stop();
      setIsSoundPlaying(false);
    }
    
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleStopSound = () => {
    if (soundController && isSoundPlaying) {
      soundController.stop();
      setIsSoundPlaying(false);
    }
  };

  const handleDismiss = () => {
    handleClose();
  };

  const handleGotIt = () => {
    handleClose();
  };

  if (!task) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
            onClick={handleClose}
          />
          
          {/* Notification Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10000]"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full mx-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Bell className="text-blue-500" size={24} />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Task Reminder
                    </h3>
                    {isSoundPlaying && (
                      <div className="flex items-center gap-1 text-xs text-orange-500">
                        <Volume2 size={12} />
                        <span className="animate-pulse">Sound playing...</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isSoundPlaying && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleStopSound}
                      className="p-1.5 text-orange-500 hover:text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                      title="Stop sound"
                    >
                      <VolumeX size={18} />
                    </motion.button>
                  )}
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-orange-500 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Task Details */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Priority:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Category:</span>
                    <span className="text-gray-600 dark:text-gray-400">{task.category}</span>
                  </div>

                  {task.reminderTime && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={14} className="text-indigo-500" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">Reminder:</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {task.reminderTime.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGotIt}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Got it!
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDismiss}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Dismiss
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
