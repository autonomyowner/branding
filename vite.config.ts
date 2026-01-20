import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize build for mobile performance
    target: 'es2015',
    cssCodeSplit: true,
    minify: 'esbuild',
    // Enable source maps for debugging (disable in production if needed)
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'animation-vendor': ['framer-motion'],
          'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          'ui-vendor': ['@radix-ui/react-accordion', '@radix-ui/react-slot'],
          'clerk-vendor': ['@clerk/clerk-react']
        },
        // Optimize asset file names for caching
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 600,
    // Enable CSS minification
    cssMinify: true
  },
  // Optimize dependencies pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion']
  },
  // Server optimization for development
  server: {
    // Enable pre-bundling
    warmup: {
      clientFiles: ['./src/pages/LandingPage.tsx', './src/pages/AdLandingPage.tsx']
    }
  }
})
