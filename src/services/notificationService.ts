import { Task } from '../types';

class NotificationService {
  private static instance: NotificationService;
  private notificationPermission: NotificationPermission = 'default';
  private checkInterval: NodeJS.Timeout | null = null;
  private notifiedTasks = new Set<string>();
  private activeSoundControllers = new Map<string, { stop: () => void }>();
  private currentTasks: Task[] = []; // Store current tasks for continuous checking

  private constructor() {
    this.init();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async init() {
    // Request notification permission
    if ('Notification' in window) {
      this.notificationPermission = await Notification.requestPermission();
    }

    // Start checking for notifications every 10 seconds for better accuracy
    this.startNotificationCheck();
    
    // Cleanup all sounds when page is about to unload
    window.addEventListener('beforeunload', () => {
      this.stopAllSounds();
    });
    
    // Also cleanup on visibility change (when user switches tabs)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopAllSounds();
      }
    });
  }

  private startNotificationCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.checkPendingNotifications();
    }, 1000); // Check every second for exact timing precision
  }

  private async checkPendingNotifications() {
    const now = new Date();

    for (const task of this.currentTasks) {
      if (
        task.notificationEnabled &&
        task.reminderTime &&
        task.reminderTime <= now &&
        !this.notifiedTasks.has(task.id) &&
        task.status !== 'completed'
      ) {
        console.log(`Internal check: Showing notification for task: ${task.title} at ${now.toLocaleString()}`);
        await this.showNotification(task);
        this.notifiedTasks.add(task.id);
      }
    }
  }

  public async showNotification(task: Task) {
    // Start continuous sound with task ID for tracking
    const soundController = this.playContinuousSound(task.id);

    // Show browser alert popup message
    const alertMessage = `⏰ TASK REMINDER ⏰\n\nTask: ${task.title}\n${task.description ? `Description: ${task.description}\n` : ''}Priority: ${task.priority.toUpperCase()}\nCategory: ${task.category}\n\nTime: ${task.reminderTime?.toLocaleString()}\n\nClick OK to acknowledge this reminder.`;
    
    // Show alert immediately when reminder time is over
    setTimeout(() => {
      alert(alertMessage);
    }, 100); // Small delay to ensure smooth execution

    // Show browser notification
    if (this.notificationPermission === 'granted') {
      const notification = new Notification(`Task Reminder: ${task.title}`, {
        body: task.description || 'Task reminder notification',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `task-${task.id}`,
        requireInteraction: true
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        soundController.stop();
      };

      // Auto close after 30 seconds (but sound continues until popup interaction)
      setTimeout(() => {
        notification.close();
      }, 30000);
    }

    // Show custom popup with sound controller
    this.showCustomPopup(task, soundController);
  }

  private playContinuousSound(taskId: string): { stop: () => void } {
    let intervalId: NodeJS.Timeout;
    let isPlaying = true;

    const playSound = () => {
      if (!isPlaying) return;
      
      try {
        // Create audio context for notification sound
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create a more attention-grabbing sound pattern
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Create a distinctive alarm pattern
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.4);
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 0.6);
        
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.8);
      } catch (error) {
        console.warn('Could not play continuous notification sound:', error);
        // Fallback: try to play a system sound
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhCJfA8OKVOQcWeLTpHZ8WExOB0/jJbSgGN2u5');
          audio.volume = 0.5;
          audio.play();
        } catch {
          // Silent fallback
        }
      }
    };

    // Play immediately
    playSound();
    
    // Then repeat every 1.5 seconds for more urgency
    intervalId = setInterval(playSound, 1500);

    const stopController = {
      stop: () => {
        console.log('Stopping sound for task:', taskId);
        isPlaying = false;
        if (intervalId) {
          clearInterval(intervalId);
        }
        // Remove from active controllers
        this.activeSoundControllers.delete(taskId);
      }
    };

    // Store the controller
    this.activeSoundControllers.set(taskId, stopController);

    return stopController;
  }

  private showCustomPopup(task: Task, soundController: { stop: () => void }) {
    // Enhance the sound controller to properly clean up from Map
    const originalStop = soundController.stop;
    soundController.stop = () => {
      this.activeSoundControllers.delete(task.id);
      originalStop();
    };

    // We'll implement this as a custom event that components can listen to
    const event = new CustomEvent('taskNotification', {
      detail: { task, soundController }
    });
    window.dispatchEvent(event);
  }

  public stopAllSounds() {
    // Stop all active sound controllers
    this.activeSoundControllers.forEach((controller) => {
      controller.stop();
    });
    this.activeSoundControllers.clear();
  }

  public checkTasksForNotifications(tasks: Task[]) {
    // Store the current tasks for continuous checking
    this.currentTasks = tasks;
    
    const now = new Date();
    
    for (const task of tasks) {
      if (
        task.notificationEnabled &&
        task.reminderTime &&
        task.reminderTime <= now &&
        !this.notifiedTasks.has(task.id) &&
        task.status !== 'completed'
      ) {
        // Show notification immediately when reminder time has passed
        console.log(`Showing notification for task: ${task.title} at ${now.toLocaleString()}`);
        this.showNotification(task);
        this.notifiedTasks.add(task.id);
      }
    }
  }

  public clearNotificationForTask(taskId: string) {
    this.notifiedTasks.delete(taskId);
  }

  public destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

export default NotificationService;
