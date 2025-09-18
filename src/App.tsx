import { useEffect, useMemo } from 'react'
import { Link } from 'react-router'

import { createHttpService } from './services/httpService'

import { FRONTEND_PATHS } from './constants/frontendPaths'

function App() {
	const httpService = useMemo(() => createHttpService(), [])

	useEffect(() => {
		if (!httpService) return

		console.log('HTTP Service initialized:', httpService)
	}, [httpService])

	return (
		<div>
			<h1>Here comes our page content.</h1>
			<div className='min-h-screen flex justify-center items-center'>
				<Link to={FRONTEND_PATHS.MATCH_CREATE} className='bg-white p-2 rounded-lg'>
					Create match (luego se elimina esto)
				</Link>
			</div>
		</div>
	)
}

export default App
