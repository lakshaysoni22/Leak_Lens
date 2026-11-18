import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'

// Initialize theme from localStorage before first render to prevent flash
const storedTheme = (() => {
  try {
    const raw = localStorage.getItem('leaklens-theme')
    if (raw) {
      const parsed = JSON.parse(raw)
      return parsed?.state?.theme ?? 'dark'
    }
  } catch {}
  return 'dark'
})()
document.documentElement.setAttribute('data-theme', storedTheme)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#111827',
                color: '#F5F7FA',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
              },
              success: { iconTheme: { primary: '#A3FF6F', secondary: '#080B12' } },
              error: { iconTheme: { primary: '#FF5A5A', secondary: '#080B12' } },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
)
