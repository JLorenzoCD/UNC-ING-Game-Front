import type { WebSocketEventMap, WebSocketEventCallback } from "@/types/ws";

const MAX_RECONNECT_ATTEMPTS = 5;
const MAX_RECONNECT_DELAY = 30000; // 30 segundos

export type WSService = ReturnType<typeof createWsService>;

const DEFAULT_WS_URL = "ws://localhost:8000/ws";

function getValidatedWsUrl(): string {
  const envUrl = import.meta.env.VITE_WS_URL;

  // Si no está definida o es una string vacía, usar default
  if (!envUrl || typeof envUrl !== "string" || envUrl.length === 0) {
    return DEFAULT_WS_URL;
  }

  // Validar que sea una URL válida con protocolo ws:// o wss://
  try {
    const url = new URL(envUrl);
    if (url.protocol !== "ws:" && url.protocol !== "wss:") {
      throw new Error("WebSocket URL must use ws:// or wss:// protocol");
    }
    return envUrl;
  } catch (error) {
    console.warn(
      `Invalid VITE_WS_URL: "${envUrl}". Using default: ${DEFAULT_WS_URL}`,
      error,
    );
    return DEFAULT_WS_URL;
  }
}

function formatWsUrl(baseUrl: string, playerId: string | null): string {
  const url = new URL(baseUrl);

  if (playerId) {
    url.searchParams.append("player_id", playerId);
  }
  return url.toString();
}

export function createWsService(playerId: string | null = null) {
  let websocket: WebSocket | null = null;
  let isConnected = false;
  let reconnectTimeout: number | null = null;
  let reconnectAttempts = 0;

  const baseUrl = getValidatedWsUrl();
  const wsUrl = formatWsUrl(baseUrl, playerId);

  const listeners = new Map<
    keyof WebSocketEventMap,
    Array<WebSocketEventCallback<any>>
  >();

  const connect = () => {
    try {
      websocket = new WebSocket(wsUrl);

      // Cuando se abre el WebSocket, emitimos la apertura de la conexión
      // y reseteamos los intentos de reconexión.
      websocket.onopen = () => {
        isConnected = true;
        reconnectAttempts = 0;

        emit("connection", true);
      };

      // Cuando se recibe un mensaje, intentamos parsearlo como JSON
      // y emitimos el evento correspondiente.
      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          emit(data.event, data.payload);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      // Cuando se cierra el WebSocket, intentamos reconectarnos
      // si no hemos superado el número máximo de intentos.
      // De hacerlo, simplemente emitimos un evento de error.
      websocket.onclose = () => {
        isConnected = false;
        emit("connection", false);

        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          // Cada vez que se intenta reconectar, se duplica el tiempo de espera hasta un máximo de 30 segundos.
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts),
            MAX_RECONNECT_DELAY,
          );

          console.log(
            `WebSocket disconnected, reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`,
          );

          reconnectTimeout = window.setTimeout(() => {
            reconnectAttempts++;
            connect();
          }, delay);
        } else {
          console.error("Max reconnection attempts reached");

          emit("error", { type: "max_reconnect_attempts" });
        }
      };

      // En caso de error, emitimos un evento de error
      // y marcamos la conexión como cerrada.
      websocket.onerror = (error) => {
        isConnected = false;
        emit("connection", false);

        console.error("WebSocket error:", error);
      };
    } catch (error) {
      isConnected = false;

      console.error("WebSocket connection failed:", error);
    }
  };

  const emit = <K extends keyof WebSocketEventMap>(
    event: K,
    data: WebSocketEventMap[K],
  ) => {
    const listener = listeners.get(event);

    if (typeof listener !== "undefined") {
      listener.forEach((callback) => callback(data));
    }
  };

  const on = <K extends keyof WebSocketEventMap>(
    event: K,
    callback: WebSocketEventCallback<K>,
  ) => {
    if (!listeners.has(event)) {
      listeners.set(event, []);
    }

    listeners.get(event)!.push(callback as WebSocketEventCallback<any>);
  };

  const off = <K extends keyof WebSocketEventMap>(
    event: K,
    callback: WebSocketEventCallback<K>,
  ) => {
    const eventListeners = listeners.get(event);
    if (!eventListeners) return;

    const index = eventListeners.indexOf(
      callback as WebSocketEventCallback<any>,
    );
    if (index !== -1) {
      eventListeners.splice(index, 1);
    }
  };

  const send = <K extends keyof WebSocketEventMap>(
    event: K,
    payload?: WebSocketEventMap[K],
  ) => {
    if (websocket && isConnected) {
      websocket.send(JSON.stringify({ event, payload }));
    } else {
      console.warn("WebSocket not connected, cannot send message");
    }
  };

  const disconnect = () => {
    // Previene reconecciones adicionales.
    reconnectAttempts = MAX_RECONNECT_ATTEMPTS;

    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }

    if (websocket) {
      websocket.close(1000, "Client disconnecting");
      websocket = null;
      isConnected = false;
    }
  };

  return {
    on,
    off,
    send,
    connect,
    disconnect,
    isConnected: () => isConnected,
  };
}
