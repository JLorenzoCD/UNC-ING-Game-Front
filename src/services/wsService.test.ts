import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Match } from "@/types/match";
import { createWsService, type WSService } from "./wsService";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const global: any;

global.WebSocket = vi.fn();

vi.mock("import.meta", () => ({
  env: {
    VITE_WS_URL: undefined,
  },
}));

describe("wsService", () => {
  let mockWebSocket: Partial<WebSocket>;
  let wsService: WSService;

  // Helper functions to simulate WebSocket events
  const openConnection = () => {
    // @ts-expect-error - necesitamos "abrir" la conexión manualmente
    mockWebSocket.onopen();
  };

  const closeConnection = () => {
    // @ts-expect-error - necesitamos "cerrar" la conexión manualmente
    mockWebSocket.onclose();
  };

  const triggerError = (error: Error) => {
    // @ts-expect-error - necesitamos "fallar" la conexión manualmente
    mockWebSocket.onerror(error);
  };

  const receiveMessage = (event: string, payload?: unknown) => {
    const messageEvent = {
      data: JSON.stringify({ event, payload }),
    };

    // @ts-expect-error - necesitamos "recibir" un mensaje manualmente
    mockWebSocket.onmessage(messageEvent);
  };

  const receiveMalformedMessage = (malformedData: string) => {
    const messageEvent = {
      data: malformedData,
    };

    // @ts-expect-error - necesitamos "recibir" un mensaje manualmente
    mockWebSocket.onmessage(messageEvent);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();

    delete (import.meta.env as any).VITE_WS_URL;

    mockWebSocket = {
      close: vi.fn(),
      send: vi.fn(),
      readyState: WebSocket.CONNECTING,
      onopen: null,
      onclose: null,
      onmessage: null,
      onerror: null,
    };

    global.WebSocket.mockImplementation(() => mockWebSocket);

    wsService = createWsService();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("Service creation", () => {
    it("creates a WebSocket service with correct initial state", () => {
      expect(wsService).toHaveProperty("isConnected");
      expect(wsService).toHaveProperty("connect");
      expect(wsService).toHaveProperty("disconnect");
      expect(wsService).toHaveProperty("send");
      expect(wsService).toHaveProperty("on");
      expect(wsService).toHaveProperty("off");
      expect(wsService.isConnected()).toBe(false);
    });

    it("creates independent service instances", () => {
      const anotherWsService = createWsService();

      expect(anotherWsService).not.toBe(wsService);

      // Ambos servicios deben iniciar desconectados
      expect(wsService.isConnected()).toBe(false);
      expect(anotherWsService.isConnected()).toBe(false);

      wsService.connect();

      openConnection();

      expect(wsService.isConnected()).toBe(true);
      expect(anotherWsService.isConnected()).toBe(false);
    });
  });

  describe("Connection management", () => {
    it("establishes a WebSocket connection", () => {
      wsService.connect();

      expect(global.WebSocket).toHaveBeenCalledWith("ws://localhost:8000/ws");
      expect(mockWebSocket.onopen).toBeDefined();
      expect(mockWebSocket.onclose).toBeDefined();
      expect(mockWebSocket.onmessage).toBeDefined();
      expect(mockWebSocket.onerror).toBeDefined();
    });

    it("establishes a WebSocket connection with player ID", () => {
      const playerId = crypto.randomUUID();
      const wsServiceWithPlayer = createWsService(playerId);
      wsServiceWithPlayer.connect();

      expect(global.WebSocket).toHaveBeenCalledWith(
        `ws://localhost:8000/ws?player_id=${playerId}`,
      );

      expect(mockWebSocket.onopen).toBeDefined();
      expect(mockWebSocket.onclose).toBeDefined();
      expect(mockWebSocket.onmessage).toBeDefined();
      expect(mockWebSocket.onerror).toBeDefined();
    });

    it("handles connection errors", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const error = new Error("Connection failed");

      wsService.connect();

      triggerError(error);

      expect(wsService.isConnected()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith("WebSocket error:", error);
      consoleSpy.mockRestore();
    });

    it("handles WebSocket constructor failure", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const error = new Error("WebSocket creation failed");

      global.WebSocket.mockImplementation(() => {
        throw error;
      });

      wsService.connect();

      expect(wsService.isConnected()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "WebSocket connection failed:",
        error,
      );

      consoleSpy.mockRestore();
    });

    it("reconnects automatically on connection close", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      wsService.connect();

      closeConnection();

      expect(wsService.isConnected()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "WebSocket disconnected, reconnecting in 1000ms (attempt 1/5)",
      );

      // Simulamos el paso del tiempo para la reconexión
      vi.advanceTimersByTime(1000);

      expect(global.WebSocket).toHaveBeenCalledTimes(2);

      consoleSpy.mockRestore();
    });

    it("closes WebSocket connection on disconnect", () => {
      wsService.connect();
      wsService.disconnect();

      expect(mockWebSocket.close).toHaveBeenCalledTimes(1);
    });

    it("prevents reconnection after disconnect", () => {
      wsService.connect();

      closeConnection();

      wsService.disconnect();

      // Avanzamos el tiempo para ver si intenta reconectar
      vi.advanceTimersByTime(30000);

      // Solo debe haberse llamado una vez (la conexión inicial)
      expect(global.WebSocket).toHaveBeenCalledTimes(1);
    });

    it("clears reconnect timeout on disconnect", () => {
      wsService.connect();

      closeConnection();

      // Desconectamos antes de que se intente reconectar
      wsService.disconnect();

      // Avanzamos el tiempo
      vi.advanceTimersByTime(2000);

      // No debe haber intentado reconectar
      expect(global.WebSocket).toHaveBeenCalledTimes(1);
    });

    it("uses VITE_WS_URL when defined", () => {
      vi.mocked(import.meta.env).VITE_WS_URL = "wss://example.com/socket";
      const customWsService = createWsService();

      customWsService.connect();

      expect(global.WebSocket).toHaveBeenCalledWith("wss://example.com/socket");
    });

    it("emits connection event on successful connection", () => {
      const connectionCallback = vi.fn();

      wsService.on("connection", connectionCallback);
      wsService.connect();

      openConnection();

      expect(connectionCallback).toHaveBeenCalledWith(true);
    });

    it("emits connection event on connection close", () => {
      const connectionCallback = vi.fn();

      wsService.on("connection", connectionCallback);
      wsService.connect();

      closeConnection();

      expect(connectionCallback).toHaveBeenCalledWith(false);
    });

    it("emits connection event on connection error", () => {
      const connectionCallback = vi.fn();
      const error = new Error("Connection error");

      wsService.on("connection", connectionCallback);
      wsService.connect();

      triggerError(error);

      expect(connectionCallback).toHaveBeenCalledWith(false);
    });

    it("stops reconnecting after max attempts", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const errorCallback = vi.fn();

      wsService.on("error", errorCallback);
      wsService.connect();

      // Simulamos 6 cierres de conexión (inicial + 5 reintentos)
      for (let i = 0; i < 6; i++) {
        closeConnection();
        vi.runAllTimers();
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        "Max reconnection attempts reached",
      );
      expect(errorCallback).toHaveBeenCalledWith({
        type: "max_reconnect_attempts",
      });
      consoleSpy.mockRestore();
      logSpy.mockRestore();
    });

    it("implements exponential backoff for reconnection", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      wsService.connect();

      // Primera reconexión: 1000ms (2^0 * 1000)
      closeConnection();
      expect(consoleSpy).toHaveBeenCalledWith(
        "WebSocket disconnected, reconnecting in 1000ms (attempt 1/5)",
      );

      vi.advanceTimersByTime(1000);

      // Segunda reconexión: 2000ms (2^1 * 1000)
      closeConnection();
      expect(consoleSpy).toHaveBeenCalledWith(
        "WebSocket disconnected, reconnecting in 2000ms (attempt 2/5)",
      );

      vi.advanceTimersByTime(2000);

      // Tercera reconexión: 4000ms (2^2 * 1000)
      closeConnection();
      expect(consoleSpy).toHaveBeenCalledWith(
        "WebSocket disconnected, reconnecting in 4000ms (attempt 3/5)",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Event handling", () => {
    const mockMatchCreatePayload: Pick<Match, "id" | "name" | "status"> = {
      id: crypto.randomUUID(),
      name: "Partida de prueba",
      status: "WAITING",
    };

    it("registers and emits events correctly", () => {
      const callbackOne = vi.fn();
      const callbackTwo = vi.fn();

      wsService.on("testEvent", callbackOne);
      wsService.on("testEvent", callbackTwo);
      wsService.on("anotherEvent", callbackOne);
      wsService.connect();

      receiveMessage("testEvent", "test data");
      receiveMessage("anotherEvent", "other data");

      expect(callbackOne).toHaveBeenCalledTimes(2);
      expect(callbackOne).toHaveBeenCalledWith("test data");
      expect(callbackOne).toHaveBeenCalledWith("other data");
      expect(callbackTwo).toHaveBeenCalledTimes(1);
      expect(callbackTwo).toHaveBeenCalledWith("test data");
    });

    it("removes event listeners correctly", () => {
      const callbackOne = vi.fn();
      const callbackTwo = vi.fn();

      wsService.on("testEvent", callbackOne);
      wsService.on("testEvent", callbackTwo);
      wsService.off("testEvent", callbackOne);

      wsService.connect();

      receiveMessage("testEvent", "test data");

      expect(callbackOne).not.toHaveBeenCalled();
      expect(callbackTwo).toHaveBeenCalledWith("test data");
    });

    it("handles removing listener from non-existent event gracefully", () => {
      const callback = vi.fn();

      expect(() => {
        wsService.off("nonExistentEvent", callback);
      }).not.toThrow();
    });

    it("handles removing non-existent callback from event", () => {
      const callbackOne = vi.fn();
      const callbackTwo = vi.fn();

      wsService.on("testEvent", callbackOne);

      expect(() => {
        wsService.off("testEvent", callbackTwo);
      }).not.toThrow();

      wsService.connect();

      receiveMessage("testEvent", "test data");

      expect(callbackOne).toHaveBeenCalledWith("test data");
    });

    it("process incoming WebSocket messages", () => {
      const callback = vi.fn();

      wsService.on("matchCreate", callback);
      wsService.connect();

      receiveMessage("matchCreate", mockMatchCreatePayload);

      expect(callback).toHaveBeenCalledWith(mockMatchCreatePayload);
    });

    it("handles multiple listeners for the same event", () => {
      const callbackOne = vi.fn();
      const callbackTwo = vi.fn();

      wsService.on("matchCreate", callbackOne);
      wsService.on("matchCreate", callbackTwo);
      wsService.connect();

      receiveMessage("matchCreate", mockMatchCreatePayload);

      expect(callbackOne).toHaveBeenCalledWith(mockMatchCreatePayload);
      expect(callbackTwo).toHaveBeenCalledWith(mockMatchCreatePayload);
    });

    it("handles messages with no listeners gracefully", () => {
      const callback = vi.fn();

      wsService.on("testEvent", callback);
      wsService.connect();

      receiveMessage("unregisteredEvent", "data");
      expect(callback).not.toHaveBeenCalled();

      receiveMessage("testEvent", undefined);
      expect(callback).toHaveBeenCalledWith(undefined);
    });

    it("handles malformed JSON messages gracefully", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      wsService.connect();

      receiveMalformedMessage("{ event: 'testEvent', payload: 'data' "); // JSON malformado

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("ignores events with no registered listeners", () => {
      wsService.connect();

      expect(() => {
        receiveMessage("unregisteredEvent", "data");
      }).to.not.throw();
    });

    it("handles extremely long event names and payloads", () => {
      const callback = vi.fn();
      const longEventName = "a".repeat(1000);
      const longPayload = { data: "b".repeat(10000) };

      wsService.on(longEventName, callback);
      wsService.connect();

      receiveMessage(longEventName, longPayload);

      expect(callback).toHaveBeenCalledWith(longPayload);
    });
  });

  describe("Sending messages", () => {
    it("sends messages when connected", () => {
      wsService.connect();

      openConnection();

      wsService.send("testEvent", { data: "test" });

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({ event: "testEvent", payload: { data: "test" } }),
      );
    });

    it("sends messages without payload", () => {
      wsService.connect();

      openConnection();

      wsService.send("testEvent");

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({ event: "testEvent", payload: undefined }),
      );
    });

    it("does not send messages when not connected", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      wsService.send("testEvent", { data: "test" });

      expect(mockWebSocket.send).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        "WebSocket not connected, cannot send message",
      );
      consoleSpy.mockRestore();
    });

    it("does not send messages when connection is closed", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      wsService.connect();

      openConnection();

      closeConnection();

      wsService.send("testEvent", { data: "test" });

      expect(consoleSpy).toHaveBeenCalledWith(
        "WebSocket not connected, cannot send message",
      );
      consoleSpy.mockRestore();
    });
  });
});
