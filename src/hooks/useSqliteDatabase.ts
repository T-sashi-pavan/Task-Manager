import { useState, useEffect } from 'react';
import SqliteDatabaseManager from '../database/sqliteDatabase';
import ApiService from '../services/apiService';

interface DatabaseState {
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
}

export function useSqliteDatabase() {
  const [dbState, setDbState] = useState<DatabaseState>({
    isLoading: true,
    error: null,
    isConnected: false
  });

  const [db] = useState(() => new SqliteDatabaseManager());
  const apiService = ApiService.getInstance();

  useEffect(() => {
    const initDatabase = async () => {
      try {
        setDbState({ isLoading: true, error: null, isConnected: false });
        
        // Test connection to the backend
        await apiService.checkHealth();
        
        setDbState({ isLoading: false, error: null, isConnected: true });
      } catch (error) {
        console.error('Failed to connect to database:', error);
        setDbState({ 
          isLoading: false, 
          error: 'Failed to connect to database server. Make sure the backend is running on port 3001.', 
          isConnected: false 
        });
      }
    };

    initDatabase();
  }, [apiService]);

  return { db, dbState };
}
