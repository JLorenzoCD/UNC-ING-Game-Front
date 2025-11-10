import { BACKEND_ENDPOINTS } from "@/constants/backend";

import type { UUID } from "@/types/common";
import type { GameCard } from "@/types/card";
import type { GameSecret, SecretUpdateAction } from "@/types/secret";
import type { GamePlayer, Player } from "@/types/player";
import type {
  Match,
  MatchCreateInput,
  MatchWithPlayerCount,
} from "@/types/match";
import type { MatchSet, SetCreationData, SetUpdateData } from "@/types/set";
import type { MatchLog } from "@/types/log";

const DEFAULT_BASE_URL = "http://localhost:8000";

function getValidatedApiUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;

  // Si no está definida o es una string vacía, usar default
  if (!envUrl || typeof envUrl !== "string" || envUrl.length === 0) {
    return DEFAULT_BASE_URL;
  }

  // Validar que sea una URL válida
  try {
    new URL(envUrl);
    return envUrl;
  } catch {
    console.warn(
      `Invalid VITE_API_URL: "${envUrl}". Using default: ${DEFAULT_BASE_URL}`,
    );
    return DEFAULT_BASE_URL;
  }
}

export type HttpService = ReturnType<typeof createHttpService>;

export function createHttpService() {
  const baseUrl = getValidatedApiUrl();

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

  const getMatch = async (matchId: UUID): Promise<MatchWithPlayerCount> => {
    return request<MatchWithPlayerCount>(BACKEND_ENDPOINTS.GET_MATCH(matchId));
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

  const startMatch = async (matchId: UUID): Promise<{ status: string }> => {
    return request<{ status: string }>(BACKEND_ENDPOINTS.START_MATCH(matchId), {
      method: "POST",
    });
  };

  const cancelMatch = async (
    matchId: UUID,
    ownerId: UUID,
  ): Promise<{ status: string }> => {
    return request<{ status: string }>(
      BACKEND_ENDPOINTS.CANCEL_MATCH(matchId, ownerId),
      {
        method: "POST",
      },
    );
  };

  const quitMatch = async (
    playerId: UUID,
    matchId: UUID,
  ): Promise<{ status: string }> => {
    const options: RequestInit = { method: "PUT" };

    return request<{ status: string }>(
      BACKEND_ENDPOINTS.QUIT_MATCH(matchId, playerId),
      options,
    );
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

  const getMatchSets = async (matchId: UUID) => {
    return request<MatchSet[]>(BACKEND_ENDPOINTS.GET_MATCH_SETS(matchId));
  };

  const getMatchLogs = async (matchId: UUID): Promise<MatchLog[]> => {
    return request<MatchLog[]>(BACKEND_ENDPOINTS.GET_MATCH_LOGS(matchId));
  };

  const putTakeCards = async (
    matchId: UUID,
    playerId: UUID,
    cardIds: UUID[],
  ): Promise<void> => {
    const options: RequestInit = {
      method: "PUT",
      body: JSON.stringify({
        player_id: playerId,
        card_ids: cardIds,
      }),
    };

    return request(BACKEND_ENDPOINTS.TAKE_CARDS(matchId), options);
  };

  const putDiscardCards = async (
    matchId: UUID,
    playerId: UUID,
    cardIds: UUID[],
  ): Promise<void> => {
    const options: RequestInit = {
      method: "PUT",
      body: JSON.stringify({
        player_id: playerId,
        card_ids: cardIds,
      }),
    };

    return request(BACKEND_ENDPOINTS.DISCARD_CARDS(matchId), options);
  };

  const putPassTurn = async (matchId: UUID): Promise<void> => {
    return request(BACKEND_ENDPOINTS.PASS_TURN(matchId), { method: "PUT" });
  };

  const postEvent = async <T = unknown>(
    matchId: UUID,
    playerId: UUID,
    matchCardId: UUID,
    eventPayload: T,
  ) => {
    const baseUrl = BACKEND_ENDPOINTS.PLAY_EVENT(matchId);

    const params = new URLSearchParams();
    params.append("player_id", playerId);
    params.append("match_card_id", matchCardId);

    const urlWithParams = `${baseUrl}?${params.toString()}`;

    const options: RequestInit = {
      method: "POST",
      body: JSON.stringify(eventPayload),
    };

    return request(urlWithParams, options);
  };

  const createAndPlaySet = async (
    matchId: UUID,
    dataBody: SetCreationData,
  ): Promise<void> => {
    const options: RequestInit = {
      method: "POST",
      body: JSON.stringify(dataBody),
    };

    return request(BACKEND_ENDPOINTS.CREATE_AND_PLAY_SET(matchId), options);
  };

  const addDetectiveCardToSetAndPlay = async (
    matchId: UUID,
    setId: UUID,
    dataBody: SetUpdateData,
  ): Promise<void> => {
    const options: RequestInit = {
      method: "PUT",
      body: JSON.stringify(dataBody),
    };

    return request(
      BACKEND_ENDPOINTS.DOWN_CARD_AND_PLAY_SET(matchId, setId),
      options,
    );
  };

  const putSecret = async (
    matchId: UUID,
    secretId: UUID,
    targetPlayerId: UUID,
    action: SecretUpdateAction,
  ) => {
    const options: RequestInit = {
      method: "PUT",
      body: JSON.stringify({
        target_player_id: targetPlayerId,
        action,
      }),
    };

    return request(BACKEND_ENDPOINTS.PUT_SECRET(matchId, secretId), options);
  };

  const postPlayNotSoFast = async (
    matchId: UUID,
    playerId: UUID,
    cardId: UUID,
    eventId: UUID,
    nsfCount: number,
  ) => {
    const baseUrl = BACKEND_ENDPOINTS.PLAY_NOT_SO_FAST(matchId);

    const params = new URLSearchParams();
    params.append("player_id", playerId);
    params.append("match_card_id", cardId);
    params.append("event_id", eventId);
    params.append("nsf_count", nsfCount.toString());

    const urlWithParams = `${baseUrl}?${params.toString()}`;

    const options: RequestInit = {
      method: "POST",
      body: JSON.stringify({
        player_id: playerId,
        match_card_id: cardId,
        event_id: eventId,
        nsf_count: nsfCount,
      }),
    };
    return request(urlWithParams, options);
  };

  const postCardTrade = async (
    matchId: UUID,
    playerId: UUID,
    eventId: UUID,
    cardId: UUID,
  ) => {
    const baseUrl = BACKEND_ENDPOINTS.CARD_TRADE(matchId);

    const params = new URLSearchParams();
    params.append("player_id", playerId);
    params.append("event_id", eventId);

    const urlWithParams = `${baseUrl}?${params.toString()}`;

    const options: RequestInit = {
      method: "POST",
      body: JSON.stringify({
        target_card_id: cardId,
      }),
    };
    return request(urlWithParams, options);
  };

  return {
    request,
    createPlayer,
    createMatch,
    startMatch,
    cancelMatch,
    getMatches,
    getMatch,
    joinMatch,
    quitMatch,
    getMatchPlayers,
    getMatchCards,
    getMatchSecrets,
    getMatchSets,
    getMatchLogs,
    putTakeCards,
    putDiscardCards,
    putPassTurn,
    postEvent,
    putSecret,
    createAndPlaySet,
    addDetectiveCardToSetAndPlay,
    postPlayNotSoFast,
    postCardTrade,
  };
}
