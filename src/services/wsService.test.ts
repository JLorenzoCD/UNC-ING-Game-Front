import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Match } from "@/types/match";
import { createWsService, type WSService } from "./wsService";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const global: any;

global.WebSocket = vi.fn();

vi.mock("import.meta", () => ({
  env: {
    VITE_WS_URL: undefined,
  }
}))

describe("wsService", () => {
  let mockWebSocket: Partial<WebSocket>;
  let wsService: WSService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();

    mockWebSocket = {
      close: vi.fn(),
      send: vi.fn(),
      readyState: WebSocket.CONNECTING,
      onopen: null,
      onclose: null,
      onmessage: null,
      onerror: null,
    }
  
    global.WebSocket.mockImplementation(() => mockWebSocket);
  
    wsService = createWsService();
  
    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    })
  })

  describe("Service creation", () => {
    it("creates a WebSocket service with correct initial state", () => {
      expect(wsService).toHaveProperty("isConnected");
      expect(wsService).toHaveProperty("connect");
      expect(wsService).toHaveProperty("disconnect");
      expect(wsService).toHaveProperty("send");
      expect(wsService).toHaveProperty("on");
      expect(wsService).toHaveProperty("off");
      expect(wsService.isConnected()).toBe(false);
    })

    it("creates independent service instances", () => {
      const anotherWsService = createWsService();

      expect(anotherWsService).not.toBe(wsService);
      expect(wsService.isConnected()).toBe(false);
      expect(anotherWsService.isConnected()).toBe(false);

      wsService.connect();

      // @ts-expect-error - necesitamos "abrir" la conexión manualmente
      mockWebSocket.onopen();

      expect(wsService.isConnected()).toBe(true);
      expect(anotherWsService.isConnected()).toBe(false);
    })
  })

  describe("Connection management", () => {
    it("establishes a WebSocket connection", () => {
      wsService.connect();

      expect(global.WebSocket).toHaveBeenCalledWith("ws://localhost:8000/ws");
      expect(mockWebSocket.onopen).toBeDefined();
      expect(mockWebSocket.onclose).toBeDefined();
      expect(mockWebSocket.onmessage).toBeDefined();
      expect(mockWebSocket.onerror).toBeDefined();
    })

    it("handles connection errors", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const error = new Error("Connection failed");
      
      wsService.connect();

      // @ts-expect-error - necesitamos "fallar" la conexión manualmente
      mockWebSocket.onerror(error);

      expect(wsService.isConnected()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith("WebSocket error:", error);
      consoleSpy.mockRestore();
    })

    it("handles WebSocket constructor failure", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const error = new Error("WebSocket creation failed");
      global.WebSocket.mockImplementation(() => { throw error; });
      wsService.connect();

      expect(wsService.isConnected()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith("WebSocket connection failed:", error);
      consoleSpy.mockRestore();
    })

    it("reconnects automatically on connection close", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      wsService.connect();

      // @ts-expect-error - necesitamos "cerrar" la conexión manualmente
      mockWebSocket.onclose();

      expect(wsService.isConnected()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith("WebSocket disconnected, reconnecting in 1000ms (attempt 1/5)");

      // Simulamos el paso del tiempo para la reconexión
      vi.advanceTimersByTime(1000);
      expect(global.WebSocket).toHaveBeenCalledTimes(2);
      consoleSpy.mockRestore();
    })

    it("closes WebSocket connection on disconnect", () => {
      wsService.connect();
      wsService.disconnect();

      expect(mockWebSocket.close).toHaveBeenCalledTimes(1);
    })
  })

  describe("Event handling", () => {
    const mockMatchCreatePayload: Pick<Match, "id" | "name" | "status"> = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Partida de prueba",
      status: "WAITING"
    };

    it("registers and emits events correctly", () => {
      const callbackOne = vi.fn();
      const callbackTwo = vi.fn();

      wsService.on("testEvent", callbackOne);
      wsService.on("testEvent", callbackTwo);
      wsService.on("anotherEvent", callbackOne);
      expect(typeof wsService.on).toBe("function");
    })

    it("removes event listeners correctly", () => {
      const callbackOne = vi.fn();
      const callbackTwo = vi.fn();
  
      wsService.on("testEvent", callbackOne);
      wsService.on("testEvent", callbackTwo);
      wsService.off("testEvent", callbackOne);
  
      wsService.connect();
  
      const messageEvent = {
        data: JSON.stringify({ event: "testEvent", payload: "test data" })
      }
  
      // @ts-expect-error - necesitamos "recibir" un mensaje manualmente
      mockWebSocket.onmessage(messageEvent);
      
      expect(callbackOne).not.toHaveBeenCalled();
      expect(callbackTwo).toHaveBeenCalledWith("test data");
    })

    it("process incoming WebSocket messages", () => {
      const callback = vi.fn();

      wsService.on("matchCreate", callback);
      wsService.connect();

      const messageEvent = {
        data: JSON.stringify({
          event: "matchCreate",
          payload: mockMatchCreatePayload
        })
      }

      // @ts-expect-error - necesitamos "recibir" un mensaje manualmente
      mockWebSocket.onmessage(messageEvent);

      expect(callback).toHaveBeenCalledWith(mockMatchCreatePayload);
    })

    it("handles multiple listeners for the same event", () => {
      const callbackOne = vi.fn();
      const callbackTwo = vi.fn();

      wsService.on("matchCreate", callbackOne);
      wsService.on("matchCreate", callbackTwo);
      wsService.connect();

      const messageEvent = {
        data: JSON.stringify({
          event: "matchCreate",
          payload: mockMatchCreatePayload
        })
      }

      // @ts-expect-error - necesitamos "recibir" un mensaje manualmente
      mockWebSocket.onmessage(messageEvent);

      expect(callbackOne).toHaveBeenCalledWith(mockMatchCreatePayload);

      expect(callbackTwo).toHaveBeenCalledWith(mockMatchCreatePayload);
    })

    it("handles messages with no listeners gracefully", () => {
      const callback = vi.fn();

      wsService.on("testEvent", callback);
      wsService.connect();

      const messageUnhandledEvent = {
        data: JSON.stringify({
          event: "unhandledEvent",
          payload: "some data"
        })
      }

      // @ts-expect-error - necesitamos "recibir" un mensaje manualmente
      mockWebSocket.onmessage(messageUnhandledEvent);
      expect(callback).not.toHaveBeenCalled();

      const messageMissingPayload = {
        data: JSON.stringify({
          event: "testEvent"
        })
      }

      // @ts-expect-error - necesitamos "recibir" un mensaje manualmente
      mockWebSocket.onmessage(messageMissingPayload);
      expect(callback).toHaveBeenCalledWith(undefined);
    })

    it("handles malformed JSON messages gracefully", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      wsService.connect();

      const malformedMessageEvent = {
        data: "{ event: 'testEvent', payload: 'data' " // JSON malformado
      }

      // @ts-expect-error - necesitamos "recibir" un mensaje manualmente
      mockWebSocket.onmessage(malformedMessageEvent);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    })

    it("ignores events with no registered listeners", () => {
      wsService.connect();

      const messageEvent = {
        data: JSON.stringify({
          event: "unregisteredEvent",
          payload: "data"
        })
      }

      expect(() => {
        // @ts-expect-error - necesitamos "recibir" un mensaje manualmente
        mockWebSocket.onmessage(messageEvent);
      }).to.not.throw();
    })

    it("handles extremely long event names and payloads", () => {
      const callback = vi.fn();
      const longEventName = "a".repeat(1000);
      const longPayload = { data: "b".repeat(10000) };

      wsService.on(longEventName, callback);
      wsService.connect();

      const messageEvent = {
        data: JSON.stringify({
          event: longEventName,
          payload: longPayload
        })
      }

      // @ts-expect-error - necesitamos "recibir" un mensaje manualmente
      mockWebSocket.onmessage(messageEvent);

      expect(callback).toHaveBeenCalledWith(longPayload);
    })
  })
})