import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'

import './index.css'

import App from './App.tsx'
import MainLayout from './containers/MainLayout'
import MatchesPage from './containers/MatchesPage/MatchesPage'
import CreateMatchPage from './containers/MatchesPage/CreateMatchPage'

import { FRONTEND_PATHS } from './constants/frontendPaths.ts'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path={FRONTEND_PATHS.HOME} element={<App />} />
				<Route element={<MainLayout />}>
					<Route path={FRONTEND_PATHS.MATCH_LIST} element={<MatchesPage />} />
					<Route path={FRONTEND_PATHS.MATCH_CREATE} element={<CreateMatchPage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	</StrictMode>
)
