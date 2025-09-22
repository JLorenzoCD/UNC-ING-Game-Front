import { useParams } from 'react-router'

function LobbyPage() {
	const { matchId } = useParams()

	return <div className='text-white'>Id de la partida: {matchId}</div>
}

export default LobbyPage
