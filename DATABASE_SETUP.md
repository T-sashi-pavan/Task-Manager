# Productivity Tracker with SQLite Database

This productivity tracker now uses a real SQLite database (`taskmanagerdata.db`) for data persistence.

## Setup & Running

### 1. Start the Backend Server (Required)
```bash
cd server
npm install
npm start
```
The server will:
- Create `taskmanagerdata.db` in the project root automatically
- Run on `http://localhost:3001`
- Store all user data, tasks, and time tracking information

### 2. Start the Frontend
```bash
npm run dev
```
The frontend will run on `http://localhost:5174` and connect to the backend.

## Features

✅ **SQLite Database**: Real database file (`taskmanagerdata.db`) created automatically  
✅ **Task Management**: Create, edit, delete tasks with full persistence  
✅ **User Authentication**: Register/login with encrypted passwords  
✅ **Time Tracking**: Track time spent on tasks  
✅ **Notifications**: Real-time countdown timers and notification popups  
✅ **Data Export**: Export to .sql scripts and .db files  

## Task Editing

- Click the **Edit** button (pencil icon) on any task card
- The task modal will open pre-filled with current data  
- Make changes and save to update the task in the SQLite database

## Notifications

- Set reminder times when creating/editing tasks
- Enable notifications toggle for each task
- Watch live countdown timers on task cards and in the header
- Get popup alerts with sound when reminder time is reached
- Notifications check every second for precise timing

## Database Location

The SQLite database file `taskmanagerdata.db` will be created in your project root directory. You can open this file with DB Browser for SQLite or any SQLite client to view your data.

## Troubleshooting

If you get connection errors:
1. Make sure the backend server is running on port 3001
2. Check that no other service is using port 3001
3. Restart both backend and frontend if needed
