import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import type { UUID } from '@/types/common'
import type { Match } from '@/types/match'

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
	const mockMatch: Match = {
		id: crypto.randomUUID() as UUID,
		name: 'Test 1',
		min_players: 2,
		max_players: 5,
		status: 'WAITING',
		owner_id: crypto.randomUUID() as UUID,
		current_player_order: 0,
	}

	const longNameMatch: Match = {
		id: crypto.randomUUID() as UUID,
		name: 'This is a match name that is way too long to be fully visible',
		min_players: 4,
		max_players: 6,
		status: 'WAITING',
		owner_id: crypto.randomUUID() as UUID,
		current_player_order: 0,
	}

	const mockInvalidMatch: Match = {
		id: crypto.randomUUID() as UUID,
		name: 'Invalid Match',
		min_players: 1,
		max_players: 10,
		status: 'IN_PROGRESS',
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

	// ! La acción de unirse a una partida se realiza en otro ticket
})
