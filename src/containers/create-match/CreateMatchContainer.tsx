import { Link } from 'react-router'
import Button from '@/components/Button'
import FormCreateMatch from './FormCreateMatch'

import { FRONTEND_PATHS } from '@/constants/frontendPaths'

import { useHttpService } from '@/contexts/HttpServiceContext'

function CreateMatchContainer() {
	const { httpService } = useHttpService()

	return (
		<>
			<Link to={FRONTEND_PATHS.MATCH_LIST} className='block mx-auto w-60 my-5'>
				<Button className='w-full'>List of matches</Button>
			</Link>
			{httpService != null && <FormCreateMatch handleCreateMatch={httpService.createMatch} />}
		</>
	)
}

export default CreateMatchContainer
