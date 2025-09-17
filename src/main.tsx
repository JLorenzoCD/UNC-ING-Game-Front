import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'

import './index.css'

import App from './App.tsx'
import MainLayout from './containers/MainLayout.tsx'
import MachesPage from './containers/MachesPage/MachesPage.tsx'

import { FRONTEND_PATHS } from './constants/frontendPaths.ts'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path={FRONTEND_PATHS.HOME} element={<App />} />
				<Route element={<MainLayout />}>
					<Route path={FRONTEND_PATHS.MATCH_LIST} element={<MachesPage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	</StrictMode>
)
