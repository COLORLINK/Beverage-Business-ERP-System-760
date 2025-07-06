import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import { useAuth, PERMISSIONS } from '../context/AppContext';

const { FiHome, FiPackage, FiShoppingCart, FiUsers, FiDollarSign, FiBarChart3, FiSettings, FiTrendingUp, FiFileText, FiUserCheck, FiLogOut, FiPieChart, FiShield, FiUserPlus } = FiIcons;

const SafeIcon = ({ icon: Icon, ...props }) => {
  return Icon ? <Icon {...props} /> : <FiHome {...props} />;
};

const Sidebar = ({ open, setOpen }) => {
  const location = useLocation();
  const { user, logout, hasAnyPermission } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: FiHome, path: '/', permissions: [PERMISSIONS.FINANCIAL_READ] },
    { name: 'User Management', icon: FiUserPlus, path: '/users', permissions: [PERMISSIONS.USER_READ] },
    { name: 'Role Permissions', icon: FiShield, path: '/role-permissions', permissions: [PERMISSIONS.USER_MANAGE_ROLES] },
    { name: 'Ingredients', icon: FiPackage, path: '/ingredients', permissions: [PERMISSIONS.PRODUCT_READ] },
    { name: 'Products', icon: FiShoppingCart, path: '/products', permissions: [PERMISSIONS.PRODUCT_READ] },
    { name: 'Sales', icon: FiTrendingUp, path: '/sales', permissions: [PERMISSIONS.SALES_READ] },
    { name: 'Financial Analysis', icon: FiPieChart, path: '/financial-analysis', permissions: [PERMISSIONS.FINANCIAL_ANALYSIS] },
    { name: 'Employees', icon: FiUsers, path: '/employees', permissions: [PERMISSIONS.EMPLOYEE_READ] },
    { name: 'Expenses', icon: FiDollarSign, path: '/expenses', permissions: [PERMISSIONS.EXPENSES_READ] },
    { name: 'Monthly Bills', icon: FiFileText, path: '/monthly-bills', permissions: [PERMISSIONS.EXPENSES_READ] },
    { name: 'Business Owners', icon: FiUserCheck, path: '/owners', permissions: [PERMISSIONS.OWNER_READ] },
    { name: 'Reports', icon: FiBarChart3, path: '/reports', permissions: [PERMISSIONS.REPORTS_READ] },
    { name: 'Settings', icon: FiSettings, path: '/settings', permissions: [PERMISSIONS.SETTINGS_READ] }
  ];

  const filteredMenuItems = menuItems.filter(item => hasAnyPermission(item.permissions));

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  return (
    <>
      <motion.div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          open ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
        initial={{ x: -256 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-center h-16 bg-primary-600 text-white">
          <h1 className="text-xl font-bold">Drink ERP</h1>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-sm">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        <nav className="mt-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600'
                  : ''
              }`}
              onClick={() => setOpen(false)}
            >
              <SafeIcon icon={item.icon} className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-6 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors mt-4 border-t border-gray-200"
          >
            <SafeIcon icon={FiLogOut} className="mr-3 h-5 w-5" />
            Logout
          </button>
        </nav>
      </motion.div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;