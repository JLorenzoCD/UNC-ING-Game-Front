import { useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router'

import { FRONTEND_PATHS } from '@/constants/frontendPaths'
import { ERROR_MESSAGES, RANGE_PLAYERS } from './constants'

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

	const createHandleSubmit =
		(handleCreateMatch: (matchToCreate: MatchToCreate) => Promise<Match>) =>
		async (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault()

			const min_players = parseInt(formData.min_players)
			const max_players = parseInt(formData.max_players)

			const isNameEmpty = !formData.name.trim()
			const isMinPlayersNaN = isNaN(min_players)
			const isMaxPlayersNaN = isNaN(max_players)
			const isMinPlayersOutRange = min_players < RANGE_PLAYERS.MIN || min_players > RANGE_PLAYERS.MAX
			const isMaxPlayersOutRange = max_players < RANGE_PLAYERS.MIN || max_players > RANGE_PLAYERS.MAX
			const isMaxLessMin = max_players < min_players
			const isError = isNameEmpty || isMinPlayersOutRange || isMaxPlayersOutRange || isMaxLessMin

			if (isNameEmpty) {
				setFormError((prevErr) => ({ ...prevErr, name: ERROR_MESSAGES.NAME_EMPTY }))
			}
			if (isMinPlayersNaN) {
				setFormError((prevErr) => ({
					...prevErr,
					min_players: ERROR_MESSAGES.MIN_PLAYERS_EMPTY,
				}))
			}
			if (isMaxPlayersNaN) {
				setFormError((prevErr) => ({
					...prevErr,
					min_players: ERROR_MESSAGES.MAX_PLAYERS_EMPTY,
				}))
			}
			if (isMinPlayersOutRange) {
				setFormError((prevErr) => ({
					...prevErr,
					min_players: ERROR_MESSAGES.MIN_PLAYERS_OUT_RANGE,
				}))
			}
			if (isMaxPlayersOutRange) {
				setFormError((prevErr) => ({
					...prevErr,
					max_players: ERROR_MESSAGES.MAX_PLAYERS_OUT_RANGE,
				}))
			}
			if (isMaxLessMin) {
				setFormError((prevErr) => ({
					...prevErr,
					min_players: ERROR_MESSAGES.MIN_PLAYERS_GREATER_MAX_PLAYERS,
					max_players: ERROR_MESSAGES.MAX_PLAYERS_LESS_MIN_PLAYERS,
				}))
			}

			if (isError) return

			try {
				console.log('Se envía:', { formData })
				setLoading(true)
				const res = await handleCreateMatch({
					name: formData.name.trim(),
					min_players,
					max_players,
				})

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
		const name = e.target.name

		const min_players = parseInt(formData.min_players)
		const max_players = parseInt(formData.max_players)
		const value = parseInt(e.target.value)

		switch (name) {
			case 'name':
				setFormData((prev) => ({ ...prev, name: e.target.value }))

				// Validaciones y estableciendo error en caso e ser necesario
				if (!e.target.value.trim()) {
					setFormError((prevErr) => ({ ...prevErr, [name]: ERROR_MESSAGES.NAME_EMPTY }))
				} else {
					setFormError((prevErr) => ({ ...prevErr, [name]: '' }))
				}
				break

			case 'min_players':
				setFormData((prev) => ({ ...prev, [name]: e.target.value }))

				// Validaciones y estableciendo error en caso e ser necesario
				if (value < RANGE_PLAYERS.MIN || value > RANGE_PLAYERS.MAX) {
					setFormError((prevErr) => ({
						...prevErr,
						[name]: ERROR_MESSAGES.MIN_PLAYERS_OUT_RANGE,
					}))
				} else if (max_players < value && formError.max_players != ERROR_MESSAGES.MAX_PLAYERS_OUT_RANGE) {
					setFormError((prevErr) => ({
						...prevErr,
						[name]: ERROR_MESSAGES.MIN_PLAYERS_GREATER_MAX_PLAYERS,
					}))
				} else if (value <= max_players && formError.max_players != ERROR_MESSAGES.MAX_PLAYERS_OUT_RANGE) {
					setFormError((prevErr) => ({
						...prevErr,
						max_players: '',
						[name]: '',
					}))
				} else {
					setFormError((prevErr) => ({
						...prevErr,
						[name]: '',
					}))
				}
				break
			case 'max_players':
				setFormData((prev) => ({ ...prev, [name]: e.target.value }))

				// Validaciones y estableciendo error en caso e ser necesario
				if (value < RANGE_PLAYERS.MIN || value > RANGE_PLAYERS.MAX) {
					setFormError((prevErr) => ({
						...prevErr,
						[name]: ERROR_MESSAGES.MAX_PLAYERS_OUT_RANGE,
					}))
				} else if (value < min_players && formError.min_players != ERROR_MESSAGES.MIN_PLAYERS_OUT_RANGE) {
					setFormError((prevErr) => ({
						...prevErr,
						[name]: ERROR_MESSAGES.MAX_PLAYERS_LESS_MIN_PLAYERS,
					}))
				} else if (value >= min_players && formError.min_players != ERROR_MESSAGES.MIN_PLAYERS_OUT_RANGE) {
					setFormError((prevErr) => ({
						...prevErr,
						min_players: '',
						[name]: '',
					}))
				} else {
					setFormError((prevErr) => ({
						...prevErr,
						[name]: '',
					}))
				}
				break

			default:
				console.warn('The event name attribute is unknown.')
				break
		}
	}

	const haveError = Object.values(formError).join('')

	return { formData, handleChange, formError, haveError, createHandleSubmit, loading }
}
