import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Define roles and permissions
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  VIEWER: 'viewer'
};

export const PERMISSIONS = {
  // User Management
  USER_CREATE: 'user_create',
  USER_READ: 'user_read',
  USER_UPDATE: 'user_update',
  USER_DELETE: 'user_delete',
  USER_MANAGE_ROLES: 'user_manage_roles',
  USER_ASSIGN_PERMISSIONS: 'user_assign_permissions',
  
  // Product Management
  PRODUCT_CREATE: 'product_create',
  PRODUCT_READ: 'product_read',
  PRODUCT_UPDATE: 'product_update',
  PRODUCT_DELETE: 'product_delete',
  
  // Sales Management
  SALES_CREATE: 'sales_create',
  SALES_READ: 'sales_read',
  SALES_UPDATE: 'sales_update',
  SALES_DELETE: 'sales_delete',
  
  // Employee Management
  EMPLOYEE_CREATE: 'employee_create',
  EMPLOYEE_READ: 'employee_read',
  EMPLOYEE_UPDATE: 'employee_update',
  EMPLOYEE_DELETE: 'employee_delete',
  EMPLOYEE_SALARY_ADJUST: 'employee_salary_adjust',
  
  // Financial Management
  FINANCIAL_READ: 'financial_read',
  FINANCIAL_ANALYSIS: 'financial_analysis',
  EXPENSES_CREATE: 'expenses_create',
  EXPENSES_READ: 'expenses_read',
  EXPENSES_UPDATE: 'expenses_update',
  EXPENSES_DELETE: 'expenses_delete',
  
  // Reports
  REPORTS_READ: 'reports_read',
  REPORTS_EXPORT: 'reports_export',
  
  // Settings
  SETTINGS_READ: 'settings_read',
  SETTINGS_UPDATE: 'settings_update',
  
  // Owner Management
  OWNER_READ: 'owner_read',
  OWNER_MANAGE: 'owner_manage',
  
  // System Admin
  SYSTEM_ADMIN: 'system_admin'
};

