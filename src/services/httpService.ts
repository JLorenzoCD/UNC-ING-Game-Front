import type { MatchListItem } from '@/containers/MatchesPage/types'

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

	const getMatches = async () => {
		return [
			{
				id: crypto.randomUUID(),
				name: 'Prueba 1',
				status: 'pending',
				min_players: 2,
				max_players: 6,
				owner_id: crypto.randomUUID(),
				current_player: 5,
				current_player_order: 0,
			},
			{
				id: crypto.randomUUID(),
				name: 'Prueba con nombre largo, pero muy muy largo',
				status: 'pending',
				min_players: 4,
				max_players: 6,
				owner_id: crypto.randomUUID(),
				current_player: 3,
				current_player_order: 0,
			},
			{
				id: crypto.randomUUID(),
				name: 'OPENTOWORK',
				status: 'pending',
				min_players: 7,
				max_players: 5,
				owner_id: crypto.randomUUID(),
				current_player: 4,
				current_player_order: 0,
			},
			{
				id: crypto.randomUUID(),
				name: 'Al pedo',
				status: 'pending',
				min_players: 3,
				max_players: 6,
				owner_id: crypto.randomUUID(),
				current_player: 4,
				current_player_order: 0,
			},
		] as MatchListItem[]
	}

	return {
		request,
		getMatches,
	}
}
