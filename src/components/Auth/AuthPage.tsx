import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { User, Clock, BarChart3, FileText, Moon, Sun } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { state, toggleDarkMode } = useApp();

  const features = [
    { icon: User, title: 'Task Management', desc: 'Organize and prioritize your tasks' },
    { icon: Clock, title: 'Time Tracking', desc: 'Track time spent on each task' },
    { icon: BarChart3, title: 'Analytics', desc: 'Visualize your productivity' },
    { icon: FileText, title: 'Reports', desc: 'Export detailed reports' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-8 floating-animation"
            >
              <div className="w-full h-full rounded-2xl glass-effect flex items-center justify-center">
                <BarChart3 size={40} className="text-white" />
              </div>
            </motion.div>
            
            <h1 className="text-4xl font-bold mb-4">
              Productivity Tracker
            </h1>
            <p className="text-xl opacity-90 mb-12">
              Transform your workflow with intelligent task management and time tracking
            </p>

            <div className="grid grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="glass-effect rounded-xl p-4 text-center"
                >
                  <feature.icon size={24} className="mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-xs opacity-80">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <div className="lg:hidden">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Productivity Tracker
            </h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg glass-effect hover:glow-effect transition-all duration-300"
          >
            {state.darkMode ? (
              <Sun size={20} className="text-yellow-500" />
            ) : (
              <Moon size={20} className="text-gray-600" />
            )}
          </button>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="glass-effect rounded-2xl p-8 shadow-2xl"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {isLogin ? 'Welcome Back' : 'Get Started'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {isLogin ? 'Sign in to your account' : 'Create your account'}
                </p>
              </div>

              {isLogin ? <LoginForm /> : <SignupForm />}

              <div className="mt-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}