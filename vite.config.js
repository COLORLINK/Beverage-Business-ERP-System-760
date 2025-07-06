import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode, command }) => {
  const isProduction = mode === 'production';
  const base = command === 'build' ? '/' : './';
  
  return {
    plugins: [
      react({
        fastRefresh: true
      })
    ],
    
    base: base,
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@context': path.resolve(__dirname, './src/context'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@config': path.resolve(__dirname, './src/config')
      }
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: isProduction ? 'esbuild' : false,
      
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'router': ['react-router-dom'],
            'ui-libs': ['framer-motion'],
            'charts': ['recharts'],
            'icons': ['react-icons/fi'],
            'utils': ['date-fns']
          }
        }
      },
      
      chunkSizeWarningLimit: 1000
    },

    server: {
      port: 3000,
      host: true,
      hmr: true
    },

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'framer-motion',
        'date-fns'
      ]
    },

    define: {
      'process.env.NODE_ENV': JSON.stringify(mode)
    }
  };
});