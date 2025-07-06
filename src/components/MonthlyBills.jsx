import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useERP } from '../context/ERPContext';
import { useAuth } from '../context/AuthContext';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';

const { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiToggleLeft, FiToggleRight, FiHome, FiZap, FiWifi, FiCalendar, FiClock, FiTrendingUp, FiChevronLeft, FiChevronRight } = FiIcons;

const MonthlyBills = () => {
  const { monthlyBills, setMonthlyBills, billPayments, setBillPayments, formatCurrency, calculateMonthlyOverhead } = useERP();
  const { hasPermission } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    name: '',
    estimatedAmount: '',
    category: '',
    isActive: true,
    billType: 'fixed', // fixed or variable
    dueDay: 1, // day of month when due
    description: ''
  });
  const [paymentData, setPaymentData] = useState({
    actualAmount: '',
    paidDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const categories = [
    { value: 'Fixed', label: 'Fixed Costs', icon: FiHome },
    { value: 'Utilities', label: 'Utilities', icon: FiZap },
    { value: 'Services', label: 'Services', icon: FiWifi },
    { value: 'Other', label: 'Other', icon: FiDollarSign }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const billData = {
      ...formData,
      estimatedAmount: parseFloat(formData.estimatedAmount),
      dueDay: parseInt(formData.dueDay),
      id: editingBill ? editingBill.id : Date.now(),
      createdAt: editingBill ? editingBill.createdAt : new Date().toISOString()
    };

    if (editingBill) {
      setMonthlyBills(monthlyBills.map(bill => 
        bill.id === editingBill.id ? billData : bill
      ));
    } else {
      setMonthlyBills([...monthlyBills, billData]);
    }

    setShowModal(false);
    setEditingBill(null);
    setFormData({
      name: '',
      estimatedAmount: '',
      category: '',
      isActive: true,
      billType: 'fixed',
      dueDay: 1,
      description: ''
    });
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const payment = {
      id: Date.now(),
      billId: selectedBill.id,
      billName: selectedBill.name,
      actualAmount: parseFloat(paymentData.actualAmount),
      paidDate: paymentData.paidDate,
      notes: paymentData.notes,
      month: format(currentMonth, 'yyyy-MM'),
      createdAt: new Date().toISOString()
    };

    setBillPayments([...billPayments, payment]);
    setShowPaymentModal(false);
    setSelectedBill(null);
    setPaymentData({
      actualAmount: '',
      paidDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleEdit = (bill) => {
    if (!hasPermission('update')) return;
    setEditingBill(bill);
    setFormData({
      name: bill.name,
      estimatedAmount: bill.estimatedAmount.toString(),
      category: bill.category,
      isActive: bill.isActive,
      billType: bill.billType || 'fixed',
      dueDay: bill.dueDay || 1,
      description: bill.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (!hasPermission('delete')) return;
    setMonthlyBills(monthlyBills.filter(bill => bill.id !== id));
  };

  const toggleActive = (id) => {
    if (!hasPermission('update')) return;
    setMonthlyBills(monthlyBills.map(bill => 
      bill.id === id ? { ...bill, isActive: !bill.isActive } : bill
    ));
  };

  const openPaymentModal = (bill) => {
    setSelectedBill(bill);
    setPaymentData({
      actualAmount: bill.billType === 'fixed' ? bill.estimatedAmount.toString() : '',
      paidDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowPaymentModal(true);
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : FiDollarSign;
  };

  // Get current month payments
  const currentMonthKey = format(currentMonth, 'yyyy-MM');
  const currentMonthPayments = billPayments.filter(payment => 
    payment.month === currentMonthKey
  );

  // Calculate totals
  const totalEstimated = monthlyBills.filter(bill => bill.isActive).reduce((sum, bill) => sum + bill.estimatedAmount, 0);
  const totalPaid = currentMonthPayments.reduce((sum, payment) => sum + payment.actualAmount, 0);
  const totalUnpaid = monthlyBills.filter(bill => bill.isActive && !currentMonthPayments.find(p => p.billId === bill.id)).reduce((sum, bill) => sum + bill.estimatedAmount, 0);

  // Get bill status for current month
  const getBillStatus = (bill) => {
    const payment = currentMonthPayments.find(p => p.billId === bill.id);
    if (payment) {
      return {
        status: 'paid',
        amount: payment.actualAmount,
        date: payment.paidDate,
        variance: payment.actualAmount - bill.estimatedAmount
      };
    }
    
    const dueDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), bill.dueDay);
    const isOverdue = new Date() > dueDate;
    
    return {
      status: isOverdue ? 'overdue' : 'pending',
      amount: bill.estimatedAmount,
      dueDate: dueDate
    };
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monthly Bills</h1>
          <p className="text-gray-600 mt-1">Manage recurring monthly expenses with payment tracking</p>
        </div>
        <div className="flex gap-3">
          {/* Month Navigation */}
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <SafeIcon icon={FiChevronLeft} className="h-4 w-4" />
            </button>
            <span className="px-4 py-2 font-medium text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <SafeIcon icon={FiChevronRight} className="h-4 w-4" />
            </button>
          </div>
          
          {hasPermission('create') && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <SafeIcon icon={FiPlus} className="h-4 w-4" />
              Add Bill
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Estimated Total</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalEstimated)}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <SafeIcon icon={FiCalendar} className="h-6 w-6 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-500">Paid This Month</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <SafeIcon icon={FiDollarSign} className="h-6 w-6 text-green-600" />
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
              <p className="text-sm font-medium text-gray-500">Unpaid Bills</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalUnpaid)}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <SafeIcon icon={FiClock} className="h-6 w-6 text-red-600" />
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
              <p className="text-sm font-medium text-gray-500">Variance</p>
              <p className={`text-2xl font-bold ${totalPaid - totalEstimated >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(Math.abs(totalPaid - totalEstimated))}
              </p>
              <p className="text-xs text-gray-500">
                {totalPaid > totalEstimated ? 'Over budget' : 'Under budget'}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <SafeIcon icon={FiTrendingUp} className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {monthlyBills.map((bill) => {
          const status = getBillStatus(bill);
          return (
            <motion.div
              key={bill.id}
              className={`bg-white p-6 rounded-xl shadow-sm border-2 ${
                status.status === 'paid' ? 'border-green-200 bg-green-50' :
                status.status === 'overdue' ? 'border-red-200 bg-red-50' :
                'border-gray-200'
              }`}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    status.status === 'paid' ? 'bg-green-100' :
                    status.status === 'overdue' ? 'bg-red-100' :
                    'bg-gray-100'
                  }`}>
                    <SafeIcon 
                      icon={getCategoryIcon(bill.category)} 
                      className={`h-5 w-5 ${
                        status.status === 'paid' ? 'text-green-600' :
                        status.status === 'overdue' ? 'text-red-600' :
                        'text-gray-600'
                      }`} 
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{bill.name}</h3>
                    <p className="text-sm text-gray-500">{bill.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(bill.id)}
                  className="text-gray-500 hover:text-primary-600 transition-colors"
                  disabled={!hasPermission('update')}
                >
                  <SafeIcon 
                    icon={bill.isActive ? FiToggleRight : FiToggleLeft} 
                    className={`h-6 w-6 ${bill.isActive ? 'text-green-600' : 'text-gray-400'}`} 
                  />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium capitalize">
                    {bill.billType === 'fixed' ? 'Fixed Amount' : 'Variable Amount'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Estimated:</span>
                  <span className="font-medium">{formatCurrency(bill.estimatedAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Due Day:</span>
                  <span className="font-medium">{bill.dueDay}{getOrdinalSuffix(bill.dueDay)} of month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-medium ${
                    status.status === 'paid' ? 'text-green-600' :
                    status.status === 'overdue' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {status.status === 'paid' ? 'Paid' :
                     status.status === 'overdue' ? 'Overdue' :
                     'Pending'}
                  </span>
                </div>
                
                {status.status === 'paid' && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Paid Amount:</span>
                      <span className="font-medium">{formatCurrency(status.amount)}</span>
                    </div>
                    {status.variance !== 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Variance:</span>
                        <span className={status.variance > 0 ? 'text-red-600' : 'text-green-600'}>
                          {status.variance > 0 ? '+' : ''}{formatCurrency(status.variance)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-200">
                {status.status !== 'paid' && (
                  <button
                    onClick={() => openPaymentModal(bill)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                  >
                    Pay Bill
                  </button>
                )}
                {hasPermission('update') && (
                  <button
                    onClick={() => handleEdit(bill)}
                    className="flex-1 p-2 text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    <SafeIcon icon={FiEdit2} className="h-4 w-4 mx-auto" />
                  </button>
                )}
                {hasPermission('delete') && (
                  <button
                    onClick={() => handleDelete(bill.id)}
                    className="flex-1 p-2 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <SafeIcon icon={FiTrash2} className="h-4 w-4 mx-auto" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add/Edit Bill Modal */}
      {showModal && hasPermission('create') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-xl font-bold mb-4">
              {editingBill ? 'Edit Monthly Bill' : 'Add New Monthly Bill'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bill Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Office Rent, Electricity"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bill Type</label>
                  <select
                    value={formData.billType}
                    onChange={(e) => setFormData({ ...formData, billType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="fixed">Fixed Amount</option>
                    <option value="variable">Variable Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Day</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dueDay}
                    onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.billType === 'fixed' ? 'Fixed Amount (USD)' : 'Estimated Amount (USD)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.estimatedAmount}
                  onChange={(e) => setFormData({ ...formData, estimatedAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="2"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active (include in calculations)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBill(null);
                    setFormData({
                      name: '',
                      estimatedAmount: '',
                      category: '',
                      isActive: true,
                      billType: 'fixed',
                      dueDay: 1,
                      description: ''
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
                  {editingBill ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-xl font-bold mb-4">Record Payment</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-900">{selectedBill.name}</h3>
              <p className="text-sm text-gray-600">
                Estimated: {formatCurrency(selectedBill.estimatedAmount)}
              </p>
              <p className="text-sm text-gray-600">
                Due: {selectedBill.dueDay}{getOrdinalSuffix(selectedBill.dueDay)} of {format(currentMonth, 'MMMM yyyy')}
              </p>
            </div>
            
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actual Amount Paid</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentData.actualAmount}
                  onChange={(e) => setPaymentData({ ...paymentData, actualAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={paymentData.paidDate}
                  onChange={(e) => setPaymentData({ ...paymentData, paidDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="2"
                  placeholder="Payment method, reference number, etc."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedBill(null);
                    setPaymentData({
                      actualAmount: '',
                      paidDate: new Date().toISOString().split('T')[0],
                      notes: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Helper function for ordinal suffixes
const getOrdinalSuffix = (day) => {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

export default MonthlyBills;