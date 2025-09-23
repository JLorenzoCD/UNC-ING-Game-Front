import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';

import { HttpServiceProvider } from './contexts/HttpServiceContext.tsx';
import { WebSocketServiceProvider } from './contexts/WebSocketServiceContext.tsx';

import './index.css';

import App from './App.tsx';

import MainLayout from './containers/MainLayout';

import CreateMachPage from './containers/CreateMachPage/CreateMachPage';
import MatchListPage from './containers/MatchListPage';
import LobbyPage from './containers/LobbyPage';

import { FRONTEND_PATHS } from './constants/frontendPaths.ts';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<HttpServiceProvider>
			<WebSocketServiceProvider>
				<BrowserRouter>
					<Routes>
						<Route path={FRONTEND_PATHS.HOME} element={<App />} />
						<Route element={<MainLayout />}>
							<Route path={FRONTEND_PATHS.MATCH_CREATE} element={<CreateMachPage />} />
							<Route path={FRONTEND_PATHS.MATCH_LIST} element={<MatchListPage />} />
						</Route>
						<Route path={`${FRONTEND_PATHS.MATCH_LOBBY}/:matchId`} element={<LobbyPage />} />
					</Routes>
				</BrowserRouter>
			</WebSocketServiceProvider>
		</HttpServiceProvider>
	</StrictMode>
);
