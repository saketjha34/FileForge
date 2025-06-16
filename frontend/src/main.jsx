import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ViewModeProvider } from './contexts/ViewModeContext.jsx';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ViewModeProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <App />
      </ViewModeProvider>
    </AuthProvider>
  </StrictMode>
);
