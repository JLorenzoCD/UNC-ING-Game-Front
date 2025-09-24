import { useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router'
import { usePlayer } from '@/contexts/usePlayer'

import { FRONTEND_PATHS } from '@/constants/frontendPaths'
import { RANGE_PLAYERS } from './constants'

import { validateForm } from './utils'

import type { Match } from '@/types/match'
import type { MatchForm, MatchFormError, MatchToCreate } from './type'

export default function useFormCreateMatch() {
	const [formData, setFormData] = useState<MatchForm>({
		name: '',
		min_players: RANGE_PLAYERS.MIN.toString(),
		max_players: RANGE_PLAYERS.MAX.toString(),
	})
	const [formError, setFormError] = useState<MatchFormError>({
		name: '',
		min_players: '',
		max_players: '',
	})
	const [loading, setLoading] = useState(false)

	const navigate = useNavigate()
	const playerData = usePlayer()

	const createHandleSubmit =
		(handleCreateMatch: (matchToCreate: MatchToCreate) => Promise<Match>) =>
		async (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault()

			const errors = validateForm(formData)
			setFormError(errors)

			const hasErrors = Object.values(errors).some((error) => error !== '')

			if (hasErrors) {
				console.warn('Formulario tiene errores de validación. Abortando el envío.')
				return
			}

			const min_players = parseInt(formData.min_players)
			const max_players = parseInt(formData.max_players)

			try {
				const matchToCreate = {
					owner_id: playerData.playerId,
					name: formData.name.trim(),
					min_players,
					max_players,
				}
				console.log('Se envía:', { matchToCreate })

				setLoading(true)
				const res = await handleCreateMatch(matchToCreate)

				console.log('Se recibe: ', { res })
				navigate(`${FRONTEND_PATHS.MATCH_LOBBY}/${res.id}`)
			} catch (err) {
				console.error(err)
				alert('The match could not be created.')
			} finally {
				setLoading(false)
			}
		}

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target

		setFormData((prev) => ({ ...prev, [name]: value }))

		// Valida el campo modificado y actualiza los errores de forma unificada
		setFormError(() => {
			const updatedFormData = { ...formData, [name]: value }
			const newErrors = validateForm(updatedFormData)
			return newErrors
		})
	}

	const haveError = Object.values(formError).some((error) => error !== '')

	return { formData, handleChange, formError, haveError, createHandleSubmit, loading }
}
