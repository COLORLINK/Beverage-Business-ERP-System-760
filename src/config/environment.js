// Environment configuration
const config = {
  development: {
    API_URL: 'http://localhost:3000',
    APP_URL: 'http://localhost:5173'
  },
  production: {
    API_URL: 'https://yourdomain.com',
    APP_URL: 'https://yourdomain.com'
  }
};

const environment = import.meta.env.MODE || 'development';

export default config[environment];