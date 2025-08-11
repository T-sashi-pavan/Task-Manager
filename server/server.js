const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Enhanced CORS for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? (origin, callback) => {
        // Allow any Vercel deployment URL (including preview deployments)
        const allowedOrigins = [
          'https://task-manager-lovat-six.vercel.app', // Production Vercel URL
          'https://task-manager-z1zx.onrender.com',    // Your Render backend
          process.env.FRONTEND_URL // Additional frontend URL if set
        ].filter(Boolean);
        
        // Allow any vercel.app subdomain for preview deployments
        const isVercelDomain = origin && origin.includes('.vercel.app');
        const isAllowedOrigin = allowedOrigins.includes(origin);
        
        if (isVercelDomain || isAllowedOrigin || !origin) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Database setup - creates taskmanagerdata.db in project root or tmp for production
const dbPath = process.env.NODE_ENV === 'production' 
  ? path.join('/tmp', 'taskmanagerdata.db')
  : path.join(__dirname, '..', 'taskmanagerdata.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tasks table
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      priority TEXT CHECK(priority IN ('low', 'medium', 'high')) NOT NULL,
      status TEXT CHECK(status IN ('pending', 'in-progress', 'completed')) NOT NULL,
      time_spent INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reminder_time DATETIME,
      notification_enabled BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Time sessions table
  db.run(`
    CREATE TABLE IF NOT EXISTS time_sessions (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME,
      duration INTEGER DEFAULT 0,
      FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // User settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY,
      dark_mode BOOLEAN DEFAULT FALSE,
      current_view TEXT DEFAULT 'tasks',
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  console.log('Database tables initialized successfully');
}

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Utility function to generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============ AUTH ROUTES ============

// Register user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ? OR username = ?', [email, username], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (row) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = generateUUID();
      
      db.run(
        'INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)',
        [userId, username, email, hashedPassword],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' });
          }

          // Create default user settings
          db.run(
            'INSERT INTO user_settings (user_id, dark_mode, current_view) VALUES (?, ?, ?)',
            [userId, false, 'tasks'],
            (err) => {
              if (err) {
                console.log('Warning: Failed to create user settings');
              }
            }
          );

          // Generate JWT token
          const token = jwt.sign({ userId, username, email }, JWT_SECRET, { expiresIn: '7d' });
          
          res.status(201).json({
            message: 'User created successfully',
            user: { id: userId, username, email },
            token
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.json({
        message: 'Login successful',
        user: { id: user.id, username: user.username, email: user.email },
        token
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ USER ROUTES ============

// Get user profile
app.get('/api/user/profile', authenticateToken, (req, res) => {
  db.get('SELECT id, username, email, created_at FROM users WHERE id = ?', [req.user.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  });
});

// Get user settings
app.get('/api/user/settings', authenticateToken, (req, res) => {
  db.get('SELECT * FROM user_settings WHERE user_id = ?', [req.user.userId], (err, settings) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!settings) {
      // Return default settings if none exist
      return res.json({ dark_mode: false, current_view: 'tasks' });
    }
    
    res.json({
      dark_mode: Boolean(settings.dark_mode),
      current_view: settings.current_view
    });
  });
});

// Update user settings
app.put('/api/user/settings', authenticateToken, (req, res) => {
  const { dark_mode, current_view } = req.body;
  
  db.run(
    `INSERT OR REPLACE INTO user_settings (user_id, dark_mode, current_view) 
     VALUES (?, ?, ?)`,
    [req.user.userId, dark_mode, current_view],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update settings' });
      }
      
      res.json({ message: 'Settings updated successfully' });
    }
  );
});

// ============ TASK ROUTES ============

// Get all tasks for user
app.get('/api/tasks', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.userId],
    (err, tasks) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Convert database format to frontend format
      const formattedTasks = tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        status: task.status,
        timeSpent: task.time_spent,
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at),
        reminderTime: task.reminder_time ? new Date(task.reminder_time) : null,
        notificationEnabled: Boolean(task.notification_enabled)
      }));
      
      res.json(formattedTasks);
    }
  );
});

// Create new task
app.post('/api/tasks', authenticateToken, (req, res) => {
  const { title, description, category, priority, status, reminderTime, notificationEnabled } = req.body;
  
  if (!title || !category || !priority || !status) {
    return res.status(400).json({ error: 'Title, category, priority, and status are required' });
  }
  
  const taskId = generateUUID();
  const now = new Date().toISOString();
  
  db.run(
    `INSERT INTO tasks (id, user_id, title, description, category, priority, status, 
     time_spent, created_at, updated_at, reminder_time, notification_enabled) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      taskId, req.user.userId, title, description || '', category, priority, status,
      0, now, now, reminderTime || null, notificationEnabled || false
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create task' });
      }
      
      const newTask = {
        id: taskId,
        title,
        description: description || '',
        category,
        priority,
        status,
        timeSpent: 0,
        createdAt: new Date(now),
        updatedAt: new Date(now),
        reminderTime: reminderTime ? new Date(reminderTime) : null,
        notificationEnabled: Boolean(notificationEnabled)
      };
      
      res.status(201).json(newTask);
    }
  );
});

