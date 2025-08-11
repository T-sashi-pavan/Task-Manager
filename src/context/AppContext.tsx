import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { AppState, User, Task, TimeSession } from '../types';
import { useSqliteDatabase } from '../hooks/useSqliteDatabase';
import NotificationService from '../services/notificationService';

interface AppContextType {
  state: AppState;
  dbState: { isLoading: boolean; error: string | null; isConnected: boolean };
  register: (userData: { username: string; email: string; password: string }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeSpent'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  startTimer: (taskId: string) => void;
  stopTimer: () => Promise<void>;
  toggleDarkMode: () => Promise<void>;
  setCurrentView: (view: AppState['currentView']) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialState: AppState = {
  user: null,
  tasks: [],
  timeSessions: [],
  activeTimer: null,
  darkMode: false,
  currentView: 'tasks',
};

type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_TIME_SESSIONS'; payload: TimeSession[] }
  | { type: 'ADD_TIME_SESSION'; payload: TimeSession }
  | { type: 'START_TIMER'; payload: string }
  | { type: 'STOP_TIMER' }
  | { type: 'SET_DARK_MODE'; payload: boolean }
  | { type: 'SET_CURRENT_VIEW'; payload: AppState['currentView'] }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...initialState };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates, updatedAt: new Date() }
            : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        timeSessions: state.timeSessions.filter(session => session.taskId !== action.payload),
        activeTimer: state.activeTimer?.taskId === action.payload ? null : state.activeTimer,
      };
    case 'SET_TIME_SESSIONS':
      return { ...state, timeSessions: action.payload };
    case 'ADD_TIME_SESSION':
      return { ...state, timeSessions: [...state.timeSessions, action.payload] };
    case 'START_TIMER':
      return {
        ...state,
        activeTimer: { taskId: action.payload, startTime: new Date() },
      };
    case 'STOP_TIMER':
      return {
        ...state,
        activeTimer: null,
      };
    case 'SET_DARK_MODE':
      return { ...state, darkMode: action.payload };
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { db, dbState } = useSqliteDatabase();
  const [isInitialized, setIsInitialized] = useState(false);
  const [notificationService] = useState(() => NotificationService.getInstance());

  // Check for notifications when tasks change
  useEffect(() => {
    if (state.tasks.length > 0) {
      notificationService.checkTasksForNotifications(state.tasks);
    }
  }, [state.tasks, notificationService]);

  // Continuous notification checking - update tasks every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.tasks.length > 0) {
        notificationService.checkTasksForNotifications(state.tasks);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [state.tasks, notificationService]);

  // Load user data when user logs in
  useEffect(() => {
    const loadUserData = async () => {
      if (state.user && !isInitialized) {
        try {
          const userData = await db.getUserSettings(state.user.id);
          const tasks = await db.getTasksByUserId(state.user.id);
          const timeSessions = await db.getTimeSessionsByUserId(state.user.id);
          
          dispatch({ type: 'SET_TASKS', payload: tasks });
          dispatch({ type: 'SET_TIME_SESSIONS', payload: timeSessions });
          dispatch({ type: 'SET_DARK_MODE', payload: userData.darkMode });
          dispatch({ type: 'SET_CURRENT_VIEW', payload: userData.currentView as AppState['currentView'] });
          setIsInitialized(true);
        } catch (error) {
          console.error('Failed to load user data:', error);
        }
      }
    };

    loadUserData();
  }, [state.user, db, isInitialized]);

  const register = async (userData: { username: string; email: string; password: string }) => {
    try {
      const user = await db.createUser(userData);
      dispatch({ type: 'LOGIN', payload: user });
      setIsInitialized(false); // Reset to load new user data
    } catch (error) {
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const user = await db.getUserByEmail(email, password);
      if (user) {
        dispatch({ type: 'LOGIN', payload: user });
        setIsInitialized(false); // Reset to load user data
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    db.logout(); // Clear the API token
    dispatch({ type: 'LOGOUT' });
    setIsInitialized(false);
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeSpent'>) => {
    if (!state.user) throw new Error('User not logged in');
    
    try {
      const task = await db.createTask(taskData, state.user.id);
      dispatch({ type: 'ADD_TASK', payload: task });
    } catch (error) {
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      await db.updateTask(id, updates);
      dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
    } catch (error) {
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await db.deleteTask(id);
      dispatch({ type: 'DELETE_TASK', payload: id });
    } catch (error) {
      throw error;
    }
  };

  const startTimer = (taskId: string) => {
    if (state.activeTimer) {
      stopTimer();
    }
    dispatch({ type: 'START_TIMER', payload: taskId });
  };

  const stopTimer = async () => {
    if (state.activeTimer && state.user) {
      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - state.activeTimer.startTime.getTime()) / 60000);
      
      const sessionData: Omit<TimeSession, 'id'> = {
        taskId: state.activeTimer.taskId,
        startTime: state.activeTimer.startTime,
        endTime,
        duration,
      };

      try {
        const session = await db.createTimeSession(sessionData, state.user.id);
        dispatch({ type: 'ADD_TIME_SESSION', payload: session });
        dispatch({ type: 'STOP_TIMER' });
        
        // Update the task's time spent
        const task = state.tasks.find(t => t.id === state.activeTimer!.taskId);
        if (task) {
          await updateTask(task.id, { timeSpent: task.timeSpent + duration });
        }
      } catch (error) {
        console.error('Failed to save time session:', error);
        dispatch({ type: 'STOP_TIMER' });
      }
    }
  };

  const toggleDarkMode = async () => {
    if (!state.user) return;
    
    const newDarkMode = !state.darkMode;
    try {
      await db.updateUserSettings(state.user.id, { darkMode: newDarkMode });
      dispatch({ type: 'SET_DARK_MODE', payload: newDarkMode });
    } catch (error) {
      console.error('Failed to update dark mode:', error);
    }
  };

  const setCurrentView = async (view: AppState['currentView']) => {
    if (!state.user) return;
    
    try {
      await db.updateUserSettings(state.user.id, { currentView: view });
      dispatch({ type: 'SET_CURRENT_VIEW', payload: view });
    } catch (error) {
      console.error('Failed to update current view:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dbState,
        register,
        login,
        logout,
        addTask,
        updateTask,
        deleteTask,
        startTimer,
        stopTimer,
        toggleDarkMode,
        setCurrentView,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
