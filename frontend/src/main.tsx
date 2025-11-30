import './index.css'
import App from './App.tsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './components/theme/theme-provider';
import { ApiProvider } from './context/APIContext';
import { ChatProvider } from './context/ChatContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ApiProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </ApiProvider>
    </ThemeProvider>
  </StrictMode>,
)
