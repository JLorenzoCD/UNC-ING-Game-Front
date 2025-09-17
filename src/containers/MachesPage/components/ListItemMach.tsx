import { Link } from 'react-router'

import Button from '@/components/Button'

import { FRONTEND_PATHS } from '@/constants/frontendPaths'

import type { MachListItem } from '../types'

interface Props {
	mach: MachListItem
}

function ListItemMach({ mach }: Props) {
	const name = mach.name.length < 35 ? mach.name : mach.name.substring(0, 32) + '...'

	return (
		<li className='flex justify-between items-center p-3 bg-white mb-2 rounded-xl border'>
			<p>{name}</p>
			<span className='flex gap-5 items-center'>
				<p>
					{mach.min_players}/{mach.max_players}
				</p>
				<p>-</p>
				<p>
					{mach.current_palyer >= mach.min_players ? '🟢' : '🟡'} {mach.current_palyer}
				</p>

				{/* <Link to={`${PATHS_MACH.MATCH_LIST}/${mach.id}`} className='ml-5'> */}
				<Link to={FRONTEND_PATHS.MATCH_LIST} className='ml-5'>
					<Button>Join</Button>
				</Link>
			</span>
		</li>
	)
}

export default ListItemMach
