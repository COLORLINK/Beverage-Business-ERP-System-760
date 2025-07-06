import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useERP } from '../context/ERPContext';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subDays } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ComposedChart } from 'recharts';

const { 
  FiTrendingUp, FiTrendingDown, FiDollarSign, FiShoppingCart, 
  FiFilter, FiBarChart3, FiPieChart, FiAlertTriangle, FiCheckCircle,
  FiCalendar, FiTarget, FiBrain, FiLightbulb, FiZap, FiArrowUp,
  FiArrowDown, FiMaximize2, FiMinimize2
} = FiIcons;

const FinancialAnalysis = () => {
  const { 
    formatCurrency, 
    calculateTotalRevenue,
    calculateTotalCosts,
    products,
    sales,
    employees,
    expenses,
    monthlyBills,
    billPayments,
    salaryAdjustments,
    calculatePortfolioMetrics
  } = useERP();
  
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate date range based on selected period
  const getDateRange = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'current':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
          label: 'This Month'
        };
      case 'last7':
        return {
          start: subDays(now, 7),
          end: now,
          label: 'Last 7 Days'
        };
      case 'last30':
        return {
          start: subDays(now, 30),
          end: now,
          label: 'Last 30 Days'
        };
      case 'last90':
        return {
          start: subDays(now, 90),
          end: now,
          label: 'Last 90 Days'
        };
      case 'thisYear':
        return {
          start: startOfYear(now),
          end: endOfYear(now),
          label: 'This Year'
        };
      case 'custom':
        if (customStartDate && customEndDate) {
          return {
            start: new Date(customStartDate),
            end: new Date(customEndDate),
            label: `${format(new Date(customStartDate), 'MMM dd')} - ${format(new Date(customEndDate), 'MMM dd, yyyy')}`
          };
        }
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
          label: 'This Month'
        };
      case 'all':
        return {
          start: new Date(0),
          end: now,
          label: 'All Time'
        };
      default:
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
          label: 'This Month'
        };
    }
  };

  const { start: startDate, end: endDate, label: periodLabel } = getDateRange();
  
  // Get comprehensive analysis
  const revenueAnalysis = calculateTotalRevenue(startDate, endDate);
  const costAnalysis = calculateTotalCosts(startDate, endDate);
  const portfolioAnalysis = calculatePortfolioMetrics(startDate, endDate);
  
  // Calculate profit metrics
  const netProfit = revenueAnalysis.totalRevenue - costAnalysis.totalCosts;
  const profitMargin = revenueAnalysis.totalRevenue > 0 ? (netProfit / revenueAnalysis.totalRevenue) * 100 : 0;
  const roi = costAnalysis.totalCosts > 0 ? (netProfit / costAnalysis.totalCosts) * 100 : 0;

  // Calculate trends for comparison
  const getTrendAnalysis = () => {
    const trends = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = endOfMonth(subMonths(new Date(), i));
      const monthRevenue = calculateTotalRevenue(monthStart, monthEnd);
      const monthCosts = calculateTotalCosts(monthStart, monthEnd);
      const monthProfit = monthRevenue.totalRevenue - monthCosts.totalCosts;
      
      trends.push({
        month: format(monthStart, 'MMM'),
        revenue: monthRevenue.totalRevenue,
        costs: monthCosts.totalCosts,
        profit: monthProfit,
        profitMargin: monthRevenue.totalRevenue > 0 ? (monthProfit / monthRevenue.totalRevenue) * 100 : 0
      });
    }
    return trends;
  };

  const trendData = getTrendAnalysis();
  
  // Calculate trend indicators
  const currentMonthIndex = trendData.length - 1;
  const previousMonthIndex = currentMonthIndex - 1;
  
  const getTrendIndicator = (current, previous, type = 'profit') => {
    if (previousMonthIndex < 0) return { trend: 'neutral', change: 0 };
    
    const currentValue = trendData[currentMonthIndex]?.[type] || 0;
    const previousValue = trendData[previousMonthIndex]?.[type] || 0;
    
    if (previousValue === 0) return { trend: 'neutral', change: 0 };
    
    const change = ((currentValue - previousValue) / previousValue) * 100;
    
    return {
      trend: change > 0 ? 'winning' : change < 0 ? 'losing' : 'neutral',
      change: change
    };
  };

  const profitTrend = getTrendIndicator(null, null, 'profit');
  const revenueTrend = getTrendIndicator(null, null, 'revenue');
  const marginTrend = getTrendIndicator(null, null, 'profitMargin');

  // Enhanced business health with AI recommendations
  const getBusinessHealthWithRecommendations = () => {
    const profitPositive = netProfit > 0;
    const profitGrowing = profitTrend.trend === 'winning';
    const marginHealthy = profitMargin > 15; // Industry standard: 15%
    const revenueGrowing = revenueTrend.trend === 'winning';
    const costEfficient = costAnalysis.breakdown.materials / revenueAnalysis.totalRevenue < 0.35; // Material costs should be <35%
    const cashFlowPositive = portfolioAnalysis.portfolio.portfolioROI > 10; // ROI should be >10%
    
    const positiveIndicators = [profitPositive, profitGrowing, marginHealthy, revenueGrowing, costEfficient, cashFlowPositive].filter(Boolean).length;
    
    // Generate smart recommendations
    const recommendations = [];
    const priorities = [];
    
    if (!profitPositive) {
      recommendations.push({
        type: 'critical',
        icon: FiAlertTriangle,
        title: 'Revenue Optimization Required',
        description: 'Business is operating at a loss. Immediate action needed.',
        actions: [
          'Review pricing strategy - consider 10-20% price increase',
          'Focus on high-margin products',
          'Reduce operational costs by 15-25%',
          'Implement cost-cutting measures'
        ]
      });
      priorities.push('Achieve profitability');
    }
    
    if (!marginHealthy) {
      recommendations.push({
        type: 'warning',
        icon: FiTrendingUp,
        title: 'Improve Profit Margins',
        description: `Current margin: ${profitMargin.toFixed(1)}%. Industry standard: 15%+`,
        actions: [
          'Negotiate better supplier rates',
          'Optimize product mix - promote high-margin items',
          'Reduce material waste and overhead',
          'Implement value-based pricing'
        ]
      });
      priorities.push('Increase profit margins to 15%+');
    }
    
    if (!revenueGrowing) {
      recommendations.push({
        type: 'warning',
        icon: FiArrowUp,
        title: 'Revenue Growth Strategy',
        description: 'Revenue growth is stagnant. Focus on expansion.',
        actions: [
          'Launch customer acquisition campaigns',
          'Expand product offerings',
          'Improve customer retention (target 80%+)',
          'Explore new market segments'
        ]
      });
      priorities.push('Grow revenue by 10% monthly');
    }
    
    if (!costEfficient) {
      const materialRatio = (costAnalysis.breakdown.materials / revenueAnalysis.totalRevenue * 100).toFixed(1);
      recommendations.push({
        type: 'warning',
        icon: FiMinimize2,
        title: 'Cost Optimization',
        description: `Material costs: ${materialRatio}% of revenue. Target: <35%`,
        actions: [
          'Renegotiate supplier contracts',
          'Implement inventory management system',
          'Reduce material waste',
          'Consider bulk purchasing discounts'
        ]
      });
      priorities.push('Reduce material costs below 35%');
    }
    
    if (!cashFlowPositive) {
      recommendations.push({
        type: 'info',
        icon: FiDollarSign,
        title: 'Cash Flow Enhancement',
        description: `Current ROI: ${portfolioAnalysis.portfolio.portfolioROI.toFixed(1)}%. Target: 10%+`,
        actions: [
          'Improve accounts receivable collection',
          'Optimize payment terms with suppliers',
          'Implement cash flow forecasting',
          'Consider short-term financing options'
        ]
      });
      priorities.push('Improve ROI to 10%+');
    }
    
    // Success recommendations
    if (positiveIndicators >= 4) {
      recommendations.push({
        type: 'success',
        icon: FiZap,
        title: 'Scale & Optimize',
        description: 'Strong performance! Focus on scaling operations.',
        actions: [
          'Invest in automation and technology',
          'Expand to new markets or locations',
          'Develop strategic partnerships',
          'Build cash reserves for opportunities'
        ]
      });
    }
    
    let status, color, bgColor, icon;
    if (positiveIndicators >= 5) {
      status = 'excellent';
      color = 'text-green-600';
      bgColor = 'bg-green-100';
      icon = FiCheckCircle;
    } else if (positiveIndicators >= 3) {
      status = 'good';
      color = 'text-blue-600';
      bgColor = 'bg-blue-100';
      icon = FiTrendingUp;
    } else if (positiveIndicators >= 2) {
      status = 'warning';
      color = 'text-yellow-600';
      bgColor = 'bg-yellow-100';
      icon = FiAlertTriangle;
    } else {
      status = 'critical';
      color = 'text-red-600';
      bgColor = 'bg-red-100';
      icon = FiTrendingDown;
    }
    
    return { 
      status, 
      color, 
      bgColor, 
      icon, 
      recommendations, 
      priorities,
      score: Math.round((positiveIndicators / 6) * 100)
    };
  };

  const businessHealth = getBusinessHealthWithRecommendations();

  // International ERP KPIs
  const getERPKPIs = () => {
    const inventoryTurnover = revenueAnalysis.totalRevenue / (costAnalysis.breakdown.materials || 1);
    const employeeProductivity = revenueAnalysis.totalRevenue / employees.length;
    const customerAcquisitionCost = (costAnalysis.breakdown.variable * 0.3) / (revenueAnalysis.totalOrders || 1); // 30% of variable costs assumed for marketing
    const averageTransactionValue = revenueAnalysis.avgOrderValue;
    const operatingEfficiency = (netProfit / costAnalysis.totalCosts) * 100;
    
    return {
      inventoryTurnover: {
        value: inventoryTurnover.toFixed(2),
        target: '4-6x',
        status: inventoryTurnover >= 4 ? 'good' : 'warning',
        description: 'Times inventory is sold per period'
      },
      employeeProductivity: {
        value: formatCurrency(employeeProductivity),
        target: formatCurrency(5000),
        status: employeeProductivity >= 5000 ? 'good' : 'warning',
        description: 'Revenue per employee'
      },
      customerAcquisitionCost: {
        value: formatCurrency(customerAcquisitionCost),
        target: formatCurrency(50),
        status: customerAcquisitionCost <= 50 ? 'good' : 'warning',
        description: 'Cost to acquire new customer'
      },
      averageTransactionValue: {
        value: formatCurrency(averageTransactionValue),
        target: formatCurrency(25),
        status: averageTransactionValue >= 25 ? 'good' : 'warning',
        description: 'Average order value'
      },
      operatingEfficiency: {
        value: `${operatingEfficiency.toFixed(1)}%`,
        target: '15%+',
        status: operatingEfficiency >= 15 ? 'good' : 'warning',
        description: 'Operating profit ratio'
      }
    };
  };

  const erpKPIs = getERPKPIs();

  // Prepare chart data
  const pieChartData = [
    { name: 'Materials', value: costAnalysis.breakdown.materials, color: '#ef4444' },
    { name: 'Variable', value: costAnalysis.breakdown.variable, color: '#f59e0b' },
    { name: 'Fixed', value: costAnalysis.breakdown.fixed, color: '#8b5cf6' },
  ].filter(item => item.value > 0);

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4'];

  const TrendBadge = ({ trend, change, label }) => (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
      trend === 'winning' ? 'bg-green-100 text-green-700' :
      trend === 'losing' ? 'bg-red-100 text-red-700' :
      'bg-gray-100 text-gray-700'
    }`}>
      <SafeIcon 
        icon={trend === 'winning' ? FiTrendingUp : trend === 'losing' ? FiTrendingDown : FiTarget} 
        className="h-4 w-4" 
      />
      <span>{label}</span>
      <span className="font-bold">
        {change > 0 ? '+' : ''}{change.toFixed(1)}%
      </span>
    </div>
  );

  const StatCard = ({ title, value, icon, color, change, subtitle, trend }) => (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-3 rounded-full ${color}`}>
          <SafeIcon icon={icon} className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <TrendBadge trend={trend.trend} change={trend.change} label="vs last month" />
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Analysis</h1>
          <p className="text-gray-600 mt-1">AI-powered insights with international ERP standards</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="current">This Month</option>
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
            <option value="last90">Last 90 Days</option>
            <option value="thisYear">This Year</option>
            <option value="custom">Custom Range</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Custom Date Range */}
      {selectedPeriod === 'custom' && (
        <motion.div
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Business Health with AI Recommendations */}
      <motion.div
        className={`p-6 rounded-xl shadow-sm border mb-8 ${businessHealth.bgColor} border-opacity-20`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${businessHealth.bgColor}`}>
              <SafeIcon icon={businessHealth.icon} className={`h-8 w-8 ${businessHealth.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className={`text-2xl font-bold ${businessHealth.color} capitalize`}>
                  Business Health: {businessHealth.status}
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${businessHealth.bgColor} ${businessHealth.color}`}>
                  {businessHealth.score}/100 Score
                </span>
              </div>
              <p className="text-gray-600">
                {businessHealth.status === 'excellent' && 'Outstanding performance! Focus on scaling and optimization.'}
                {businessHealth.status === 'good' && 'Strong performance with room for strategic improvements.'}
                {businessHealth.status === 'warning' && 'Some areas need attention for better performance.'}
                {businessHealth.status === 'critical' && 'Immediate action required to improve profitability.'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <TrendBadge trend={profitTrend.trend} change={profitTrend.change} label="Profit" />
            <TrendBadge trend={revenueTrend.trend} change={revenueTrend.change} label="Revenue" />
            <TrendBadge trend={marginTrend.trend} change={marginTrend.change} label="Margin" />
          </div>
        </div>

        {/* AI Recommendations */}
        {businessHealth.recommendations.length > 0 && (
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <SafeIcon icon={FiBrain} className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">AI-Powered Recommendations</h3>
            </div>
            
            {/* Priority Actions */}
            {businessHealth.priorities.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <SafeIcon icon={FiTarget} className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Priority Actions</span>
                </div>
                <ul className="space-y-1">
                  {businessHealth.priorities.slice(0, 3).map((priority, index) => (
                    <li key={index} className="text-sm text-blue-800 flex items-center gap-2">
                      <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                      {priority}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detailed Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {businessHealth.recommendations.slice(0, 4).map((rec, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  rec.type === 'critical' ? 'bg-red-50 border-red-400' :
                  rec.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                  rec.type === 'success' ? 'bg-green-50 border-green-400' :
                  'bg-blue-50 border-blue-400'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <SafeIcon icon={rec.icon} className={`h-4 w-4 ${
                      rec.type === 'critical' ? 'text-red-600' :
                      rec.type === 'warning' ? 'text-yellow-600' :
                      rec.type === 'success' ? 'text-green-600' :
                      'text-blue-600'
                    }`} />
                    <h4 className="font-medium text-gray-900">{rec.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                  <ul className="space-y-1">
                    {rec.actions.slice(0, 2).map((action, actionIndex) => (
                      <li key={actionIndex} className="text-xs text-gray-700 flex items-center gap-1">
                        <SafeIcon icon={FiLightbulb} className="h-3 w-3 text-yellow-500" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* International ERP KPIs */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <SafeIcon icon={FiBarChart3} className="h-6 w-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">International ERP Standards & KPIs</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(erpKPIs).map(([key, kpi]) => (
            <div key={key} className={`p-4 rounded-lg ${kpi.status === 'good' ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${kpi.status === 'good' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm font-medium text-gray-700">{kpi.description}</span>
              </div>
              <p className={`text-xl font-bold ${kpi.status === 'good' ? 'text-green-700' : 'text-yellow-700'}`}>
                {kpi.value}
              </p>
              <p className="text-xs text-gray-500">Target: {kpi.target}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Period Summary */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <SafeIcon icon={FiFilter} className="h-6 w-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Financial Summary - {periodLabel}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-green-700">Total Revenue</p>
            <p className="text-xl font-bold text-green-900">{formatCurrency(revenueAnalysis.totalRevenue)}</p>
            <p className="text-xs text-green-600">{revenueAnalysis.totalOrders} orders</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-red-700">Total Costs</p>
            <p className="text-xl font-bold text-red-900">{formatCurrency(costAnalysis.totalCosts)}</p>
            <p className="text-xs text-red-600">All categories</p>
          </div>
          <div className={`p-4 rounded-lg ${netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`text-sm font-medium ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>Net Profit</p>
            <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              {formatCurrency(netProfit)}
            </p>
            <p className={`text-xs ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {profitMargin.toFixed(1)}% margin
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-700">ROI</p>
            <p className="text-xl font-bold text-blue-900">{roi.toFixed(1)}%</p>
            <p className="text-xs text-blue-600">Return on investment</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-purple-700">Portfolio Performance</p>
            <p className="text-xl font-bold text-purple-900">
              {portfolioAnalysis.portfolio.portfolioROI.toFixed(1)}%
            </p>
            <p className="text-xs text-purple-600">Portfolio ROI</p>
          </div>
        </div>
      </motion.div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(revenueAnalysis.totalRevenue)}
          icon={FiTrendingUp}
          color="bg-green-500"
          subtitle={`${revenueAnalysis.totalUnits} units sold`}
          trend={revenueTrend}
        />
        <StatCard
          title="Total Costs"
          value={formatCurrency(costAnalysis.totalCosts)}
          icon={FiTrendingDown}
          color="bg-red-500"
          subtitle="All cost categories"
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(netProfit)}
          icon={FiDollarSign}
          color={netProfit >= 0 ? "bg-green-500" : "bg-red-500"}
          subtitle={`${profitMargin.toFixed(1)}% margin`}
          trend={profitTrend}
        />
        <StatCard
          title="Average Order"
          value={formatCurrency(revenueAnalysis.avgOrderValue)}
          icon={FiShoppingCart}
          color="bg-blue-500"
          subtitle={`${revenueAnalysis.totalOrders} orders`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Costs Chart */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold mb-4">Revenue vs Costs Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
              <Bar dataKey="costs" fill="#ef4444" name="Costs" />
              <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} name="Profit" />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Cost Distribution */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-4">Cost Distribution</h3>
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No cost data available
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default FinancialAnalysis;