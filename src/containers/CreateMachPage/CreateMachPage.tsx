import { Link } from 'react-router'

import Button from '@/components/Button'
import FormCreateMatch from './FormCreateMatch'

import { FRONTEND_PATHS } from '@/constants/frontendPaths'

import type { Match, MatchStatus } from '@/types/match'
import type { UUID } from '@/types/common'

import type { MatchToCreate } from './type'

function CreateMachPage() {
	const handleCreateMatch = async (matchToCreate: MatchToCreate): Promise<Match> => {
		const id = 'a1b2c3d4-e5f6-7890-1234-567890abcdef' as UUID
		const owner_id = 'f6e5d4c3-b2a1-0987-6543-210fedcba987' as UUID
		const status = 'in_progress' as MatchStatus

		return {
			id,
			name: matchToCreate.name,
			status,
			min_players: matchToCreate.min_players,
			max_players: matchToCreate.max_players,
			owner_id,
			current_player_order: 2,
		}
	}

	return (
		<>
			<Link to={FRONTEND_PATHS.HOME} className='ml-5'>
				<Button className='block mx-auto w-60 my-5'>List of matches</Button>
			</Link>
			<FormCreateMatch handleCreateMatch={handleCreateMatch} />
		</>
	)
}

export default CreateMachPage
