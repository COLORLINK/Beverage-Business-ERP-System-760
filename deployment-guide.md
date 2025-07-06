# Deploy React ERP System to Hostinger Shared Hosting

## 📋 Prerequisites
- Hostinger shared hosting account
- Domain name (or subdomain)
- FTP access credentials
- Node.js installed locally for building

## 🔧 Step 1: Prepare Your Project for Production

### Update vite.config.js for production
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Important for shared hosting
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable for production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          charts: ['recharts'],
          icons: ['react-icons'],
          motion: ['framer-motion']
        }
      }
    }
  },
  server: {
    port: 3000
  }
})
```

### Update package.json build script
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "build:prod": "npm run lint && vite build --mode production"
  }
}
```