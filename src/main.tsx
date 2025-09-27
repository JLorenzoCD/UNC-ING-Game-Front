import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'

import { HttpServiceProvider } from './contexts/HttpServiceContext'
import { WebSocketServiceProvider } from './contexts/WebSocketServiceContext'
import { PlayerProvider } from './contexts/PlayerContext'

import './index.css'
import App from './App'

import MainLayout from './containers/MainLayout'

import CreateMatchContainer from './containers/create-match/CreateMatchContainer.tsx'
import MatchListPage from './containers/MatchListPage'
import LobbyPage from './containers/LobbyPage'
import CreatePlayerContainer from './containers/create-player/CreatePlayerContainer'

import { FRONTEND_PATHS } from './constants/frontendPaths.ts'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<HttpServiceProvider>
			<WebSocketServiceProvider>
				<PlayerProvider>
					<BrowserRouter>
						<Routes>
							<Route path={FRONTEND_PATHS.HOME} element={<App />} />
							<Route element={<MainLayout />}>
								<Route path={'/players'} element={<CreatePlayerContainer />} />
								<Route path={FRONTEND_PATHS.MATCH_CREATE} element={<CreateMatchContainer />} />
								<Route path={FRONTEND_PATHS.MATCH_LIST} element={<MatchListPage />} />
							</Route>
							<Route path={FRONTEND_PATHS.MATCH_LOBBY(':matchId')} element={<LobbyPage />} />
						</Routes>
					</BrowserRouter>
				</PlayerProvider>
			</WebSocketServiceProvider>
		</HttpServiceProvider>
	</StrictMode>
)
