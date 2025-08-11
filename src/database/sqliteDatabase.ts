import ApiService from '../services/apiService';
import { User, Task, TimeSession } from '../types';

class SqliteDatabaseManager {
  private api: ApiService;

  constructor() {
    this.api = ApiService.getInstance();
  }

  // User operations
  async createUser(user: { username: string; email: string; password: string }): Promise<User> {
    try {
      const response = await this.api.register(user);
      return {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
        createdAt: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to create user: ${(error as Error).message}`);
    }
  }

  async getUserByEmail(email: string, password: string): Promise<User | null> {
    try {
      const response = await this.api.login({ email, password });
      return {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
        createdAt: new Date()
      };
    } catch (error) {
      return null;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const user = await this.api.getUserProfile();
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: new Date(user.created_at)
      };
    } catch (error) {
      return null;
    }
  }

  // Task operations
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeSpent'>, userId: string): Promise<Task> {
    try {
      return await this.api.createTask(task);
    } catch (error) {
      throw new Error(`Failed to create task: ${(error as Error).message}`);
    }
  }

  async getTasksByUserId(userId: string): Promise<Task[]> {
    try {
      return await this.api.getTasks();
    } catch (error) {
      throw new Error(`Failed to get tasks: ${(error as Error).message}`);
    }
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<boolean> {
    try {
      await this.api.updateTask(id, updates);
      return true;
    } catch (error) {
      throw new Error(`Failed to update task: ${(error as Error).message}`);
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    try {
      await this.api.deleteTask(id);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete task: ${(error as Error).message}`);
    }
  }

  // Time session operations
  async createTimeSession(session: Omit<TimeSession, 'id'>, userId: string): Promise<TimeSession> {
    try {
      return await this.api.createTimeSession(session);
    } catch (error) {
      throw new Error(`Failed to create time session: ${(error as Error).message}`);
    }
  }

  async getTimeSessionsByUserId(userId: string): Promise<TimeSession[]> {
    try {
      return await this.api.getTimeSessions();
    } catch (error) {
      throw new Error(`Failed to get time sessions: ${(error as Error).message}`);
    }
  }

  // User settings operations
  async getUserSettings(userId: string): Promise<{ darkMode: boolean; currentView: string }> {
    try {
      const settings = await this.api.getUserSettings();
      return {
        darkMode: settings.dark_mode,
        currentView: settings.current_view
      };
    } catch (error) {
      return { darkMode: false, currentView: 'tasks' };
    }
  }

  async updateUserSettings(userId: string, settings: { darkMode?: boolean; currentView?: string }): Promise<boolean> {
    try {
      await this.api.updateUserSettings({
        dark_mode: settings.darkMode,
        current_view: settings.currentView
      });
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
      const stats = await this.api.getTaskStats();
      return {
        total: stats.total,
        completed: stats.completed,
        inProgress: stats['in-progress'],
        pending: stats.pending
      };
    } catch (error) {
      throw new Error(`Failed to get task stats: ${(error as Error).message}`);
    }
  }

  async getTotalTimeSpent(userId: string): Promise<number> {
    try {
      return await this.api.getTotalTimeSpent();
    } catch (error) {
      throw new Error(`Failed to get total time spent: ${(error as Error).message}`);
    }
  }

  logout() {
    this.api.logout();
  }

  close() {
    // No need to close anything for API-based database
  }
}

export default SqliteDatabaseManager;
