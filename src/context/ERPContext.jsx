import React, { createContext, useContext, useState, useEffect } from 'react';

const ERPContext = createContext();

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};

export const ERPProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(15000);

  // Core data states
  const [ingredients, setIngredients] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [salaryAdjustments, setSalaryAdjustments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [monthlyBills, setMonthlyBills] = useState([]);
  const [billPayments, setBillPayments] = useState([]);
  const [owners, setOwners] = useState([]);

  // International ERP Compliance Settings
  const [erpSettings, setERPSettings] = useState({
    fiscalYearStart: 'January', // Configurable fiscal year
    taxRate: 10, // Default tax rate
    currency: 'USD',
    companyInfo: {
      name: '',
      address: '',
      taxId: '',
      industry: 'Food & Beverage'
    },
    auditTrail: true,
    multiCurrency: false,
    inventory: {
      method: 'FIFO', // FIFO, LIFO, Weighted Average
      autoReorder: false,
      reorderLevel: 10
    },
    accounting: {
      method: 'Cash', // Cash or Accrual
      depreciation: 'Straight Line'
    }
  });

  // Currency conversion
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

  // Initialize with sample data
  useEffect(() => {
    const sampleIngredients = [
      { id: 1, name: 'Coffee Beans', cost: 8.50, unit: 'kg', stock: 100, reorderLevel: 10, supplier: 'Premium Coffee Co.' },
      { id: 2, name: 'Milk', cost: 3.20, unit: 'liter', stock: 50, reorderLevel: 15, supplier: 'Local Dairy Farm' },
      { id: 3, name: 'Sugar', cost: 2.10, unit: 'kg', stock: 25, reorderLevel: 5, supplier: 'Sweet Supply Inc.' },
      { id: 4, name: 'Vanilla Syrup', cost: 12.00, unit: 'bottle', stock: 15, reorderLevel: 3, supplier: 'Flavor Masters' },
    ];

    const sampleProducts = [
      {
        id: 1,
        name: 'Cappuccino',
        price: 4.50,
        ingredients: [
          { id: 1, quantity: 0.02 },
          { id: 2, quantity: 0.15 },
          { id: 3, quantity: 0.01 },
        ],
        category: 'Coffee',
        sku: 'CAP001',
        barcode: '1234567890123'
      },
      {
        id: 2,
        name: 'Latte',
        price: 5.00,
        ingredients: [
          { id: 1, quantity: 0.02 },
          { id: 2, quantity: 0.2 },
          { id: 3, quantity: 0.01 },
        ],
        category: 'Coffee',
        sku: 'LAT001',
        barcode: '1234567890124'
      },
      {
        id: 3,
        name: 'Espresso',
        price: 3.50,
        ingredients: [
          { id: 1, quantity: 0.015 },
          { id: 3, quantity: 0.005 },
        ],
        category: 'Coffee',
        sku: 'ESP001',
        barcode: '1234567890125'
      },
    ];

    // Enhanced sales data with more realistic patterns
    const sampleSales = [
      { id: 1, productId: 1, productName: 'Cappuccino', quantity: 25, unitPrice: 4.50, amount: 112.50, date: '2024-12-01', customerName: 'John Doe', reference: 'INV-001' },
      { id: 2, productId: 2, productName: 'Latte', quantity: 18, unitPrice: 5.00, amount: 90.00, date: '2024-12-02', customerName: 'Jane Smith', reference: 'INV-002' },
      { id: 3, productId: 1, productName: 'Cappuccino', quantity: 30, unitPrice: 4.50, amount: 135.00, date: '2024-12-03', customerName: 'Mike Johnson', reference: 'INV-003' },
      { id: 4, productId: 2, productName: 'Latte', quantity: 22, unitPrice: 5.00, amount: 110.00, date: '2024-12-04', customerName: 'Sarah Wilson', reference: 'INV-004' },
      { id: 5, productId: 3, productName: 'Espresso', quantity: 15, unitPrice: 3.50, amount: 52.50, date: '2024-12-05', customerName: 'Tom Brown', reference: 'INV-005' },
      { id: 6, productId: 1, productName: 'Cappuccino', quantity: 20, unitPrice: 4.50, amount: 90.00, date: '2024-12-06', customerName: 'Lisa Davis', reference: 'INV-006' },
      { id: 7, productId: 2, productName: 'Latte', quantity: 12, unitPrice: 5.00, amount: 60.00, date: '2024-12-07', customerName: 'Chris Wilson', reference: 'INV-007' },
      { id: 8, productId: 3, productName: 'Espresso', quantity: 8, unitPrice: 3.50, amount: 28.00, date: '2024-12-08', customerName: 'Anna Miller', reference: 'INV-008' },
      // Previous months for better analytics
      { id: 9, productId: 1, productName: 'Cappuccino', quantity: 35, unitPrice: 4.50, amount: 157.50, date: '2024-11-28', customerName: 'Robert Taylor', reference: 'INV-009' },
      { id: 10, productId: 2, productName: 'Latte', quantity: 28, unitPrice: 5.00, amount: 140.00, date: '2024-11-29', customerName: 'Emma Johnson', reference: 'INV-010' },
      { id: 11, productId: 3, productName: 'Espresso', quantity: 12, unitPrice: 3.50, amount: 42.00, date: '2024-11-30', customerName: 'Mark Davis', reference: 'INV-011' },
      { id: 12, productId: 1, productName: 'Cappuccino', quantity: 40, unitPrice: 4.50, amount: 180.00, date: '2024-10-15', customerName: 'Linda Brown', reference: 'INV-012' },
      { id: 13, productId: 2, productName: 'Latte', quantity: 25, unitPrice: 5.00, amount: 125.00, date: '2024-10-16', customerName: 'Paul Wilson', reference: 'INV-013' },
    ];

    const sampleEmployees = [
      { 
        id: 1, 
        name: 'John Doe', 
        position: 'Barista', 
        salary: 2500, 
        type: 'monthly', 
        email: 'john@example.com', 
        phone: '+1234567890',
        employeeId: 'EMP001',
        department: 'Operations',
        hireDate: '2024-01-15'
      },
      { 
        id: 2, 
        name: 'Jane Smith', 
        position: 'Manager', 
        salary: 3500, 
        type: 'monthly', 
        email: 'jane@example.com', 
        phone: '+1234567891',
        employeeId: 'EMP002',
        department: 'Management',
        hireDate: '2023-06-01'
      },
      { 
        id: 3, 
        name: 'Mike Wilson', 
        position: 'Assistant', 
        salary: 2200, 
        type: 'monthly', 
        email: 'mike@example.com', 
        phone: '+1234567892',
        employeeId: 'EMP003',
        department: 'Operations',
        hireDate: '2024-03-10'
      },
    ];

    const sampleSalaryAdjustments = [
      { id: 1, employeeId: 1, employeeName: 'John Doe', amount: 200, type: 'bonus', reason: 'Excellent performance', month: '2024-12', description: 'Monthly performance bonus', createdAt: '2024-12-01T00:00:00Z' },
      { id: 2, employeeId: 2, employeeName: 'Jane Smith', amount: 300, type: 'overtime', reason: 'Extra hours worked', month: '2024-12', description: 'Weekend shift coverage', createdAt: '2024-12-05T00:00:00Z' },
      { id: 3, employeeId: 3, employeeName: 'Mike Wilson', amount: 100, type: 'deduction', reason: 'Late arrival', month: '2024-12', description: 'Penalty for repeated tardiness', createdAt: '2024-12-10T00:00:00Z' },
      { id: 4, employeeId: 1, employeeName: 'John Doe', amount: 150, type: 'bonus', reason: 'Customer service', month: '2024-11', description: 'Customer appreciation bonus', createdAt: '2024-11-15T00:00:00Z' },
    ];

    const sampleExpenses = [
      { id: 1, type: 'rent', description: 'Monthly Rent', amount: 2000, date: '2024-12-01', category: 'Fixed', reference: 'EXP-001' },
      { id: 2, type: 'utilities', description: 'Electricity Bill', amount: 300, date: '2024-12-01', category: 'Utilities', reference: 'EXP-002' },
      { id: 3, type: 'marketing', description: 'Social Media Ads', amount: 500, date: '2024-12-02', category: 'Marketing', reference: 'EXP-003' },
      { id: 4, type: 'maintenance', description: 'Equipment Repair', amount: 150, date: '2024-12-03', category: 'Maintenance', reference: 'EXP-004' },
      { id: 5, type: 'other', description: 'Office Supplies', amount: 75, date: '2024-12-04', category: 'Office', reference: 'EXP-005' },
      { id: 6, type: 'utilities', description: 'Water Bill', amount: 120, date: '2024-11-15', category: 'Utilities', reference: 'EXP-006' },
      { id: 7, type: 'marketing', description: 'Print Advertising', amount: 300, date: '2024-11-20', category: 'Marketing', reference: 'EXP-007' },
      { id: 8, type: 'maintenance', description: 'Coffee Machine Service', amount: 200, date: '2024-11-25', category: 'Maintenance', reference: 'EXP-008' },
    ];

    const sampleMonthlyBills = [
      { id: 1, name: 'Office Rent', estimatedAmount: 2000, category: 'Fixed', isActive: true, billType: 'fixed', dueDay: 1, description: 'Monthly office rent payment', createdAt: '2024-01-01T00:00:00Z', vendor: 'Property Management Co.' },
      { id: 2, name: 'Electricity Bill', estimatedAmount: 300, category: 'Utilities', isActive: true, billType: 'variable', dueDay: 15, description: 'Monthly electricity usage', createdAt: '2024-01-01T00:00:00Z', vendor: 'Power Company' },
      { id: 3, name: 'Internet Service', estimatedAmount: 100, category: 'Utilities', isActive: true, billType: 'fixed', dueDay: 5, description: 'Business internet connection', createdAt: '2024-01-01T00:00:00Z', vendor: 'ISP Provider' },
      { id: 4, name: 'Water Bill', estimatedAmount: 150, category: 'Utilities', isActive: true, billType: 'variable', dueDay: 20, description: 'Water usage', createdAt: '2024-01-01T00:00:00Z', vendor: 'Water Department' },
      { id: 5, name: 'Insurance Premium', estimatedAmount: 500, category: 'Fixed', isActive: true, billType: 'fixed', dueDay: 1, description: 'Business insurance premium', createdAt: '2024-01-01T00:00:00Z', vendor: 'Insurance Corp' },
    ];

    const sampleBillPayments = [
      { id: 1, billId: 1, billName: 'Office Rent', actualAmount: 2000, paidDate: '2024-12-01', notes: 'Paid via bank transfer', month: '2024-12', createdAt: '2024-12-01T10:00:00Z', reference: 'PAY-001' },
      { id: 2, billId: 3, billName: 'Internet Service', actualAmount: 100, paidDate: '2024-12-05', notes: 'Auto-payment', month: '2024-12', createdAt: '2024-12-05T09:30:00Z', reference: 'PAY-002' },
      { id: 3, billId: 2, billName: 'Electricity Bill', actualAmount: 285, paidDate: '2024-12-15', notes: 'Lower usage this month', month: '2024-12', createdAt: '2024-12-15T14:20:00Z', reference: 'PAY-003' },
      { id: 4, billId: 1, billName: 'Office Rent', actualAmount: 2000, paidDate: '2024-11-01', notes: 'Monthly rent payment', month: '2024-11', createdAt: '2024-11-01T10:00:00Z', reference: 'PAY-004' },
      { id: 5, billId: 2, billName: 'Electricity Bill', actualAmount: 310, paidDate: '2024-11-15', notes: 'Higher usage last month', month: '2024-11', createdAt: '2024-11-15T14:20:00Z', reference: 'PAY-005' },
    ];

    const sampleOwners = [
      { 
        id: 1, 
        name: 'Ahmed Ali', 
        shareCapital: 50000, 
        profitPercentage: 60, 
        email: 'ahmed@example.com', 
        phone: '+1234567893',
        ownershipType: 'Majority',
        joinDate: '2023-01-01'
      },
      { 
        id: 2, 
        name: 'Sara Omar', 
        shareCapital: 30000, 
        profitPercentage: 40, 
        email: 'sara@example.com', 
        phone: '+1234567894',
        ownershipType: 'Minority',
        joinDate: '2023-01-01'
      },
    ];

    // Set all data
    setIngredients(sampleIngredients);
    setProducts(sampleProducts);
    setSales(sampleSales);
    setEmployees(sampleEmployees);
    setSalaryAdjustments(sampleSalaryAdjustments);
    setExpenses(sampleExpenses);
    setMonthlyBills(sampleMonthlyBills);
    setBillPayments(sampleBillPayments);
    setOwners(sampleOwners);
  }, []);

  //===========================================
  // CORE CALCULATION FUNCTIONS
  //===========================================

  // Calculate effective salary for a specific month
  const calculateEffectiveSalary = (employeeId, month = new Date().toISOString().slice(0, 7)) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return 0;

    const monthlyAdjustments = salaryAdjustments.filter(adj => 
      adj.employeeId === employeeId && adj.month === month
    );

    const totalAdjustments = monthlyAdjustments.reduce((sum, adj) => {
      return sum + (adj.type === 'deduction' ? -adj.amount : adj.amount);
    }, 0);

    return employee.salary + totalAdjustments;
  };

  // Calculate total monthly overhead including salary adjustments
  const calculateMonthlyOverhead = (month = new Date().toISOString().slice(0, 7)) => {
    const activeBills = monthlyBills.filter(bill => bill.isActive);
    const billsTotal = activeBills.reduce((sum, bill) => sum + bill.estimatedAmount, 0);

    // Calculate total effective salaries for the month
    const totalEffectiveSalaries = employees.reduce((sum, emp) => {
      return sum + calculateEffectiveSalary(emp.id, month);
    }, 0);

    return billsTotal + totalEffectiveSalaries;
  };

  //===========================================
  // COMPREHENSIVE COST & REVENUE ANALYSIS
  //===========================================

  // Calculate total costs for a period (Enhanced with ERP standards)
  const calculateTotalCosts = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 1. Direct Material Costs (from sales) - COGS calculation
    const periodSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= start && saleDate <= end;
    });

    const directMaterialCosts = periodSales.reduce((total, sale) => {
      const product = products.find(p => p.id === sale.productId);
      if (!product) return total;

      const productMaterialCost = product.ingredients.reduce((cost, ing) => {
        const ingredient = ingredients.find(i => i.id === ing.id);
        return cost + (ingredient ? ingredient.cost * ing.quantity : 0);
      }, 0);

      return total + (productMaterialCost * sale.quantity);
    }, 0);

    // 2. Variable Expenses (period-specific)
    const variableExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= start && expenseDate <= end && 
             ['utilities', 'maintenance', 'marketing', 'other'].includes(expense.type);
    }).reduce((sum, expense) => sum + expense.amount, 0);

    // 3. Fixed Costs (monthly overhead allocated to period)
    const daysInPeriod = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const monthlyOverhead = calculateMonthlyOverhead();
    const allocatedFixedCosts = (monthlyOverhead / 30) * daysInPeriod;

    // 4. Actual Bill Payments in period
    const periodBillPayments = billPayments.filter(payment => {
      const paymentDate = new Date(payment.paidDate);
      return paymentDate >= start && paymentDate <= end;
    }).reduce((sum, payment) => sum + payment.actualAmount, 0);

    // 5. Salary Adjustments in period
    const periodAdjustments = salaryAdjustments.filter(adj => {
      const adjDate = new Date(adj.createdAt);
      return adjDate >= start && adjDate <= end;
    }).reduce((sum, adj) => {
      return sum + (adj.type === 'deduction' ? -adj.amount : adj.amount);
    }, 0);

    return {
      directMaterialCosts,
      variableExpenses,
      allocatedFixedCosts,
      actualBillPayments: periodBillPayments,
      salaryAdjustments: periodAdjustments,
      totalCosts: directMaterialCosts + variableExpenses + allocatedFixedCosts,
      breakdown: {
        materials: directMaterialCosts,
        variable: variableExpenses,
        fixed: allocatedFixedCosts,
        bills: periodBillPayments,
        adjustments: periodAdjustments
      }
    };
  };

  // Calculate total revenue for a period (Enhanced with ERP standards)
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

    // Revenue by product
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

    // Revenue by category
    const revenueByCategory = revenueByProduct.reduce((acc, product) => {
      const productData = products.find(p => p.id === product.id);
      const category = productData?.category || 'Other';

      if (!acc[category]) {
        acc[category] = { revenue: 0, units: 0, orders: 0 };
      }

      acc[category].revenue += product.revenue;
      acc[category].units += product.units;
      acc[category].orders += product.orders;

      return acc;
    }, {});

    return {
      totalRevenue,
      totalUnits,
      totalOrders,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      avgRevenuePerUnit: totalUnits > 0 ? totalRevenue / totalUnits : 0,
      revenueByProduct,
      revenueByCategory: Object.entries(revenueByCategory).map(([category, data]) => ({
        category,
        ...data,
        share: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
      })),
      dailyAverage: totalRevenue / Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
    };
  };

  //===========================================
  // ADVANCED PROFIT CALCULATION METHODS
  //===========================================

  // 1. DIRECT MATERIAL COST (DMC)
  const calculateDirectMaterialCost = (product) => {
    return product.ingredients.reduce((total, ingredient) => {
      const ing = ingredients.find(i => i.id === ingredient.id);
      return total + (ing ? ing.cost * ingredient.quantity : 0);
    }, 0);
  };

  // 2. VARIABLE OVERHEAD ALLOCATION
  const calculateVariableOverheadPerUnit = (productId, startDate, endDate) => {
    const allSalesInPeriod = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDate && saleDate <= endDate;
    });

    const totalUnitsAllProducts = allSalesInPeriod.reduce((sum, sale) => sum + sale.quantity, 0);
    const productUnits = allSalesInPeriod
      .filter(sale => sale.productId === productId)
      .reduce((sum, sale) => sum + sale.quantity, 0);

    if (totalUnitsAllProducts === 0 || productUnits === 0) return 0;

    // Get variable expenses for the period
    const variableExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate &&
             ['utilities', 'maintenance', 'marketing'].includes(expense.type);
    });

    const totalVariableExpenses = variableExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Allocate based on unit volume
    return totalVariableExpenses * (productUnits / totalUnitsAllProducts) / productUnits;
  };

  // 3. FIXED OVERHEAD ALLOCATION
  const calculateFixedOverheadPerUnit = (productId, startDate, endDate) => {
    const monthlyOverhead = calculateMonthlyOverhead();
    const daysInPeriod = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const periodOverhead = (monthlyOverhead / 30) * daysInPeriod;

    const allSalesInPeriod = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDate && saleDate <= endDate;
    });

    const totalUnitsAllProducts = allSalesInPeriod.reduce((sum, sale) => sum + sale.quantity, 0);
    const productUnits = allSalesInPeriod
      .filter(sale => sale.productId === productId)
      .reduce((sum, sale) => sum + sale.quantity, 0);

    if (totalUnitsAllProducts === 0 || productUnits === 0) return 0;

    return periodOverhead * (productUnits / totalUnitsAllProducts) / productUnits;
  };

  // 4. FULL COST PER UNIT
  const calculateFullCostPerUnit = (product, startDate, endDate) => {
    const directMaterialCost = calculateDirectMaterialCost(product);
    const variableOverhead = calculateVariableOverheadPerUnit(product.id, startDate, endDate);
    const fixedOverhead = calculateFixedOverheadPerUnit(product.id, startDate, endDate);

    return {
      directMaterialCost,
      variableOverhead,
      fixedOverhead,
      totalCostPerUnit: directMaterialCost + variableOverhead + fixedOverhead
    };
  };

  // 5. COMPREHENSIVE PROFIT METRICS
  const calculateProfitMetrics = (product, startDate, endDate) => {
    const productSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return sale.productId === product.id && saleDate >= startDate && saleDate <= endDate;
    });

    const totalQuantitySold = productSales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalRevenue = productSales.reduce((sum, sale) => sum + sale.amount, 0);

    const costBreakdown = calculateFullCostPerUnit(product, startDate, endDate);
    const totalCostForPeriod = costBreakdown.totalCostPerUnit * totalQuantitySold;

    // Calculate different profit metrics
    const grossProfit = totalRevenue - totalCostForPeriod;
    const profitPerUnit = totalQuantitySold > 0 ? grossProfit / totalQuantitySold : product.price - costBreakdown.totalCostPerUnit;

    // Profit Margins
    const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const markupPercentage = costBreakdown.totalCostPerUnit > 0 ? 
      ((product.price - costBreakdown.totalCostPerUnit) / costBreakdown.totalCostPerUnit) * 100 : 0;

    // Average Profit Per Unit
    const avgProfitPerUnit = totalQuantitySold > 0 ? grossProfit / totalQuantitySold : 0;

    // Contribution Margin
    const variableCostPerUnit = costBreakdown.directMaterialCost + costBreakdown.variableOverhead;
    const contributionMargin = totalRevenue - (variableCostPerUnit * totalQuantitySold);
    const contributionMarginPercentage = totalRevenue > 0 ? (contributionMargin / totalRevenue) * 100 : 0;

    return {
      // Revenue Metrics
      totalRevenue,
      totalQuantitySold,
      averageSellingPrice: totalQuantitySold > 0 ? totalRevenue / totalQuantitySold : product.price,

      // Cost Breakdown
      costBreakdown,
      totalCostForPeriod,

      // Profit Metrics
      grossProfit,
      profitPerUnit,
      avgProfitPerUnit,

      // Margin Metrics
      grossProfitMargin,
      markupPercentage,
      contributionMargin,
      contributionMarginPercentage,

      // Performance Indicators
      salesCount: productSales.length,
      averageOrderSize: productSales.length > 0 ? totalQuantitySold / productSales.length : 0,

      // ROI Metrics
      roi: costBreakdown.totalCostPerUnit > 0 ? ((profitPerUnit / costBreakdown.totalCostPerUnit) * 100) : 0
    };
  };

  // 6. PORTFOLIO ANALYSIS
  const calculatePortfolioMetrics = (startDate, endDate) => {
    const portfolioData = products.map(product => {
      const metrics = calculateProfitMetrics(product, startDate, endDate);
      return { ...product, ...metrics };
    });

    // Portfolio totals
    const totalPortfolioRevenue = portfolioData.reduce((sum, p) => sum + p.totalRevenue, 0);
    const totalPortfolioProfit = portfolioData.reduce((sum, p) => sum + p.grossProfit, 0);
    const totalPortfolioCost = portfolioData.reduce((sum, p) => sum + p.totalCostForPeriod, 0);
    const totalPortfolioUnits = portfolioData.reduce((sum, p) => sum + p.totalQuantitySold, 0);

    const portfolioMetrics = {
      totalRevenue: totalPortfolioRevenue,
      totalProfit: totalPortfolioProfit,
      totalCost: totalPortfolioCost,
      totalUnits: totalPortfolioUnits,
      avgProfitPerUnit: totalPortfolioUnits > 0 ? totalPortfolioProfit / totalPortfolioUnits : 0,
      portfolioMargin: totalPortfolioRevenue > 0 ? (totalPortfolioProfit / totalPortfolioRevenue) * 100 : 0,
      portfolioROI: totalPortfolioCost > 0 ? (totalPortfolioProfit / totalPortfolioCost) * 100 : 0
    };

    return {
      products: portfolioData,
      portfolio: portfolioMetrics
    };
  };

  //===========================================
  // LEGACY & UTILITY FUNCTIONS
  //===========================================

  // Legacy functions for backward compatibility
  const calculateProductUnitCost = (product) => calculateDirectMaterialCost(product);

  const calculateProductCost = (product) => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const costBreakdown = calculateFullCostPerUnit(product, startDate, endDate);
    return costBreakdown.totalCostPerUnit;
  };

  const calculateProfitMargin = (product) => {
    const cost = calculateProductCost(product);
    return product.price > 0 ? ((product.price - cost) / product.price) * 100 : 0;
  };

  // Calculate owner profit distribution
  const calculateOwnerProfits = () => {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalCosts = calculateMonthlyOverhead() + expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = totalRevenue - totalCosts;

    return owners.map(owner => ({
      ...owner,
      profitShare: (netProfit * owner.profitPercentage) / 100
    }));
  };

  // International ERP Compliance Functions
  const generateAuditTrail = (action, entity, entityId, changes) => {
    return {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action, // 'CREATE', 'UPDATE', 'DELETE'
      entity, // 'PRODUCT', 'SALE', 'EXPENSE', etc.
      entityId,
      changes,
      user: 'current_user', // Would be actual user in real implementation
      ipAddress: '127.0.0.1' // Would be actual IP in real implementation
    };
  };

  const validateBusinessRules = (entity, data) => {
    const errors = [];
    
    switch (entity) {
      case 'PRODUCT':
        if (!data.price || data.price <= 0) errors.push('Price must be greater than 0');
        if (!data.name || data.name.trim() === '') errors.push('Product name is required');
        break;
      case 'SALE':
        if (!data.quantity || data.quantity <= 0) errors.push('Quantity must be greater than 0');
        if (!data.productId) errors.push('Product selection is required');
        break;
      // Add more validation rules as needed
    }
    
    return errors;
  };

  // Helper functions
  const getProductSalesInPeriod = (productId, startDate, endDate) => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return sale.productId === productId && saleDate >= startDate && saleDate <= endDate;
    });
  };

  const getTotalSalesInPeriod = (startDate, endDate) => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDate && saleDate <= endDate;
    });
  };

  //===========================================
  // CONTEXT VALUE
  //===========================================

  const value = {
    // Core data
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

    // ERP Settings
    erpSettings,
    setERPSettings,

    // Utility functions
    convertCurrency,
    formatCurrency,

    // NEW: Comprehensive Cost & Revenue Analysis
    calculateTotalCosts,
    calculateTotalRevenue,

    // Advanced Profit Calculation Functions
    calculateDirectMaterialCost,
    calculateVariableOverheadPerUnit,
    calculateFixedOverheadPerUnit,
    calculateFullCostPerUnit,
    calculateProfitMetrics,
    calculatePortfolioMetrics,

    // Legacy calculation functions (for backward compatibility)
    calculateProductUnitCost,
    calculateProductCost,
    calculateProfitMargin,
    calculateMonthlyOverhead,
    calculateOwnerProfits,
    calculateEffectiveSalary,

    // International ERP Compliance Functions
    generateAuditTrail,
    validateBusinessRules,

    // Helper functions
    getProductSalesInPeriod,
    getTotalSalesInPeriod,
  };

  return (
    <ERPContext.Provider value={value}>
      {children}
    </ERPContext.Provider>
  );
};