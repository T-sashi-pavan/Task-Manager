import React from 'react';
import { Plus, TrendingUp, Clock, CheckSquare, Target } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useTimer } from '../hooks/useTimer';
import TaskCard from './TaskCard';

const Dashboard: React.FC = () => {
  const { tasks, updateTask, deleteTask, completeTask } = useTasks();
  const { sessions, formatTime } = useTimer();

  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    activeTasks: tasks.filter(t => t.status === 'active').length,
    totalTime: sessions.reduce((acc, session) => acc + session.duration, 0),
  };

  const recentTasks = tasks
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Good morning! 👋
          </h1>
          <p className="text-slate-400">
            Let's make today productive
          </p>
        </div>
        
        <button className="flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-orange-500 text-white font-bold rounded-full hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-cyan-500/50">
          <Plus className="w-5 h-5 mr-2" />
          Quick Add Task
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tasks */}
        <div className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-lg border border-slate-700 rounded-xl hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-xl">
              <CheckSquare className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-2xl font-bold text-white">{stats.totalTasks}</span>
          </div>
          <h3 className="text-slate-300 font-medium">Total Tasks</h3>
          <p className="text-sm text-slate-500 mt-1">All time</p>
        </div>

        {/* Completed Tasks */}
        <div className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-lg border border-slate-700 rounded-xl hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl">
              <Target className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-2xl font-bold text-white">{stats.completedTasks}</span>
          </div>
          <h3 className="text-slate-300 font-medium">Completed</h3>
          <p className="text-sm text-slate-500 mt-1">
            {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% completion rate
          </p>
        </div>

        {/* Active Tasks */}
        <div className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-lg border border-slate-700 rounded-xl hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-orange-400" />
            </div>
            <span className="text-2xl font-bold text-white">{stats.activeTasks}</span>
          </div>
          <h3 className="text-slate-300 font-medium">In Progress</h3>
          <p className="text-sm text-slate-500 mt-1">Active tasks</p>
        </div>

        {/* Total Time */}
        <div className="p-6 bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-lg border border-slate-700 rounded-xl hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-white">{Math.floor(stats.totalTime / 60)}h</span>
          </div>
          <h3 className="text-slate-300 font-medium">Time Tracked</h3>
          <p className="text-sm text-slate-500 mt-1">{stats.totalTime % 60}min total</p>
        </div>
      </div>

      {/* Recent Tasks */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Recent Tasks</h2>
          <button className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
            View All →
          </button>
        </div>

        {recentTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={updateTask}
                onDelete={deleteTask}
                onComplete={completeTask}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckSquare className="w-12 h-12 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No tasks yet</h3>
            <p className="text-slate-500 mb-6">Create your first task to get started</p>
            <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-orange-500 text-white font-bold rounded-full hover:scale-105 transition-all duration-200">
              Create Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;