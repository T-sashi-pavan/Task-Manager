// Vercel Serverless API Handler
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

// Create Express app
const app = express();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Enhanced CORS for production
const corsOptions = {
  origin: [
    'https://your-frontend-url.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Simple in-memory storage for serverless (you'd want to use a proper database in production)
let users = [];
let tasks = [];
let timeSessions = [];
let userSettings = [];

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Task Manager API is running on Vercel', 
    timestamp: new Date().toISOString(),
    environment: 'serverless'
  });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = users.find(user => user.email === email || user.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = Date.now().toString();
    const newUser = {
      id: userId,
      username,
      email,
      password: hashedPassword,
      created_at: new Date().toISOString()
    };

    users.push(newUser);

    // Create user settings
    userSettings.push({
      userId,
      darkMode: false,
      currentView: 'tasks'
    });

    // Generate token
    const token = jwt.sign({ userId, username, email }, JWT_SECRET);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, username, email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id, username: user.username, email: user.email }, JWT_SECRET);

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Tasks routes
app.get('/api/tasks/user/:userId', authenticateToken, (req, res) => {
  const userTasks = tasks.filter(task => task.userId === req.params.userId);
  res.json(userTasks);
});

app.post('/api/tasks', authenticateToken, (req, res) => {
  try {
    const taskData = {
      id: Date.now().toString(),
      userId: req.user.userId,
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    tasks.push(taskData);
    res.status(201).json(taskData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Export the Express app as a Vercel function
module.exports = app;
