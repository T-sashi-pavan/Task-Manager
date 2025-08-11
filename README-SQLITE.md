# Productivity Tracker with SQLite Database

A comprehensive productivity tracking application with SQLite database integration using DB Browser for SQLite compatibility.

## Database Setup

The application now uses a SQLite database (`taskmanagerdata.db`) that will be automatically created in the project root when you first run the server. This database stores:

- **User Data**: Authentication, profiles, and settings
- **Tasks**: All task information including reminders and notifications  
- **Time Tracking**: Timer sessions and time spent on tasks
- **Analytics**: Task statistics and productivity metrics

## Quick Start

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
npm run install:server
```

### 2. Start the Application

```bash
# Start both frontend and backend together
npm run start:all
```

Or start them separately:

```bash
# Terminal 1: Start backend server (port 3001)
npm run server:dev

# Terminal 2: Start frontend (port 5173)
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Database File**: `taskmanagerdata.db` (created automatically in project root)

## Database Features

### SQLite Database Structure

The `taskmanagerdata.db` file contains these tables:

- `users` - User accounts and authentication
- `tasks` - Task management with notifications
- `time_sessions` - Time tracking data  
- `user_settings` - User preferences and settings

### DB Browser for SQLite

You can use DB Browser for SQLite to view and query the database:

1. Download [DB Browser for SQLite](https://sqlitebrowser.org/)
2. Open the `taskmanagerdata.db` file from your project root
3. Browse tables, run queries, and analyze your productivity data

### API Endpoints

The backend provides RESTful API endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/time-sessions` - Get time sessions
- `POST /api/time-sessions` - Create time session
- `GET /api/analytics/task-stats` - Task statistics
- `GET /api/analytics/total-time` - Total time spent

## Features Preserved

All existing features continue to work with the SQLite backend:

✅ **User Authentication** - Sign up/login with encrypted passwords
✅ **Task Management** - Create, edit, delete, and organize tasks
✅ **Time Tracking** - Start/stop timers with session logging
✅ **Notifications** - Real-time reminders with countdown timers
✅ **Analytics** - Task statistics and productivity insights
✅ **Dark Mode** - Theme switching with user preferences
✅ **Export** - Generate reports and export data
✅ **Responsive Design** - Works on desktop and mobile

## Development

### Project Structure

```
project/
├── src/                    # Frontend React application
├── server/                 # Backend Node.js API
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables
├── taskmanagerdata.db     # SQLite database (auto-created)
└── package.json          # Frontend dependencies
```

### Environment Variables

Backend environment variables (server/.env):

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3001
NODE_ENV=development
```

### Database Schema

The SQLite database is automatically initialized with the following schema:

```sql
-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table  
CREATE TABLE tasks (
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
);

-- Time sessions table
CREATE TABLE time_sessions (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    duration INTEGER DEFAULT 0,
    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- User settings table
CREATE TABLE user_settings (
    user_id TEXT PRIMARY KEY,
    dark_mode BOOLEAN DEFAULT FALSE,
    current_view TEXT DEFAULT 'tasks',
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

## Troubleshooting

### Backend Not Starting

1. Make sure you're in the correct directory
2. Check that Node.js is installed
3. Verify dependencies are installed: `npm run install:server`
4. Check port 3001 is not in use

### Database Connection Issues

1. Ensure the backend server is running on port 3001
2. Check the console for database connection messages
3. Verify the `taskmanagerdata.db` file is created in the project root

### Frontend API Errors

1. Confirm backend server is running
2. Check browser console for CORS errors
3. Verify API endpoints are accessible at http://localhost:3001

## Migration from IndexedDB

If you were previously using the IndexedDB version, your data will be stored separately. The SQLite version provides:

- **Better Performance** - Faster queries and data operations
- **Data Persistence** - Database file survives browser cache clearing  
- **External Access** - Use DB Browser for SQLite to analyze data
- **Backup** - Simply copy the `.db` file to backup your data
- **Multi-device** - Potential for future cloud sync capabilities

Enjoy your enhanced productivity tracking with SQLite database integration!
