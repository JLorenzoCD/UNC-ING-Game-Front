import { useEffect, useState } from 'react'

import { Link } from 'react-router'
import Button from '../../components/Button'
import ListItemMach from './components/ListItemMach'

import { FRONTEND_PATHS } from '../../constants/frontendPaths'

import { initialStateMachesMock } from './data'

import type { MachListItem } from './types'

function MachesPage() {
	const [maches, setMaches] = useState<MachListItem[]>([])

	useEffect(() => {
		// obtener datos
		setMaches(initialStateMachesMock)

		return () => {
			// se tiene que cancelar peticiones en caso de ser necesario
			// o se podria crear un hook useFetch para que lo haga este
		}
	}, [])

	return (
		<>
			{/* <Link to={FRONTEND_PATHS.MATCH_CREATE} className='ml-5'> */}
			<Link to={FRONTEND_PATHS.MATCH_LIST} className='ml-5'>
				<Button className='block mx-auto w-60 my-5'>Create match</Button>
			</Link>
			<div className='bg-white rounded-xl p-6 max-w-3xl mx-auto'>
				<h1 className='text-center text-4xl font-bold'>List of matches</h1>
				<hr className='my-2' />
				<ul className='min-h-[40vh] bg-[#f3f3f3] rounded-xl p-1 flex flex-col'>
					{!maches.length ? (
						<div className='flex justify-center items-center flex-grow'>
							<p>There are no games available, why don't you create one?</p>
						</div>
					) : (
						maches.map((m) => <ListItemMach key={m.id} mach={m} />)
					)}
				</ul>
			</div>
		</>
	)
}

export default MachesPage
