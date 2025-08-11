# 📋 Task Manager - Productivity Tracker

A comprehensive full-stack productivity tracker application built with React TypeScript frontend and Node.js backend, featuring real-time task management, time tracking, notifications, and analytics.

![Task Manager](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933.svg)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57.svg)

## 🌟 Features

### 🔐 **Authentication System**
- Secure user registration and login
- JWT token-based authentication
- Password encryption with bcryptjs
- User session management

### 📝 **Task Management**
- Create, edit, delete, and manage tasks
- Task categories and priority levels (High, Medium, Low)
- Task status tracking (Pending, In Progress, Completed)
- Rich task descriptions and details
- Task filtering and organization

### ⏰ **Smart Notifications**
- Custom reminder times for tasks
- Real-time browser alert popups when reminders expire
- Continuous alarm sound until acknowledged
- Visual notification popups with task details
- Sound controls (mute/unmute)

### 🕐 **Time Tracking**
- Built-in timer for task sessions
- Start, pause, and stop time tracking
- Session history and analytics
- Time spent per task tracking

### 📊 **Analytics Dashboard**
- Comprehensive task completion statistics
- Time tracking analytics
- Visual charts and graphs
- Progress reports and insights
- Export functionality for reports

### 🎨 **Modern UI/UX**
- Responsive design for all devices
- Dark/Light mode toggle
- Smooth animations with Framer Motion
- Intuitive user interface
- Mobile-friendly design

## 🛠️ Tech Stack

### **Frontend**
- **React 18.3.1** - Component-based UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Chart.js** - Data visualization
- **Lucide React** - Icon library

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **SQLite3** - Lightweight database
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### **Database**
- **SQLite** - File-based SQL database
- Automatic database creation and initialization
- Tables for users, tasks, time sessions, and user settings

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/T-sashi-pavan/Task-Manager.git
   cd Task-Manager
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Start the backend server**
   ```bash
   npm run server
   ```
   The backend server will start on `http://localhost:3001`

5. **Start the frontend development server**
   ```bash
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

6. **Alternative: Start both servers simultaneously**
   ```bash
   npm run start:all
   ```

## 🚀 **FREE Deployment**

Deploy your Task Manager for **FREE** using:
- **Backend**: Render.com (Free tier with database)
- **Frontend**: Vercel (Free tier)

Quick deployment:
```bash
./deploy-render.sh  # Follow the guide for FREE deployment
```

See `FREE-DEPLOYMENT.md` for complete free deployment guide.

## 📂 Project Structure

```
Task-Manager/
├── 📁 src/                          # Frontend source code
│   ├── 📁 components/               # React components
│   │   ├── 📁 Auth/                # Authentication components
│   │   ├── 📁 Dashboard/           # Dashboard components
│   │   └── 📁 ...                  # Other components
│   ├── 📁 context/                 # React context providers
│   ├── 📁 hooks/                   # Custom React hooks
│   ├── 📁 services/                # API and notification services
│   ├── 📁 types/                   # TypeScript type definitions
│   └── 📁 styles/                  # Global styles
├── 📁 server/                      # Backend source code
│   ├── server.js                   # Express server setup
│   ├── package.json               # Backend dependencies
│   └── taskmanagerdata.db         # SQLite database (auto-generated)
├── 📁 public/                      # Static assets
├── package.json                    # Frontend dependencies
├── vite.config.ts                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
└── README.md                      # Project documentation
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the server directory:
```env
JWT_SECRET=your_jwt_secret_here
PORT=3001
```

### Database
The SQLite database is automatically created and initialized when you first run the backend server. The database file `taskmanagerdata.db` will be created in the project root.

## 🎯 Usage

### 1. **User Registration**
- Create a new account with username, email, and password
- Login with your credentials

### 2. **Task Management**
- Create new tasks with titles, descriptions, categories, and priorities
- Set reminder times for important tasks
- Edit or delete existing tasks
- Mark tasks as completed

### 3. **Time Tracking**
- Start the timer when working on a task
- Pause and resume as needed
- View time tracking analytics

### 4. **Notifications**
- Set custom reminder times for tasks
- Receive browser alerts when reminders expire
- Manage notification settings

### 5. **Analytics**
- View task completion statistics
- Analyze time spent on different categories
- Export reports for external use

## 🚨 Notifications System

The application features a sophisticated notification system:

- **Real-time Monitoring**: Checks every second for expired reminders
- **Browser Alerts**: Native popup alerts when reminder time is reached
- **Custom Popups**: Beautiful in-app notification popups
- **Sound Alerts**: Continuous alarm sound until acknowledged
- **Multiple Triggers**: Both immediate and continuous checking systems

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- 💻 Desktop computers
- 📱 Mobile phones
- 📊 Tablets
- 🖥️ Large screens

## 🔒 Security Features

- **Password Encryption**: All passwords are hashed using bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Properly configured cross-origin resource sharing
- **Input Validation**: Server-side validation for all inputs

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**T-sashi-pavan**
- GitHub: [@T-sashi-pavan](https://github.com/T-sashi-pavan)

## 🙏 Acknowledgments

- React community for excellent documentation
- Tailwind CSS for beautiful styling utilities
- Framer Motion for smooth animations
- All contributors and testers

## 🐛 Bug Reports

If you find any bugs or issues, please create an issue on GitHub with:
- Detailed description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

## 🔮 Future Enhancements

- [ ] Team collaboration features
- [ ] Integration with calendar applications
- [ ] Mobile app development
- [ ] Advanced analytics and insights
- [ ] Export to different file formats
- [ ] Integration with third-party services

---

<div align="center">
  <p>⭐ Star this repository if you find it helpful!</p>
  <p>Made with ❤️ by T-sashi-pavan</p>
</div>