// Update task
app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  const taskId = req.params.id;
  const updates = req.body;
  const now = new Date().toISOString();
  
  // Build dynamic update query
  const updateFields = [];
  const updateValues = [];
  
  Object.keys(updates).forEach(key => {
    if (key === 'timeSpent') {
      updateFields.push('time_spent = ?');
      updateValues.push(updates[key]);
    } else if (key === 'reminderTime') {
      updateFields.push('reminder_time = ?');
      updateValues.push(updates[key]);
    } else if (key === 'notificationEnabled') {
      updateFields.push('notification_enabled = ?');
      updateValues.push(updates[key]);
    } else if (['title', 'description', 'category', 'priority', 'status'].includes(key)) {
      updateFields.push(`${key} = ?`);
      updateValues.push(updates[key]);
    }
  });
  
  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }
  
  updateFields.push('updated_at = ?');
  updateValues.push(now);
  updateValues.push(taskId);
  updateValues.push(req.user.userId);
  
  const query = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`;
  
  db.run(query, updateValues, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update task' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task updated successfully' });
  });
});

// Delete task
app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  const taskId = req.params.id;
  
  // Delete associated time sessions first
  db.run('DELETE FROM time_sessions WHERE task_id = ?', [taskId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete time sessions' });
    }
    
    // Delete the task
    db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, req.user.userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete task' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.json({ message: 'Task deleted successfully' });
    });
  });
});

// ============ TIME SESSION ROUTES ============

// Get time sessions for user
app.get('/api/time-sessions', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM time_sessions WHERE user_id = ? ORDER BY start_time DESC',
    [req.user.userId],
    (err, sessions) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      const formattedSessions = sessions.map(session => ({
        id: session.id,
        taskId: session.task_id,
        startTime: new Date(session.start_time),
        endTime: session.end_time ? new Date(session.end_time) : null,
        duration: session.duration
      }));
      
      res.json(formattedSessions);
    }
  );
});

// Create time session
app.post('/api/time-sessions', authenticateToken, (req, res) => {
  const { taskId, startTime, endTime, duration } = req.body;
  
  if (!taskId || !startTime) {
    return res.status(400).json({ error: 'Task ID and start time are required' });
  }
  
  const sessionId = generateUUID();
  
  db.run(
    'INSERT INTO time_sessions (id, task_id, user_id, start_time, end_time, duration) VALUES (?, ?, ?, ?, ?, ?)',
    [sessionId, taskId, req.user.userId, startTime, endTime || null, duration || 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create time session' });
      }
      
      const newSession = {
        id: sessionId,
        taskId,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        duration: duration || 0
      };
      
      res.status(201).json(newSession);
    }
  );
});

// ============ ANALYTICS ROUTES ============

// Get task statistics
app.get('/api/analytics/task-stats', authenticateToken, (req, res) => {
  db.all(
    'SELECT status, COUNT(*) as count FROM tasks WHERE user_id = ? GROUP BY status',
    [req.user.userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      const stats = {
        total: 0,
        completed: 0,
        'in-progress': 0,
        pending: 0
      };
      
      results.forEach(row => {
        stats[row.status] = row.count;
        stats.total += row.count;
      });
      
      res.json(stats);
    }
  );
});

// Get total time spent
app.get('/api/analytics/total-time', authenticateToken, (req, res) => {
  db.get(
    'SELECT SUM(time_spent) as total_time FROM tasks WHERE user_id = ?',
    [req.user.userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ totalTime: result.total_time || 0 });
    }
  );
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', database: 'Connected' });
});

// Health check endpoint for deployment monitoring
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Task Manager API is running', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Task Manager API Server', 
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      tasks: '/api/tasks/*',
      users: '/api/users/*',
      analytics: '/api/analytics/*'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Task Manager API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 JWT Secret configured: ${JWT_SECRET ? '✅' : '❌'}`);
  console.log(`🗄️  Database file: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
