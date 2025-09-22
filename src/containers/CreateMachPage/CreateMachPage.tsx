import { useMemo } from 'react'

import { Link } from 'react-router'
import Button from '@/components/Button'
import FormCreateMatch from './FormCreateMatch'

import { FRONTEND_PATHS } from '@/constants/frontendPaths'

import { createHttpService } from '@/services/httpService'

function CreateMachPage() {
	const httpService = useMemo(() => createHttpService(), [])

	return (
		<>
			<Link to={FRONTEND_PATHS.MATCH_LIST} className='ml-5'>
				<Button className='block mx-auto w-60 my-5'>List of matches</Button>
			</Link>
			<FormCreateMatch handleCreateMatch={httpService.createMatch} />
		</>
	)
}

export default CreateMachPage
