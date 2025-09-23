import { createWsService } from "@/services/wsService";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type WSService = ReturnType<typeof createWsService>;

interface WebSocketContextType {
  wsService: WSService | null;
  isConnected: boolean;
}

export const WebSocketContext = createContext<WebSocketContextType>({
  wsService: null,
  isConnected: false,
})

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [wsService] = useState<WSService>(() => createWsService());
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    wsService.on("connection", setIsConnected);
    wsService.connect();

    return () => {
      wsService.off("connection", setIsConnected);
      wsService.disconnect();
    }
  }, [wsService]);

  return (
    <WebSocketContext.Provider value={{ wsService, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);

  if (!context || !context.wsService) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }

  return context;
}