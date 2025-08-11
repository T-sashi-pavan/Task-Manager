const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private static instance: ApiService;
  private token: string | null = null;

  private constructor() {
    // Load token from localStorage if available
    this.token = localStorage.getItem('authToken');
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async register(userData: { username: string; email: string; password: string }) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  logout() {
    this.clearToken();
  }

  // User methods
  async getUserProfile() {
    return this.request('/user/profile');
  }

  async getUserSettings() {
    return this.request('/user/settings');
  }

  async updateUserSettings(settings: { dark_mode?: boolean; current_view?: string }) {
    return this.request('/user/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Task methods
  async getTasks() {
    const tasks = await this.request('/tasks');
    
    // Convert date strings back to Date objects
    return tasks.map((task: any) => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      reminderTime: task.reminderTime ? new Date(task.reminderTime) : null,
    }));
  }

  async createTask(taskData: any) {
    const response = await this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        ...taskData,
        reminderTime: taskData.reminderTime?.toISOString(),
      }),
    });

    // Convert date strings back to Date objects
    return {
      ...response,
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
      reminderTime: response.reminderTime ? new Date(response.reminderTime) : null,
    };
  }

  async updateTask(taskId: string, updates: any) {
    const updateData = {
      ...updates,
      reminderTime: updates.reminderTime?.toISOString(),
    };

    return this.request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteTask(taskId: string) {
    return this.request(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // Time session methods
  async getTimeSessions() {
    const sessions = await this.request('/time-sessions');
    
    // Convert date strings back to Date objects
    return sessions.map((session: any) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: session.endTime ? new Date(session.endTime) : null,
    }));
  }

  async createTimeSession(sessionData: any) {
    const response = await this.request('/time-sessions', {
      method: 'POST',
      body: JSON.stringify({
        ...sessionData,
        startTime: sessionData.startTime.toISOString(),
        endTime: sessionData.endTime?.toISOString(),
      }),
    });

    // Convert date strings back to Date objects
    return {
      ...response,
      startTime: new Date(response.startTime),
      endTime: response.endTime ? new Date(response.endTime) : null,
    };
  }

  // Analytics methods
  async getTaskStats() {
    return this.request('/analytics/task-stats');
  }

  async getTotalTimeSpent() {
    const response = await this.request('/analytics/total-time');
    return response.totalTime;
  }

  // Health check
  async checkHealth() {
    return this.request('/health');
  }
}

export default ApiService;
