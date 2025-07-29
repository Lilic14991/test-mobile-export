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
      // Output directory based on command (serve vs build) and app ID
      outDir: command === 'serve' ? 'dist' : `dist-${appId}`,
      emptyOutDir: true,
      
      // Rollup-specific options
      rollupOptions: {
        // Entry point
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        
        // Output chunking strategy for better caching and performance
        output: {
          manualChunks: {
            // Group common dependencies into separate chunks
            vendor: ['react', 'react-dom', 'react-router-dom', '@ionic/react'],
            ionic: ['@ionic/react', '@ionic/react-router', 'ionicons'],
          }
        }
      }
    }
  }
})
