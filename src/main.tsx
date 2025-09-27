import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'

import { HttpServiceProvider } from './contexts/HttpServiceContext.tsx'
import { WebSocketServiceProvider } from './contexts/WebSocketServiceContext.tsx'
import { PlayerProvider } from './contexts/PlayerContext.tsx'

import './index.css'
import App from './App.tsx' 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HttpServiceProvider>
      <WebSocketServiceProvider>
        <PlayerProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />} />              
            </Routes>
          </BrowserRouter>
        </PlayerProvider>
      </WebSocketServiceProvider>
    </HttpServiceProvider>
  </StrictMode>
)