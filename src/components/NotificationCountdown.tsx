import { useState, useEffect } from 'react';
import { Clock, Bell } from 'lucide-react';
import { Task } from '../types';

interface NotificationCountdownProps {
  tasks: Task[];
  compact?: boolean;
}

export function NotificationCountdown({ tasks, compact = false }: NotificationCountdownProps) {
  const [nextNotification, setNextNotification] = useState<Task | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      
      // Find the next upcoming notification
      const upcomingTasks = tasks
        .filter(task => 
          task.notificationEnabled && 
          task.reminderTime && 
          task.reminderTime > now &&
          task.status !== 'completed'
        )
        .sort((a, b) => {
          if (!a.reminderTime || !b.reminderTime) return 0;
          return a.reminderTime.getTime() - b.reminderTime.getTime();
        });

      if (upcomingTasks.length > 0) {
        const nextTask = upcomingTasks[0];
        setNextNotification(nextTask);

        if (nextTask.reminderTime) {
          const timeDiff = nextTask.reminderTime.getTime() - now.getTime();
          
          if (timeDiff > 0) {
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            if (hours > 0) {
              setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
            } else if (minutes > 0) {
              setTimeRemaining(`${minutes}m ${seconds}s`);
            } else {
              setTimeRemaining(`${seconds}s`);
            }
          } else {
            setTimeRemaining('Now!');
          }
        }
      } else {
        setNextNotification(null);
        setTimeRemaining('');
      }
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [tasks]);

  if (!nextNotification || !timeRemaining) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-800">
        <Bell size={12} className="animate-pulse" />
        <span className="font-medium">{timeRemaining}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-1">
        <Clock size={14} className="animate-pulse" />
        <Bell size={14} />
      </div>
      <div className="flex flex-col">
        <span className="font-medium">Next Alert: {nextNotification.title}</span>
        <span className="text-xs opacity-75">
          in {timeRemaining} | {nextNotification.reminderTime?.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
