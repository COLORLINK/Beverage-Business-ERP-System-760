import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import { useERP } from '../context/AppContext';
import { startOfMonth, endOfMonth } from 'date-fns';

const { FiDollarSign, FiShoppingCart, FiUsers, FiTrendingUp, FiMenu } = FiIcons;

const SafeIcon = ({ icon: Icon, ...props }) => {
  return Icon ? <Icon {...props} /> : <FiDollarSign {...props} />;
};

const Dashboard = () => {
  const { formatCurrency, products, sales, employees, calculateTotalRevenue, calculateTotalCosts } = useERP();

  // Get current month analysis
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);

  const totalRevenue = calculateTotalRevenue(currentMonthStart, currentMonthEnd);
  const totalCosts = calculateTotalCosts(currentMonthStart, currentMonthEnd);
  const netProfit = totalRevenue.totalRevenue - totalCosts.totalCosts;
  const profitMargin = totalRevenue.totalRevenue > 0 ? (netProfit / totalRevenue.totalRevenue) * 100 : 0;

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
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          {change !== undefined && (
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your ERP system!</p>
        </div>
        <button className="lg:hidden p-2 rounded-md bg-white shadow-sm">
          <SafeIcon icon={FiMenu} className="h-5 w-5" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue.totalRevenue)}
          icon={FiTrendingUp}
          color="bg-green-500"
          change={12.5}
          subtitle={`${totalRevenue.totalOrders} orders this month`}
        />
        <StatCard
          title="Total Costs"
          value={formatCurrency(totalCosts.totalCosts)}
          icon={FiDollarSign}
          color="bg-red-500"
          change={-3.2}
          subtitle="All cost categories"
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(netProfit)}
          icon={FiDollarSign}
          color={netProfit >= 0 ? "bg-green-500" : "bg-red-500"}
          change={15.3}
          subtitle={`${profitMargin.toFixed(1)}% margin`}
        />
        <StatCard
          title="Active Products"
          value={products.length}
          icon={FiShoppingCart}
          color="bg-blue-500"
          subtitle="In inventory"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue:</span>
              <span className="font-medium text-green-600">{formatCurrency(totalRevenue.totalRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Units Sold:</span>
              <span className="font-medium">{totalRevenue.totalUnits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Order Value:</span>
              <span className="font-medium text-blue-600">{formatCurrency(totalRevenue.avgOrderValue)}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Materials:</span>
              <span className="font-medium text-red-600">{formatCurrency(totalCosts.breakdown.materials)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Variable Costs:</span>
              <span className="font-medium text-orange-600">{formatCurrency(totalCosts.breakdown.variable)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fixed Costs:</span>
              <span className="font-medium text-purple-600">{formatCurrency(totalCosts.breakdown.fixed)}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Employees:</span>
              <span className="font-medium">{employees.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Products:</span>
              <span className="font-medium">{products.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sales This Month:</span>
              <span className="font-medium text-green-600">{sales.length}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Products */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold mb-4">Top Products (This Month)</h3>
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {totalRevenue.revenueByProduct.slice(0, 5).map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {formatCurrency(product.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.units}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.orders}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;