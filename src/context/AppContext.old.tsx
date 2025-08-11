import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, User, Task, TimeSession } from '../types';
import { useDatabase } from '../hooks/useDatabase';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, User, Task, TimeSession } from '../types';
import { useDatabase } from '../hooks/useDatabase';

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
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'START_TIMER'; payload: string }
  | { type: 'STOP_TIMER'; payload: TimeSession }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_CURRENT_VIEW'; payload: AppState['currentView'] }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, activeTimer: null };
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
    case 'START_TIMER':
      return {
        ...state,
        activeTimer: { taskId: action.payload, startTime: new Date() },
      };
    case 'STOP_TIMER':
      return {
        ...state,
        activeTimer: null,
        timeSessions: [...state.timeSessions, action.payload],
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? { ...task, timeSpent: task.timeSpent + action.payload.duration }
            : task
        ),
      };
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };
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
  const [storedState, setStoredState] = useLocalStorage('productivity-tracker', {});

  useEffect(() => {
    if (Object.keys(storedState).length > 0) {
      dispatch({ type: 'LOAD_STATE', payload: storedState });
    }
  }, []);

  useEffect(() => {
    setStoredState(state);
  }, [state, setStoredState]);

  const login = (user: User) => {
    dispatch({ type: 'LOGIN', payload: user });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeSpent'>) => {
    const task: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      timeSpent: 0,
    };
    dispatch({ type: 'ADD_TASK', payload: task });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
  };

  const deleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  };

  const startTimer = (taskId: string) => {
    if (state.activeTimer) {
      stopTimer();
    }
    dispatch({ type: 'START_TIMER', payload: taskId });
  };

  const stopTimer = () => {
    if (state.activeTimer) {
      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - state.activeTimer.startTime.getTime()) / 60000);
      const session: TimeSession = {
        id: crypto.randomUUID(),
        taskId: state.activeTimer.taskId,
        startTime: state.activeTimer.startTime,
        endTime,
        duration,
      };
      dispatch({ type: 'STOP_TIMER', payload: session });
    }
  };

  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };

  const setCurrentView = (view: AppState['currentView']) => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: view });
  };

  return (
    <AppContext.Provider
      value={{
        state,
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