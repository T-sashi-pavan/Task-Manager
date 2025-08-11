import DatabaseManager from './database';
import { User, Task, TimeSession } from '../types';

// Simple password hashing using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
}

class DatabaseService {
  private static instance: DatabaseService;
  private db: DatabaseManager;

  private constructor() {
    this.db = new DatabaseManager();
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Authentication methods
  async register(userData: { username: string; email: string; password: string }): Promise<User> {
    try {
      // Hash the password
      const hashedPassword = await hashPassword(userData.password);
      
      const user = await this.db.createUser({
        username: userData.username,
        email: userData.email,
        password: hashedPassword
      });
      
      return user;
    } catch (error) {
      throw new Error(`Registration failed: ${(error as Error).message}`);
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const userWithPassword = await this.db.getUserByEmail(email);
      
      if (!userWithPassword) {
        throw new Error('User not found');
      }
      
      const isPasswordValid = await verifyPassword(password, userWithPassword.password);
      
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }
      
      // Return user without password
      const { password: _, ...user } = userWithPassword;
      return user;
    } catch (error) {
      throw new Error(`Login failed: ${(error as Error).message}`);
    }
  }

  // Task methods
  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeSpent'>, userId: string): Promise<Task> {
    try {
      return await this.db.createTask(taskData, userId);
    } catch (error) {
      throw new Error(`Failed to create task: ${(error as Error).message}`);
    }
  }

  async getTasks(userId: string): Promise<Task[]> {
    try {
      return await this.db.getTasksByUserId(userId);
    } catch (error) {
      throw new Error(`Failed to get tasks: ${(error as Error).message}`);
    }
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<boolean> {
    try {
      return await this.db.updateTask(id, updates);
    } catch (error) {
      throw new Error(`Failed to update task: ${(error as Error).message}`);
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    try {
      return await this.db.deleteTask(id);
    } catch (error) {
      throw new Error(`Failed to delete task: ${(error as Error).message}`);
    }
  }

  // Time session methods
  async createTimeSession(sessionData: Omit<TimeSession, 'id'>, userId: string): Promise<TimeSession> {
    try {
      const session = await this.db.createTimeSession(sessionData, userId);
      
      // Update task time spent
      const currentTask = await this.db.getTasksByUserId(userId);
      const task = currentTask.find(t => t.id === sessionData.taskId);
      if (task) {
        await this.updateTask(sessionData.taskId, {
          timeSpent: task.timeSpent + sessionData.duration
        });
      }
      
      return session;
    } catch (error) {
      throw new Error(`Failed to create time session: ${(error as Error).message}`);
    }
  }

  async getTimeSessions(userId: string): Promise<TimeSession[]> {
    try {
      return await this.db.getTimeSessionsByUserId(userId);
    } catch (error) {
      throw new Error(`Failed to get time sessions: ${(error as Error).message}`);
    }
  }

  // User settings methods
  async getUserSettings(userId: string): Promise<{ darkMode: boolean; currentView: string }> {
    try {
      return await this.db.getUserSettings(userId);
    } catch (error) {
      throw new Error(`Failed to get user settings: ${(error as Error).message}`);
    }
  }

  async updateUserSettings(userId: string, settings: { darkMode?: boolean; currentView?: string }): Promise<boolean> {
    try {
      return await this.db.updateUserSettings(userId, settings);
    } catch (error) {
      throw new Error(`Failed to update user settings: ${(error as Error).message}`);
    }
  }

  // Analytics methods
  async getTaskStats(userId: string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  }> {
    try {
      return await this.db.getTaskStats(userId);
    } catch (error) {
      throw new Error(`Failed to get task stats: ${(error as Error).message}`);
    }
  }

  async getTotalTimeSpent(userId: string): Promise<number> {
    try {
      return await this.db.getTotalTimeSpent(userId);
    } catch (error) {
      throw new Error(`Failed to get total time spent: ${(error as Error).message}`);
    }
  }

  // Sync methods for loading user data
  async loadUserData(userId: string): Promise<{
    tasks: Task[];
    timeSessions: TimeSession[];
    settings: { darkMode: boolean; currentView: string };
  }> {
    try {
      const [tasks, timeSessions, settings] = await Promise.all([
        this.getTasks(userId),
        this.getTimeSessions(userId),
        this.getUserSettings(userId)
      ]);

      return { tasks, timeSessions, settings };
    } catch (error) {
      throw new Error(`Failed to load user data: ${(error as Error).message}`);
    }
  }

  // Get user information
  async getUser(userId: string): Promise<User | null> {
    try {
      return await this.db.getUserById(userId);
    } catch (error) {
      throw new Error(`Failed to get user: ${(error as Error).message}`);
    }
  }

  // Close database connection
  close() {
    this.db.close();
  }
}

export default DatabaseService;
