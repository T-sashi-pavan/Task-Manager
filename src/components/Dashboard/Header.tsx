import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Bell, Search, Moon, Sun, User, LogOut } from 'lucide-react';
import { NotificationCountdown } from '../NotificationCountdown';

export function Header() {
  const { state, toggleDarkMode, logout } = useApp();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Search */}
          <div className="flex items-center space-x-4">
            <div className="lg:hidden">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Productivity Tracker
              </h1>
            </div>
            
            <div className="hidden md:block relative">
              <div  className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
                <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'gray-900',background:'purple-100',borderRadius: '0.375rem' }}>Task Manager</h1>
              </div>

              {/* <input
                type="text"
                placeholder="Search tasks..."
                className="w-64 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              /> */}
            </div>
          </div>

          {/* Center - Notification Countdown */}
          <div className="hidden lg:block">
            <NotificationCountdown tasks={state.tasks} />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile Countdown */}
            <div className="lg:hidden">
              <NotificationCountdown tasks={state.tasks} compact={true} />
            </div>

            {/* <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {state.darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative"
            >
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </motion.button> */}

            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {state.user?.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {state.user?.email}
                </p>
              </div>
              
              <div className="relative group">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center"
                >
                  <User size={18} className="text-white" />
                </motion.button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="py-2">
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}