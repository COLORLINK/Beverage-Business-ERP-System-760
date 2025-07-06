// Lazy loading for better performance
import { lazy } from 'react';

export const LazyDashboard = lazy(() => import('../components/Dashboard'));
export const LazyProducts = lazy(() => import('../components/Products'));
export const LazyFinancialAnalysis = lazy(() => import('../components/FinancialAnalysis'));
export const LazyReports = lazy(() => import('../components/Reports'));