import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'

import { HttpServiceProvider } from './contexts/HttpServiceContext.tsx'
import { WebSocketServiceProvider } from './contexts/WebSocketServiceContext.tsx'
import { PlayerProvider } from './contexts/PlayerContext.tsx'

import './index.css'
import App from './App.tsx' 

import GameLayout from './containers/game/layout.tsx'
import GameContainer from './containers/game/index.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HttpServiceProvider>
      <WebSocketServiceProvider>
        <PlayerProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />} />
              
              <Route element={<GameLayout />}>
                <Route path="/match/:matchId/game" element={<GameContainer />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </PlayerProvider>
      </WebSocketServiceProvider>
    </HttpServiceProvider>
  </StrictMode>
)