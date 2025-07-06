import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useERP } from '../context/ERPContext';

const { FiPlus, FiEdit2, FiTrash2, FiPackage } = FiIcons;

const Ingredients = () => {
  const { ingredients, setIngredients, formatCurrency } = useERP();
  const [showModal, setShowModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    unit: '',
    stock: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const ingredientData = {
      ...formData,
      cost: parseFloat(formData.cost),
      stock: parseInt(formData.stock),
      id: editingIngredient ? editingIngredient.id : Date.now()
    };

    if (editingIngredient) {
      setIngredients(ingredients.map(ing => 
        ing.id === editingIngredient.id ? ingredientData : ing
      ));
    } else {
      setIngredients([...ingredients, ingredientData]);
    }

    setShowModal(false);
    setEditingIngredient(null);
    setFormData({ name: '', cost: '', unit: '', stock: '' });
  };

  const handleEdit = (ingredient) => {
    setEditingIngredient(ingredient);
    setFormData({
      name: ingredient.name,
      cost: ingredient.cost.toString(),
      unit: ingredient.unit,
      stock: ingredient.stock.toString()
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ingredients</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <SafeIcon icon={FiPlus} className="h-4 w-4" />
          Add Ingredient
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ingredients.map((ingredient) => (
          <motion.div
            key={ingredient.id}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <SafeIcon icon={FiPackage} className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{ingredient.name}</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(ingredient)}
                  className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                >
                  <SafeIcon icon={FiEdit2} className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(ingredient.id)}
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Cost:</span>
                <span className="font-medium">{formatCurrency(ingredient.cost)}/{ingredient.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Stock:</span>
                <span className={`font-medium ${ingredient.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                  {ingredient.stock} {ingredient.unit}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
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
              {editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select unit</option>
                  <option value="kg">Kilogram</option>
                  <option value="liter">Liter</option>
                  <option value="bottle">Bottle</option>
                  <option value="piece">Piece</option>
                  <option value="cup">Cup</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingIngredient(null);
                    setFormData({ name: '', cost: '', unit: '', stock: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingIngredient ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Ingredients;