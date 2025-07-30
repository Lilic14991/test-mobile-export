/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'

/**
 * Vite Configuration
 * 
 * This configuration file sets up the build process for the Ionic application,
 * handling environment variables, plugins, testing, and build optimization.
 * 
 * @see https://vitejs.dev/config/
 */
export default defineConfig(({ command, mode }) => {
  // Load all environment variables regardless of the `VITE_` prefix
  const env = loadEnv(mode, process.cwd(), '')
  
  // Determine the app ID from environment variables with fallback to default
  const appId = process.env.VITE_APP_ID || env.VITE_APP_ID || 'client-web'
  
  // Configuration object
  return {
    // Plugins for React and legacy browser support
    plugins: [
      react(),
      legacy()
    ],
    
    // Vitest configuration for testing
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
    
    // Environment variable definitions that will be replaced in the code
    define: {
      'process.env.VITE_APP_ID': JSON.stringify(appId),
      'import.meta.env.VITE_APP_ID': JSON.stringify(appId),
    },
    
    // Build configuration
    build: {
      // Output directory - always use dist
      outDir: 'dist',
      emptyOutDir: true,
      
      // Rollup-specific options
      rollupOptions: {
        // Entry point
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        
        // Output chunking strategy for better caching and performance
        output: {
          manualChunks: (id) => {
            // Group dependencies into appropriate chunks
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              if (id.includes('@ionic/react') || id.includes('@ionic/react-router') || id.includes('ionicons')) {
                return 'vendor-ionic';
              }
              return 'vendor'; // all other node_modules
            }
          }
        }
      }
    }
  }
})
