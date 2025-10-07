import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

import type { UUID } from "@/types/common";
import type { Player } from "@/types/player";

// Mocks de dependencias
const {
  mockNavigate,
  mockSetPlayer,
  mockCreatePlayer,
  mockCreatePlayerForm,
  mockUseHttpService,
  MOCK_FRONTEND_PATHS,
  newPlayer,
  testPlayerInput,
} = vi.hoisted(() => {
  const testPlayerInput = { name: "TestPlayerName", avatar: "TestAvatar" };
  const newPlayer = {
    id: "p1" as UUID,
    name: "TestPlayerName",
    avatar: "TestAvatar",
  } as Player;

  const mockNavigate = vi.fn();
  const mockSetPlayer = vi.fn();

  const mockCreatePlayer = vi.fn();
  const mockUseHttpService = vi.fn(
    (): {
      httpService: {
        createPlayer: typeof mockCreatePlayer;
      } | null;
    } => ({
      httpService: {
        createPlayer: mockCreatePlayer,
      },
    }),
  );

  const mockCreatePlayerForm = vi.fn(({ handleCreatePlayer }) => (
    <button
      data-testid="submit-button"
      onClick={() => handleCreatePlayer(testPlayerInput)}
    >
      Crear Jugador
    </button>
  ));

  const MOCK_FRONTEND_PATHS = {
    MATCH_LIST: "/partidas",
  };

  return {
    mockNavigate,
    mockSetPlayer,
    mockCreatePlayer,
    mockUseHttpService,
    mockCreatePlayerForm,
    MOCK_FRONTEND_PATHS,
    testPlayerInput,
    newPlayer,
  };
});

vi.mock("react-router", () => {
  return {
    useNavigate: () => mockNavigate,
  };
});

// Mocks para los hooks de contexto
vi.mock("@/contexts/PlayerContext", () => ({
  usePlayer: () => ({
    setPlayer: mockSetPlayer,
    player: null, // Asumimos que el jugador es null inicialmente
  }),
}));

vi.mock("@/contexts/HttpServiceContext", () => ({
  useHttpService: mockUseHttpService,
}));

// Mock para el componente hijo (CreatePlayerForm)
vi.mock("./components/CreatePlayerForm", () => ({
  default: mockCreatePlayerForm,
}));

// Mock para las constantes
vi.mock("@/constants/frontend", () => ({
  FRONTEND_PATHS: MOCK_FRONTEND_PATHS,
}));

// Importamos el componente después de los mocks
import CreatePlayerContainer from "./CreatePlayerContainer";

// Las descripciones del 'describe' y 'it' se pasan a inglés
describe("CreatePlayerContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockCreatePlayer.mockResolvedValue(newPlayer);
  });

  it("should render CreatePlayerForm and pass the handleCreatePlayer function", () => {
    render(<CreatePlayerContainer />);

    expect(mockCreatePlayerForm).toHaveBeenCalledTimes(1);
    const props = mockCreatePlayerForm.mock.calls[0][0];
    expect(typeof props.handleCreatePlayer).toBe("function");
  });

  it("should call httpService.createPlayer, setPlayer, and navigate to the match list upon successful player creation", async () => {
    render(<CreatePlayerContainer />);

    // Simulamos el click del botón que llama a handleCreatePlayer
    const submitButton = screen.getByTestId("submit-button");

    await act(async () => {
      await userEvent.click(submitButton);
    });

    // Verificaciones
    expect(mockCreatePlayer).toHaveBeenCalledWith(testPlayerInput);
    expect(mockSetPlayer).toHaveBeenCalledWith(newPlayer);
    expect(mockNavigate).toHaveBeenCalledWith(MOCK_FRONTEND_PATHS.MATCH_LIST);
  });

  it("should handle error, show alert, and NOT call logic if httpService is not available", async () => {
    // MOCK de console.error y alert
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const mockAlert = vi.spyOn(window, "alert").mockImplementation(() => {});

    const error = new Error("API Error: Player creation failed");
    mockCreatePlayer.mockRejectedValue(error);

    render(<CreatePlayerContainer />);

    const submitButton = screen.getByTestId("submit-button");
    await act(async () => {
      await userEvent.click(submitButton);
    });

    // Verificaciones
    expect(mockCreatePlayer).toHaveBeenCalledWith(testPlayerInput);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error creating player:",
      error,
    );
    expect(mockAlert).toHaveBeenCalledWith(
      "Could not create player, try again.",
    );

    // Verificar que la lógica de éxito NO se llama
    expect(mockSetPlayer).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();

    // Restaurar los mocks
    consoleErrorSpy.mockRestore();
    mockAlert.mockRestore();
  });

  it("should handle error, log it, show alert, and NOT call successful logic if httpService is not available", async () => {
    // MOCK de console.error y alert
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const mockAlert = vi.spyOn(window, "alert").mockImplementation(() => {});

    // Sobreescribe el mock para simular un httpService nulo SOLO para esta llamada
    mockUseHttpService.mockImplementationOnce(() => ({ httpService: null }));

    render(<CreatePlayerContainer />);

    const submitButton = screen.getByTestId("submit-button");
    await act(async () => {
      await userEvent.click(submitButton);
    });

    // Verificaciones

    // El error esperado que se pasa al catch (Error lanzado al verificar si httpService existe)
    const expectedError = new Error("HTTP Service is not available.");

    // Verificar que console.error fue llamado con el error de servicio.
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error creating player:",
      expectedError,
    );

    // Verificar que alert fue llamado para notificar al usuario.
    expect(mockAlert).toHaveBeenCalledWith(
      "Could not create player, try again.",
    );

    // Verificar que la lógica de éxito NO se ejecuta
    expect(mockCreatePlayer).not.toHaveBeenCalled();
    expect(mockSetPlayer).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();

    // Restaurar los mocks
    consoleErrorSpy.mockRestore();
    mockAlert.mockRestore();
  });
});
