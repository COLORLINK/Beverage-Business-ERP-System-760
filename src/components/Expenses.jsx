import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useERP } from '../context/ERPContext';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subDays } from 'date-fns';

const { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiHome, FiZap, FiTrendingUp, FiTool, FiFilter } = FiIcons;

const Expenses = () => {
  const { expenses, setExpenses, formatCurrency } = useERP();
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: ''
  });

  const expenseTypes = [
    { value: 'rent', label: 'Rent', icon: FiHome, color: 'bg-blue-100 text-blue-600' },
    { value: 'utilities', label: 'Utilities', icon: FiZap, color: 'bg-yellow-100 text-yellow-600' },
    { value: 'marketing', label: 'Marketing', icon: FiTrendingUp, color: 'bg-green-100 text-green-600' },
    { value: 'maintenance', label: 'Maintenance', icon: FiTool, color: 'bg-purple-100 text-purple-600' },
    { value: 'depreciation', label: 'Depreciation', icon: FiDollarSign, color: 'bg-red-100 text-red-600' },
    { value: 'other', label: 'Other', icon: FiDollarSign, color: 'bg-gray-100 text-gray-600' }
  ];

  // Calculate date range based on selected period
  const getDateRange = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'current':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
          label: 'This Month'
        };
      case 'last7':
        return {
          start: subDays(now, 7),
          end: now,
          label: 'Last 7 Days'
        };
      case 'last30':
        return {
          start: subDays(now, 30),
          end: now,
          label: 'Last 30 Days'
        };
      case 'last90':
        return {
          start: subDays(now, 90),
          end: now,
          label: 'Last 90 Days'
        };
      case 'thisYear':
        return {
          start: startOfYear(now),
          end: endOfYear(now),
          label: 'This Year'
        };
      case 'custom':
        if (customStartDate && customEndDate) {
          return {
            start: new Date(customStartDate),
            end: new Date(customEndDate),
            label: `${format(new Date(customStartDate), 'MMM dd')} - ${format(new Date(customEndDate), 'MMM dd, yyyy')}`
          };
        }
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
          label: 'This Month'
        };
      case 'all':
        return {
          start: new Date(0),
          end: now,
          label: 'All Time'
        };
      default:
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
          label: 'This Month'
        };
    }
  };

  const { start: startDate, end: endDate, label: periodLabel } = getDateRange();

  // Filter expenses by selected period
  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount),
      id: editingExpense ? editingExpense.id : Date.now()
    };

    if (editingExpense) {
      setExpenses(expenses.map(exp => 
        exp.id === editingExpense.id ? expenseData : exp
      ));
    } else {
      setExpenses([...expenses, expenseData]);
    }

    setShowModal(false);
    setEditingExpense(null);
    setFormData({
      type: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: ''
    });
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      type: expense.type,
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date,
      category: expense.category || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const getExpenseIcon = (type) => {
    const expenseType = expenseTypes.find(t => t.value === type);
    return expenseType ? expenseType.icon : FiDollarSign;
  };

  const getExpenseColor = (type) => {
    const expenseType = expenseTypes.find(t => t.value === type);
    return expenseType ? expenseType.color : 'bg-gray-100 text-gray-600';
  };

  // Calculate totals by type for filtered period
  const expensesByType = filteredExpenses.reduce((acc, expense) => {
    if (!acc[expense.type]) {
      acc[expense.type] = 0;
    }
    acc[expense.type] += expense.amount;
    return acc;
  }, {});

  const totalFilteredExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalAllExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">Track and manage business expenses</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="current">This Month</option>
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
            <option value="last90">Last 90 Days</option>
            <option value="thisYear">This Year</option>
            <option value="custom">Custom Range</option>
            <option value="all">All Time</option>
          </select>
          
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <SafeIcon icon={FiPlus} className="h-4 w-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Custom Date Range */}
      {selectedPeriod === 'custom' && (
        <motion.div
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Period Summary */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <SafeIcon icon={FiFilter} className="h-6 w-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Expense Summary - {periodLabel}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-red-700">Period Total</p>
            <p className="text-xl font-bold text-red-900">{formatCurrency(totalFilteredExpenses)}</p>
            <p className="text-xs text-red-600">{filteredExpenses.length} expenses</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-700">Daily Average</p>
            <p className="text-xl font-bold text-blue-900">
              {formatCurrency(filteredExpenses.length > 0 ? totalFilteredExpenses / Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))) : 0)}
            </p>
            <p className="text-xs text-blue-600">Per day</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-yellow-700">Period vs All Time</p>
            <p className="text-xl font-bold text-yellow-900">
              {totalAllExpenses > 0 ? ((totalFilteredExpenses / totalAllExpenses) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-yellow-600">Of total expenses</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-purple-700">Largest Expense</p>
            <p className="text-xl font-bold text-purple-900">
              {filteredExpenses.length > 0 ? formatCurrency(Math.max(...filteredExpenses.map(e => e.amount))) : formatCurrency(0)}
            </p>
            <p className="text-xs text-purple-600">Single transaction</p>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Expenses (All Time)</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAllExpenses)}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <SafeIcon icon={FiDollarSign} className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </motion.div>

        {Object.entries(expensesByType).slice(0, 3).map(([type, amount]) => {
          const expenseType = expenseTypes.find(t => t.value === type);
          return (
            <motion.div
              key={type}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{expenseType?.label || type} ({periodLabel})</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(amount)}</p>
                </div>
                <div className={`p-3 rounded-full ${getExpenseColor(type)}`}>
                  <SafeIcon icon={getExpenseIcon(type)} className="h-6 w-6" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Expenses List */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold mb-4">
          Expenses in {periodLabel} ({filteredExpenses.length} total)
        </h3>
        <div className="space-y-4">
          {filteredExpenses.slice().reverse().map((expense) => (
            <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getExpenseColor(expense.type)}`}>
                  <SafeIcon icon={getExpenseIcon(expense.type)} className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{expense.description}</p>
                  <p className="text-sm text-gray-500 capitalize">{expense.type}</p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(expense.date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-red-600">{formatCurrency(expense.amount)}</span>
                <button
                  onClick={() => handleEdit(expense)}
                  className="p-1 text-gray-500 hover:text-primary-600 transition-colors"
                >
                  <SafeIcon icon={FiEdit2} className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <SafeIcon icon={FiTrash2} className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
          {filteredExpenses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <SafeIcon icon={FiDollarSign} className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No expenses in {periodLabel}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-xl font-bold mb-4">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select type</option>
                  {expenseTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category (Optional)</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingExpense(null);
                    setFormData({
                      type: '',
                      description: '',
                      amount: '',
                      date: new Date().toISOString().split('T')[0],
                      category: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingExpense ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Expenses;