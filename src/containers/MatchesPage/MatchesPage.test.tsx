import '@testing-library/jest-dom'
import { act, render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import MatchesPage from './MatchesPage'

const mockGetMatches = vi.fn().mockResolvedValue([
	{
		id: '1',
		name: 'Prueba 1',
		status: 'pending',
		min_players: 2,
		max_players: 6,
		owner_id: crypto.randomUUID(),
		current_player: 5,
		current_player_order: 0,
	},
	{
		id: '2',
		name: 'Prueba 2',
		status: 'pending',
		min_players: 4,
		max_players: 6,
		owner_id: crypto.randomUUID(),
		current_player: 3,
		current_player_order: 0,
	},
])

const mockConnect = vi.fn()
const mockDisconnect = vi.fn()
const mockOn = vi.fn()
const mockOff = vi.fn()

// Mock de los servicios
vi.mock('@/contexts/HttpServiceContext', () => ({
	useHttpService: vi.fn(() => ({
		httpService: {
			getMatches: mockGetMatches,
		},
	})),
}))

vi.mock('@/contexts/WebSocketServiceContext', () => ({
	useWebSocketService: vi.fn(() => ({
		wsService: {
			connect: mockConnect,
			disconnect: mockDisconnect,
			on: mockOn,
			off: mockOff,
		},
		isConnected: false,
	})),
}))

vi.mock('@/components/Button', () => ({
	default: vi.fn(({ children }) => <button data-testid='mock-button'>{children}</button>),
}))

vi.mock('./components/ListMatches', () => ({
	default: vi.fn(({ children }) => <div>{children}</div>),
}))

vi.mock('./components/ListItemMatch', () => ({
	default: vi.fn(({ match }) => <div>{match.name}</div>),
}))

vi.mock('@/constants/frontendPaths', () => ({
	FRONTEND_PATHS: {
		MATCH_CREATE: '/match/create',
	},
}))

vi.mock('react-router', async (importOriginal) => {
	const mod = await importOriginal<typeof import('react-router')>()
	return {
		...mod,
		Link: vi.fn(({ to, children, ...props }) => (
			<a href={to} {...props} data-testid='mock-link'>
				{children}
			</a>
		)),
	}
})

describe('MatchesPage', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should render the page correctly', async () => {
		render(<MatchesPage />)

		// El botón de creación de partida se renderiza
		const createButton = screen.getByTestId('mock-button')
		expect(createButton).toBeInTheDocument()
		expect(createButton).toHaveTextContent('Create match')

		// Se realiza la petición para obtener las partidas
		expect(mockGetMatches).toHaveBeenCalledTimes(1)

		// Verificar que los elementos de la lista se renderizan
		await waitFor(() => {
			expect(screen.getByText('Prueba 1')).toBeInTheDocument()
			expect(screen.getByText('Prueba 2')).toBeInTheDocument()
		})
	})

	it('should call getMatches on mount', async () => {
		render(<MatchesPage />)

		await waitFor(() => {
			expect(mockGetMatches).toHaveBeenCalledTimes(1)
		})
	})

	it('should handle WebSocket connection and events', async () => {
		render(<MatchesPage />)

		// Verificar que se conecta al WebSocket
		await waitFor(() => {
			expect(mockConnect).toHaveBeenCalledTimes(1)
		})

		// Simular que se agrega una nueva partida por WebSocket
		const newMatch = {
			id: '3',
			name: 'New Match',
			status: 'pending',
			min_players: 4,
			max_players: 6,
			owner_id: crypto.randomUUID(),
			current_player: 3,
			current_player_order: 0,
		}
		// console.log(mockOn.mock.calls)
		mockOn.mock.calls[0][1](newMatch) // Llamamos al handler de 'matchAdd'

		await act(() => {
			expect(screen.getByText('New Match')).toBeInTheDocument()
		})

		// Simular que se elimina una partida por WebSocket llamando al handler de 'matchRemove'
		mockOn.mock.calls[1][1]('1')

		await act(() => {
			expect(screen.queryByText('Prueba 1')).not.toBeInTheDocument()
		})

		// Simular que se actualiza una partida por WebSocket llamando al handler de 'matchUpdate'
		const updatedMatch = {
			...newMatch,
			name: 'Update Match',
			status: 'is_pending',
		}
		mockOn.mock.calls[2][1](updatedMatch)

		await act(() => {
			expect(screen.getByText(updatedMatch.name)).toBeInTheDocument()
		})
	})

	it('should handle WebSocket disconnection on unmount', () => {
		const { unmount } = render(<MatchesPage />)

		// Verificar que al desmontar se desconecte el WebSocket
		unmount()
		expect(mockDisconnect).toHaveBeenCalledTimes(1)
	})
})
