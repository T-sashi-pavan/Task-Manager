export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  timeSpent: number; // in minutes
  reminderTime?: Date; // When to show notification
  notificationEnabled: boolean; // Whether notifications are enabled for this task
}

export interface TimeSession {
  id: string;
  taskId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
}

export interface AppState {
  user: User | null;
  tasks: Task[];
  timeSessions: TimeSession[];
  activeTimer: {
    taskId: string;
    startTime: Date;
  } | null;
  darkMode: boolean;
  currentView: 'tasks' | 'timer' | 'analytics' | 'reports' | 'database';
}