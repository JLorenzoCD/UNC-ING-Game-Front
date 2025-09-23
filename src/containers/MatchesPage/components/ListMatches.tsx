import { useEffect, useState } from 'react'

import ListItemMatch from './ListItemMatch'

import type { MatchListItem } from '../types'
import Loading from '@/components/Loading'

interface Props {
	getMatches: () => Promise<MatchListItem[]>
}

function ListMatches({ getMatches }: Props) {
	const [matches, setMatches] = useState<MatchListItem[]>([])
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		;(async () => {
			try {
				setLoading(true)
				const matches = await getMatches()
				setMatches(matches)
			} catch (err) {
				console.error(err)
				alert('Could not connect to the server.')
			} finally {
				setLoading(false)
			}
		})()
	}, [getMatches])

	return (
		<div className='bg-white rounded-xl p-6 max-w-3xl mx-auto'>
			<h1 className='text-center text-4xl font-bold'>List of matches</h1>
			<hr className='my-2' />
			<ul className='min-h-[40vh] bg-[#f3f3f3] rounded-xl p-1 flex flex-col'>
				{loading && (
					<div className='flex justify-center items-center flex-grow'>
						<Loading />
					</div>
				)}
				{!matches.length && !loading ? (
					<div className='flex justify-center items-center flex-grow'>
						<p>There are no games available, why don't you create one?</p>
					</div>
				) : (
					matches.map((m) => <ListItemMatch key={m.id} match={m} />)
				)}
			</ul>
		</div>
	)
}

export default ListMatches
