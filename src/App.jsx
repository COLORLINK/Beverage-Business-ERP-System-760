import React, { useState, Suspense, lazy, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/Sidebar';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

// Lazy load all components
const Installation = lazy(() => import('./components/Installation'));
const Login = lazy(() => import('./components/Login'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const UserManagement = lazy(() => import('./components/UserManagement'));
const RolePermissions = lazy(() => import('./components/RolePermissions'));
const Ingredients = lazy(() => import('./components/Ingredients'));
const Products = lazy(() => import('./components/Products'));
const Sales = lazy(() => import('./components/Sales'));
const FinancialAnalysis = lazy(() => import('./components/FinancialAnalysis'));
const Employees = lazy(() => import('./components/Employees'));
const Expenses = lazy(() => import('./components/Expenses'));
const MonthlyBills = lazy(() => import('./components/MonthlyBills'));
const Owners = lazy(() => import('./components/Owners'));
const Reports = lazy(() => import('./components/Reports'));
const Settings = lazy(() => import('./components/Settings'));

const MainApp = () => {
  const { user, loading, isInstalled } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <LoadingSpinner text="Starting ERP System..." />;
  }

  if (!isInstalled) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Installation onComplete={() => window.location.reload()} />
      </Suspense>
    );
  }

  if (!user) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Login />
      </Suspense>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <motion.main 
          className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/role-permissions" element={<RolePermissions />} />
              <Route path="/ingredients" element={<Ingredients />} />
              <Route path="/products" element={<Products />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/financial-analysis" element={<FinancialAnalysis />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/monthly-bills" element={<MonthlyBills />} />
              <Route path="/owners" element={<Owners />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </motion.main>
      </div>
    </div>
  );
};

function App() {
  useEffect(() => {
    console.log('🚀 ERP System starting...');
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <MainApp />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;