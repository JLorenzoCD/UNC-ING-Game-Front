import type { Match } from "@/types/match";
import type { GameCard } from "@/types/card";
import type { GameSecret } from "@/types/secret";
import type { GamePlayer, Player } from "@/types/player";

// TODO: cambiar este import a "@/types/..."
import type { MatchToCreate } from "@/containers/create-match/components/FormCreateMatch/type";

const DEFAULT_BASE_URL = "http://localhost:8000";

function isApiUrlDefined(): boolean {
  return typeof import.meta.env.VITE_API_URL === "string"
    && import.meta.env.VITE_API_URL.length > 0;
}

export type HttpService = ReturnType<typeof createHttpService>;

export function createHttpService() {
  const baseUrl = isApiUrlDefined()
    ? import.meta.env.VITE_API_URL
    : DEFAULT_BASE_URL;

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
  const request = async<T = unknown>(route: string, options?: RequestInit): Promise<T> => {
    const url = baseUrl.concat(route);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options?.headers || {}),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed with error:", error);

      throw error;
    }
  }

  const createPlayer = async (player: Omit<Player, "id">): Promise<Player> => {
    return request<Player>("/players", {
      method: "POST",
      body: JSON.stringify(player),
    });
  }

  const createMatch = async (matchToCreate: MatchToCreate) => {
    const options = { method: 'POST', body: JSON.stringify(matchToCreate) }
    return request<Match>('/matches', options)
  }

  const getMatch = async (matchId: string): Promise<Match> => {
    return request<Match>(`/matches/${matchId}`)
  }

  const getMatchPlayers = async (matchId: string): Promise<GamePlayer[]> => {
    return request<GamePlayer[]>(`/matches/${matchId}/players`)
  }

  const getMatchCards = async (matchId: string): Promise<GameCard[]> => {
    return request<GameCard[]>(`/matches/${matchId}/cards`)
  }

  const getMatchSecrets = async (matchId: string): Promise<GameSecret[]> => {
    return request<GameSecret[]>(`/matches/${matchId}/secrets`)
  }

  return {
    request,
    createPlayer,
    createMatch,
    getMatch,
    getMatchPlayers,
    getMatchCards,
    getMatchSecrets,
  }
}