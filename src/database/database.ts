import Dexie, { Table } from 'dexie';
import { User, Task, TimeSession } from '../types';

export interface DatabaseUser {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface DatabaseTask {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  timeSpent: number;
  createdAt: Date;
  updatedAt: Date;
  reminderTime?: Date;
  notificationEnabled: boolean;
}

export interface DatabaseTimeSession {
  id: string;
  taskId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
}

export interface DatabaseUserSettings {
  userId: string;
  darkMode: boolean;
  currentView: string;
}

class ProductivityTrackerDB extends Dexie {
  users!: Table<DatabaseUser, string>;
  tasks!: Table<DatabaseTask, string>;
  timeSessions!: Table<DatabaseTimeSession, string>;
  userSettings!: Table<DatabaseUserSettings, string>;

  constructor() {
    super('ProductivityTrackerDB');
    
    this.version(1).stores({
      users: 'id, username, email, createdAt',
      tasks: 'id, userId, title, category, priority, status, createdAt, updatedAt',
      timeSessions: 'id, taskId, userId, startTime, endTime',
      userSettings: 'userId, darkMode, currentView'
    });

    // Version 2: Add notification fields to tasks
    this.version(2).stores({
      users: 'id, username, email, createdAt',
      tasks: 'id, userId, title, category, priority, status, createdAt, updatedAt, reminderTime',
      timeSessions: 'id, taskId, userId, startTime, endTime',
      userSettings: 'userId, darkMode, currentView'
    }).upgrade(tx => {
      // Migrate existing tasks to include new notification fields
      return tx.table('tasks').toCollection().modify(task => {
        if (task.notificationEnabled === undefined) {
          task.notificationEnabled = false;
        }
      });
    });
  }
}

class DatabaseManager {
  private db: ProductivityTrackerDB;

  constructor() {
    this.db = new ProductivityTrackerDB();
  }

  // User operations
  async createUser(user: { username: string; email: string; password: string }): Promise<User> {
    const id = crypto.randomUUID();
    const now = new Date();
    
    const dbUser: DatabaseUser = {
      id,
      username: user.username,
      email: user.email,
      password: user.password,
      createdAt: now
    };

    try {
      await this.db.users.add(dbUser);
      
      // Create default user settings
      await this.db.userSettings.add({
        userId: id,
        darkMode: false,
        currentView: 'tasks'
      });
      
      return {
        id,
        username: user.username,
        email: user.email,
        createdAt: now
      };
    } catch (error) {
      throw new Error(`Failed to create user: ${(error as Error).message}`);
    }
  }

  async getUserByEmail(email: string): Promise<(User & { password: string }) | null> {
    try {
      const user = await this.db.users.where('email').equals(email).first();
      if (!user) return null;
      
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password,
        createdAt: user.createdAt
      };
    } catch (error) {
      throw new Error(`Failed to get user: ${(error as Error).message}`);
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const user = await this.db.users.get(id);
      if (!user) return null;
      
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      };
    } catch (error) {
      throw new Error(`Failed to get user: ${(error as Error).message}`);
    }
  }

  // Task operations
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeSpent'>, userId: string): Promise<Task> {
    const id = crypto.randomUUID();
    const now = new Date();
    
    const dbTask: DatabaseTask = {
      id,
      userId,
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      status: task.status,
      timeSpent: 0,
      createdAt: now,
      updatedAt: now,
      reminderTime: task.reminderTime,
      notificationEnabled: task.notificationEnabled
    };
    
    try {
      await this.db.tasks.add(dbTask);
      
      return {
        id,
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        status: task.status,
        timeSpent: 0,
        createdAt: now,
        updatedAt: now,
        reminderTime: task.reminderTime,
        notificationEnabled: task.notificationEnabled
      };
    } catch (error) {
      throw new Error(`Failed to create task: ${(error as Error).message}`);
    }
  }

  async getTasksByUserId(userId: string): Promise<Task[]> {
    try {
      const tasks = await this.db.tasks.where('userId').equals(userId).reverse().sortBy('createdAt');
      
      return tasks.map((task: DatabaseTask) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        status: task.status,
        timeSpent: task.timeSpent,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        reminderTime: task.reminderTime,
        notificationEnabled: task.notificationEnabled
      }));
    } catch (error) {
      throw new Error(`Failed to get tasks: ${(error as Error).message}`);
    }
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<boolean> {
    try {
      const updateData: Partial<DatabaseTask> = {
        ...updates,
        updatedAt: new Date()
      };
      
      const count = await this.db.tasks.update(id, updateData);
      return count > 0;
    } catch (error) {
      throw new Error(`Failed to update task: ${(error as Error).message}`);
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    try {
      // Delete associated time sessions
      await this.db.timeSessions.where('taskId').equals(id).delete();
      
      // Delete the task
      await this.db.tasks.delete(id);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete task: ${(error as Error).message}`);
    }
  }

  // Time session operations
  async createTimeSession(session: Omit<TimeSession, 'id'>, userId: string): Promise<TimeSession> {
    const id = crypto.randomUUID();
    
    const dbSession: DatabaseTimeSession = {
      id,
      taskId: session.taskId,
      userId,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration
    };
    
    try {
      await this.db.timeSessions.add(dbSession);
      
      return {
        id,
        taskId: session.taskId,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.duration
      };
    } catch (error) {
      throw new Error(`Failed to create time session: ${(error as Error).message}`);
    }
  }

  async getTimeSessionsByUserId(userId: string): Promise<TimeSession[]> {
    try {
      const sessions = await this.db.timeSessions.where('userId').equals(userId).reverse().sortBy('startTime');
      
      return sessions.map((session: DatabaseTimeSession) => ({
        id: session.id,
        taskId: session.taskId,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.duration
      }));
    } catch (error) {
      throw new Error(`Failed to get time sessions: ${(error as Error).message}`);
    }
  }

  // User settings operations
  async getUserSettings(userId: string): Promise<{ darkMode: boolean; currentView: string }> {
    try {
      const settings = await this.db.userSettings.get(userId);
      if (!settings) {
        return { darkMode: false, currentView: 'tasks' };
      }
      
      return {
        darkMode: settings.darkMode,
        currentView: settings.currentView
      };
    } catch (error) {
      throw new Error(`Failed to get user settings: ${(error as Error).message}`);
    }
  }

  async updateUserSettings(userId: string, settings: { darkMode?: boolean; currentView?: string }): Promise<boolean> {
    try {
      const existing = await this.db.userSettings.get(userId);
      
      if (existing) {
        await this.db.userSettings.update(userId, settings);
      } else {
        await this.db.userSettings.add({
          userId,
          darkMode: settings.darkMode ?? false,
          currentView: settings.currentView ?? 'tasks'
        });
      }
      
      return true;
    } catch (error) {
      throw new Error(`Failed to update user settings: ${(error as Error).message}`);
    }
  }

  // Analytics helper methods
  async getTaskStats(userId: string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  }> {
    try {
      const tasks = await this.db.tasks.where('userId').equals(userId).toArray();
      
      const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        pending: tasks.filter(t => t.status === 'pending').length
      };
      
      return stats;
    } catch (error) {
      throw new Error(`Failed to get task stats: ${(error as Error).message}`);
    }
  }

  async getTotalTimeSpent(userId: string): Promise<number> {
    try {
      const tasks = await this.db.tasks.where('userId').equals(userId).toArray();
      return tasks.reduce((total, task) => total + task.timeSpent, 0);
    } catch (error) {
      throw new Error(`Failed to get total time spent: ${(error as Error).message}`);
    }
  }

  close() {
    this.db.close();
  }
}

export default DatabaseManager;
