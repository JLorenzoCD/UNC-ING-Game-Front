import { Link } from 'react-router'

import Button from '@/components/Button'

import { FRONTEND_PATHS } from '@/constants/frontendPaths'

import { isInvalidMatch } from '../utils'

import type { MatchListItem } from '../types'

interface Props {
	match: MatchListItem
}

function ListItemMatch({ match }: Props) {
	if (isInvalidMatch(match)) return null

	const name = match.name.length < 35 ? match.name : match.name.substring(0, 32) + '...'

	return (
		<li className='flex justify-between items-center p-3 bg-white mb-2 rounded-xl border'>
			<p>{name}</p>
			<span className='flex gap-5 items-center'>
				<p>
					{match.min_players}/{match.max_players}
				</p>
				<p>-</p>
				<p>
					{match.current_palyer >= match.min_players ? '🟢' : '🟡'} {match.current_palyer}
				</p>

				<Link to={FRONTEND_PATHS.MATCH_LIST} className='ml-5'>
					<Button>Join</Button>
				</Link>
			</span>
		</li>
	)
}

export default ListItemMatch
