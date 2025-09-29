import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { createWsService, type WSService } from "@/services/wsService";

import { usePlayer } from "./PlayerContext";

interface WebSocketServiceContextType {
  wsService: WSService | null;
  isConnected: boolean;
}

const WebSocketServiceContext = createContext<WebSocketServiceContextType>({
  wsService: null,
  isConnected: false,
});

interface WebSocketServiceProviderProps {
  children: ReactNode;
}

export function WebSocketServiceProvider({ children }: WebSocketServiceProviderProps) {
  const { player } = usePlayer();
  
  const [wsService, setWsService] = useState<WSService | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    if (!player) return;

    setWsService(createWsService(player.id));
  }, [player])

  useEffect(() => {
    if (!wsService) return;

    wsService.on("connection", setIsConnected);
    wsService.connect();

    return () => {
      wsService.off("connection", setIsConnected);
      wsService.disconnect();
    };
  }, [wsService]);

  return (
    <WebSocketServiceContext.Provider value={{ wsService, isConnected }}>
      {children}
    </WebSocketServiceContext.Provider>
  );
}

export function useWebSocketService() {
  const context = useContext(WebSocketServiceContext);

  if (!context || !context.wsService) {
    throw new Error(
      "useWebSocketService must be used within a WebSocketServiceProvider",
    );
  }

  return context;
}
