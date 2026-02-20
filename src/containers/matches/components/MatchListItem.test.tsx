import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, afterAll, beforeEach } from "vitest";

import type { UUID } from "@/types/common";
import type { MatchWithPlayerCount } from "@/types/match";

import MatchListItem from "./MatchListItem";

const { mockUsePlayer, mockToastSuccess, mockToastError, mockToastInfo } =
  vi.hoisted(() => {
    const mockUsePlayer = vi.fn();
    const mockToastSuccess = vi.fn();
    const mockToastError = vi.fn();
    const mockToastInfo = vi.fn();

    return {
      mockUsePlayer,
      mockToastSuccess,
      mockToastError,
      mockToastInfo,
    };
  });

vi.mock("sonner", () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
    info: mockToastInfo,
  },
}));

// Mock de isValidMatch
const isValidMatch = vi.fn();

vi.mock("utils", () => ({
  isValidMatch,
}));

// Mock de useNavigate para evitar errores de contexto
const mockNavigate = vi.fn();

vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/constants/frontend", () => ({
  FRONTEND_PATHS: {
    MATCH_LOBBY: (mockJoinedMatchId: UUID) =>
      `/match/${mockJoinedMatchId}/lobby`,
  },
}));

// Mock de usePlayer
const mockPlayerId = "playerId" as UUID;
vi.mock("@/contexts/PlayerContext", () => ({
  usePlayer: mockUsePlayer,
}));

// Mock joinMatch prop
const joinMatch = vi.fn();

