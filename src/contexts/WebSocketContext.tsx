import { createWsService } from "@/services/wsService";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type WSService = ReturnType<typeof createWsService>;

interface WebSocketServiceContextType {
  wsService: WSService | null;
  isConnected: boolean;
}

export const WebSocketServiceContext = createContext<WebSocketServiceContextType>({
  wsService: null,
  isConnected: false,
})

interface WebSocketServiceProviderProps {
  children: ReactNode;
}

export function WebSocketServiceProvider({ children }: WebSocketServiceProviderProps) {
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
    <WebSocketServiceContext.Provider value={{ wsService, isConnected }}>
      {children}
    </WebSocketServiceContext.Provider>
  )
}

export function useWebSocketService() {
  const context = useContext(WebSocketServiceContext);

  if (!context || !context.wsService) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }

  return context;
}