// API configuration with fallback for demo mode
const getApiUrl = () => {
  // Check if we're in production
  if (typeof window !== 'undefined' && window.location.hostname === 'erp.qamarah.me') {
    return 'https://erp.qamarah.me/api';
  }
  
  // Check for environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Default to localhost for development
  return 'http://localhost:5000/api';
};

const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 5000, // Reduced timeout for faster fallback
  RETRY_ATTEMPTS: 1 // Reduced retries for faster fallback
};

class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    this.demoMode = false;
    
    // Log API configuration for debugging
    if (typeof window !== 'undefined') {
      console.log('API Base URL:', this.baseURL);
    }
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    // If we're in demo mode, reject immediately
    if (this.demoMode) {
      throw new Error('Running in demo mode - no backend available');
    }

    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      timeout: API_CONFIG.TIMEOUT,
      ...options,
    };

    try {
      console.log(`Making API request to: ${url}`);
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timeout'));
        }, API_CONFIG.TIMEOUT);
      });

      // Race between fetch and timeout
      const response = await Promise.race([
        fetch(url, config),
        timeoutPromise
      ]);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.warn('Non-JSON response:', text);
        data = { error: 'Server returned non-JSON response' };
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.warn('API request failed, enabling demo mode:', error.message);
      
      // Enable demo mode on any API failure
      this.demoMode = true;
      
      // Re-throw the error to be handled by the calling code
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;