import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useERP } from '../context/ERPContext';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subDays } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const { FiDollarSign, FiTrendingDown, FiCalendar, FiPieChart, FiFilter, FiBarChart } = FiIcons;

const TotalCosts = () => {
  const { 
    formatCurrency, 
    calculateTotalCosts,
    employees,
    expenses,
    monthlyBills,
    billPayments,
    salaryAdjustments
  } = useERP();
  
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

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
  
  // Get comprehensive cost analysis
  const costAnalysis = calculateTotalCosts(startDate, endDate);

  // Prepare data for charts
  const pieChartData = [
    { name: 'Materials', value: costAnalysis.breakdown.materials, color: '#ef4444' },
    { name: 'Variable Expenses', value: costAnalysis.breakdown.variable, color: '#f59e0b' },
    { name: 'Fixed Costs', value: costAnalysis.breakdown.fixed, color: '#8b5cf6' },
  ].filter(item => item.value > 0);

  const COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981'];

  // Calculate cost trends for last 6 months
  const getCostTrends = () => {
    const trends = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = endOfMonth(subMonths(new Date(), i));
      const monthCosts = calculateTotalCosts(monthStart, monthEnd);
      
      trends.push({
        month: format(monthStart, 'MMM'),
        materials: monthCosts.breakdown.materials,
        variable: monthCosts.breakdown.variable,
        fixed: monthCosts.breakdown.fixed,
        total: monthCosts.totalCosts
      });
    }
    return trends;
  };

  const costTrends = getCostTrends();

  // Get detailed breakdowns
  const getDetailedBreakdowns = () => {
    // Variable expenses breakdown
    const periodExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    const expensesByType = periodExpenses.reduce((acc, expense) => {
      if (!acc[expense.type]) {
        acc[expense.type] = { total: 0, count: 0, items: [] };
      }
      acc[expense.type].total += expense.amount;
      acc[expense.type].count += 1;
      acc[expense.type].items.push(expense);
      return acc;
    }, {});

    // Fixed costs breakdown
    const activeBills = monthlyBills.filter(bill => bill.isActive);
    const totalSalaries = employees.reduce((sum, emp) => sum + emp.salary, 0);

    return {
      expensesByType,
      fixedCosts: {
        bills: activeBills.reduce((sum, bill) => sum + bill.estimatedAmount, 0),
        salaries: totalSalaries
      }
    };
  };

  const breakdowns = getDetailedBreakdowns();

  const StatCard = ({ title, value, icon, color, change, subtitle }) => (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <SafeIcon icon={icon} className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Total Costs Analysis</h1>
          <p className="text-gray-600 mt-1">Comprehensive cost breakdown and analysis</p>
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
          <SafeIcon icon={FiFilter} className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Cost Summary - {periodLabel}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-red-700">Total Costs</p>
            <p className="text-xl font-bold text-red-900">{formatCurrency(costAnalysis.totalCosts)}</p>
            <p className="text-xs text-red-600">All categories</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-orange-700">Materials</p>
            <p className="text-xl font-bold text-orange-900">{formatCurrency(costAnalysis.breakdown.materials)}</p>
            <p className="text-xs text-orange-600">{((costAnalysis.breakdown.materials / costAnalysis.totalCosts) * 100).toFixed(1)}% of total</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-purple-700">Variable Costs</p>
            <p className="text-xl font-bold text-purple-900">{formatCurrency(costAnalysis.breakdown.variable)}</p>
            <p className="text-xs text-purple-600">{((costAnalysis.breakdown.variable / costAnalysis.totalCosts) * 100).toFixed(1)}% of total</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-700">Fixed Costs</p>
            <p className="text-xl font-bold text-blue-900">{formatCurrency(costAnalysis.breakdown.fixed)}</p>
            <p className="text-xs text-blue-600">{((costAnalysis.breakdown.fixed / costAnalysis.totalCosts) * 100).toFixed(1)}% of total</p>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Direct Material Costs"
          value={formatCurrency(costAnalysis.directMaterialCosts)}
          icon={FiDollarSign}
          color="bg-red-500"
          change={5.2}
        />
        <StatCard
          title="Variable Expenses"
          value={formatCurrency(costAnalysis.variableExpenses)}
          icon={FiTrendingDown}
          color="bg-orange-500"
          change={-2.1}
        />
        <StatCard
          title="Fixed Overhead"
          value={formatCurrency(costAnalysis.allocatedFixedCosts)}
          icon={FiCalendar}
          color="bg-purple-500"
          change={1.3}
        />
        <StatCard
          title="Actual Payments"
          value={formatCurrency(costAnalysis.actualBillPayments)}
          icon={FiPieChart}
          color="bg-blue-500"
          subtitle="Bills paid in period"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Cost Distribution Pie Chart */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold mb-4">Cost Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Cost Trends */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-4">6-Month Cost Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="materials" stackId="a" fill="#ef4444" name="Materials" />
              <Bar dataKey="variable" stackId="a" fill="#f59e0b" name="Variable" />
              <Bar dataKey="fixed" stackId="a" fill="#8b5cf6" name="Fixed" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Variable Expenses Breakdown */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold mb-4">Variable Expenses Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(breakdowns.expensesByType).map(([type, data]) => (
              <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <SafeIcon icon={FiBarChart} className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{type}</p>
                    <p className="text-sm text-gray-500">{data.count} transactions</p>
                  </div>
                </div>
                <span className="font-bold text-orange-600">{formatCurrency(data.total)}</span>
              </div>
            ))}
            {Object.keys(breakdowns.expensesByType).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No variable expenses in {periodLabel}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Fixed Costs Breakdown */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold mb-4">Fixed Costs Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <SafeIcon icon={FiCalendar} className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Monthly Bills</p>
                  <p className="text-sm text-gray-500">{monthlyBills.filter(b => b.isActive).length} active bills</p>
                </div>
              </div>
              <span className="font-bold text-blue-600">{formatCurrency(breakdowns.fixedCosts.bills)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <SafeIcon icon={FiDollarSign} className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Employee Salaries</p>
                  <p className="text-sm text-gray-500">{employees.length} employees</p>
                </div>
              </div>
              <span className="font-bold text-purple-600">{formatCurrency(breakdowns.fixedCosts.salaries)}</span>
            </div>
            {costAnalysis.salaryAdjustments !== 0 && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <SafeIcon icon={FiTrendingDown} className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Salary Adjustments</p>
                    <p className="text-sm text-gray-500">Period adjustments</p>
                  </div>
                </div>
                <span className={`font-bold ${costAnalysis.salaryAdjustments >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(Math.abs(costAnalysis.salaryAdjustments))}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TotalCosts;