import { useState, useEffect } from 'react';
import { Task } from '../types';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const storedTasks = localStorage.getItem('productivitypulse_tasks');
    if (storedTasks) {
      const parsedTasks = JSON.parse(storedTasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      }));
      setTasks(parsedTasks);
    }
  }, []);

  const saveTasks = (updatedTasks: Task[]) => {
    localStorage.setItem('productivitypulse_tasks', JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'actualTime'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      actualTime: 0,
    };
    
    const updatedTasks = [...tasks, newTask];
    saveTasks(updatedTasks);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    );
    saveTasks(updatedTasks);
  };

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    saveTasks(updatedTasks);
  };

  const completeTask = (id: string) => {
    updateTask(id, { 
      status: 'completed', 
      completedAt: new Date() 
    });
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
  };
};