// Default role-based permissions
export const DEFAULT_ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_ASSIGN_PERMISSIONS,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_READ,
    PERMISSIONS.SALES_UPDATE,
    PERMISSIONS.SALES_DELETE,
    PERMISSIONS.EMPLOYEE_CREATE,
    PERMISSIONS.EMPLOYEE_READ,
    PERMISSIONS.EMPLOYEE_UPDATE,
    PERMISSIONS.EMPLOYEE_DELETE,
    PERMISSIONS.EMPLOYEE_SALARY_ADJUST,
    PERMISSIONS.FINANCIAL_READ,
    PERMISSIONS.FINANCIAL_ANALYSIS,
    PERMISSIONS.EXPENSES_CREATE,
    PERMISSIONS.EXPENSES_READ,
    PERMISSIONS.EXPENSES_UPDATE,
    PERMISSIONS.EXPENSES_DELETE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.OWNER_READ
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_READ,
    PERMISSIONS.SALES_UPDATE,
    PERMISSIONS.EMPLOYEE_READ,
    PERMISSIONS.EMPLOYEE_SALARY_ADJUST,
    PERMISSIONS.FINANCIAL_READ,
    PERMISSIONS.FINANCIAL_ANALYSIS,
    PERMISSIONS.EXPENSES_CREATE,
    PERMISSIONS.EXPENSES_READ,
    PERMISSIONS.EXPENSES_UPDATE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.SETTINGS_READ
  ],
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_READ,
    PERMISSIONS.SALES_UPDATE,
    PERMISSIONS.EXPENSES_READ,
    PERMISSIONS.REPORTS_READ
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.SALES_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.FINANCIAL_READ
  ]
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [customRolePermissions, setCustomRolePermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);

  // Simple cookie management
  const setCookie = (name, value, days = 7) => {
    try {
      const expires = new Date();
      expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
      document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    } catch (error) {
      console.warn('Cookie setting failed:', error);
    }
  };

  const getCookie = (name) => {
    try {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
    } catch (error) {
      console.warn('Cookie reading failed:', error);
    }
    return null;
  };

  const deleteCookie = (name) => {
    try {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    } catch (error) {
      console.warn('Cookie deletion failed:', error);
    }
  };

  // Memoized permission calculations
  const getRolePermissions = useCallback((role) => {
    if (role === ROLES.SUPER_ADMIN) {
      return Object.values(PERMISSIONS);
    }
    return customRolePermissions[role] || DEFAULT_ROLE_PERMISSIONS[role] || [];
  }, [customRolePermissions]);

  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    if (user.role === ROLES.SUPER_ADMIN) return true;
    
    const rolePermissions = getRolePermissions(user.role);
    const customPermissions = user.custom_permissions ? JSON.parse(user.custom_permissions) : [];
    
    return [...rolePermissions, ...customPermissions].includes(permission);
  }, [user, getRolePermissions]);

  const hasAnyPermission = useCallback((permissions) => {
    if (!user) return false;
    if (user.role === ROLES.SUPER_ADMIN) return true;
    return permissions.some(permission => hasPermission(permission));
  }, [user, hasPermission]);

  // Check installation status immediately
  const checkInstallation = useCallback(() => {
    try {
      const installationData = localStorage.getItem('erp_installation');
      const isInstalled = !!installationData;
      setIsInstalled(isInstalled);
      return isInstalled;
    } catch (error) {
      console.warn('Installation check failed:', error);
      setIsInstalled(false);
      return false;
    }
  }, []);

  // Initialize production system
  const initializeProduction = useCallback(async (installationData) => {
    try {
      console.log('🔧 Initializing demo system...', installationData);
      
      // Store installation data
      const installationRecord = {
        isInstalled: true,
        installedAt: new Date().toISOString(),
        companyInfo: installationData.company,
        adminInfo: {
          name: installationData.admin.name,
          email: installationData.admin.email,
          role: installationData.admin.role
        }
      };
      
      localStorage.setItem('erp_installation', JSON.stringify(installationRecord));
      
      // Create demo admin user
      const adminUser = {
        id: 1,
        name: installationData.admin.name,
        email: installationData.admin.email,
        role: installationData.admin.role,
        status: 'active',
        department: 'System',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        custom_permissions: []
      };
      
      setUser(adminUser);
      setIsInstalled(true);
      setCookie('user', JSON.stringify(adminUser), 7);
      
      console.log('✅ Demo system initialized successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Demo system initialization failed:', error);
      return { success: false, error: error.message || 'Failed to initialize demo system' };
    }
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      console.log('🔐 Attempting login...', email);
      
      // Check if system is installed
      const installationData = localStorage.getItem('erp_installation');
      if (!installationData) {
        return { success: false, error: 'System not installed' };
      }
      
      const installation = JSON.parse(installationData);
      
      // Simple demo login
      if (email === installation.adminInfo.email && password.length >= 8) {
        const userData = {
          id: 1,
          name: installation.adminInfo.name,
          email: installation.adminInfo.email,
          role: installation.adminInfo.role,
          status: 'active',
          department: 'System',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          custom_permissions: []
        };
        
        setUser(userData);
        setCookie('user', JSON.stringify(userData), 7);
        console.log('✅ Login successful');
        return { success: true };
      } else {
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    console.log('🚪 Logging out...');
    setUser(null);
    deleteCookie('user');
  }, []);

  // Get profile from cookie
  const getProfile = useCallback(() => {
    try {
      const userCookie = getCookie('user');
      if (userCookie) {
        const userData = JSON.parse(userCookie);
        setUser(userData);
        console.log('👤 Profile loaded from cookie');
        return userData;
      }
    } catch (error) {
      console.warn('Profile loading failed:', error);
    }
    return null;
  }, []);

  // Mock functions for UI compatibility
  const mockFunctions = useMemo(() => ({
    createUser: () => ({ success: false, error: 'Demo mode - API not available' }),
    updateUser: () => ({ success: false, error: 'Demo mode - API not available' }),
    updateUserPermissions: () => ({ success: false, error: 'Demo mode - API not available' }),
    updateRolePermissions: () => ({ success: false, error: 'Demo mode - API not available' }),
    deleteUser: () => ({ success: false, error: 'Demo mode - API not available' }),
    toggleUserStatus: () => ({ success: false, error: 'Demo mode - API not available' })
  }), []);

  const canManageUser = useCallback((targetUser) => {
    if (!user) return false;
    if (user.role === ROLES.SUPER_ADMIN) return true;
    if (targetUser?.role === ROLES.SUPER_ADMIN) return false;
    return hasPermission(PERMISSIONS.USER_UPDATE);
  }, [user, hasPermission]);

  const getRoleDisplayName = useCallback((role) => {
    const roleNames = {
      [ROLES.SUPER_ADMIN]: 'Super Admin',
      [ROLES.ADMIN]: 'Administrator',
      [ROLES.MANAGER]: 'Manager',
      [ROLES.EMPLOYEE]: 'Employee',
      [ROLES.VIEWER]: 'Viewer'
    };
    return roleNames[role] || role;
  }, []);

  // Initialize app immediately
  useEffect(() => {
    const initializeApp = () => {
      console.log('🚀 Initializing ERP System...');
      
      try {
        // Check installation immediately
        const installed = checkInstallation();
        
        if (installed) {
          // Try to get user from cookie immediately
          getProfile();
        }
        
        console.log('✅ ERP System initialized');
      } catch (error) {
        console.error('❌ Initialization failed:', error);
      } finally {
        // Stop loading very quickly
        setTimeout(() => {
          setLoading(false);
        }, 200);
      }
    };

    initializeApp();
  }, [checkInstallation, getProfile]);

  // Memoized context value
  const contextValue = useMemo(() => ({
    user,
    users,
    loading,
    isInstalled,
    login,
    logout,
    ...mockFunctions,
    canManageUser,
    initializeProduction,
    checkInstallation,
    getProfile,
    hasPermission,
    hasAnyPermission,
    getRolePermissions,
    getRoleDisplayName,
    
    // Role checks
    isSuperAdmin: user?.role === ROLES.SUPER_ADMIN,
    isAdmin: user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN,
    isManager: ['manager', 'admin', 'super_admin'].includes(user?.role),
    
    // Constants
    ROLES,
    PERMISSIONS,
    DEFAULT_ROLE_PERMISSIONS,
    customRolePermissions
  }), [
    user,
    users,
    loading,
    isInstalled,
    login,
    logout,
    mockFunctions,
    canManageUser,
    initializeProduction,
    checkInstallation,
    getProfile,
    hasPermission,
    hasAnyPermission,
    getRolePermissions,
    getRoleDisplayName,
    customRolePermissions
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};