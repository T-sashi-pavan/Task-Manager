import { useState, useEffect, useCallback } from 'react';
import DatabaseService from '../database/service';
import { User, Task, TimeSession } from '../types';

interface DatabaseState {
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
}

interface DatabaseOperations {
  // Auth operations
  register: (userData: { username: string; email: string; password: string }) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  
  // Task operations
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeSpent'>, userId: string) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  loadTasks: (userId: string) => Promise<Task[]>;
  
  // Time session operations
  createTimeSession: (sessionData: Omit<TimeSession, 'id'>, userId: string) => Promise<TimeSession>;
  loadTimeSessions: (userId: string) => Promise<TimeSession[]>;
  
  // Settings operations
  updateUserSettings: (userId: string, settings: { darkMode?: boolean; currentView?: string }) => Promise<boolean>;
  loadUserSettings: (userId: string) => Promise<{ darkMode: boolean; currentView: string }>;
  
  // Analytics operations
  getTaskStats: (userId: string) => Promise<{
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  }>;
  getTotalTimeSpent: (userId: string) => Promise<number>;
  
  // Bulk operations
  loadUserData: (userId: string) => Promise<{
    tasks: Task[];
    timeSessions: TimeSession[];
    settings: { darkMode: boolean; currentView: string };
  }>;
}

export function useDatabase(): [DatabaseState, DatabaseOperations] {
  const [state, setState] = useState<DatabaseState>({
    isLoading: false,
    error: null,
    isConnected: false
  });

  const [dbService] = useState(() => DatabaseService.getInstance());

  useEffect(() => {
    // Initialize database connection
    setState(prev => ({ ...prev, isConnected: true }));
    
    // Cleanup on unmount
    return () => {
      // Don't close the database as it's a singleton and might be used elsewhere
    };
  }, []);

  const wrapOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<T> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await operation();
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const errorMsg = `${errorMessage}: ${(error as Error).message}`;
      setState(prev => ({ ...prev, isLoading: false, error: errorMsg }));
      throw new Error(errorMsg);
    }
  }, []);

  const operations: DatabaseOperations = {
    // Auth operations
    register: useCallback((userData) => 
      wrapOperation(
        () => dbService.register(userData),
        'Registration failed'
      ), [dbService, wrapOperation]
    ),

    login: useCallback((email, password) => 
      wrapOperation(
        () => dbService.login(email, password),
        'Login failed'
      ), [dbService, wrapOperation]
    ),

    // Task operations
    createTask: useCallback((taskData, userId) => 
      wrapOperation(
        () => dbService.createTask(taskData, userId),
        'Failed to create task'
      ), [dbService, wrapOperation]
    ),

    updateTask: useCallback((id, updates) => 
      wrapOperation(
        () => dbService.updateTask(id, updates),
        'Failed to update task'
      ), [dbService, wrapOperation]
    ),

    deleteTask: useCallback((id) => 
      wrapOperation(
        () => dbService.deleteTask(id),
        'Failed to delete task'
      ), [dbService, wrapOperation]
    ),

    loadTasks: useCallback((userId) => 
      wrapOperation(
        () => dbService.getTasks(userId),
        'Failed to load tasks'
      ), [dbService, wrapOperation]
    ),

    // Time session operations
    createTimeSession: useCallback((sessionData, userId) => 
      wrapOperation(
        () => dbService.createTimeSession(sessionData, userId),
        'Failed to create time session'
      ), [dbService, wrapOperation]
    ),

    loadTimeSessions: useCallback((userId) => 
      wrapOperation(
        () => dbService.getTimeSessions(userId),
        'Failed to load time sessions'
      ), [dbService, wrapOperation]
    ),

    // Settings operations
    updateUserSettings: useCallback((userId, settings) => 
      wrapOperation(
        () => dbService.updateUserSettings(userId, settings),
        'Failed to update user settings'
      ), [dbService, wrapOperation]
    ),

    loadUserSettings: useCallback((userId) => 
      wrapOperation(
        () => dbService.getUserSettings(userId),
        'Failed to load user settings'
      ), [dbService, wrapOperation]
    ),

    // Analytics operations
    getTaskStats: useCallback((userId) => 
      wrapOperation(
        () => dbService.getTaskStats(userId),
        'Failed to get task statistics'
      ), [dbService, wrapOperation]
    ),

    getTotalTimeSpent: useCallback((userId) => 
      wrapOperation(
        () => dbService.getTotalTimeSpent(userId),
        'Failed to get total time spent'
      ), [dbService, wrapOperation]
    ),

    // Bulk operations
    loadUserData: useCallback((userId) => 
      wrapOperation(
        () => dbService.loadUserData(userId),
        'Failed to load user data'
      ), [dbService, wrapOperation]
    ),
  };

  return [state, operations];
}
