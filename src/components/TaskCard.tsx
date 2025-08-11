import React, { useState } from 'react';
import { Clock, Edit3, Trash2, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onDelete, onComplete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);

  const categoryColors = {
    work: 'from-blue-500/20 to-blue-600/20 border-blue-500/50',
    urgent: 'from-red-500/20 to-red-600/20 border-red-500/50',
    personal: 'from-green-500/20 to-green-600/20 border-green-500/50',
  };

  const statusIcons = {
    pending: Circle,
    active: AlertCircle,
    completed: CheckCircle,
  };

  const priorityIndicators = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500',
  };

  const StatusIcon = statusIcons[task.status];

  const handleSave = () => {
    onUpdate(task.id, {
      title: editTitle,
      description: editDescription,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setIsEditing(false);
  };

  return (
    <div className={`group relative p-6 bg-gradient-to-br ${categoryColors[task.category]} backdrop-blur-lg border rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20 animate-slideUp`}>
      {/* Priority Indicator */}
      <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${priorityIndicators[task.priority]}`} />

      {/* Status Button */}
      <button
        onClick={() => onComplete(task.id)}
        className={`absolute top-4 left-4 transition-all duration-200 ${
          task.status === 'completed'
            ? 'text-green-400'
            : 'text-slate-400 hover:text-cyan-400 hover:scale-110'
        }`}
      >
        <StatusIcon className="w-5 h-5" />
      </button>

      <div className="ml-8 mr-8">
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Task title"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              rows={3}
              placeholder="Task description"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-orange-500 text-white rounded-lg hover:scale-105 transition-all duration-200"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:scale-105 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className={`font-bold text-lg mb-2 ${
              task.status === 'completed' ? 'text-slate-400 line-through' : 'text-white'
            }`}>
              {task.title}
            </h3>
            
            <p className={`text-sm mb-4 leading-relaxed ${
              task.status === 'completed' ? 'text-slate-500' : 'text-slate-300'
            }`}>
              {task.description}
            </p>

            {/* Meta Information */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-4">
                <span className="capitalize bg-slate-700/50 px-2 py-1 rounded">
                  {task.category}
                </span>
                <span className="capitalize">
                  {task.priority} priority
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{task.estimatedTime}min</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-12 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col space-y-2">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 bg-slate-700/80 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskCard;