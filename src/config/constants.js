/**
 * Application constants and configuration
 */

export const APP_CONFIG = {
  NAME: 'Drink ERP System',
  VERSION: '1.0.0',
  AUTHOR: 'ERP Development Team',
  
  // API Configuration
  API: {
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  },

  // UI Configuration
  UI: {
    SIDEBAR_WIDTH: 256,
    HEADER_HEIGHT: 64,
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 300,
    PAGINATION_SIZE: 20
  },

  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_PREFERENCES: 'user_preferences',
    THEME: 'theme',
    LANGUAGE: 'language'
  },

  // Default Values
  DEFAULTS: {
    CURRENCY: 'USD',
    LANGUAGE: 'en',
    THEME: 'light',
    PAGE_SIZE: 10
  }
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/',
  USERS: '/users',
  ROLES: '/role-permissions',
  PRODUCTS: '/products',
  SALES: '/sales',
  FINANCIAL: '/financial-analysis',
  EMPLOYEES: '/employees',
  EXPENSES: '/expenses',
  BILLS: '/monthly-bills',
  OWNERS: '/owners',
  REPORTS: '/reports',
  SETTINGS: '/settings'
};

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
  CURRENCY: /^\d+(\.\d{1,2})?$/
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.'
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  SAVE_SUCCESS: 'Changes saved successfully!',
  DELETE_SUCCESS: 'Item deleted successfully!',
  CREATE_SUCCESS: 'Item created successfully!'
};