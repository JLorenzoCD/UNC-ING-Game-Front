import { useMemo } from 'react'

import { Link } from 'react-router'
import Button from '../../components/Button'

import { FRONTEND_PATHS } from '../../constants/frontendPaths'

import { createHttpService } from '@/services/httpService'

import ListMatches from './components/ListMatches'

function MatchesPage() {
	const httpService = useMemo(() => createHttpService(), [])

	return (
		<>
			<Link to={FRONTEND_PATHS.MATCH_CREATE} className='ml-5'>
				<Button className='block mx-auto w-60 my-5'>Create match</Button>
			</Link>
			<ListMatches getMatches={httpService.getMatches} />
		</>
	)
}

export default MatchesPage
