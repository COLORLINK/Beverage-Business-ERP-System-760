import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// Combined Context for Auth and ERP
const AppContext = createContext();

export const useAuth = () => useContext(AppContext);
export const useERP = () => useContext(AppContext);

// Constants
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  VIEWER: 'viewer'
};

export const PERMISSIONS = {
  USER_CREATE: 'user_create',
  USER_READ: 'user_read',
  USER_UPDATE: 'user_update',
  USER_DELETE: 'user_delete',
  USER_MANAGE_ROLES: 'user_manage_roles',
  PRODUCT_CREATE: 'product_create',
  PRODUCT_READ: 'product_read',
  PRODUCT_UPDATE: 'product_update',
  PRODUCT_DELETE: 'product_delete',
  SALES_CREATE: 'sales_create',
  SALES_READ: 'sales_read',
  SALES_UPDATE: 'sales_update',
  SALES_DELETE: 'sales_delete',
  EMPLOYEE_CREATE: 'employee_create',
  EMPLOYEE_READ: 'employee_read',
  EMPLOYEE_UPDATE: 'employee_update',
  EMPLOYEE_DELETE: 'employee_delete',
  EMPLOYEE_SALARY_ADJUST: 'employee_salary_adjust',
  FINANCIAL_READ: 'financial_read',
  FINANCIAL_ANALYSIS: 'financial_analysis',
  EXPENSES_CREATE: 'expenses_create',
  EXPENSES_READ: 'expenses_read',
  EXPENSES_UPDATE: 'expenses_update',
  EXPENSES_DELETE: 'expenses_delete',
  REPORTS_READ: 'reports_read',
  REPORTS_EXPORT: 'reports_export',
  SETTINGS_READ: 'settings_read',
  SETTINGS_UPDATE: 'settings_update',
  OWNER_READ: 'owner_read',
  OWNER_MANAGE: 'owner_manage',
  SYSTEM_ADMIN: 'system_admin'
};

export const DEFAULT_ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.USER_CREATE, PERMISSIONS.USER_READ, PERMISSIONS.USER_UPDATE, PERMISSIONS.USER_DELETE,
    PERMISSIONS.PRODUCT_CREATE, PERMISSIONS.PRODUCT_READ, PERMISSIONS.PRODUCT_UPDATE, PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.SALES_CREATE, PERMISSIONS.SALES_READ, PERMISSIONS.SALES_UPDATE, PERMISSIONS.SALES_DELETE,
    PERMISSIONS.EMPLOYEE_CREATE, PERMISSIONS.EMPLOYEE_READ, PERMISSIONS.EMPLOYEE_UPDATE, PERMISSIONS.EMPLOYEE_DELETE,
    PERMISSIONS.EMPLOYEE_SALARY_ADJUST, PERMISSIONS.FINANCIAL_READ, PERMISSIONS.FINANCIAL_ANALYSIS,
    PERMISSIONS.EXPENSES_CREATE, PERMISSIONS.EXPENSES_READ, PERMISSIONS.EXPENSES_UPDATE, PERMISSIONS.EXPENSES_DELETE,
    PERMISSIONS.REPORTS_READ, PERMISSIONS.REPORTS_EXPORT, PERMISSIONS.SETTINGS_READ, PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.OWNER_READ
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.USER_READ, PERMISSIONS.PRODUCT_CREATE, PERMISSIONS.PRODUCT_READ, PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.SALES_CREATE, PERMISSIONS.SALES_READ, PERMISSIONS.SALES_UPDATE, PERMISSIONS.EMPLOYEE_READ,
    PERMISSIONS.EMPLOYEE_SALARY_ADJUST, PERMISSIONS.FINANCIAL_READ, PERMISSIONS.FINANCIAL_ANALYSIS,
    PERMISSIONS.EXPENSES_CREATE, PERMISSIONS.EXPENSES_READ, PERMISSIONS.EXPENSES_UPDATE, PERMISSIONS.REPORTS_READ,
    PERMISSIONS.SETTINGS_READ
  ],
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.PRODUCT_READ, PERMISSIONS.SALES_CREATE, PERMISSIONS.SALES_READ, PERMISSIONS.SALES_UPDATE,
    PERMISSIONS.EXPENSES_READ, PERMISSIONS.REPORTS_READ
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.PRODUCT_READ, PERMISSIONS.SALES_READ, PERMISSIONS.REPORTS_READ, PERMISSIONS.FINANCIAL_READ
  ]
};

