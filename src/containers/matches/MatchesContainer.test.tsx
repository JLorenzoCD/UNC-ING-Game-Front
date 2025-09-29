import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import MatchesContainer from "./MatchesContainer";

const mockGetMatches = vi.fn().mockResolvedValue([
  {
    id: "1",
    name: "Prueba 1",
    status: "WAITING",
    min_players: 2,
    max_players: 6,
    owner_id: crypto.randomUUID(),
    current_player_count: 5,
    current_player_order: 0,
  },
  {
    id: "2",
    name: "Prueba 2",
    status: "WAITING",
    min_players: 4,
    max_players: 6,
    owner_id: crypto.randomUUID(),
    current_player_count: 3,
    current_player_order: 0,
  },
]);

// Mock de los servicios
vi.mock("@/contexts/HttpServiceContext", () => ({
  useHttpService: vi.fn(() => ({
    httpService: {
      getMatches: mockGetMatches,
    },
  })),
}));

const mockOn = vi.fn();
const mockOff = vi.fn();

vi.mock("@/contexts/WebSocketServiceContext", () => ({
  useWebSocketService: vi.fn(() => ({
    wsService: {
      on: mockOn,
      off: mockOff,
    },
    isConnected: true,
  })),
}));

// Función auxiliar para obtener el handler por el nombre del evento
const getEventHandler = (eventName: string) => {
  const call = mockOn.mock.calls.find((call) => call[0] === eventName);
  if (!call) throw new Error(`Handler for event ${eventName} not found.`);

  return call[1]; // El handler es el segundo elemento del array [nombre, handler]
};

// Mock de los componentes
vi.mock("@/components/Button", () => ({
  default: vi.fn(({ children }) => (
    <button data-testid="mock-button">{children}</button>
  )),
}));

vi.mock("./components/ListMatches", () => ({
  default: vi.fn(({ children }) => <div>{children}</div>),
}));

vi.mock("./components/ListItemMatch", () => ({
  default: vi.fn(({ match }) => <div>{match.name}</div>),
}));

vi.mock("react-router", async (importOriginal) => {
  const mod = await importOriginal<typeof import("react-router")>();
  return {
    ...mod,
    Link: vi.fn(({ to, children, ...props }) => (
      <a href={to} {...props} data-testid="mock-link">
        {children}
      </a>
    )),
  };
});

// Mock de las constantes
vi.mock("@/constants/frontendPaths", () => ({
  FRONTEND_PATHS: {
    MATCH_CREATE: "/match/create",
  },
}));

//! OJO - Tiene que ser iguales, da problemas la herramienta de testing
const mockSocketsEvents = {
  MATCHES_ADD: "matchAdd",
  MATCHES_REMOVE: "matchRemove",
  MATCHES_UPDATE: "matchUpdate",
};
vi.mock("@/constants/backend", () => ({
  BACKEND_SOCKETS_EVENTS: {
    MATCHES_ADD: "matchAdd",
    MATCHES_REMOVE: "matchRemove",
    MATCHES_UPDATE: "matchUpdate",
  },
}));
//! Termina

