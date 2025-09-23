import type { Match, MatchStatus } from '@/types/match'
import type { UUID } from '@/types/common'
import type { MatchToCreate } from '@/containers/CreateMatchPage/type'

const DEFAULT_BASE_URL = 'http://localhost:8000'

export function createHttpService() {
	const baseUrl = String(import.meta.env.VITE_API_URL) || DEFAULT_BASE_URL

	/**
	 * Realiza una petición HTTP a una ruta específica de la API con las opciones proporcionadas.
	 * @param route La ruta de la API a la que se realizará la petición.
	 * @param options Opciones de configuración para la petición HTTP.
	 * @returns Una promesa que resuelve con la respuesta de la API en formato JSON.
	 * @throws Un error si la petición falla o si la respuesta no es exitosa.
	 * @template T El tipo de datos esperado en la respuesta.
	 * @example
	 * const data = await httpService.request<MyDataType>("/my-endpoint", { method: "GET" });
	 * console.log(data); // `data` es de tipo `MyDataType`
	 */
	const request = async <T = unknown>(route: string, options?: RequestInit): Promise<T> => {
		const url = baseUrl.concat(route)

		try {
			const response = await fetch(url, {
				...options,
				headers: {
					'Content-Type': 'application/json',
					...(options?.headers || {}),
				},
			})

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			return await response.json()
		} catch (error) {
			console.error('API request failed with error:', error)

			throw error
		}
	}

	const createMatch = async (matchToCreate: MatchToCreate): Promise<Match> => {
		const id = 'a1b2c3d4-e5f6-7890-1234-567890abcdef' as UUID
		const owner_id = 'f6e5d4c3-b2a1-0987-6543-210fedcba987' as UUID
		const status = 'in_progress' as MatchStatus

		return {
			id,
			name: matchToCreate.name,
			status,
			min_players: matchToCreate.min_players,
			max_players: matchToCreate.max_players,
			owner_id,
			current_player_order: null,
		}
	}

	return {
		request,
		createMatch,
	}
}
