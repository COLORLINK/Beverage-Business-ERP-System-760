import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Enhanced error handling and faster loading
const container = document.getElementById('root');

if (!container) {
  throw new Error('Failed to find the root element');
}

// Clear the loading fallback as soon as React starts
container.innerHTML = '';

const root = createRoot(container);

// Render with enhanced error handling
try {
  console.log('🎯 React mounting...');
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  console.log('✅ React mounted successfully');
} catch (error) {
  console.error('❌ Failed to render app:', error);
  
  // Show a better error message
  container.innerHTML = `
    <div style="
      text-align: center;
      padding: 50px;
      font-family: Arial, sans-serif;
      max-width: 500px;
      margin: 50px auto;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    ">
      <h1 style="color: #dc2626; margin-bottom: 20px;">Application Failed to Start</h1>
      <p style="margin-bottom: 20px;">There was an error starting the ERP application.</p>
      <div style="background: #10b981; color: white; padding: 12px; border-radius: 5px; margin: 20px 0;">
        ✅ This is a demo system - no backend required
      </div>
      <button 
        onclick="window.location.reload()" 
        style="
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 20px;
          font-size: 14px;
        "
      >
        Reload Page
      </button>
      <div style="margin-top: 20px; font-size: 12px; color: #6b7280;">
        <p>Error: ${error.message}</p>
        <p style="margin-top: 10px;">Try clearing your browser cache or opening in incognito mode</p>
      </div>
    </div>
  `;
}