const MAX_RECONNECT_ATTEMPTS = 5;
const MAX_RECONNECT_DELAY = 30000; // 30 segundos

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventCallback = (data: any) => void;

export type WSService = ReturnType<typeof createWsService>;

function isWsUrlDefined(): boolean {
  return (
    typeof import.meta.env.VITE_WS_URL === "string" &&
    import.meta.env.VITE_WS_URL.length > 0
  );
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

  const baseUrl = isWsUrlDefined()
    ? import.meta.env.VITE_WS_URL
    : "ws://localhost:8000/ws" 

  const wsUrl = formatWsUrl(baseUrl, playerId);

  const listeners = new Map<string, EventCallback[]>();

  const connect = () => {
    try {
      websocket = new WebSocket(wsUrl);

      // Cuando se abre el WebSocket, emitimos la apertura de la conexión
      // y reseteamos los intentos de reconexión.
      websocket.onopen = () => {
        isConnected = true;
        reconnectAttempts = 0;

        emit("connection", true);

        console.log("WebSocket connected");
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emit = (event: string, data: any) => {
    if (listeners.has(event)) {
      const listener = listeners.get(event);

      if (!listener) return;

      listener.forEach((callback) => callback(data));
    }
  };

  const on = (event: string, callback: EventCallback) => {
    if (!listeners.has(event)) {
      listeners.set(event, []);
    }

    listeners.get(event)!.push(callback);
  };

  const off = (event: string, callback: EventCallback) => {
    const eventListeners = listeners.get(event);
    if (!eventListeners) return;

    const index = eventListeners.indexOf(callback);
    if (index !== -1) {
      eventListeners.splice(index, 1);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const send = (event: string, payload?: any) => {
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
