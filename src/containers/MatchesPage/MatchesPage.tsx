import { useEffect, useState } from 'react'

import { Link } from 'react-router'
import Button from '../../components/Button'
import ListMatches from './components/ListMatches'

import { useHttpService } from '@/contexts/HttpServiceContext'
import { useWebSocketService } from '@/contexts/WebSocketServiceContext'

import { FRONTEND_PATHS } from '@/constants/frontendPaths'

import type { UUID } from '@/types/common'
import type { MatchListItem } from './types'

function MatchesPage() {
	const { httpService } = useHttpService()
	const { wsService, isConnected } = useWebSocketService()

	const [matches, setMatches] = useState<MatchListItem[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (httpService == null || wsService == null) return

		const init = async () => {
			try {
				// Se obtienen los datos mediante http
				setLoading(true)
				const matches = await httpService.getMatches()
				setMatches(matches)

				// Inicializando WebSocket
				if (isConnected) {
					console.warn('WebSocket is already connected. Reusing existing connection.')
				} else {
					wsService.connect()
					wsService.on('matchAdd', (newMatch: MatchListItem) => {
						setMatches((prev) => {
							const exists = prev.some((match) => match.id === newMatch.id)
							return exists ? prev : [...prev, newMatch]
						})
					})

					wsService.on('matchRemove', (deletedMatchId: UUID) => {
						setMatches((prev) => prev.filter((match) => match.id !== deletedMatchId))
					})

					wsService.on('matchUpdate', (updatedMatch: MatchListItem) => {
						setMatches((prev) => {
							return prev.map((match) => (match.id === updatedMatch.id ? updatedMatch : match))
						})
					})
				}
			} catch (err) {
				console.error(err)
				alert('Could not connect to the server.')
			} finally {
				setLoading(false)
			}
		}

		init()

		// Cleanup WebSocket on unmount
		return () => {
			wsService.disconnect()
		}
	}, [httpService, wsService, isConnected])

	return (
		<>
			<Link to={FRONTEND_PATHS.MATCH_CREATE} className='ml-5'>
				<Button className='block mx-auto w-60 my-5'>Create match</Button>
			</Link>
			{httpService != null && <ListMatches matches={matches} loading={loading} />}
		</>
	)
}

export default MatchesPage
