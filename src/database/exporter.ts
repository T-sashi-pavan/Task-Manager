import DatabaseService from './service';
import initSqlJs from 'sql.js';

export class DatabaseExporter {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  // Create actual SQLite database file that DB Browser can open directly
  async exportToSQLiteFile(userId: string): Promise<Uint8Array> {
    try {
      console.log('Starting SQLite export...');
      
      const SQL = await initSqlJs({
        locateFile: () => `/sql-wasm.wasm`
      });
      
      console.log('SQL.js initialized successfully');

      const db = new SQL.Database();
      console.log('Database created');
      
      // Create tables
      db.exec(`
        CREATE TABLE users (
          id TEXT PRIMARY KEY,
          username TEXT NOT NULL,
          email TEXT NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE tasks (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          category TEXT NOT NULL,
          priority TEXT CHECK(priority IN ('low', 'medium', 'high')) NOT NULL,
          status TEXT CHECK(status IN ('pending', 'in-progress', 'completed')) NOT NULL,
          time_spent INTEGER DEFAULT 0,
          reminder_time DATETIME,
          notification_enabled BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );

        CREATE TABLE time_sessions (
          id TEXT PRIMARY KEY,
          task_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          start_time DATETIME NOT NULL,
          end_time DATETIME,
          duration INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );

        CREATE TABLE user_settings (
          user_id TEXT PRIMARY KEY,
          dark_mode BOOLEAN DEFAULT FALSE,
          current_view TEXT DEFAULT 'tasks',
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );

        CREATE INDEX idx_tasks_user_id ON tasks(user_id);
        CREATE INDEX idx_tasks_status ON tasks(status);
        CREATE INDEX idx_time_sessions_task_id ON time_sessions(task_id);
        CREATE INDEX idx_time_sessions_user_id ON time_sessions(user_id);
      `);

      console.log('Tables created');

      // Get user data
      const userData = await this.dbService.loadUserData(userId);
      console.log('User data loaded:', userData);
      
      // Get actual user info from database
      const userInfo = await this.dbService.getUser(userId);
      console.log('User info loaded:', userInfo);
      
      // Insert user with actual data (password will be hashed, but we need a placeholder for export)
      const insertUser = db.prepare(`
        INSERT INTO users (id, username, email, password, created_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertUser.run([
        userId, 
        userInfo?.username || 'user', 
        userInfo?.email || 'user@example.com',
        '[HASHED_PASSWORD]', // Placeholder for security
        userInfo?.createdAt?.toISOString() || new Date().toISOString()
      ]);
      console.log('User inserted');

      // Insert tasks
      const insertTask = db.prepare(`
        INSERT INTO tasks (id, user_id, title, description, category, priority, status, time_spent, reminder_time, notification_enabled, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (const task of userData.tasks) {
        insertTask.run([
          task.id,
          userId,
          task.title,
          task.description,
          task.category,
          task.priority,
          task.status,
          task.timeSpent,
          task.reminderTime ? task.reminderTime.toISOString() : null,
          task.notificationEnabled ? 1 : 0,
          task.createdAt.toISOString(),
          task.updatedAt.toISOString()
        ]);
      }
      console.log(`${userData.tasks.length} tasks inserted`);

      // Insert time sessions
      const insertSession = db.prepare(`
        INSERT INTO time_sessions (id, task_id, user_id, start_time, end_time, duration, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (const session of userData.timeSessions) {
        insertSession.run([
          session.id,
          session.taskId,
          userId,
          session.startTime.toISOString(),
          session.endTime ? session.endTime.toISOString() : null,
          session.duration,
          session.startTime.toISOString()
        ]);
      }
      console.log(`${userData.timeSessions.length} time sessions inserted`);

      // Insert user settings
      const insertSettings = db.prepare(`
        INSERT INTO user_settings (user_id, dark_mode, current_view)
        VALUES (?, ?, ?)
      `);
      insertSettings.run([userId, userData.settings.darkMode ? 1 : 0, userData.settings.currentView]);
      console.log('User settings inserted');

      // Export as binary data
      const data = db.export();
      console.log('Database exported, size:', data.length, 'bytes');
      db.close();
      
      return data;
    } catch (error) {
      console.error('SQLite export error:', error);
      throw new Error(`Failed to create SQLite file: ${(error as Error).message}`);
    }
  }

  // Download the SQLite database file (this is what DB Browser can open directly!)
  async downloadSQLiteDatabase(userId: string, filename: string = 'productivity-tracker.db'): Promise<void> {
    try {
      console.log('Starting downloadSQLiteDatabase...');
      const dbData = await this.exportToSQLiteFile(userId);
      console.log('Got database data, size:', dbData.length, 'bytes');
      
      const blob = new Blob([dbData], { type: 'application/x-sqlite3' });
      console.log('Created blob:', blob);
      
      const url = URL.createObjectURL(blob);
      console.log('Created object URL:', url);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      console.log('Created download link:', link);
      
      document.body.appendChild(link);
      console.log('Added link to body');
      
      link.click();
      console.log('Clicked download link');
      
      document.body.removeChild(link);
      console.log('Removed link from body');
      
      URL.revokeObjectURL(url);
      console.log('Revoked object URL');
    } catch (error) {
      console.error('downloadSQLiteDatabase error:', error);
      throw new Error(`Failed to download SQLite database: ${(error as Error).message}`);
    }
  }

  // Export user data as SQL script (alternative option)
  async exportUserDataToSQL(userId: string): Promise<string> {
    try {
      const userData = await this.dbService.loadUserData(userId);
      
      let sqlScript = `-- SQLite export for Productivity Tracker
-- Generated on ${new Date().toISOString()}

-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    priority TEXT CHECK(priority IN ('low', 'medium', 'high')) NOT NULL,
    status TEXT CHECK(status IN ('pending', 'in-progress', 'completed')) NOT NULL,
    time_spent INTEGER DEFAULT 0,
    reminder_time DATETIME,
    notification_enabled BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS time_sessions (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    duration INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY,
    dark_mode BOOLEAN DEFAULT FALSE,
    current_view TEXT DEFAULT 'tasks',
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Insert user data
INSERT OR REPLACE INTO users (id, username, email, created_at)
VALUES ('${userId}', 'user', 'user@example.com', '${new Date().toISOString()}');

`;

      // Insert tasks
      for (const task of userData.tasks) {
        const description = task.description.replace(/'/g, "''"); // Escape single quotes
        const title = task.title.replace(/'/g, "''");
        const reminderTime = task.reminderTime ? `'${task.reminderTime.toISOString()}'` : 'NULL';
        
        sqlScript += `INSERT OR REPLACE INTO tasks (id, user_id, title, description, category, priority, status, time_spent, reminder_time, notification_enabled, created_at, updated_at)
VALUES ('${task.id}', '${userId}', '${title}', '${description}', '${task.category}', '${task.priority}', '${task.status}', ${task.timeSpent}, ${reminderTime}, ${task.notificationEnabled ? 1 : 0}, '${task.createdAt.toISOString()}', '${task.updatedAt.toISOString()}');
`;
      }

      // Insert time sessions
      for (const session of userData.timeSessions) {
        const endTime = session.endTime ? `'${session.endTime.toISOString()}'` : 'NULL';
        
        sqlScript += `INSERT OR REPLACE INTO time_sessions (id, task_id, user_id, start_time, end_time, duration, created_at)
VALUES ('${session.id}', '${session.taskId}', '${userId}', '${session.startTime.toISOString()}', ${endTime}, ${session.duration}, '${session.startTime.toISOString()}');
`;
      }

      // Insert user settings
      sqlScript += `INSERT OR REPLACE INTO user_settings (user_id, dark_mode, current_view)
VALUES ('${userId}', ${userData.settings.darkMode ? 1 : 0}, '${userData.settings.currentView}');
`;

      return sqlScript;
    } catch (error) {
      throw new Error(`Failed to export data: ${(error as Error).message}`);
    }
  }

  // Download the SQL file
  async downloadSQLExport(userId: string, filename: string = 'productivity-tracker-export.sql'): Promise<void> {
    try {
      const sqlScript = await this.exportUserDataToSQL(userId);
      
      const blob = new Blob([sqlScript], { type: 'text/sql' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(`Failed to download export: ${(error as Error).message}`);
    }
  }

  // Get statistics for display
  async getUserStatistics(userId: string): Promise<{
    taskStats: {
      total: number;
      completed: number;
      inProgress: number;
      pending: number;
    };
    totalTimeSpent: number;
    totalSessions: number;
  }> {
    try {
      const [taskStats, totalTimeSpent, userData] = await Promise.all([
        this.dbService.getTaskStats(userId),
        this.dbService.getTotalTimeSpent(userId),
        this.dbService.loadUserData(userId)
      ]);

      return {
        taskStats,
        totalTimeSpent,
        totalSessions: userData.timeSessions.length
      };
    } catch (error) {
      throw new Error(`Failed to get statistics: ${(error as Error).message}`);
    }
  }
}

export default DatabaseExporter;
