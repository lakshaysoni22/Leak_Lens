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

    // Use default OXC minifier (built-in, fastest)

    // Chunk splitting for optimal caching & parallel loading
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router-dom') || id.match(/\/react\//))
              return 'vendor-react';
            if (id.includes('framer-motion'))
              return 'vendor-motion';
            if (id.includes('recharts'))
              return 'vendor-charts';
            if (id.includes('axios') || id.includes('zustand') || id.includes('react-hot-toast') || id.includes('react-helmet-async') || id.includes('clsx'))
              return 'vendor-utils';
            if (id.includes('lucide-react'))
              return 'vendor-icons';
          }
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
