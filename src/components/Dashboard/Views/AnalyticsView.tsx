import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../../context/AppContext';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { TrendingUp, Clock, Target, Award } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export function AnalyticsView() {
  const { state } = useApp();

  // Calculate analytics data
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter(t => t.status === 'completed').length;
  const totalTimeSpent = state.tasks.reduce((acc, task) => acc + task.timeSpent, 0);
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Category distribution
  const categoryData = state.tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Priority breakdown
  const priorityData = state.tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Time spent by category
  const timeByCategory = state.tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + task.timeSpent;
    return acc;
  }, {} as Record<string, number>);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          color: '#6B7280',
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: '#6B7280',
        },
      },
      y: {
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: '#6B7280',
        },
      },
    },
  };

  const categoryChartData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        label: 'Tasks by Category',
        data: Object.values(categoryData),
        backgroundColor: [
          'rgba(79, 70, 229, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderColor: [
          'rgb(79, 70, 229)',
          'rgb(20, 184, 166)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
          'rgb(34, 197, 94)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const timeChartData = {
    labels: Object.keys(timeByCategory),
    datasets: [
      {
        label: 'Time Spent (minutes)',
        data: Object.values(timeByCategory),
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderColor: 'rgb(79, 70, 229)',
        borderWidth: 2,
      },
    ],
  };

  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: Target,
      color: 'text-blue-500',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: Award,
      color: 'text-green-500',
      bg: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Completion Rate',
      value: `${completionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-purple-500',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      title: 'Time Tracked',
      value: `${Math.floor(totalTimeSpent / 60)}h ${totalTimeSpent % 60}m`,
      icon: Clock,
      color: 'text-orange-500',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Visualize your productivity patterns and performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-effect rounded-xl p-6 hover:glow-effect transition-all duration-300"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bg} mr-4`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      {totalTasks > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tasks by Category */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-effect rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Tasks by Category
            </h3>
            <div className="h-64">
              <Pie data={categoryChartData} options={{ ...chartOptions, maintainAspectRatio: false }} />
            </div>
          </motion.div>

          {/* Time Spent by Category */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-effect rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Time Spent by Category
            </h3>
            <div className="h-64">
              <Bar data={timeChartData} options={{ ...chartOptions, maintainAspectRatio: false }} />
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <TrendingUp size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No data to analyze yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Create some tasks and start tracking time to see your analytics
          </p>
        </motion.div>
      )}

      {/* Priority Breakdown */}
      {totalTasks > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-effect rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Task Priority Distribution
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(priorityData).map(([priority, count]) => {
              const priorityConfig = {
                low: { color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
                medium: { color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
                high: { color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
              };
              
              return (
                <div key={priority} className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full ${priorityConfig[priority as keyof typeof priorityConfig].bg} flex items-center justify-center mb-2`}>
                    <span className={`text-2xl font-bold ${priorityConfig[priority as keyof typeof priorityConfig].color}`}>
                      {count}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                    {priority} Priority
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}