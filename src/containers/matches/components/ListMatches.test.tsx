import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { MatchListItem } from '../types'

import ListMatches from './ListMatches'

// Mock componente loading
vi.mock('@/components/Loading', () => ({
	default: vi.fn(() => <p data-testid='mock-loading'>Loading</p>),
}))

// Mock componente ListItemMatch
const ListItemMatch = ({ match }: { match: MatchListItem }) => {
	//* Se busca representar validaciones básicas, no todas (para no llamar la fun de validación)
	if (match.status != 'WAITING' || match.min_players > match.max_players) return null

	return (
		<div data-testid='mock-item-match'>
			<p data-testid='mock-match-name'>{match.name}</p>
			<p data-testid='mock-match-min-players'>{match.min_players}</p>
			<p data-testid='mock-match-max-players'>{match.max_players}</p>
			<p data-testid='mock-match-current-players'>{match.current_player}</p>
		</div>
	)
}
vi.mock('./ListItemMatch', () => ({
	default: vi.fn(ListItemMatch),
}))

// Datos de prueba
const testValidMatches: MatchListItem[] = [
	{
		id: crypto.randomUUID(),
		name: 'Prueba 1',
		status: 'WAITING',
		min_players: 2,
		max_players: 6,
		owner_id: crypto.randomUUID(),
		current_player: 5,
		current_player_order: 0,
	},
	{
		id: crypto.randomUUID(),
		name: 'Prueba 2',
		status: 'WAITING',
		min_players: 4,
		max_players: 6,
		owner_id: crypto.randomUUID(),
		current_player: 3,
		current_player_order: 0,
	},
]

const testInValidMatches: MatchListItem[] = [
	{
		id: crypto.randomUUID(),
		name: 'Invalid match item 1',
		status: 'IN_PROGRESS',
		min_players: 4,
		max_players: 10,
		owner_id: crypto.randomUUID(),
		current_player: 3,
		current_player_order: 0,
	},
	{
		id: crypto.randomUUID(),
		name: 'Invalid match item 2',
		status: 'WAITING',
		min_players: 100,
		max_players: 10,
		owner_id: crypto.randomUUID(),
		current_player: 3,
		current_player_order: 0,
	},
]

describe('ListMatches', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.resetAllMocks()
	})

	it('should show the loading component when loading is true', () => {
		render(
			<ListMatches isLoading={true}>
				{[].map((m) => (
					<ListItemMatch match={m} />
				))}
			</ListMatches>
		)

		expect(screen.getByTestId('mock-loading')).toBeInTheDocument()
		expect(screen.queryByText("There are no games available, why don't you create one?")).not.toBeInTheDocument()
		expect(screen.queryByTestId('mock-item-match')).not.toBeInTheDocument()
	})

	it('should show the "no games available" message when the matches list is empty and not loading', () => {
		render(
			<ListMatches isLoading={false}>
				{[].map((m) => (
					<ListItemMatch match={m} />
				))}
			</ListMatches>
		)

		expect(screen.getByText("There are no games available, why don't you create one?")).toBeInTheDocument()
		expect(screen.queryByTestId('mock-loading')).not.toBeInTheDocument()
		expect(screen.queryByTestId('mock-item-match')).not.toBeInTheDocument()
	})

	it('should render the correct ListItemMatch components when a list of matches is provided', () => {
		render(
			<ListMatches isLoading={false}>
				{[...testValidMatches, ...testInValidMatches].map((m) => (
					<ListItemMatch match={m} />
				))}
			</ListMatches>
		)

		// Se espera que se muestren 2 de los 3 mocks, ya que uno es inválido
		const renderedMatches = screen.getAllByTestId('mock-item-match')
		expect(renderedMatches.length).toBe(2)

		// Los mocks correctos están en el documento
		testValidMatches.forEach((testValidMatch) => {
			expect(screen.getByText(testValidMatch.name)).toBeInTheDocument()
		})

		// Los mocks inválido no están en el documento
		testInValidMatches.forEach((testInValidMatch) => {
			expect(screen.queryByText(testInValidMatch.name)).not.toBeInTheDocument()
		})

		// No esta el componente loading ni el mensaje de que no hay partidas
		expect(screen.queryByTestId('mock-loading')).not.toBeInTheDocument()
		expect(screen.queryByText("There are no games available, why don't you create one?")).not.toBeInTheDocument()
	})
})