describe("MatchesContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call getMatches on mount", async () => {
    render(<MatchesContainer />);

    await waitFor(() => {
      expect(mockGetMatches).toHaveBeenCalledTimes(1);
    });
  });

  it("should render the page correctly", async () => {
    render(<MatchesContainer />);

    // El botón de creación de partida se renderiza
    const createButton = screen.getByTestId("mock-button");
    expect(createButton).toBeInTheDocument();
    expect(createButton).toHaveTextContent("Create match");

    // Se realiza la petición para obtener las partidas
    expect(mockGetMatches).toHaveBeenCalledTimes(1);

    // Verificar que los elementos de la lista se renderizan
    await waitFor(() => {
      expect(screen.getByText("Prueba 1")).toBeInTheDocument();
      expect(screen.getByText("Prueba 2")).toBeInTheDocument();
    });
  });

  it("should connect to WebSocket and register all necessary event handlers on mount", async () => {
    render(<MatchesContainer />);

    // Verifica el registro de eventos WebSocket.
    await waitFor(() => {
      expect(mockOn).toHaveBeenCalledWith(
        mockSocketsEvents.MATCHES_ADD,
        expect.any(Function),
      );
      expect(mockOn).toHaveBeenCalledWith(
        mockSocketsEvents.MATCHES_REMOVE,
        expect.any(Function),
      );
      expect(mockOn).toHaveBeenCalledWith(
        mockSocketsEvents.MATCHES_UPDATE,
        expect.any(Function),
      );
    });
  });

  it('should handle the "matchAdd" event and display the new match', async () => {
    render(<MatchesContainer />);

    await waitFor(() => {
      expect(mockOn).toHaveBeenCalledWith(
        mockSocketsEvents.MATCHES_ADD,
        expect.any(Function),
      );
    });

    // Simulamos el evento 'matchAdd'.
    const addHandler = getEventHandler(mockSocketsEvents.MATCHES_ADD);
    act(() => {
      addHandler({
        id: "3",
        name: "New match",
        status: "WAITING",
        min_players: 2,
        max_players: 4,
        owner_id: crypto.randomUUID(),
        current_player_count: 1,
        current_player_order: 0,
      });
    });

    // Verificamos que el nuevo match se renderiza.
    await waitFor(() => {
      expect(screen.getByText("New match")).toBeInTheDocument();
    });
  });

  it('should handle "matchRemove" events correctly', async () => {
    render(<MatchesContainer />);

    await waitFor(() => {
      expect(mockOn).toHaveBeenCalledWith(
        mockSocketsEvents.MATCHES_REMOVE,
        expect.any(Function),
      );
    });

    // Simulamos un evento 'matchRemove' (asumiendo que 'Prueba 1' existe inicialmente).
    const removeHandler = getEventHandler(mockSocketsEvents.MATCHES_REMOVE);
    act(() => {
      removeHandler("1"); // Eliminamos el match con id '1' ('Prueba 1').
    });

    // Verificamos que el match eliminado ya NO está en el documento.
    await waitFor(() => {
      expect(screen.queryByText("Prueba 1")).not.toBeInTheDocument();
    });
  });

  it('should handle "matchUpdate" events correctly', async () => {
    render(<MatchesContainer />);

    await waitFor(() => {
      expect(mockOn).toHaveBeenCalledWith(
        mockSocketsEvents.MATCHES_UPDATE,
        expect.any(Function),
      );
    });

    // Simulamos un evento 'matchUpdate' (asumiendo que 'Prueba 2' existe con id '2').
    const updateHandler = getEventHandler(mockSocketsEvents.MATCHES_UPDATE);
    act(() => {
      updateHandler({
        id: "2",
        name: "Update match", // Nuevo nombre
        status: "WAITING",
        min_players: 4,
        max_players: 6,
        owner_id: crypto.randomUUID(),
        current_player_count: 5,
        current_player_order: 0,
      });
    });

    // Verificamos que el match actualizado con el nuevo nombre se renderiza.
    await waitFor(() => {
      expect(screen.getByText("Update match")).toBeInTheDocument();
    });
  });

  it("should off events on unmount, the WebSocket", () => {
    const { unmount } = render(<MatchesContainer />);

    // Verificar que al desmontar deja de escuchar los eventos
    unmount();

    expect(mockOff).toHaveBeenCalledWith(
      mockSocketsEvents.MATCHES_ADD,
      expect.any(Function),
    );
    expect(mockOff).toHaveBeenCalledWith(
      mockSocketsEvents.MATCHES_REMOVE,
      expect.any(Function),
    );
    expect(mockOff).toHaveBeenCalledWith(
      mockSocketsEvents.MATCHES_UPDATE,
      expect.any(Function),
    );
  });
});
