import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useERP } from '../context/ERPContext';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subDays } from 'date-fns';

const { FiPlus, FiEdit2, FiTrash2, FiShoppingCart, FiCalendar, FiTrendingUp, FiFilter } = FiIcons;

const Sales = () => {
  const { sales, setSales, products, formatCurrency } = useERP();
  const [showModal, setShowModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0],
    customerName: ''
  });

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

  // Filter sales by selected period
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate >= startDate && saleDate <= endDate;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const product = products.find(p => p.id === parseInt(formData.productId));
    if (!product) return;

    const saleData = {
      ...formData,
      productId: parseInt(formData.productId),
      quantity: parseInt(formData.quantity),
      amount: product.price * parseInt(formData.quantity),
      productName: product.name,
      unitPrice: product.price,
      id: editingSale ? editingSale.id : Date.now()
    };

    if (editingSale) {
      setSales(sales.map(sale => 
        sale.id === editingSale.id ? saleData : sale
      ));
    } else {
      setSales([...sales, saleData]);
    }

    setShowModal(false);
    setEditingSale(null);
    setFormData({
      productId: '',
      quantity: '',
      date: new Date().toISOString().split('T')[0],
      customerName: ''
    });
  };

  const handleEdit = (sale) => {
    setEditingSale(sale);
    setFormData({
      productId: sale.productId.toString(),
      quantity: sale.quantity.toString(),
      date: sale.date,
      customerName: sale.customerName || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setSales(sales.filter(sale => sale.id !== id));
  };

  // Calculate statistics for filtered period
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalQuantity = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);
  const averageOrderValue = filteredSales.length > 0 ? totalSales / filteredSales.length : 0;

  // Group sales by product for top products in selected period
  const productSales = filteredSales.reduce((acc, sale) => {
    const key = sale.productId;
    if (!acc[key]) {
      acc[key] = {
        productName: sale.productName,
        totalQuantity: 0,
        totalAmount: 0,
        orderCount: 0
      };
    }
    acc[key].totalQuantity += sale.quantity;
    acc[key].totalAmount += sale.amount;
    acc[key].orderCount += 1;
    return acc;
  }, {});

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-600 mt-1">Track and manage all product sales</p>
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
            Add Sale
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
          <h3 className="text-lg font-semibold text-gray-900">Sales Summary - {periodLabel}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-green-700">Period Revenue</p>
            <p className="text-xl font-bold text-green-900">{formatCurrency(totalSales)}</p>
            <p className="text-xs text-green-600">{filteredSales.length} orders</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-700">Units Sold</p>
            <p className="text-xl font-bold text-blue-900">{totalQuantity}</p>
            <p className="text-xs text-blue-600">Total items</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-purple-700">Avg. Order Value</p>
            <p className="text-xl font-bold text-purple-900">{formatCurrency(averageOrderValue)}</p>
            <p className="text-xs text-purple-600">Per transaction</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-yellow-700">Daily Average</p>
            <p className="text-xl font-bold text-yellow-900">
              {formatCurrency(filteredSales.length > 0 ? totalSales / Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))) : 0)}
            </p>
            <p className="text-xs text-yellow-600">Revenue per day</p>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Sales (All Time)</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(sales.reduce((sum, sale) => sum + sale.amount, 0))}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <SafeIcon icon={FiShoppingCart} className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Items Sold (All Time)</p>
              <p className="text-2xl font-bold text-gray-900">{sales.reduce((sum, sale) => sum + sale.quantity, 0)}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <SafeIcon icon={FiShoppingCart} className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders (All Time)</p>
              <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <SafeIcon icon={FiCalendar} className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Period vs All Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {sales.length > 0 ? ((filteredSales.length / sales.length) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <SafeIcon icon={FiTrendingUp} className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales List */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold mb-4">
            Recent Sales in {periodLabel} ({filteredSales.length} total)
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredSales.slice().reverse().map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <SafeIcon icon={FiShoppingCart} className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{sale.productName}</p>
                    <p className="text-sm text-gray-500">
                      {sale.quantity} × {formatCurrency(sale.unitPrice)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(sale.date), 'MMM dd, yyyy')}
                    </p>
                    {sale.customerName && (
                      <p className="text-xs text-gray-500">Customer: {sale.customerName}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-green-600">{formatCurrency(sale.amount)}</span>
                  <button
                    onClick={() => handleEdit(sale)}
                    className="p-1 text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    <SafeIcon icon={FiEdit2} className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(sale.id)}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <SafeIcon icon={FiTrash2} className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
            {filteredSales.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <SafeIcon icon={FiShoppingCart} className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No sales in {periodLabel}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Products for Period */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-4">Top Products in {periodLabel}</h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.productName}</p>
                    <p className="text-sm text-gray-500">{product.totalQuantity} sold in {product.orderCount} orders</p>
                  </div>
                </div>
                <span className="font-bold text-green-600">{formatCurrency(product.totalAmount)}</span>
              </div>
            ))}
            {topProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No sales data for {periodLabel}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

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
              {editingSale ? 'Edit Sale' : 'Add New Sale'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {formatCurrency(product.price)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name (Optional)</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSale(null);
                    setFormData({
                      productId: '',
                      quantity: '',
                      date: new Date().toISOString().split('T')[0],
                      customerName: ''
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
                  {editingSale ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Sales;