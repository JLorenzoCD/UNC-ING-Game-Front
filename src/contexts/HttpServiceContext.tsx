import { createHttpService } from "@/services/httpService";
import { createContext, useContext, useState, type ReactNode } from "react";

type HTTPService = ReturnType<typeof createHttpService>;

interface HttpServiceContextType {
  httpService: HTTPService | null;
}

const HttpServiceContext = createContext<HttpServiceContextType>({
  httpService: null,
});

interface HttpServiceProviderProps {
  children: ReactNode;
}

export function HttpServiceProvider({ children }: HttpServiceProviderProps) {
  const [httpService] = useState<HTTPService>(() => createHttpService());

  return (
    <HttpServiceContext.Provider value={{ httpService }}>
      {children}
    </HttpServiceContext.Provider>
  );
}

export function useHttpService() {
  const context = useContext(HttpServiceContext);

  if (!context) {
    throw new Error("useHttpService must be used within a HttpServiceProvider");
  }

  return context;
}
