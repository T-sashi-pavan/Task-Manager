import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { 
  CheckSquare, 
  Clock, 
  BarChart3, 
  FileText, 
  Database,
  Target
} from 'lucide-react';

export function Sidebar() {
  const { state, setCurrentView } = useApp();

  const menuItems = [
    { id: 'tasks', icon: CheckSquare, label: 'Tasks', color: 'text-blue-500' },
    { id: 'timer', icon: Clock, label: 'Time Tracker', color: 'text-green-500' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', color: 'text-purple-500' },
    { id: 'reports', icon: FileText, label: 'Reports', color: 'text-orange-500' },
    { id: 'database', icon: Database, label: 'Database', color: 'text-indigo-500' },
  ];

  const stats = [
    { label: 'Total Tasks', value: state.tasks.length, icon: CheckSquare },
    { label: 'Completed', value: state.tasks.filter(t => t.status === 'completed').length, icon: Target },
    { label: 'Time Tracked', value: `${Math.floor(state.tasks.reduce((acc, task) => acc + task.timeSpent, 0) / 60)}h`, icon: Clock },
  ];

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform -translate-x-full lg:translate-x-0 transition-transform z-40">
      <div className="h-full flex flex-col">
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Navigation
            </h2>
          </div>

          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentView(item.id as any)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                state.currentView === item.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-r-4 border-indigo-600'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon size={20} className={state.currentView === item.id ? 'text-indigo-600 dark:text-indigo-400' : item.color} />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          ))}
        </nav>

        {/* Quick Stats */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Quick Stats
          </h3>
          <div className="space-y-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <stat.icon size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}