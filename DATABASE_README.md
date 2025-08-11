# Productivity Tracker - Database Integration

## Overview

This productivity tracker application now includes full database integration using IndexedDB (via Dexie) for client-side data storage. All user data including authentication, tasks, time tracking, and settings are persisted in the browser's IndexedDB database.

## Database Features

### 🗄️ Data Storage
- **User Authentication**: Secure user registration and login with password hashing
- **Task Management**: Full CRUD operations for tasks with categories, priorities, and status tracking
- **Time Tracking**: Session-based time tracking with detailed logs
- **User Settings**: Persistent dark mode and view preferences
- **Data Export**: Export data to SQLite format for use with DB Browser for SQLite

### 📊 Database Schema

#### Users Table
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tasks Table
```sql
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
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

#### Time Sessions Table
```sql
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
```

#### User Settings Table
```sql
CREATE TABLE user_settings (
    user_id TEXT PRIMARY KEY,
    dark_mode BOOLEAN DEFAULT FALSE,
    current_view TEXT DEFAULT 'tasks',
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

## Usage

### 🚀 Getting Started

1. **Start the Application**
   ```bash
   npm run dev
   ```

2. **Create an Account**
   - Navigate to the authentication page
   - Register with username, email, and password
   - Your data will be securely stored in IndexedDB

3. **Use the Application**
   - Create and manage tasks
   - Track time spent on tasks
   - View analytics and reports
   - Export your data

### 📥 Database Export

The application includes a **Database** view in the sidebar where you can:

1. **View Database Statistics**
   - Total tasks, completed tasks, time tracked
   - Database connection status
   - Data export options

2. **Export to SQLite**
   - Click "Export to SQLite" to download a .sql file
   - This file contains all your data in SQLite format
   - Import into DB Browser for SQLite for advanced analysis

### 🔧 Using DB Browser for SQLite

1. **Download DB Browser**
   - Get it from [sqlitebrowser.org](https://sqlitebrowser.org/)

2. **Import Your Data**
   - Open DB Browser for SQLite
   - Create a new database or open existing
   - Go to File → Import → Database from SQL file
   - Select your downloaded .sql file
   - Your data will be imported with full schema

3. **Browse Your Data**
   - View all tables (users, tasks, time_sessions, user_settings)
   - Run custom SQL queries
   - Generate reports and analytics
   - Export to various formats (CSV, JSON, etc.)

## Technical Implementation

### 🏗️ Architecture

- **Frontend**: React with TypeScript
- **Database**: IndexedDB via Dexie.js
- **State Management**: React Context with useReducer
- **Authentication**: Client-side with SHA-256 password hashing
- **Export**: SQL generation for SQLite compatibility

### 📁 File Structure

```
src/
├── database/
│   ├── database.ts      # Database schema and operations
│   ├── service.ts       # Business logic layer
│   └── exporter.ts      # Data export functionality
├── hooks/
│   └── useDatabase.ts   # Database hook for components
├── context/
│   └── AppContext.tsx   # Application state with database integration
└── components/
    ├── DatabaseManager.tsx    # Database management UI
    └── Dashboard/
        └── Views/
            └── DatabaseView.tsx   # Database statistics view
```

### 🔐 Security Features

- **Password Hashing**: SHA-256 hashing for password security
- **Data Isolation**: User data is isolated by user ID
- **Input Validation**: SQL injection prevention through parameterized operations
- **Local Storage**: All data stays in the user's browser

### 📊 Analytics Features

- **Task Statistics**: Total, completed, in-progress, pending tasks
- **Time Tracking**: Total time spent, session analytics
- **Category Breakdown**: Tasks by category and priority
- **Progress Tracking**: Completion rates and trends
- **Export Options**: Full data export for external analysis

## Data Export Examples

### Task Analytics Query (for DB Browser)
```sql
SELECT 
    category,
    COUNT(*) as total_tasks,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
    SUM(time_spent) as total_time_minutes
FROM tasks 
GROUP BY category;
```

### Time Tracking Summary
```sql
SELECT 
    DATE(start_time) as date,
    COUNT(*) as sessions,
    SUM(duration) as total_minutes
FROM time_sessions 
GROUP BY DATE(start_time)
ORDER BY date DESC;
```

### Productivity Trends
```sql
SELECT 
    strftime('%Y-%W', created_at) as week,
    COUNT(*) as tasks_created,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as tasks_completed
FROM tasks 
GROUP BY week
ORDER BY week DESC;
```

## Benefits

✅ **Persistent Data**: Never lose your productivity data  
✅ **Offline Capable**: Works without internet connection  
✅ **Privacy Focused**: All data stays in your browser  
✅ **Export Ready**: Easy data export for analysis  
✅ **Professional Analytics**: DB Browser integration for advanced queries  
✅ **Scalable**: Handles large amounts of task and time data  
✅ **Fast Performance**: IndexedDB provides quick data access  

## Browser Compatibility

- Chrome/Chromium-based browsers: ✅ Full support
- Firefox: ✅ Full support  
- Safari: ✅ Full support
- Edge: ✅ Full support

IndexedDB is supported in all modern browsers with excellent performance characteristics.
