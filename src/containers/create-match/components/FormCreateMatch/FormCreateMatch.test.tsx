import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { ERROR_MESSAGES, RANGE_PLAYERS } from './constants'

import type { FormEvent } from 'react'
import type { UUID } from '@/types/common'
import type { Match, MatchCreateInput } from '@/types/match'

import FormCreateMatch from './index'

// Mock de los componentes dependientes AlertErrorList, Input (se asume que
// están bien y con tests)
vi.mock('../AlertErrorList', () => ({
	default: vi.fn(
		({
			title,
			errorList,
		}: {
			title: string
			errorList: {
				key: string | number
				error: string
			}[]
		}) => (
			<div data-testid='mock-alert-error-list'>
				<h2 data-testid='mock-alert-title'>{title}</h2>
				<ul>
					{errorList.map(({ key, error }) => (
						<li key={key} data-testid='mock-error-item'>
							{error}
						</li>
					))}
				</ul>
			</div>
		)
	),
}))

vi.mock('@/components/Input', () => ({
	default: vi.fn((props) => <input {...props} data-testid={`input-${props.name}`} />),
}))

// Mock del hook useFormCreateMatch (se asume que esta bien y con tests)
const mockUseFormCreateMatch = {
	formData: {
		name: 'Test Match',
		min_players: RANGE_PLAYERS.MIN.toString(),
		max_players: RANGE_PLAYERS.MAX.toString(),
	},
	formError: { name: '', min_players: '', max_players: '' },
	haveError: false,
	loading: false,
	handleChange: vi.fn(),
	createHandleSubmit: vi.fn(() => vi.fn((e) => e.preventDefault())),
}
vi.mock('./useFormCreateMatch', () => ({
	default: vi.fn(() => mockUseFormCreateMatch),
}))

// Mock para evitar problemas de contexto por el Link
vi.mock('react-router', async (importOriginal) => {
	const mod = await importOriginal<typeof import('react-router')>()
	return {
		...mod,
		Link: vi.fn(({ to, children, ...props }) => (
			<a href={to} {...props}>
				{children}
			</a>
		)),
	}
})

