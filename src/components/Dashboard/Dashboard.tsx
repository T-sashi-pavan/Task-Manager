import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { TasksView } from './Views/TasksView';
import { TimerView } from './Views/TimerView';
import { AnalyticsView } from './Views/AnalyticsView';
import { ReportsView } from './Views/ReportsView';
import { DatabaseView } from './Views/DatabaseView';

export function Dashboard() {
  const { state } = useApp();

  const renderCurrentView = () => {
    switch (state.currentView) {
      case 'tasks':
        return <TasksView />;
      case 'timer':
        return <TimerView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'reports':
        return <ReportsView />;
      case 'database':
        return <DatabaseView />;
      default:
        return <TasksView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 lg:ml-64">
          <div className="p-6">
            <motion.div
              key={state.currentView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderCurrentView()}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}