import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import { useAuth, ROLES, PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from '../context/AppContext';

const { FiPlus, FiEdit2, FiTrash2, FiUser, FiShield, FiSearch, FiFilter, FiUsers, FiLock, FiUnlock, FiCheck, FiX, FiEdit, FiSave, FiRefreshCw } = FiIcons;

const SafeIcon = ({ icon: Icon, ...props }) => {
  return Icon ? <Icon {...props} /> : <FiUser {...props} />;
};

const UserRoleManagement = () => {
  const { user: currentUser, hasPermission, getRoleDisplayName, hasAnyPermission, getRolePermissions } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  
  // User Management State
  const [users] = useState([
    {
      id: 1,
      name: currentUser?.name || 'System Administrator',
      email: currentUser?.email || 'admin@company.com',
      role: currentUser?.role || ROLES.SUPER_ADMIN,
      status: 'active',
      department: 'System',
      phone: '+1234567890',
      created_at: '2024-01-01T00:00:00Z',
      last_login: new Date().toISOString(),
      permissions: [],
      customPermissions: []
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Role Permissions State
  const [selectedRole, setSelectedRole] = useState(ROLES.EMPLOYEE);
  const [editingRole, setEditingRole] = useState(null);
  const [editPermissions, setEditPermissions] = useState([]);
  const [isModified, setIsModified] = useState(false);
  const [customRolePermissions, setCustomRolePermissions] = useState({});

  // Check if user has permission to view this page
  if (!hasAnyPermission([PERMISSIONS.USER_READ, PERMISSIONS.USER_MANAGE_ROLES])) {
    return (
      <div className="p-6 text-center">
        <SafeIcon icon={FiShield} className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view user or role management.</p>
      </div>
    );
  }

  // User Management Functions
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role) => {
    const colors = {
      [ROLES.SUPER_ADMIN]: 'bg-purple-100 text-purple-800',
      [ROLES.ADMIN]: 'bg-red-100 text-red-800',
      [ROLES.MANAGER]: 'bg-blue-100 text-blue-800',
      [ROLES.EMPLOYEE]: 'bg-green-100 text-green-800',
      [ROLES.VIEWER]: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  // Role Permissions Functions
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

  const getRoleColorForBadge = (role) => {
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
    // In a real app, this would update the backend
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

  // Render User Management Tab
  const renderUserManagement = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          <p className="text-gray-600 text-sm">Manage users and their access</p>
        </div>
        {hasPermission(PERMISSIONS.USER_CREATE) && (
          <button
            onClick={() => alert('User creation API not yet implemented')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <SafeIcon icon={FiPlus} className="h-4 w-4" />
            Add User
          </button>
        )}
      </div>

      {/* Demo Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">🔧 Demo Mode</h3>
        <div className="text-sm text-blue-700">
          <p><strong>Current Status:</strong> User Management UI is ready, showing demo data.</p>
          <p><strong>Available:</strong> Authentication, Installation, Profile Management</p>
          <p><strong>Note:</strong> This is a frontend demo with sample data</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Roles</option>
            {Object.values(ROLES).map(role => (
              <option key={role} value={role}>{getRoleDisplayName(role)}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            <SafeIcon icon={FiFilter} className="h-4 w-4 mr-2" />
            {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-primary-600 font-bold text-sm">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.department && (
                          <div className="text-xs text-gray-400">{user.department}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {getRoleDisplayName(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => alert('User management API coming soon')}
                        className="text-primary-600 hover:text-primary-900 transition-colors"
                        title="Edit user"
                      >
                        <SafeIcon icon={FiEdit2} className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            <SafeIcon icon={FiUser} className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No users found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render Role Permissions Tab
  const renderRolePermissions = () => (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Role Permissions</h2>
        <p className="text-gray-600 text-sm">Manage role-based access control and permissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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
                          <div className={`w-3 h-3 rounded-full ${getRoleColorForBadge(role)}`}></div>
                          <span className="font-medium text-gray-900">
                            {getRoleDisplayName(role)}
                          </span>
                          {isCustom && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                              Custom
                            </span>
                          )}
                        </div>
                        {currentUser?.role === role && (
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
          </div>
        </div>

        {/* Permissions Display */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${getRoleColorForBadge(selectedRole)}`}></div>
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
                          const hasPermission = currentPermissions.includes(permission) || selectedRole === ROLES.SUPER_ADMIN;

                          return (
                            <div
                              key={permission}
                              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                                hasPermission
                                  ? 'bg-green-50 border border-green-200'
                                  : 'bg-gray-50 border border-gray-200'
                              } ${editingRole ? 'hover:bg-blue-50' : ''}`}
                              onClick={() => editingRole && togglePermission(permission)}
                            >
                              <div className="flex items-center gap-3">
                                <SafeIcon 
                                  icon={hasPermission ? FiCheck : FiX} 
                                  className={`h-4 w-4 ${hasPermission ? 'text-green-600' : 'text-gray-400'}`} 
                                />
                                <span className={`text-sm font-medium ${
                                  hasPermission ? 'text-green-900' : 'text-gray-500'
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
          </div>
        </div>
      </div>

      {/* Permission Summary */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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
                <div className={`w-12 h-12 rounded-full ${getRoleColorForBadge(role)} mx-auto mb-2 flex items-center justify-center relative`}>
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
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User & Role Management</h1>
          <p className="text-gray-600 mt-1">Manage users, roles, and permissions in one place</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <SafeIcon icon={FiUsers} className="h-4 w-4" />
                User Management
              </div>
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'roles'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <SafeIcon icon={FiShield} className="h-4 w-4" />
                Role Permissions
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'users' && renderUserManagement()}
        {activeTab === 'roles' && renderRolePermissions()}
      </motion.div>
    </div>
  );
};

export default UserRoleManagement;