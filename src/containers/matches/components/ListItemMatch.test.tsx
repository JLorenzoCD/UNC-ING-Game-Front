import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import type { UUID } from '@/types/common'
import type { MatchListItem } from '../types'

import ListItemMatch from './ListItemMatch'

// Mock de isValidMatch
const isValidMatch = vi.fn()
vi.mock('../utils', () => ({
	isValidMatch,
}))

// Mock de useNavigate para evitar errores de contexto
const mockNavigate = vi.fn()
vi.mock('react-router', () => ({
	useNavigate: () => mockNavigate,
}))

describe('ListItemMatch', () => {
	const mockMatch: MatchListItem = {
		id: crypto.randomUUID() as UUID,
		name: 'Test 1',
		min_players: 2,
		max_players: 5,
		status: 'pending',
		current_player: 3,
		owner_id: crypto.randomUUID() as UUID,
		current_player_order: 0,
	}

	const longNameMatch: MatchListItem = {
		id: crypto.randomUUID() as UUID,
		name: 'This is a match name that is way too long to be fully visible',
		min_players: 4,
		max_players: 6,
		current_player: 5,
		status: 'pending',
		owner_id: crypto.randomUUID() as UUID,
		current_player_order: 0,
	}

	const mockInvalidMatch: MatchListItem = {
		id: crypto.randomUUID() as UUID,
		name: 'Invalid Match',
		min_players: 1,
		max_players: 10,
		status: 'in_progress',
		current_player: 100,
		owner_id: crypto.randomUUID() as UUID,
		current_player_order: 0,
	}

	it('should render the match correctly', () => {
		// Match valido
		isValidMatch.mockReturnValue(true)

		render(<ListItemMatch match={mockMatch} />)

		// Esta el nombre de la partida
		expect(screen.getByText(mockMatch.name)).toBeInTheDocument()

		// Comprobar que los jugadores se muestran correctamente
		expect(screen.getByText(`${mockMatch.min_players}/${mockMatch.max_players}`)).toBeInTheDocument()
		expect(screen.getByText(`🟢 ${mockMatch.current_player}`)).toBeInTheDocument()

		// Comprobar que el botón Join está presente
		const joinButton = screen.getByRole('button', { name: /join/i })
		expect(joinButton).toBeInTheDocument()
		expect(joinButton).not.toBeDisabled()
		expect(joinButton).toHaveTextContent('Join')
	})

	it('should not render anything if the match is invalid', () => {
		// Match invalido
		isValidMatch.mockReturnValue(false)

		const { container } = render(<ListItemMatch match={mockInvalidMatch} />)
		expect(container.firstChild).toBeNull()
	})

	it('should truncate name if it exceeds 35 characters', () => {
		// Match valido
		isValidMatch.mockReturnValue(true)

		render(<ListItemMatch match={longNameMatch} />)

		// Verificamos que el nombre está truncado
		expect(screen.getByText(longNameMatch.name.substring(0, 32) + '...')).toBeInTheDocument()
	})

	it('should render the correct player status (🟢 or 🟡)', () => {
		// Matches valido
		isValidMatch.mockReturnValue(true)

		const matchWithEnoughPlayers: MatchListItem = {
			id: crypto.randomUUID() as UUID,
			name: 'Full Match',
			min_players: 2,
			max_players: 5,
			current_player: 3,
			status: 'pending',
			owner_id: crypto.randomUUID() as UUID,
			current_player_order: 0,
		}

		render(<ListItemMatch match={matchWithEnoughPlayers} />)
		expect(screen.getByText('🟢 3')).toBeInTheDocument()

		const matchWithInsufficientPlayers: MatchListItem = {
			id: crypto.randomUUID() as UUID,
			name: 'Not enough players',
			min_players: 5,
			max_players: 5,
			current_player: 1,
			status: 'pending',
			owner_id: crypto.randomUUID() as UUID,
			current_player_order: 0,
		}

		render(<ListItemMatch match={matchWithInsufficientPlayers} />)
		expect(screen.getByText('🟡 1')).toBeInTheDocument()
	})

	// ! La acción de unirse a una partida se realiza en otro ticket
})
