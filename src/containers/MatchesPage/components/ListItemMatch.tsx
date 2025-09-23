import { useNavigate } from 'react-router'

import Button from '@/components/Button'

import { FRONTEND_PATHS } from '@/constants/frontendPaths'

import { isValidMatch } from '../utils'

import type { MatchListItem } from '../types'

interface Props {
	match: MatchListItem
}

function ListItemMatch({ match }: Props) {
	const navigate = useNavigate()

	if (!isValidMatch(match)) return null

	const name = match.name.length < 35 ? match.name : match.name.substring(0, 32) + '...'

	function handleClick() {
		//! El correcto funcionamiento se realiza en otro ticket
		navigate(FRONTEND_PATHS.MATCH_LOBBY(match.id))
	}

	return (
		<li className='flex justify-between items-center p-3 bg-white mb-2 rounded-xl border'>
			<p>{name}</p>
			<span className='flex gap-5 items-center'>
				<p>
					{match.min_players}/{match.max_players}
				</p>
				<p>-</p>
				<p>
					{match.current_player >= match.min_players ? '🟢' : '🟡'} {match.current_player}
				</p>

				<Button className='ml-5' onClick={handleClick}>
					Join
				</Button>
			</span>
		</li>
	)
}

export default ListItemMatch
