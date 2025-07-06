import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth, ROLES, PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from '../context/AppContext';

const { FiShield, FiUsers, FiLock, FiUnlock, FiCheck, FiX, FiEdit, FiSave, FiRefreshCw } = FiIcons;

const RolePermissions = () => {
  const { user, getRoleDisplayName, hasPermission, PERMISSIONS: PERMS, getRolePermissions } = useAuth();
  const [selectedRole, setSelectedRole] = useState(ROLES.EMPLOYEE);
  const [editingRole, setEditingRole] = useState(null);
  const [editPermissions, setEditPermissions] = useState([]);
  const [isModified, setIsModified] = useState(false);
  const [customRolePermissions, setCustomRolePermissions] = useState({});

  if (!hasPermission(PERMISSIONS.USER_MANAGE_ROLES)) {
    return (
      <div className="p-6 text-center">
        <SafeIcon icon={FiShield} className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view role permissions.</p>
      </div>
    );
  }

  const permissionCategories = {
    'User Management': [
      PERMISSIONS.USER_CREATE,
      PERMISSIONS.USER_READ,
      PERMISSIONS.USER_UPDATE,
      PERMISSIONS.USER_DELETE,
      PERMISSIONS.USER_MANAGE_ROLES,
      PERMISSIONS.USER_ASSIGN_PERMISSIONS
    ],
    'Product Management': [
      PERMISSIONS.PRODUCT_CREATE,
      PERMISSIONS.PRODUCT_READ,
      PERMISSIONS.PRODUCT_UPDATE,
      PERMISSIONS.PRODUCT_DELETE
    ],
    'Sales Management': [
      PERMISSIONS.SALES_CREATE,
      PERMISSIONS.SALES_READ,
      PERMISSIONS.SALES_UPDATE,
      PERMISSIONS.SALES_DELETE
    ],
    'Employee Management': [
      PERMISSIONS.EMPLOYEE_CREATE,
      PERMISSIONS.EMPLOYEE_READ,
      PERMISSIONS.EMPLOYEE_UPDATE,
      PERMISSIONS.EMPLOYEE_DELETE,
      PERMISSIONS.EMPLOYEE_SALARY_ADJUST
    ],
    'Financial Management': [
      PERMISSIONS.FINANCIAL_READ,
      PERMISSIONS.FINANCIAL_ANALYSIS,
      PERMISSIONS.EXPENSES_CREATE,
      PERMISSIONS.EXPENSES_READ,
      PERMISSIONS.EXPENSES_UPDATE,
      PERMISSIONS.EXPENSES_DELETE
    ],
    'Reports & Analytics': [
      PERMISSIONS.REPORTS_READ,
      PERMISSIONS.REPORTS_EXPORT
    ],
    'System Settings': [
      PERMISSIONS.SETTINGS_READ,
      PERMISSIONS.SETTINGS_UPDATE,
      PERMISSIONS.OWNER_READ,
      PERMISSIONS.OWNER_MANAGE,
      PERMISSIONS.SYSTEM_ADMIN
    ]
  };

  const getPermissionDisplayName = (permission) => {
    const names = {
      [PERMISSIONS.USER_CREATE]: 'Create Users',
      [PERMISSIONS.USER_READ]: 'View Users',
      [PERMISSIONS.USER_UPDATE]: 'Edit Users',
      [PERMISSIONS.USER_DELETE]: 'Delete Users',
      [PERMISSIONS.USER_MANAGE_ROLES]: 'Manage Roles',
      [PERMISSIONS.USER_ASSIGN_PERMISSIONS]: 'Assign Permissions',
      [PERMISSIONS.PRODUCT_CREATE]: 'Create Products',
      [PERMISSIONS.PRODUCT_READ]: 'View Products',
      [PERMISSIONS.PRODUCT_UPDATE]: 'Edit Products',
      [PERMISSIONS.PRODUCT_DELETE]: 'Delete Products',
      [PERMISSIONS.SALES_CREATE]: 'Create Sales',
      [PERMISSIONS.SALES_READ]: 'View Sales',
      [PERMISSIONS.SALES_UPDATE]: 'Edit Sales',
      [PERMISSIONS.SALES_DELETE]: 'Delete Sales',
      [PERMISSIONS.EMPLOYEE_CREATE]: 'Create Employees',
      [PERMISSIONS.EMPLOYEE_READ]: 'View Employees',
      [PERMISSIONS.EMPLOYEE_UPDATE]: 'Edit Employees',
      [PERMISSIONS.EMPLOYEE_DELETE]: 'Delete Employees',
      [PERMISSIONS.EMPLOYEE_SALARY_ADJUST]: 'Adjust Salaries',
      [PERMISSIONS.FINANCIAL_READ]: 'View Financial Data',
      [PERMISSIONS.FINANCIAL_ANALYSIS]: 'Financial Analysis',
      [PERMISSIONS.EXPENSES_CREATE]: 'Create Expenses',
      [PERMISSIONS.EXPENSES_READ]: 'View Expenses',
      [PERMISSIONS.EXPENSES_UPDATE]: 'Edit Expenses',
      [PERMISSIONS.EXPENSES_DELETE]: 'Delete Expenses',
      [PERMISSIONS.REPORTS_READ]: 'View Reports',
      [PERMISSIONS.REPORTS_EXPORT]: 'Export Reports',
      [PERMISSIONS.SETTINGS_READ]: 'View Settings',
      [PERMISSIONS.SETTINGS_UPDATE]: 'Edit Settings',
      [PERMISSIONS.OWNER_READ]: 'View Owners',
      [PERMISSIONS.OWNER_MANAGE]: 'Manage Owners',
      [PERMISSIONS.SYSTEM_ADMIN]: 'System Administration'
    };
    return names[permission] || permission;
  };

  const getRoleColor = (role) => {
    const colors = {
      [ROLES.SUPER_ADMIN]: 'bg-purple-500',
      [ROLES.ADMIN]: 'bg-red-500',
      [ROLES.MANAGER]: 'bg-blue-500',
      [ROLES.EMPLOYEE]: 'bg-green-500',
      [ROLES.VIEWER]: 'bg-gray-500'
    };
    return colors[role] || 'bg-gray-500';
  };

  const startEditing = (role) => {
    if (role === ROLES.SUPER_ADMIN) {
      alert('Cannot edit Super Admin permissions');
      return;
    }
    setEditingRole(role);
    setEditPermissions(getRolePermissions(role));
    setIsModified(false);
  };

  const togglePermission = (permission) => {
    if (editPermissions.includes(permission)) {
      setEditPermissions(editPermissions.filter(p => p !== permission));
    } else {
      setEditPermissions([...editPermissions, permission]);
    }
    setIsModified(true);
  };

  const savePermissions = () => {
    setCustomRolePermissions({
      ...customRolePermissions,
      [editingRole]: editPermissions
    });
    setEditingRole(null);
    setEditPermissions([]);
    setIsModified(false);
    alert('Permissions updated successfully!');
  };

  const resetToDefault = () => {
    if (confirm('Reset to default permissions? This will remove all custom permissions for this role.')) {
      setEditPermissions(DEFAULT_ROLE_PERMISSIONS[editingRole] || []);
      setIsModified(true);
    }
  };

  const cancelEditing = () => {
    if (isModified && !confirm('Discard changes?')) {
      return;
    }
    setEditingRole(null);
    setEditPermissions([]);
    setIsModified(false);
  };

  const currentPermissions = editingRole ? editPermissions : getRolePermissions(selectedRole);
  const isCustomized = customRolePermissions[selectedRole] !== undefined;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role Permissions</h1>
          <p className="text-gray-600 mt-1">Manage role-based access control and permissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Selector */}
        <div className="lg:col-span-1">
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <SafeIcon icon={FiUsers} className="h-5 w-5 text-primary-600" />
              Select Role
            </h3>
            <div className="space-y-3">
              {Object.values(ROLES).map(role => {
                const rolePermissions = getRolePermissions(role);
                const permissionCount = rolePermissions.length;
                const isCustom = customRolePermissions[role] !== undefined;

                return (
                  <div key={role} className="relative">
                    <button
                      onClick={() => setSelectedRole(role)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedRole === role
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getRoleColor(role)}`}></div>
                          <span className="font-medium text-gray-900">
                            {getRoleDisplayName(role)}
                          </span>
                          {isCustom && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                              Custom
                            </span>
                          )}
                        </div>
                        {user?.role === role && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            Your Role
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {permissionCount} permissions
                      </p>
                    </button>
                    {role !== ROLES.SUPER_ADMIN && selectedRole === role && !editingRole && (
                      <button
                        onClick={() => startEditing(role)}
                        className="absolute top-2 right-2 p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Edit permissions"
                      >
                        <SafeIcon icon={FiEdit} className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Permissions Display */}
        <div className="lg:col-span-2">
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${getRoleColor(selectedRole)}`}></div>
                <h3 className="text-lg font-semibold">
                  {getRoleDisplayName(selectedRole)} Permissions
                  {editingRole && (
                    <span className="ml-2 text-sm text-orange-600">(Editing)</span>
                  )}
                </h3>
              </div>
              {editingRole && (
                <div className="flex gap-2">
                  <button
                    onClick={resetToDefault}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <SafeIcon icon={FiRefreshCw} className="h-3 w-3" />
                    Reset
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={savePermissions}
                    className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center gap-1"
                    disabled={!isModified}
                  >
                    <SafeIcon icon={FiSave} className="h-3 w-3" />
                    Save
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {Object.entries(permissionCategories).map(([category, permissions]) => {
                const categoryPermissions = permissions.filter(p => 
                  currentPermissions.includes(p) || selectedRole === ROLES.SUPER_ADMIN
                );

                return (
                  <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <SafeIcon icon={FiShield} className="h-4 w-4 text-gray-600" />
                        {category}
                        <span className="text-sm text-gray-500 ml-auto">
                          {categoryPermissions.length} of {permissions.length}
                        </span>
                      </h4>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 gap-3">
                        {permissions.map(permission => {
                          const hasPermissionCheck = currentPermissions.includes(permission) || selectedRole === ROLES.SUPER_ADMIN;

                          return (
                            <div
                              key={permission}
                              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                                hasPermissionCheck
                                  ? 'bg-green-50 border border-green-200'
                                  : 'bg-gray-50 border border-gray-200'
                              } ${editingRole ? 'hover:bg-blue-50' : ''}`}
                              onClick={() => editingRole && togglePermission(permission)}
                            >
                              <div className="flex items-center gap-3">
                                <SafeIcon 
                                  icon={hasPermissionCheck ? FiCheck : FiX} 
                                  className={`h-4 w-4 ${hasPermissionCheck ? 'text-green-600' : 'text-gray-400'}`} 
                                />
                                <span className={`text-sm font-medium ${
                                  hasPermissionCheck ? 'text-green-900' : 'text-gray-500'
                                }`}>
                                  {getPermissionDisplayName(permission)}
                                </span>
                              </div>
                              {editingRole && (
                                <SafeIcon icon={FiEdit} className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Permission Summary */}
      <motion.div 
        className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <SafeIcon icon={FiLock} className="h-5 w-5 text-primary-600" />
          Permission Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.values(ROLES).map(role => {
            const rolePermissions = getRolePermissions(role);
            const totalPermissions = Object.values(PERMISSIONS).length;
            const permissionPercentage = Math.round((rolePermissions.length / totalPermissions) * 100);
            const isCustom = customRolePermissions[role] !== undefined;

            return (
              <div key={role} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`w-12 h-12 rounded-full ${getRoleColor(role)} mx-auto mb-2 flex items-center justify-center relative`}>
                  <span className="text-white font-bold text-sm">
                    {permissionPercentage}%
                  </span>
                  {isCustom && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">•</span>
                    </div>
                  )}
                </div>
                <h4 className="font-medium text-gray-900 text-sm mb-1">
                  {getRoleDisplayName(role)}
                </h4>
                <p className="text-xs text-gray-500">
                  {rolePermissions.length} of {totalPermissions} permissions
                </p>
                {isCustom && (
                  <p className="text-xs text-orange-600 mt-1">
                    Customized
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default RolePermissions;