export const AuthProvider = ({ children }) => {
  // Auth State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [customRolePermissions, setCustomRolePermissions] = useState({});

  // ERP State
  const [currency, setCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(15000);
  const [ingredients, setIngredients] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [salaryAdjustments, setSalaryAdjustments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [monthlyBills, setMonthlyBills] = useState([]);
  const [billPayments, setBillPayments] = useState([]);
  const [owners, setOwners] = useState([]);

  // Utility functions
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

  // Currency functions
  const convertCurrency = (amount, fromCurrency = 'USD') => {
    if (currency === 'USD') return amount;
    if (currency === 'SYP') return amount * exchangeRate;
    return amount;
  };

  const formatCurrency = (amount) => {
    const converted = convertCurrency(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(converted);
  };

  // Permission functions
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

  // Auth functions
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

  const initializeProduction = useCallback(async (installationData) => {
    try {
      console.log('🔧 Initializing demo system...', installationData);
      
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

  const login = useCallback(async (email, password) => {
    try {
      console.log('🔐 Attempting login...', email);
      
      const installationData = localStorage.getItem('erp_installation');
      if (!installationData) {
        return { success: false, error: 'System not installed' };
      }
      
      const installation = JSON.parse(installationData);
      
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

  const logout = useCallback(() => {
    console.log('🚪 Logging out...');
    setUser(null);
    deleteCookie('user');
  }, []);

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

  // ERP Calculation Functions
  const calculateDirectMaterialCost = (product) => {
    return product.ingredients.reduce((total, ingredient) => {
      const ing = ingredients.find(i => i.id === ingredient.id);
      return total + (ing ? ing.cost * ingredient.quantity : 0);
    }, 0);
  };

  const calculateMonthlyOverhead = (month = new Date().toISOString().slice(0, 7)) => {
    const activeBills = monthlyBills.filter(bill => bill.isActive);
    const billsTotal = activeBills.reduce((sum, bill) => sum + bill.estimatedAmount, 0);
    
    const totalEffectiveSalaries = employees.reduce((sum, emp) => {
      const monthlyAdjustments = salaryAdjustments.filter(adj => 
        adj.employeeId === emp.id && adj.month === month
      );
      const totalAdjustments = monthlyAdjustments.reduce((sum, adj) => {
        return sum + (adj.type === 'deduction' ? -adj.amount : adj.amount);
      }, 0);
      return sum + emp.salary + totalAdjustments;
    }, 0);
    
    return billsTotal + totalEffectiveSalaries;
  };

  const calculateTotalRevenue = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const periodSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= start && saleDate <= end;
    });
    
    const totalRevenue = periodSales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalUnits = periodSales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalOrders = periodSales.length;
    
    const revenueByProduct = products.map(product => {
      const productSales = periodSales.filter(sale => sale.productId === product.id);
      const revenue = productSales.reduce((sum, sale) => sum + sale.amount, 0);
      const units = productSales.reduce((sum, sale) => sum + sale.quantity, 0);
      const orders = productSales.length;
      
      return {
        id: product.id,
        name: product.name,
        revenue,
        units,
        orders,
        avgOrderValue: orders > 0 ? revenue / orders : 0,
        revenueShare: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0
      };
    }).sort((a, b) => b.revenue - a.revenue);
    
    return {
      totalRevenue,
      totalUnits,
      totalOrders,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      avgRevenuePerUnit: totalUnits > 0 ? totalRevenue / totalUnits : 0,
      revenueByProduct,
      dailyAverage: totalRevenue / Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
    };
  };

  const calculateTotalCosts = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Direct Material Costs
    const periodSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= start && saleDate <= end;
    });
    
    const directMaterialCosts = periodSales.reduce((total, sale) => {
      const product = products.find(p => p.id === sale.productId);
      if (!product) return total;
      const productMaterialCost = calculateDirectMaterialCost(product);
      return total + (productMaterialCost * sale.quantity);
    }, 0);
    
    // Variable Expenses
    const variableExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= start && expenseDate <= end;
    }).reduce((sum, expense) => sum + expense.amount, 0);
    
    // Fixed Costs (monthly overhead allocated to period)
    const daysInPeriod = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const monthlyOverhead = calculateMonthlyOverhead();
    const allocatedFixedCosts = (monthlyOverhead / 30) * daysInPeriod;
    
    return {
      directMaterialCosts,
      variableExpenses,
      allocatedFixedCosts,
      totalCosts: directMaterialCosts + variableExpenses + allocatedFixedCosts,
      breakdown: {
        materials: directMaterialCosts,
        variable: variableExpenses,
        fixed: allocatedFixedCosts
      }
    };
  };

  const calculateOwnerProfits = () => {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalCosts = calculateMonthlyOverhead() + expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = totalRevenue - totalCosts;
    
    return owners.map(owner => ({
      ...owner,
      profitShare: (netProfit * owner.profitPercentage) / 100
    }));
  };

  // Initialize sample data
  useEffect(() => {
    const sampleIngredients = [
      { id: 1, name: 'Coffee Beans', cost: 8.50, unit: 'kg', stock: 100 },
      { id: 2, name: 'Milk', cost: 3.20, unit: 'liter', stock: 50 },
      { id: 3, name: 'Sugar', cost: 2.10, unit: 'kg', stock: 25 },
      { id: 4, name: 'Vanilla Syrup', cost: 12.00, unit: 'bottle', stock: 15 }
    ];

    const sampleProducts = [
      {
        id: 1,
        name: 'Cappuccino',
        price: 4.50,
        ingredients: [{ id: 1, quantity: 0.02 }, { id: 2, quantity: 0.15 }, { id: 3, quantity: 0.01 }],
        category: 'Coffee'
      },
      {
        id: 2,
        name: 'Latte',
        price: 5.00,
        ingredients: [{ id: 1, quantity: 0.02 }, { id: 2, quantity: 0.2 }, { id: 3, quantity: 0.01 }],
        category: 'Coffee'
      },
      {
        id: 3,
        name: 'Espresso',
        price: 3.50,
        ingredients: [{ id: 1, quantity: 0.015 }, { id: 3, quantity: 0.005 }],
        category: 'Coffee'
      }
    ];

    const sampleSales = [
      { id: 1, productId: 1, productName: 'Cappuccino', quantity: 25, unitPrice: 4.50, amount: 112.50, date: '2024-12-01' },
      { id: 2, productId: 2, productName: 'Latte', quantity: 18, unitPrice: 5.00, amount: 90.00, date: '2024-12-02' },
      { id: 3, productId: 1, productName: 'Cappuccino', quantity: 30, unitPrice: 4.50, amount: 135.00, date: '2024-12-03' },
      { id: 4, productId: 2, productName: 'Latte', quantity: 22, unitPrice: 5.00, amount: 110.00, date: '2024-12-04' },
      { id: 5, productId: 3, productName: 'Espresso', quantity: 15, unitPrice: 3.50, amount: 52.50, date: '2024-12-05' }
    ];

    const sampleEmployees = [
      { id: 1, name: 'John Doe', position: 'Barista', salary: 2500, type: 'monthly', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', position: 'Manager', salary: 3500, type: 'monthly', email: 'jane@example.com' },
      { id: 3, name: 'Mike Wilson', position: 'Assistant', salary: 2200, type: 'monthly', email: 'mike@example.com' }
    ];

    const sampleExpenses = [
      { id: 1, type: 'rent', description: 'Monthly Rent', amount: 2000, date: '2024-12-01' },
      { id: 2, type: 'utilities', description: 'Electricity Bill', amount: 300, date: '2024-12-01' },
      { id: 3, type: 'marketing', description: 'Social Media Ads', amount: 500, date: '2024-12-02' }
    ];

    const sampleMonthlyBills = [
      { id: 1, name: 'Office Rent', estimatedAmount: 2000, category: 'Fixed', isActive: true, billType: 'fixed', dueDay: 1 },
      { id: 2, name: 'Electricity Bill', estimatedAmount: 300, category: 'Utilities', isActive: true, billType: 'variable', dueDay: 15 }
    ];

    const sampleOwners = [
      { id: 1, name: 'Ahmed Ali', shareCapital: 50000, profitPercentage: 60, email: 'ahmed@example.com' },
      { id: 2, name: 'Sara Omar', shareCapital: 30000, profitPercentage: 40, email: 'sara@example.com' }
    ];

    setIngredients(sampleIngredients);
    setProducts(sampleProducts);
    setSales(sampleSales);
    setEmployees(sampleEmployees);
    setExpenses(sampleExpenses);
    setMonthlyBills(sampleMonthlyBills);
    setOwners(sampleOwners);
  }, []);

  // Initialize app
  useEffect(() => {
    const initializeApp = () => {
      console.log('🚀 Initializing ERP System...');
      
      try {
        const installed = checkInstallation();
        if (installed) {
          getProfile();
        }
        console.log('✅ ERP System initialized');
      } catch (error) {
        console.error('❌ Initialization failed:', error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 200);
      }
    };

    initializeApp();
  }, [checkInstallation, getProfile]);

  // Context value
  const contextValue = useMemo(() => ({
    // Auth
    user,
    loading,
    isInstalled,
    login,
    logout,
    initializeProduction,
    checkInstallation,
    getProfile,
    hasPermission,
    hasAnyPermission,
    getRolePermissions,
    getRoleDisplayName,
    isSuperAdmin: user?.role === ROLES.SUPER_ADMIN,
    isAdmin: user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN,
    
    // ERP Data
    currency,
    setCurrency,
    exchangeRate,
    setExchangeRate,
    ingredients,
    setIngredients,
    products,
    setProducts,
    sales,
    setSales,
    employees,
    setEmployees,
    salaryAdjustments,
    setSalaryAdjustments,
    expenses,
    setExpenses,
    monthlyBills,
    setMonthlyBills,
    billPayments,
    setBillPayments,
    owners,
    setOwners,
    
    // Utility Functions
    convertCurrency,
    formatCurrency,
    calculateDirectMaterialCost,
    calculateMonthlyOverhead,
    calculateTotalRevenue,
    calculateTotalCosts,
    calculateOwnerProfits,
    
    // Constants
    ROLES,
    PERMISSIONS,
    DEFAULT_ROLE_PERMISSIONS,
    customRolePermissions
  }), [
    user, loading, isInstalled, login, logout, initializeProduction, checkInstallation, getProfile,
    hasPermission, hasAnyPermission, getRolePermissions, getRoleDisplayName,
    currency, setCurrency, exchangeRate, setExchangeRate,
    ingredients, setIngredients, products, setProducts, sales, setSales,
    employees, setEmployees, salaryAdjustments, setSalaryAdjustments,
    expenses, setExpenses, monthlyBills, setMonthlyBills, billPayments, setBillPayments,
    owners, setOwners, convertCurrency, formatCurrency, calculateDirectMaterialCost,
    calculateMonthlyOverhead, calculateTotalRevenue, calculateTotalCosts, calculateOwnerProfits,
    customRolePermissions
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};