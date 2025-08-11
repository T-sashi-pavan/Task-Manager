import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AuthPage } from './Auth/AuthPage';
import { Dashboard } from './Dashboard/Dashboard';
import { NotificationPopup } from './NotificationPopup';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types';

export function MainApp() {
  const { state } = useApp();
  const [notificationTask, setNotificationTask] = useState<Task | null>(null);
  const [soundController, setSoundController] = useState<{ stop: () => void } | null>(null);

  // Listen for task notifications
  useEffect(() => {
    const handleTaskNotification = (event: any) => {
      setNotificationTask(event.detail.task);
      setSoundController(event.detail.soundController);
    };

    window.addEventListener('taskNotification', handleTaskNotification);
    return () => {
      window.removeEventListener('taskNotification', handleTaskNotification);
    };
  }, []);

  const handleCloseNotification = () => {
    setNotificationTask(null);
    setSoundController(null);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${state.darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <AnimatePresence mode="wait">
          {!state.user ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AuthPage />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              <Dashboard />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Notification Popup */}
        <NotificationPopup
          task={notificationTask}
          soundController={soundController}
          onClose={handleCloseNotification}
        />
      </div>
    </div>
  );
}