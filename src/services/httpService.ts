import { BACKEND_ENDPOINTS } from "@/constants/backend";

import type { UUID } from "@/types/common";
import type { GameCard } from "@/types/card";
import type { GameSecret } from "@/types/secret";
import type { GamePlayer, Player } from "@/types/player";
import type {
  Match,
  MatchCreateInput,
  MatchWithPlayerCount,
} from "@/types/match";

const DEFAULT_BASE_URL = "http://localhost:8000";

function isApiUrlDefined(): boolean {
  return (
    typeof import.meta.env.VITE_API_URL === "string" &&
    import.meta.env.VITE_API_URL.length > 0
  );
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
  const request = async <T = unknown>(
    route: string,
    options?: RequestInit,
  ): Promise<T> => {
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
  };

  const createPlayer = async (player: Omit<Player, "id">): Promise<Player> => {
    const options: RequestInit = {
      method: "POST",
      body: JSON.stringify(player),
    };

    return request<Player>(BACKEND_ENDPOINTS.CREATE_PLAYER, options);
  };

  const createMatch = async (matchInput: MatchCreateInput): Promise<Match> => {
    const options = { method: "POST", body: JSON.stringify(matchInput) };

    return request<Match>(BACKEND_ENDPOINTS.CREATE_MATCHES, options);
  };

  const getMatches = async (): Promise<MatchWithPlayerCount[]> => {
    return request<MatchWithPlayerCount[]>(BACKEND_ENDPOINTS.GET_MATCHES);
  };

  const joinMatch = async (
    playerId: UUID,
    matchId: UUID,
  ): Promise<{ match_id: UUID }> => {
    const options: RequestInit = { method: "POST" };

    return request<{ match_id: UUID }>(
      BACKEND_ENDPOINTS.JOIN_MATCH(matchId, playerId),
      options,
    );
  };

  const getMatch = async (matchId: UUID): Promise<MatchWithPlayerCount> => {
    return request<MatchWithPlayerCount>(BACKEND_ENDPOINTS.GET_MATCH(matchId));
  };

  const startMatch = async (matchId: UUID): Promise<{ status: string }> => {
    return request<{ status: string }>(BACKEND_ENDPOINTS.START_MATCH(matchId), {
      method: "POST",
    });
  };

  const getMatchPlayers = async (matchId: UUID): Promise<GamePlayer[]> => {
    return request<GamePlayer[]>(BACKEND_ENDPOINTS.GET_MATCH_PLAYERS(matchId));
  };

  const getMatchCards = async (matchId: UUID): Promise<GameCard[]> => {
    return request<GameCard[]>(BACKEND_ENDPOINTS.GET_MATCH_CARDS(matchId));
  };

  const getMatchSecrets = async (matchId: UUID): Promise<GameSecret[]> => {
    return request<GameSecret[]>(BACKEND_ENDPOINTS.GET_MATCH_SECRETS(matchId));
  };

  const putMatchCards = async (
    matchId: UUID,
    playerId: UUID,
    takenCardIds: string[],
    discardedCardIds: string[],
  ): Promise<void> => {
    const options: RequestInit = {
      method: "PUT",
      body: JSON.stringify({
        player_id: playerId,
        taken_card_ids: takenCardIds,
        discarded_card_ids: discardedCardIds,
      }),
    };

    return request(BACKEND_ENDPOINTS.UPDATE_CARDS(matchId), options);
  };

  const putPassTurn = async (matchId: UUID): Promise<void> => {
    return request(BACKEND_ENDPOINTS.PASS_TURN(matchId), { method: "PUT" });
  };

  return {
    request,
    createPlayer,
    createMatch,
    startMatch,
    getMatches,
    joinMatch,
    getMatch,
    getMatchPlayers,
    getMatchCards,
    getMatchSecrets,
    putMatchCards,
    putPassTurn,
  };
}
