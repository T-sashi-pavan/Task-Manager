import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Clock, 
  BarChart3, 
  FileText, 
  Settings,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'timer', icon: Clock, label: 'Timer' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'reports', icon: FileText, label: 'Reports' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <div className={`fixed left-0 top-0 h-full bg-slate-800/95 backdrop-blur-lg border-r border-slate-700 z-50 transition-all duration-300 ${
        isExpanded ? 'w-64' : 'w-16'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center lg:justify-start text-white hover:text-cyan-400 transition-colors"
          >
            {isExpanded ? (
              <>
                <X className="w-6 h-6" />
                <span className="ml-3 font-bold text-lg">ProductivityPulse</span>
              </>
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id);
                  setIsExpanded(false);
                }}
                className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-orange-500/20 text-cyan-400 shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${
                  isActive ? 'scale-110' : 'group-hover:scale-110'
                }`} />
                
                {isExpanded && (
                  <span className="ml-3 font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}

                {/* Active Indicator */}
                {isActive && !isExpanded && (
                  <div className="absolute left-0 w-1 h-8 bg-gradient-to-b from-cyan-400 to-orange-400 rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Expand Hint */}
        {!isExpanded && (
          <div className="absolute bottom-4 left-4 text-xs text-slate-500 hidden lg:block">
            Hover to expand
          </div>
        )}
      </div>

      {/* Desktop Hover Expansion */}
      <div 
        className="fixed left-0 top-0 w-16 h-full z-40 hidden lg:block"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      />
    </>
  );
};

export default Sidebar;