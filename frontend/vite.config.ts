import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: { '/api': 'http://localhost:8000' },
  },

  resolve: {
    alias: { '@': '/src' },
  },

  // ── EXTREME Performance Build Config ──
  build: {
    // Target modern browsers for smaller bundle
    target: 'esnext',

    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,       // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,                // Extra compression pass
      },
      mangle: { toplevel: true },
    },

    // Chunk splitting for optimal caching & parallel loading
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React — cached permanently
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Animation library (heavy, isolated)
          'vendor-motion': ['framer-motion'],
          // Data & charts
          'vendor-charts': ['recharts'],
          // Utilities
          'vendor-utils': ['axios', 'zustand', 'react-hot-toast', 'react-helmet-async', 'clsx'],
          // Icons (tree-shaken per-page, but shared chunk)
          'vendor-icons': ['lucide-react'],
        },
        // Shorter hashed filenames for smaller HTML
        chunkFileNames: 'js/[name]-[hash:8].js',
        entryFileNames: 'js/[name]-[hash:8].js',
        assetFileNames: 'assets/[name]-[hash:8].[ext]',
      },
    },

    // Source map for debugging but not in production HTML
    sourcemap: false,

    // Increase chunk size warning (we control splitting)
    chunkSizeWarningLimit: 500,

    // CSS code splitting for per-route styles
    cssCodeSplit: true,
  },

  // ── Dependency Optimization ──
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom',
      'framer-motion', 'axios', 'zustand',
      'lucide-react', 'react-hot-toast', 'recharts',
    ],
  },
})
