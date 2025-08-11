import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../../context/AppContext';
import { Download, FileText, Calendar, Filter, Printer } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import jsPDF from 'jspdf';

export function ReportsView() {
  const { state } = useApp();
  const [dateRange, setDateRange] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const categories = ['all', ...new Set(state.tasks.map(task => task.category))];

  const getFilteredTasks = () => {
    let filtered = state.tasks;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(task => task.category === selectedCategory);
    }

    // Filter by date range
    const now = new Date();
    switch (dateRange) {
      case 'week':
        const weekStart = startOfWeek(now);
        const weekEnd = endOfWeek(now);
        filtered = filtered.filter(task => 
          task.createdAt >= weekStart && task.createdAt <= weekEnd
        );
        break;
      case 'month':
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        filtered = filtered.filter(task => 
          task.createdAt >= monthStart && task.createdAt <= monthEnd
        );
        break;
      // 'all' case doesn't need filtering
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');
  const totalTimeSpent = filteredTasks.reduce((acc, task) => acc + task.timeSpent, 0);

  const generatePDFReport = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      
      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Productivity Report', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on ${format(new Date(), 'MMMM dd, yyyy')}`, pageWidth / 2, 30, { align: 'center' });
      
      // Summary Stats
      let yPosition = 50;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Summary', 20, yPosition);
      
      yPosition += 15;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Tasks: ${filteredTasks.length}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Completed Tasks: ${completedTasks.length}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Completion Rate: ${filteredTasks.length > 0 ? ((completedTasks.length / filteredTasks.length) * 100).toFixed(1) : 0}%`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Total Time Tracked: ${Math.floor(totalTimeSpent / 60)}h ${totalTimeSpent % 60}m`, 20, yPosition);
      
      // Task Details
      yPosition += 25;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Task Details', 20, yPosition);
      
      yPosition += 15;
      filteredTasks.forEach((task, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. ${task.title}`, 20, yPosition);
        yPosition += 8;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Category: ${task.category} | Priority: ${task.priority} | Status: ${task.status}`, 25, yPosition);
        yPosition += 6;
        pdf.text(`Time Spent: ${Math.floor(task.timeSpent / 60)}h ${task.timeSpent % 60}m`, 25, yPosition);
        yPosition += 6;
        pdf.text(`Created: ${format(task.createdAt, 'MMM dd, yyyy')}`, 25, yPosition);
        yPosition += 12;
      });
      
      pdf.save(`productivity-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCSVReport = () => {
    const headers = ['Title', 'Description', 'Category', 'Priority', 'Status', 'Time Spent (minutes)', 'Created Date', 'Updated Date'];
    const csvContent = [
      headers.join(','),
      ...filteredTasks.map(task => [
        `"${task.title}"`,
        `"${task.description}"`,
        task.category,
        task.priority,
        task.status,
        task.timeSpent,
        format(task.createdAt, 'yyyy-MM-dd'),
        format(task.updatedAt, 'yyyy-MM-dd')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `productivity-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Generate and download detailed productivity reports
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-effect rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Filter size={20} className="mr-2" />
          Report Filters
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="glass-effect rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Report Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
              <FileText size={24} className="text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{filteredTasks.length}</h3>
            <p className="text-gray-600 dark:text-gray-400">Total Tasks</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
              <Calendar size={24} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{completedTasks.length}</h3>
            <p className="text-gray-600 dark:text-gray-400">Completed</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl font-bold text-purple-500">%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {filteredTasks.length > 0 ? ((completedTasks.length / filteredTasks.length) * 100).toFixed(1) : 0}%
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Completion Rate</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-3">
              <span className="text-lg font-bold text-orange-500">⏱️</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.floor(totalTimeSpent / 60)}h {totalTimeSpent % 60}m
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Time Tracked</p>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="glass-effect rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Export Reports</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generatePDFReport}
            disabled={isGenerating || filteredTasks.length === 0}
            className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed glow-effect"
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileText size={20} />
            )}
            <span>{isGenerating ? 'Generating...' : 'Download PDF Report'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateCSVReport}
            disabled={filteredTasks.length === 0}
            className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed glow-effect"
          >
            <Download size={20} />
            <span>Download CSV Report</span>
          </motion.button>
        </div>

        {filteredTasks.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
            No tasks match the current filters. Adjust your filters to generate reports.
          </p>
        )}
      </div>

      {/* Task Preview */}
      {filteredTasks.length > 0 && (
        <div className="glass-effect rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Task Preview</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Task</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.slice(0, 10).map((task) => (
                  <tr key={task.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                          {task.description}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs">
                        {task.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        task.status === 'completed' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : task.status === 'in-progress'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {Math.floor(task.timeSpent / 60)}h {task.timeSpent % 60}m
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredTasks.length > 10 && (
              <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
                Showing 10 of {filteredTasks.length} tasks. Download full report for complete data.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}