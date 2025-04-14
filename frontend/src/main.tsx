import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppRouter from './App-router.tsx';
import 'overlayscrollbars/overlayscrollbars.css';

import { AuthProvider } from './providers/auth-provider.tsx';
import { Toaster } from './components/ui/sonner.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
        <Toaster position='top-right'/>
        <AppRouter />
    </AuthProvider>
  </StrictMode>,
)
