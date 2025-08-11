import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Task } from '../../types';
import { 
  Clock, 
  Flag, 
  Calendar, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  CheckCircle,
  Circle,
  Bell,
  BellOff
} from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const { state, updateTask, deleteTask, startTimer, stopTimer } = useApp();
  const isTimerActive = state.activeTimer?.taskId === task.id;
  const [countdown, setCountdown] = useState<string>('');

  // Countdown timer for this specific task
  useEffect(() => {
    if (!task.notificationEnabled || !task.reminderTime || task.status === 'completed') {
      setCountdown('');
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const timeDiff = task.reminderTime!.getTime() - now.getTime();
      
      if (timeDiff <= 0) {
        setCountdown('Now!');
        return;
      }
      
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setCountdown(`${minutes}m ${seconds}s`);
      } else {
        setCountdown(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [task.notificationEnabled, task.reminderTime, task.status]);

  const priorityConfig = {
    low: { color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Low' },
    medium: { color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Medium' },
    high: { color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', label: 'High' },
  };

  const statusConfig = {
    pending: { color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700', label: 'Pending' },
    'in-progress': { color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'In Progress' },
    completed: { color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Completed' },
  };

  const toggleStatus = () => {
    const statusOrder = ['pending', 'in-progress', 'completed'];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    updateTask(task.id, { status: nextStatus as Task['status'] });
  };

  const toggleTimer = () => {
    if (isTimerActive) {
      stopTimer();
    } else {
      startTimer(task.id);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="glass-effect rounded-xl p-6 shadow-lg hover:glow-effect transition-all duration-300 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleStatus}
            className="text-gray-400 hover:text-indigo-500 transition-colors"
          >
            {task.status === 'completed' ? (
              <CheckCircle size={20} className="text-green-500" />
            ) : (
              <Circle size={20} />
            )}
          </motion.button>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[task.status].bg} ${statusConfig[task.status].color}`}>
            {statusConfig[task.status].label}
          </span>
        </div>

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTimer}
            className={`p-1.5 rounded-lg transition-colors ${
              isTimerActive 
                ? 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30' 
                : 'text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30'
            }`}
          >
            {isTimerActive ? <Pause size={16} /> : <Play size={16} />}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit?.(task)}
            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          >
            <Edit size={16} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => deleteTask(task.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      </div>

      {/* Title and Description */}
      <div className="mb-4">
        <h3 className={`font-semibold text-gray-900 dark:text-white mb-2 ${
          task.status === 'completed' ? 'line-through opacity-60' : ''
        }`}>
          {task.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
          {task.description}
        </p>
      </div>

      {/* Category and Priority */}
      <div className="flex items-center justify-between mb-4">
        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-medium">
          {task.category}
        </span>
        
        <div className="flex items-center space-x-1">
          <Flag size={14} className={priorityConfig[task.priority].color} />
          <span className={`text-xs font-medium ${priorityConfig[task.priority].color}`}>
            {priorityConfig[task.priority].label}
          </span>
        </div>
      </div>

      {/* Reminder Time and Notifications */}
      {(task.reminderTime || task.notificationEnabled) && (
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
          {task.reminderTime && (
            <div className="flex items-center space-x-1 text-xs">
              <Clock size={12} className="text-indigo-500" />
              <span className="text-gray-600 dark:text-gray-400">
                Reminder: {format(new Date(task.reminderTime), 'MMM dd, HH:mm')}
              </span>
            </div>
          )}
          
          {task.notificationEnabled && (
            <div className="flex items-center space-x-1 text-xs">
              <div className="flex items-center space-x-1 text-blue-500">
                <Bell size={12} />
                <span>Alerts On</span>
              </div>
              {countdown && (
                <div className="flex items-center space-x-1 text-orange-500 font-medium">
                  <Clock size={12} className="animate-pulse" />
                  <span>in {countdown}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Clock size={12} />
            <span>{Math.floor(task.timeSpent / 60)}h {task.timeSpent % 60}m</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar size={12} />
            <span>{format(task.createdAt, 'MMM dd')}</span>
          </div>
        </div>
        
        {isTimerActive && (
          <div className="flex items-center space-x-1 text-green-500 pulse-glow">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-medium">Tracking</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}