describe('FormCreateMatch', () => {
	const handleCreateMatchMock = vi.fn()

	beforeEach(() => {
		vi.clearAllMocks()
		vi.resetAllMocks()
	})

	it('should render the form with initial values and no errors', () => {
		render(<FormCreateMatch handleCreateMatch={handleCreateMatchMock} />)

		const formTitle = 'Create match'
		const h1Title = screen.getByRole('heading', { level: 1 })
		expect(h1Title).toBeInTheDocument()
		expect(h1Title).toHaveTextContent(formTitle)

		// Inputs con sus valores de inicio
		const nameInput = screen.getByTestId('input-name') as HTMLInputElement
		expect(nameInput).toBeInTheDocument()
		expect(nameInput.value).toBe(mockUseFormCreateMatch.formData.name)

		const minPlayersInput = screen.getByTestId('input-min_players') as HTMLInputElement
		expect(minPlayersInput).toBeInTheDocument()
		expect(minPlayersInput.value).toBe(mockUseFormCreateMatch.formData.min_players)

		const maxPlayersInput = screen.getByTestId('input-max_players') as HTMLInputElement
		expect(maxPlayersInput).toBeInTheDocument()
		expect(maxPlayersInput.value).toBe(mockUseFormCreateMatch.formData.max_players)

		// Como son valores validos, no debería de estar el componente AlertErrorList
		expect(screen.queryByTestId('mock-alert-error-list')).not.toBeInTheDocument()

		// El botón de crear se debe de mostrar el texto normal (no de carga) y estar habilitado
		const submitButton = screen.getByRole('button', { name: /create/i })
		expect(submitButton).toBeInTheDocument()
		expect(submitButton).not.toBeDisabled()
		expect(submitButton).toHaveTextContent('Create')

		// El botón de cancelar debe de estar habilitado
		const cancelButton = screen.getByRole('button', { name: /cancel/i })
		expect(cancelButton).toBeInTheDocument()
		expect(cancelButton).not.toBeDisabled()
		expect(cancelButton).toHaveTextContent('Cancel')
	})

	it('should call handleCreateMatch on form submission with valid data', async () => {
		// Mockea una respuesta exitosa del hook y la función de prop
		mockUseFormCreateMatch.createHandleSubmit = vi.fn(
			(callback: (matchToCreate: MatchCreateInput) => Promise<Match>) => (e: FormEvent<HTMLFormElement>) => {
				e.preventDefault()
				callback({
					owner_id: 'mock-uuid-owner-123' as UUID,
					name: mockUseFormCreateMatch.formData.name,
					min_players: parseInt(mockUseFormCreateMatch.formData.min_players),
					max_players: parseInt(mockUseFormCreateMatch.formData.max_players),
				})
			}
		)

		const newMatch = {
			id: 'mock-uuid-123',
			name: mockUseFormCreateMatch.formData.name,
			min_players: parseInt(mockUseFormCreateMatch.formData.min_players),
			max_players: parseInt(mockUseFormCreateMatch.formData.max_players),
			status: 'WAITING',
			owner_id: 'mock-uuid-owner-123',
			current_player_order: 0,
		}
		handleCreateMatchMock.mockResolvedValueOnce(newMatch)

		render(<FormCreateMatch handleCreateMatch={handleCreateMatchMock} />)

		// Simula el envío del formulario
		const form = screen.getByRole('form')
		fireEvent.submit(form)

		await waitFor(() => {
			expect(handleCreateMatchMock).toHaveBeenCalledWith({
				owner_id: 'mock-uuid-owner-123',
				name: newMatch.name,
				min_players: newMatch.min_players,
				max_players: newMatch.max_players,
			})
		})
	})

	it('should display validation errors for empty name field', async () => {
		// Mock que simula un error por nombre vació
		mockUseFormCreateMatch.haveError = true
		mockUseFormCreateMatch.formError = {
			name: ERROR_MESSAGES.NAME_EMPTY,
			min_players: '',
			max_players: '',
		}

		render(<FormCreateMatch handleCreateMatch={handleCreateMatchMock} />)

		// Se verifica que muestre el componente AlertErrorList cuando hay
		// error
		const errorAlert = screen.getByTestId('mock-alert-error-list')
		expect(errorAlert).toBeInTheDocument()

		// Le pasa el titulo al componente AlertErrorList
		expect(screen.getByTestId('mock-alert-title')).toHaveTextContent(
			'There are errors in the form, please note the following:'
		)

		// Le pasa el error al componente AlertErrorList
		expect(screen.getByText(ERROR_MESSAGES.NAME_EMPTY)).toBeInTheDocument()

		// El botón debería de estar deshabilitado
		const submitButton = screen.getByRole('button', { name: /create/i })
		expect(submitButton).toBeDisabled()
	})

	it('should display a loading state on form submission', async () => {
		mockUseFormCreateMatch.loading = true

		render(<FormCreateMatch handleCreateMatch={handleCreateMatchMock} />)

		const submitButton = screen.getByRole('button', { name: /loading/i })
		expect(submitButton).toBeInTheDocument()
		expect(submitButton).toBeDisabled()
	})

	it('should show an error when min_players is greater than max_players on submission', async () => {
		// Mock que simula un error tener el min_players > max_players
		mockUseFormCreateMatch.haveError = true
		mockUseFormCreateMatch.formError = {
			name: '',
			min_players: ERROR_MESSAGES.MIN_PLAYERS_GREATER_MAX_PLAYERS,
			max_players: ERROR_MESSAGES.MAX_PLAYERS_LESS_MIN_PLAYERS,
		}

		render(<FormCreateMatch handleCreateMatch={handleCreateMatchMock} />)

		// Se muestra el componente AlertErrorList
		const errorAlert = screen.getByTestId('mock-alert-error-list')
		expect(errorAlert).toBeInTheDocument()

		// Se verifica que se pasan ambos errores
		expect(screen.getByText(ERROR_MESSAGES.MIN_PLAYERS_GREATER_MAX_PLAYERS)).toBeInTheDocument()
		expect(screen.getByText(ERROR_MESSAGES.MAX_PLAYERS_LESS_MIN_PLAYERS)).toBeInTheDocument()
	})
})
