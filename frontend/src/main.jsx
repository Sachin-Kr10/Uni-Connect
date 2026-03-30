import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SocketProvider } from './context/SocketContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch on tab switch by default 
      retry: 1, // Only retry once on failure
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </SocketProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)

