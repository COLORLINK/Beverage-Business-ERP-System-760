import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useERP } from '../context/ERPContext';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subDays } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

const { FiTrendingUp, FiDollarSign, FiShoppingCart, FiUsers, FiFilter, FiBarChart3, FiPieChart } = FiIcons;

const TotalRevenue = () => {
  const { 
    formatCurrency, 
    calculateTotalRevenue,
    products,
    sales
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
  
  // Get comprehensive revenue analysis
  const revenueAnalysis = calculateTotalRevenue(startDate, endDate);

  // Calculate revenue trends for last 6 months
  const getRevenueTrends = () => {
    const trends = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = endOfMonth(subMonths(new Date(), i));
      const monthRevenue = calculateTotalRevenue(monthStart, monthEnd);
      
      trends.push({
        month: format(monthStart, 'MMM'),
        revenue: monthRevenue.totalRevenue,
        orders: monthRevenue.totalOrders,
        avgOrder: monthRevenue.avgOrderValue
      });
    }
    return trends;
  };

  const revenueTrends = getRevenueTrends();

  // Prepare data for charts
  const productRevenueChart = revenueAnalysis.revenueByProduct
    .filter(product => product.revenue > 0)
    .map(product => ({
      name: product.name,
      value: product.revenue,
      units: product.units,
      orders: product.orders
    }));

  const categoryRevenueChart = revenueAnalysis.revenueByCategory
    .filter(category => category.revenue > 0)
    .map(category => ({
      name: category.category,
      value: category.revenue,
      units: category.units,
      share: category.share
    }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

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
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
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
          <h1 className="text-3xl font-bold text-gray-900">Total Revenue Analysis</h1>
          <p className="text-gray-600 mt-1">Comprehensive revenue breakdown and performance metrics</p>
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
          <SafeIcon icon={FiFilter} className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Revenue Summary - {periodLabel}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-green-700">Total Revenue</p>
            <p className="text-xl font-bold text-green-900">{formatCurrency(revenueAnalysis.totalRevenue)}</p>
            <p className="text-xs text-green-600">{revenueAnalysis.totalOrders} orders</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-700">Units Sold</p>
            <p className="text-xl font-bold text-blue-900">{revenueAnalysis.totalUnits}</p>
            <p className="text-xs text-blue-600">Total items</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-purple-700">Avg Order Value</p>
            <p className="text-xl font-bold text-purple-900">{formatCurrency(revenueAnalysis.avgOrderValue)}</p>
            <p className="text-xs text-purple-600">Per transaction</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-yellow-700">Daily Average</p>
            <p className="text-xl font-bold text-yellow-900">{formatCurrency(revenueAnalysis.dailyAverage)}</p>
            <p className="text-xs text-yellow-600">Revenue per day</p>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(revenueAnalysis.totalRevenue)}
          icon={FiTrendingUp}
          color="bg-green-500"
          change={12.5}
        />
        <StatCard
          title="Total Orders"
          value={revenueAnalysis.totalOrders.toLocaleString()}
          icon={FiShoppingCart}
          color="bg-blue-500"
          change={8.3}
        />
        <StatCard
          title="Units Sold"
          value={revenueAnalysis.totalUnits.toLocaleString()}
          icon={FiBarChart3}
          color="bg-purple-500"
          change={15.7}
        />
        <StatCard
          title="Revenue per Unit"
          value={formatCurrency(revenueAnalysis.avgRevenuePerUnit)}
          icon={FiDollarSign}
          color="bg-orange-500"
          change={-2.1}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue by Product */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold mb-4">Revenue by Product</h3>
          {productRevenueChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productRevenueChart}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${formatCurrency(value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {productRevenueChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>No revenue data for {periodLabel}</p>
            </div>
          )}
        </motion.div>

        {/* Revenue Trends */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-4">6-Month Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value, name) => {
                if (name === 'revenue' || name === 'avgOrder') return formatCurrency(value);
                return value;
              }} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={3} 
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Product Performance Table */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold mb-4">Product Performance - {periodLabel}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Order Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue Share
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {revenueAnalysis.revenueByProduct.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="font-bold text-green-600">{formatCurrency(product.revenue)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.units}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(product.avgOrderValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.revenueShare > 40 ? 'bg-green-100 text-green-800' :
                      product.revenueShare > 20 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {product.revenueShare.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Category Analysis */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold mb-4">Revenue by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {revenueAnalysis.revenueByCategory.map((category, index) => (
            <div key={category.category} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{category.category}</h4>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  COLORS[index % COLORS.length] === '#10b981' ? 'bg-green-100 text-green-800' :
                  COLORS[index % COLORS.length] === '#3b82f6' ? 'bg-blue-100 text-blue-800' :
                  COLORS[index % COLORS.length] === '#f59e0b' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {category.share.toFixed(1)}%
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Revenue:</span>
                  <span className="text-sm font-bold text-green-600">{formatCurrency(category.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Units:</span>
                  <span className="text-sm font-medium">{category.units}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Orders:</span>
                  <span className="text-sm font-medium">{category.orders}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default TotalRevenue;