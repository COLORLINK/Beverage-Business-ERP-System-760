import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import { useERP } from '../context/AppContext';

const { FiPlus, FiEdit2, FiTrash2, FiCoffee, FiX } = FiIcons;

const SafeIcon = ({ icon: Icon, ...props }) => {
  return Icon ? <Icon {...props} /> : <FiCoffee {...props} />;
};

const Products = () => {
  const { products, setProducts, ingredients, formatCurrency } = useERP();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    ingredients: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      ingredients: formData.ingredients.map(ing => ({
        id: parseInt(ing.id),
        quantity: parseFloat(ing.quantity)
      })),
      id: editingProduct ? editingProduct.id : Date.now()
    };

    if (editingProduct) {
      setProducts(products.map(prod => 
        prod.id === editingProduct.id ? productData : prod
      ));
    } else {
      setProducts([...products, productData]);
    }

    setShowModal(false);
    setEditingProduct(null);
    setFormData({ name: '', price: '', category: '', ingredients: [] });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      ingredients: product.ingredients.map(ing => ({
        id: ing.id.toString(),
        quantity: ing.quantity.toString()
      }))
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setProducts(products.filter(prod => prod.id !== id));
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { id: '', quantity: '' }]
    });
  };

  const removeIngredient = (index) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    });
  };

  const updateIngredient = (index, field, value) => {
    const updatedIngredients = formData.ingredients.map((ing, i) =>
      i === index ? { ...ing, [field]: value } : ing
    );
    setFormData({ ...formData, ingredients: updatedIngredients });
  };

  const calculateProductCost = (product) => {
    return product.ingredients.reduce((total, ingredient) => {
      const ing = ingredients.find(i => i.id === ingredient.id);
      return total + (ing ? ing.cost * ingredient.quantity : 0);
    }, 0);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <SafeIcon icon={FiPlus} className="h-4 w-4" />
          Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const cost = calculateProductCost(product);
          const profit = product.price - cost;
          const margin = product.price > 0 ? (profit / product.price) * 100 : 0;

          return (
            <motion.div
              key={product.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <SafeIcon icon={FiCoffee} className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    <SafeIcon icon={FiEdit2} className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Price:</span>
                  <span className="font-bold text-green-600">{formatCurrency(product.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cost:</span>
                  <span className="font-medium text-red-600">{formatCurrency(cost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Profit:</span>
                  <span className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(profit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Margin:</span>
                  <span className={`font-medium ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {margin.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-2 font-medium">Recipe:</p>
                <div className="space-y-1">
                  {product.ingredients.map((ing) => {
                    const ingredient = ingredients.find(i => i.id === ing.id);
                    return ingredient ? (
                      <div key={ing.id} className="flex justify-between text-xs">
                        <span className="text-gray-600">
                          {ingredient.name} ({ing.quantity} {ingredient.unit})
                        </span>
                        <span className="text-gray-500">
                          {formatCurrency(ingredient.cost * ing.quantity)}
                        </span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white p-6 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
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
                  <option value="Coffee">Coffee</option>
                  <option value="Tea">Tea</option>
                  <option value="Juice">Juice</option>
                  <option value="Smoothie">Smoothie</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Recipe Ingredients</label>
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                  >
                    <SafeIcon icon={FiPlus} className="h-3 w-3" />
                    Add Ingredient
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {formData.ingredients.map((ing, index) => (
                    <div key={index} className="flex gap-2 items-center bg-gray-50 p-2 rounded">
                      <select
                        value={ing.id}
                        onChange={(e) => updateIngredient(index, 'id', e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                        required
                      >
                        <option value="">Select ingredient</option>
                        {ingredients.map(ingredient => (
                          <option key={ingredient.id} value={ingredient.id}>
                            {ingredient.name} ({formatCurrency(ingredient.cost)}/{ingredient.unit})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step="0.001"
                        placeholder="Qty"
                        value={ing.quantity}
                        onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="p-1 text-red-600 hover:text-red-700"
                      >
                        <SafeIcon icon={FiX} className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    setFormData({ name: '', price: '', category: '', ingredients: [] });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingProduct ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Products;