import { REGEX_PATTERNS } from '@config/constants';

/**
 * Validation utilities
 */

export const validators = {
  email: (value) => {
    if (!value) return 'Email is required';
    if (!REGEX_PATTERNS.EMAIL.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!REGEX_PATTERNS.PASSWORD.test(value)) {
      return 'Password must contain uppercase, lowercase, and number';
    }
    return null;
  },

  required: (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'This field is required';
    }
    return null;
  },

  phone: (value) => {
    if (value && !REGEX_PATTERNS.PHONE.test(value)) {
      return 'Please enter a valid phone number';
    }
    return null;
  },

  currency: (value) => {
    if (!value) return 'Amount is required';
    if (!REGEX_PATTERNS.CURRENCY.test(value)) {
      return 'Please enter a valid amount';
    }
    if (parseFloat(value) <= 0) {
      return 'Amount must be greater than 0';
    }
    return null;
  },

  minLength: (min) => (value) => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters long`;
    }
    return null;
  },

  maxLength: (max) => (value) => {
    if (value && value.length > max) {
      return `Must be no more than ${max} characters long`;
    }
    return null;
  }
};

/**
 * Validate form fields
 * @param {Object} fields - Field values
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation errors
 */
export const validateFields = (fields, rules) => {
  const errors = {};

  Object.keys(rules).forEach(fieldName => {
    const fieldRules = rules[fieldName];
    const fieldValue = fields[fieldName];

    for (const rule of fieldRules) {
      const error = rule(fieldValue);
      if (error) {
        errors[fieldName] = error;
        break; // Stop at first error
      }
    }
  });

  return errors;
};

/**
 * Check if form has errors
 * @param {Object} errors - Validation errors
 * @returns {boolean} Has errors
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};