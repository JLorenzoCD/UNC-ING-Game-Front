import { useEffect, useState } from 'react'

import { Link } from 'react-router'
import Button from '@/components/Button'
import ListMatches from './components/ListMatches'
import ListItemMatch from './components/ListItemMatch'

import { useHttpService } from '@/contexts/HttpServiceContext'
import { useWebSocketService } from '@/contexts/WebSocketServiceContext'

import { FRONTEND_PATHS } from '@/constants/frontendPaths'
import { BACKEND_SOCKETS_EVENTS } from '@/constants/backend'

import type { UUID } from '@/types/common'
import type { MatchListItem } from '@/types/match'

interface WSError extends Error {
	showUser: boolean
}

function MatchesContainer() {
	const { httpService } = useHttpService()
	const { wsService, isConnected } = useWebSocketService()

	const [matches, setMatches] = useState<MatchListItem[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (httpService == null || wsService == null) return

		const handleMatchAdd = (newMatch: MatchListItem) => {
			setMatches((prev) => {
				const exists = prev.some((match) => match.id === newMatch.id)
				return exists ? prev : [...prev, newMatch]
			})
		}

		const handleMatchRemove = (deletedMatchId: UUID) => {
			setMatches((prev) => prev.filter((match) => match.id !== deletedMatchId))
		}

		const handleMatchUpdate = (updatedMatch: Partial<MatchListItem>) => {
			setMatches((prev) => {
				return prev.map((match) => (match.id === updatedMatch.id ? { ...match, ...updatedMatch } : match))
			})
		}

		const init = async () => {
			try {
				// Se obtienen los datos mediante http
				setLoading(true)
				const matches = await httpService.getMatches()
				setMatches(matches)

				if (isConnected) {
					wsService.on(BACKEND_SOCKETS_EVENTS.MATCHES_ADD, handleMatchAdd)
					wsService.on(BACKEND_SOCKETS_EVENTS.MATCHES_REMOVE, handleMatchRemove)
					wsService.on(BACKEND_SOCKETS_EVENTS.MATCHES_UPDATE, handleMatchUpdate)
				} else {
					const err = new Error(
						'An error occurred while connecting to the server. Matches cannot be updated when adding players or adding new matches.'
					) as WSError
					err.showUser = true
					console.log('error')

					throw err
				}
			} catch (err) {
				console.error(err)
				const error = err as Error

				if ((error as WSError).showUser) {
					alert(error.message)
				} else {
					alert('Could not connect to the server.')
				}
			} finally {
				setLoading(false)
			}
		}

		init()
		return () => {
			wsService.off(BACKEND_SOCKETS_EVENTS.MATCHES_ADD, handleMatchAdd)
			wsService.off(BACKEND_SOCKETS_EVENTS.MATCHES_REMOVE, handleMatchRemove)
			wsService.off(BACKEND_SOCKETS_EVENTS.MATCHES_UPDATE, handleMatchUpdate)
		}
	}, [httpService, wsService, isConnected])

	return (
		<>
			<Link to={FRONTEND_PATHS.MATCH_CREATE} className='block mx-auto w-60 my-5'>
				<Button className='w-full'>Create match</Button>
			</Link>
			{httpService != null && (
				<ListMatches isLoading={loading}>
					{matches.map((m) => (
						<ListItemMatch key={m.id} match={m} />
					))}
				</ListMatches>
			)}
		</>
	)
}

export default MatchesContainer
