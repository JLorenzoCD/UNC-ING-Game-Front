import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'

import { HttpServiceProvider } from './contexts/HttpServiceContext'
import { WebSocketServiceProvider } from './contexts/WebSocketServiceContext'
import { PlayerProvider } from './contexts/PlayerContext'

import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<HttpServiceProvider>
			<WebSocketServiceProvider>
				<PlayerProvider>
					<BrowserRouter>
						<Routes>
							<Route path='/' element={<App />} />
						</Routes>
					</BrowserRouter>
				</PlayerProvider>
			</WebSocketServiceProvider>
		</HttpServiceProvider>
	</StrictMode>
)
