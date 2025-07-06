import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useERP } from '../context/ERPContext';
import { useAuth } from '../context/AuthContext';

const { FiPlus, FiEdit2, FiTrash2, FiUser, FiPercent, FiDollarSign, FiPieChart } = FiIcons;

const Owners = () => {
  const { owners, setOwners, formatCurrency, calculateOwnerProfits } = useERP();
  const { hasPermission, isAdmin } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    shareCapital: '',
    profitPercentage: '',
    email: '',
    phone: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const ownerData = {
      ...formData,
      shareCapital: parseFloat(formData.shareCapital),
      profitPercentage: parseFloat(formData.profitPercentage),
      id: editingOwner ? editingOwner.id : Date.now()
    };

    if (editingOwner) {
      setOwners(owners.map(owner => 
        owner.id === editingOwner.id ? ownerData : owner
      ));
    } else {
      setOwners([...owners, ownerData]);
    }

    setShowModal(false);
    setEditingOwner(null);
    setFormData({ name: '', shareCapital: '', profitPercentage: '', email: '', phone: '' });
  };

  const handleEdit = (owner) => {
    if (!isAdmin) return;
    setEditingOwner(owner);
    setFormData({
      name: owner.name,
      shareCapital: owner.shareCapital.toString(),
      profitPercentage: owner.profitPercentage.toString(),
      email: owner.email || '',
      phone: owner.phone || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (!isAdmin) return;
    setOwners(owners.filter(owner => owner.id !== id));
  };

  const ownersWithProfits = calculateOwnerProfits();
  const totalShareCapital = owners.reduce((sum, owner) => sum + owner.shareCapital, 0);
  const totalProfitPercentage = owners.reduce((sum, owner) => sum + owner.profitPercentage, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Owners</h1>
          <p className="text-gray-600 mt-1">Manage ownership structure and profit distribution</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <SafeIcon icon={FiPlus} className="h-4 w-4" />
            Add Owner
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Owners</p>
              <p className="text-2xl font-bold text-gray-900">{owners.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <SafeIcon icon={FiUser} className="h-6 w-6 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-500">Total Share Capital</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalShareCapital)}</p>
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
              <p className="text-sm font-medium text-gray-500">Total Profit Share</p>
              <p className={`text-2xl font-bold ${totalProfitPercentage === 100 ? 'text-green-600' : 'text-red-600'}`}>
                {totalProfitPercentage}%
              </p>
              {totalProfitPercentage !== 100 && (
                <p className="text-xs text-red-500">Should equal 100%</p>
              )}
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <SafeIcon icon={FiPercent} className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Owners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {ownersWithProfits.map((owner) => (
          <motion.div
            key={owner.id}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {owner.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{owner.name}</h3>
                  <p className="text-sm text-gray-500">{owner.email}</p>
                </div>
              </div>
              
              {isAdmin && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(owner)}
                    className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    <SafeIcon icon={FiEdit2} className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(owner.id)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Share Capital:</span>
                <span className="font-bold text-green-600">{formatCurrency(owner.shareCapital)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Profit Share:</span>
                <span className="font-bold text-purple-600">{owner.profitPercentage}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Expected Profit:</span>
                <span className={`font-bold ${owner.profitShare >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(owner.profitShare)}
                </span>
              </div>
              
              {owner.phone && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Phone: {owner.phone}</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Profit Distribution Chart */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <SafeIcon icon={FiPieChart} className="h-6 w-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-gray-900">Profit Distribution</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Share Capital
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROI
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ownersWithProfits.map((owner) => {
                const roi = owner.shareCapital > 0 ? (owner.profitShare / owner.shareCapital) * 100 : 0;
                return (
                  <tr key={owner.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold text-sm">
                            {owner.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{owner.name}</div>
                          <div className="text-sm text-gray-500">{owner.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(owner.shareCapital)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {owner.profitPercentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={owner.profitShare >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(owner.profitShare)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={roi >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {roi.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-xl font-bold mb-4">
              {editingOwner ? 'Edit Owner' : 'Add New Owner'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Share Capital (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.shareCapital}
                    onChange={(e) => setFormData({...formData, shareCapital: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profit Share (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.profitPercentage}
                    onChange={(e) => setFormData({...formData, profitPercentage: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingOwner(null);
                    setFormData({ name: '', shareCapital: '', profitPercentage: '', email: '', phone: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingOwner ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Owners;