describe("MatchListItem", () => {
  const mockMatch: MatchWithPlayerCount = {
    id: crypto.randomUUID() as UUID,
    name: "Test 1",
    min_players: 2,
    max_players: 5,
    status: "WAITING",
    current_player_count: 3,
    owner_id: crypto.randomUUID() as UUID,
    current_player_order: 0,
    timer_turn: null,
    is_private: false,
  };

  const longNameMatch: MatchWithPlayerCount = {
    id: crypto.randomUUID() as UUID,
    name: "This is a match name that is way too long to be fully visible",
    min_players: 4,
    max_players: 6,
    current_player_count: 5,
    status: "WAITING",
    owner_id: crypto.randomUUID() as UUID,
    current_player_order: 0,
    timer_turn: null,
    is_private: false,
  };

  const mockInvalidMatch: MatchWithPlayerCount = {
    id: crypto.randomUUID() as UUID,
    name: "Invalid Match",
    min_players: 1,
    max_players: 10,
    status: "IN_PROGRESS",
    current_player_count: 100,
    owner_id: crypto.randomUUID() as UUID,
    current_player_order: 0,
    timer_turn: new Date(),
    is_private: false,
  };

  // Configuración para simular la alerta y evitar que aparezca en el test.
  const mockAlert = vi.spyOn(window, "alert").mockImplementation(() => {});

  beforeEach(() => {
    isValidMatch.mockReturnValue(true);
    mockUsePlayer.mockReturnValue({ player: { id: mockPlayerId } });

    vi.clearAllMocks();
  });

  afterAll(() => {
    mockAlert.mockRestore();
  });

  it("should render the match correctly", () => {
    // Match valido
    isValidMatch.mockReturnValue(true);

    render(<MatchListItem match={mockMatch} joinMatch={joinMatch} />);

    // Esta el nombre de la partida
    expect(screen.getByText(mockMatch.name)).toBeInTheDocument();

    // Comprobar que los jugadores se muestran correctamente
    expect(
      screen.getByText(`${mockMatch.min_players}/${mockMatch.max_players}`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`🟢 ${mockMatch.current_player_count}`),
    ).toBeInTheDocument();

    // Comprobar que el botón Join está presente
    const joinButton = screen.getByRole("button", { name: /join/i });
    expect(joinButton).toBeInTheDocument();
    expect(joinButton).not.toBeDisabled();
    expect(joinButton).toHaveTextContent("Join");
  });

  it("should not render anything if the match is invalid", () => {
    // Match invalido
    isValidMatch.mockReturnValue(false);

    const { container } = render(
      <MatchListItem match={mockInvalidMatch} joinMatch={joinMatch} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should truncate name if it exceeds 35 characters", () => {
    // Match valido
    isValidMatch.mockReturnValue(true);

    render(<MatchListItem match={longNameMatch} joinMatch={joinMatch} />);

    // Verificamos que el nombre está truncado
    expect(
      screen.getByText(longNameMatch.name.substring(0, 32) + "..."),
    ).toBeInTheDocument();
  });

  it("should render the correct player status (🟢 or 🟡)", () => {
    // Matches valido
    isValidMatch.mockReturnValue(true);

    const matchWithEnoughPlayers: MatchWithPlayerCount = {
      id: crypto.randomUUID() as UUID,
      name: "Full Match",
      min_players: 2,
      max_players: 5,
      current_player_count: 3,
      status: "WAITING",
      owner_id: crypto.randomUUID() as UUID,
      current_player_order: 0,
      timer_turn: null,
      is_private: false,
    };

    render(
      <MatchListItem match={matchWithEnoughPlayers} joinMatch={joinMatch} />,
    );
    expect(screen.getByText("🟢 3")).toBeInTheDocument();

    const matchWithInsufficientPlayers: MatchWithPlayerCount = {
      id: crypto.randomUUID() as UUID,
      name: "Not enough players",
      min_players: 5,
      max_players: 5,
      current_player_count: 1,
      status: "WAITING",
      owner_id: crypto.randomUUID() as UUID,
      current_player_order: 0,
      timer_turn: null,
      is_private: false,
    };

    render(
      <MatchListItem
        match={matchWithInsufficientPlayers}
        joinMatch={joinMatch}
      />,
    );
    expect(screen.getByText("🟡 1")).toBeInTheDocument();
  });

  describe("joining a match", () => {
    it("should call joinMatch with correct arguments when 'Join' button is clicked", async () => {
      const mockMatchId = mockMatch.id;

      joinMatch.mockResolvedValue({ match_id: mockMatchId });

      render(<MatchListItem match={mockMatch} joinMatch={joinMatch} />);

      const joinButton = screen.getByRole("button", { name: /join/i });

      fireEvent.click(joinButton);

      await waitFor(() => {
        expect(joinMatch).toHaveBeenCalledTimes(1);
        expect(joinMatch).toHaveBeenCalledWith(mockPlayerId, mockMatchId, null);
      });
    });

    it("should alert success and navigate to lobby on successful join", async () => {
      const mockJoinedMatchId = crypto.randomUUID() as UUID;

      joinMatch.mockResolvedValue({ match_id: mockJoinedMatchId });

      render(<MatchListItem match={mockMatch} joinMatch={joinMatch} />);

      const joinButton = screen.getByRole("button", { name: /join/i });

      fireEvent.click(joinButton);

      await waitFor(() => {
        // 1. Verificar el toast de éxito
        expect(mockToastInfo).toHaveBeenCalledWith(
          "You successfully joined the match.",
        );
        // 2. Verificar la navegación
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(
          `/match/${mockJoinedMatchId}/lobby`,
        );
      });
    });

    it("should alert failure if joinMatch resolves to null/undefined (res is falsy)", async () => {
      // Mock para simular que la unión no fue posible o falló, devolviendo un valor falsy.
      joinMatch.mockResolvedValue(null);

      render(<MatchListItem match={mockMatch} joinMatch={joinMatch} />);

      const joinButton = screen.getByRole("button", { name: /join/i });

      fireEvent.click(joinButton);

      await waitFor(() => {
        // 1. Verificar la alerta de fallo
        expect(mockToastError).toHaveBeenCalledWith(
          "Couldn't join the match, try another one.",
        );
        // 2. Verificar que NO haya navegación
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it("should alert error on joinMatch rejection (catch block)", async () => {
      const mockError = new Error("Network error or server issue");
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {}); // Mock para silenciar console.error

      // Mock para simular un error en la promesa (bloque catch)
      joinMatch.mockRejectedValue(mockError);

      render(<MatchListItem match={mockMatch} joinMatch={joinMatch} />);

      const joinButton = screen.getByRole("button", { name: /join/i });

      fireEvent.click(joinButton);

      await waitFor(() => {
        // 1. Verificar que se llame a console.error
        expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);

        // 2. Verificar la alerta de error
        expect(mockToastError).toHaveBeenCalledWith(
          `There was a problem joining game "${mockMatch.name}", please try again later.`,
        );

        // 3. Verificar que NO haya navegación
        expect(mockNavigate).not.toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore(); // Restaurar el mock de console.error
    });

    it("should alert and not join when there is no player", async () => {
      // Mock de usePlayer devolviendo player nulo
      mockUsePlayer.mockReturnValue({ player: null });

      const mockAlert = vi.spyOn(window, "alert").mockImplementation(() => {});

      isValidMatch.mockReturnValue(true);

      render(<MatchListItem match={mockMatch} joinMatch={joinMatch} />);

      const joinButton = screen.getByRole("button", { name: /join/i });

      fireEvent.click(joinButton);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "You must create a player before joining a match.",
        );
        expect(joinMatch).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
      });

      mockAlert.mockRestore();
    });
  });
});
