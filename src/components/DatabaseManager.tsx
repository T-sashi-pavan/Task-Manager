import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { DatabaseExporter } from '../database/exporter';
import { Download, Database, BarChart3, Clock, CheckCircle, Circle, PlayCircle } from 'lucide-react';

interface DatabaseStats {
  taskStats: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  };
  totalTimeSpent: number;
  totalSessions: number;
}

export function DatabaseManager() {
  const { state, dbState } = useApp();
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exporter] = useState(() => new DatabaseExporter());

  useEffect(() => {
    const loadStats = async () => {
      if (state.user) {
        try {
          const statistics = await exporter.getUserStatistics(state.user.id);
          setStats(statistics);
        } catch (error) {
          console.error('Failed to load statistics:', error);
        }
      }
    };

    loadStats();
  }, [state.user, exporter, state.tasks, state.timeSessions]);

  const handleExportToSQLite = async () => {
    if (!state.user) return;
    
    setIsExporting(true);
    try {
      console.log('DatabaseManager: Starting SQLite export...');
      await exporter.downloadSQLiteDatabase(state.user.id);
      console.log('DatabaseManager: SQLite export completed');
    } catch (error) {
      console.error('DatabaseManager: SQLite export failed:', error);
      alert(`SQLite export failed: ${(error as Error).message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportToSQL = async () => {
    if (!state.user) return;
    
    setIsExporting(true);
    try {
      await exporter.downloadSQLExport(state.user.id);
    } catch (error) {
      console.error('SQL export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (!state.user) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">Please log in to view database information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Database Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-3 mb-4">
          <Database className="text-indigo-500" size={24} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Database Status</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${dbState.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {dbState.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${dbState.isLoading ? 'bg-yellow-500' : 'bg-gray-300'}`} />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {dbState.isLoading ? 'Loading...' : 'Ready'}
            </span>
          </div>
          
          {dbState.error && (
            <div className="col-span-full p-2 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
              Error: {dbState.error}
            </div>
          )}
        </div>
      </motion.div>

      {/* Statistics */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="text-indigo-500" size={24} />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Database Statistics</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mx-auto mb-2">
                <Circle className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.taskStats.total}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Tasks</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg mx-auto mb-2">
                <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.taskStats.completed}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Completed</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mx-auto mb-2">
                <PlayCircle className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.taskStats.inProgress}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">In Progress</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg mx-auto mb-2">
                <Clock className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(stats.totalTimeSpent)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Time Tracked</p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.totalSessions}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Time Sessions Recorded</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.taskStats.pending}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Pending Tasks</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Export Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-3 mb-4">
          <Download className="text-indigo-500" size={24} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Export Options</h2>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Export your data in different formats for analysis with external tools.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <motion.button
            onClick={handleExportToSQLite}
            disabled={isExporting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download size={18} />
                Export as .db File
              </>
            )}
          </motion.button>
          
          <motion.button
            onClick={handleExportToSQL}
            disabled={isExporting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download size={18} />
                Export as .sql Script
              </>
            )}
          </motion.button>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">How to use the exported files:</h4>
          
          <div className="space-y-3 text-sm text-blue-800 dark:text-blue-300">
            <div>
              <h5 className="font-medium">📊 .db File (Recommended):</h5>
              <ol className="ml-4 space-y-1">
                <li>1. Download and install DB Browser for SQLite</li>
                <li>2. Open DB Browser → File → Open Database</li>
                <li>3. Select the downloaded .db file</li>
                <li>4. Browse your data immediately!</li>
              </ol>
            </div>
            
            <div>
              <h5 className="font-medium">📝 .sql Script File:</h5>
              <ol className="ml-4 space-y-1">
                <li>1. Open DB Browser → New Database</li>
                <li>2. File → Import → Database from SQL file</li>
                <li>3. Select the downloaded .sql file</li>
                <li>4. Data will be imported into the new database</li>
              </ol>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
