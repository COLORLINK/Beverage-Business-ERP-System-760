import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useERP } from '../context/ERPContext';
import { format } from 'date-fns';

const { FiPlus, FiEdit2, FiTrash2, FiUser, FiDollarSign, FiTrendingUp, FiTrendingDown, FiCalendar, FiClock } = FiIcons;

const Employees = () => {
  const { employees, setEmployees, salaryAdjustments, setSalaryAdjustments, formatCurrency } = useERP();
  const [showModal, setShowModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    salary: '',
    type: 'monthly',
    email: '',
    phone: ''
  });
  const [adjustmentData, setAdjustmentData] = useState({
    amount: '',
    type: 'bonus', // bonus, deduction, overtime
    reason: '',
    month: new Date().toISOString().slice(0, 7), // YYYY-MM format
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const employeeData = {
      ...formData,
      salary: parseFloat(formData.salary),
      id: editingEmployee ? editingEmployee.id : Date.now()
    };

    if (editingEmployee) {
      setEmployees(employees.map(emp => 
        emp.id === editingEmployee.id ? employeeData : emp
      ));
    } else {
      setEmployees([...employees, employeeData]);
    }

    setShowModal(false);
    setEditingEmployee(null);
    setFormData({
      name: '',
      position: '',
      salary: '',
      type: 'monthly',
      email: '',
      phone: ''
    });
  };

  const handleAdjustmentSubmit = (e) => {
    e.preventDefault();
    const adjustment = {
      id: Date.now(),
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      amount: parseFloat(adjustmentData.amount),
      type: adjustmentData.type,
      reason: adjustmentData.reason,
      month: adjustmentData.month,
      description: adjustmentData.description,
      createdAt: new Date().toISOString()
    };

    setSalaryAdjustments([...salaryAdjustments, adjustment]);
    setShowAdjustmentModal(false);
    setSelectedEmployee(null);
    setAdjustmentData({
      amount: '',
      type: 'bonus',
      reason: '',
      month: new Date().toISOString().slice(0, 7),
      description: ''
    });
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      position: employee.position,
      salary: employee.salary.toString(),
      type: employee.type,
      email: employee.email || '',
      phone: employee.phone || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setEmployees(employees.filter(emp => emp.id !== id));
    // Also remove related salary adjustments
    setSalaryAdjustments(salaryAdjustments.filter(adj => adj.employeeId !== id));
  };

  const openAdjustmentModal = (employee) => {
    setSelectedEmployee(employee);
    setAdjustmentData({
      amount: '',
      type: 'bonus',
      reason: '',
      month: new Date().toISOString().slice(0, 7),
      description: ''
    });
    setShowAdjustmentModal(true);
  };

  // Calculate effective salary for current month
  const getEffectiveSalary = (employee, month = new Date().toISOString().slice(0, 7)) => {
    const monthlyAdjustments = salaryAdjustments.filter(adj => 
      adj.employeeId === employee.id && adj.month === month
    );
    
    const totalAdjustments = monthlyAdjustments.reduce((sum, adj) => {
      return sum + (adj.type === 'deduction' ? -adj.amount : adj.amount);
    }, 0);

    return employee.salary + totalAdjustments;
  };

  // Get current month adjustments for an employee
  const getCurrentMonthAdjustments = (employeeId) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return salaryAdjustments.filter(adj => 
      adj.employeeId === employeeId && adj.month === currentMonth
    );
  };

  // Calculate totals
  const baseSalaryExpense = employees.reduce((sum, emp) => sum + emp.salary, 0);
  const currentMonthAdjustments = salaryAdjustments.filter(adj => 
    adj.month === new Date().toISOString().slice(0, 7)
  );
  const totalAdjustments = currentMonthAdjustments.reduce((sum, adj) => {
    return sum + (adj.type === 'deduction' ? -adj.amount : adj.amount);
  }, 0);
  const totalEffectiveSalary = baseSalaryExpense + totalAdjustments;

  const adjustmentTypes = [
    { value: 'bonus', label: 'Bonus', icon: FiTrendingUp, color: 'text-green-600' },
    { value: 'overtime', label: 'Overtime Pay', icon: FiClock, color: 'text-blue-600' },
    { value: 'deduction', label: 'Deduction', icon: FiTrendingDown, color: 'text-red-600' },
    { value: 'allowance', label: 'Allowance', icon: FiDollarSign, color: 'text-purple-600' }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <SafeIcon icon={FiPlus} className="h-4 w-4" />
          Add Employee
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Base Salary Expense</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(baseSalaryExpense)}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <SafeIcon icon={FiDollarSign} className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Monthly Adjustments</p>
              <p className={`text-2xl font-bold ${totalAdjustments >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalAdjustments >= 0 ? '+' : ''}{formatCurrency(totalAdjustments)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <SafeIcon icon={totalAdjustments >= 0 ? FiTrendingUp : FiTrendingDown} className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Effective Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalEffectiveSalary)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <SafeIcon icon={FiDollarSign} className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <SafeIcon icon={FiUser} className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => {
          const effectiveSalary = getEffectiveSalary(employee);
          const currentAdjustments = getCurrentMonthAdjustments(employee.id);
          const salaryDifference = effectiveSalary - employee.salary;

          return (
            <motion.div
              key={employee.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <SafeIcon icon={FiUser} className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-500">{employee.position}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openAdjustmentModal(employee)}
                    className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                    title="Add Salary Adjustment"
                  >
                    <SafeIcon icon={FiDollarSign} className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(employee)}
                    className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    <SafeIcon icon={FiEdit2} className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(employee.id)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Base Salary:</span>
                  <span className="font-medium">{formatCurrency(employee.salary)}</span>
                </div>
                
                {salaryDifference !== 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Adjustments:</span>
                    <span className={`font-medium ${salaryDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {salaryDifference >= 0 ? '+' : ''}{formatCurrency(salaryDifference)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-700 font-medium">Effective Salary:</span>
                  <span className="font-bold text-gray-900">{formatCurrency(effectiveSalary)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium capitalize">{employee.type}</span>
                </div>

                {employee.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span className="font-medium text-xs">{employee.email}</span>
                  </div>
                )}

                {employee.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone:</span>
                    <span className="font-medium">{employee.phone}</span>
                  </div>
                )}

                {/* Current Month Adjustments */}
                {currentAdjustments.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">This Month:</p>
                    <div className="space-y-1">
                      {currentAdjustments.map((adj) => {
                        const adjType = adjustmentTypes.find(t => t.value === adj.type);
                        return (
                          <div key={adj.id} className="flex justify-between text-xs">
                            <span className={`${adjType?.color || 'text-gray-600'}`}>
                              {adjType?.label || adj.type}: {adj.reason}
                            </span>
                            <span className={`font-medium ${adj.type === 'deduction' ? 'text-red-600' : 'text-green-600'}`}>
                              {adj.type === 'deduction' ? '-' : '+'}{formatCurrency(adj.amount)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Salary Adjustments */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold mb-4">Recent Salary Adjustments</h3>
        {salaryAdjustments.length > 0 ? (
          <div className="space-y-3">
            {salaryAdjustments.slice().reverse().slice(0, 10).map((adjustment) => {
              const adjType = adjustmentTypes.find(t => t.value === adjustment.type);
              return (
                <div key={adjustment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${adjustment.type === 'deduction' ? 'bg-red-100' : 'bg-green-100'}`}>
                      <SafeIcon 
                        icon={adjType?.icon || FiDollarSign} 
                        className={`h-4 w-4 ${adjustment.type === 'deduction' ? 'text-red-600' : 'text-green-600'}`} 
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{adjustment.employeeName}</p>
                      <p className="text-sm text-gray-500">{adjType?.label || adjustment.type}: {adjustment.reason}</p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(adjustment.month), 'MMMM yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${adjustment.type === 'deduction' ? 'text-red-600' : 'text-green-600'}`}>
                      {adjustment.type === 'deduction' ? '-' : '+'}{formatCurrency(adjustment.amount)}
                    </p>
                    {adjustment.description && (
                      <p className="text-xs text-gray-500">{adjustment.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <SafeIcon icon={FiCalendar} className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No salary adjustments recorded yet</p>
          </div>
        )}
      </motion.div>

      {/* Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-xl font-bold mb-4">
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Salary (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="monthly">Monthly</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEmployee(null);
                    setFormData({
                      name: '',
                      position: '',
                      salary: '',
                      type: 'monthly',
                      email: '',
                      phone: ''
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
                  {editingEmployee ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Salary Adjustment Modal */}
      {showAdjustmentModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-xl font-bold mb-4">Salary Adjustment</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-900">{selectedEmployee.name}</h3>
              <p className="text-sm text-gray-600">
                Base Salary: {formatCurrency(selectedEmployee.salary)}
              </p>
            </div>
            
            <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={adjustmentData.type}
                    onChange={(e) => setAdjustmentData({ ...adjustmentData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    {adjustmentTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={adjustmentData.amount}
                    onChange={(e) => setAdjustmentData({ ...adjustmentData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <input
                  type="month"
                  value={adjustmentData.month}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, month: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <input
                  type="text"
                  value={adjustmentData.reason}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Extra hours, Performance bonus, Late arrival"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={adjustmentData.description}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="2"
                  placeholder="Additional details..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdjustmentModal(false);
                    setSelectedEmployee(null);
                    setAdjustmentData({
                      amount: '',
                      type: 'bonus',
                      reason: '',
                      month: new Date().toISOString().slice(0, 7),
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
                  Add Adjustment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Employees;