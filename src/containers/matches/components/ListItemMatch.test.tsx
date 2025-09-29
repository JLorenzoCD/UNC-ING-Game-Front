import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, afterAll, beforeEach } from "vitest";

import type { UUID } from "@/types/common";
import type { MatchListItem } from "@/types/match";

import ListItemMatch from "./ListItemMatch";

// Mock de isValidMatch
const isValidMatch = vi.fn();
vi.mock("../utils", () => ({
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
      `/match-lobby/${mockJoinedMatchId}`,
  },
}));

// Mock de usePlayer
const mockPlayerId = "playerId" as UUID;
vi.mock("@/contexts/PlayerContext", () => ({
  usePlayer: () => ({ player: { id: mockPlayerId } }),
}));

// Mock joinMatch prop
const joinMatch = vi.fn();

describe("ListItemMatch", () => {
  const mockMatch: MatchListItem = {
    id: crypto.randomUUID() as UUID,
    name: "Test 1",
    min_players: 2,
    max_players: 5,
    status: "WAITING",
    current_player_count: 3,
    owner_id: crypto.randomUUID() as UUID,
    current_player_order: 0,
  };

  const longNameMatch: MatchListItem = {
    id: crypto.randomUUID() as UUID,
    name: "This is a match name that is way too long to be fully visible",
    min_players: 4,
    max_players: 6,
    current_player_count: 5,
    status: "WAITING",
    owner_id: crypto.randomUUID() as UUID,
    current_player_order: 0,
  };

  const mockInvalidMatch: MatchListItem = {
    id: crypto.randomUUID() as UUID,
    name: "Invalid Match",
    min_players: 1,
    max_players: 10,
    status: "IN_PROGRESS",
    current_player_count: 100,
    owner_id: crypto.randomUUID() as UUID,
    current_player_order: 0,
  };

  it("should render the match correctly", () => {
    // Match valido
    isValidMatch.mockReturnValue(true);

    render(<ListItemMatch match={mockMatch} joinMatch={joinMatch} />);

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
      <ListItemMatch match={mockInvalidMatch} joinMatch={joinMatch} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should truncate name if it exceeds 35 characters", () => {
    // Match valido
    isValidMatch.mockReturnValue(true);

    render(<ListItemMatch match={longNameMatch} joinMatch={joinMatch} />);

    // Verificamos que el nombre está truncado
    expect(
      screen.getByText(longNameMatch.name.substring(0, 32) + "..."),
    ).toBeInTheDocument();
  });

  it("should render the correct player status (🟢 or 🟡)", () => {
    // Matches valido
    isValidMatch.mockReturnValue(true);

    const matchWithEnoughPlayers: MatchListItem = {
      id: crypto.randomUUID() as UUID,
      name: "Full Match",
      min_players: 2,
      max_players: 5,
      current_player_count: 3,
      status: "WAITING",
      owner_id: crypto.randomUUID() as UUID,
      current_player_order: 0,
    };

    render(
      <ListItemMatch match={matchWithEnoughPlayers} joinMatch={joinMatch} />,
    );
    expect(screen.getByText("🟢 3")).toBeInTheDocument();

    const matchWithInsufficientPlayers: MatchListItem = {
      id: crypto.randomUUID() as UUID,
      name: "Not enough players",
      min_players: 5,
      max_players: 5,
      current_player_count: 1,
      status: "WAITING",
      owner_id: crypto.randomUUID() as UUID,
      current_player_order: 0,
    };

    render(
      <ListItemMatch
        match={matchWithInsufficientPlayers}
        joinMatch={joinMatch}
      />,
    );
    expect(screen.getByText("🟡 1")).toBeInTheDocument();
  });

  describe("joining a match", () => {
    // Configuración para simular la alerta y evitar que aparezca en el test.
    const mockAlert = vi.spyOn(window, "alert").mockImplementation(() => {});

    beforeEach(() => {
      isValidMatch.mockReturnValue(true);
      vi.clearAllMocks();
    });

    afterAll(() => {
      mockAlert.mockRestore();
    });

    it("should call joinMatch with correct arguments when 'Join' button is clicked", async () => {
      const mockMatchId = mockMatch.id;

      joinMatch.mockResolvedValue({ match_id: mockMatchId });

      render(<ListItemMatch match={mockMatch} joinMatch={joinMatch} />);

      const joinButton = screen.getByRole("button", { name: /join/i });

      fireEvent.click(joinButton);

      await waitFor(() => {
        expect(joinMatch).toHaveBeenCalledTimes(1);
        expect(joinMatch).toHaveBeenCalledWith(mockPlayerId, mockMatchId);
      });
    });

    it("should alert success and navigate to lobby on successful join", async () => {
      const mockJoinedMatchId = "new-match-id-123" as UUID;

      joinMatch.mockResolvedValue({ match_id: mockJoinedMatchId });

      render(<ListItemMatch match={mockMatch} joinMatch={joinMatch} />);

      const joinButton = screen.getByRole("button", { name: /join/i });

      fireEvent.click(joinButton);

      await waitFor(() => {
        // 1. Verificar la alerta de éxito
        expect(mockAlert).toHaveBeenCalledWith(
          "You successfully joined the match.",
        );
        // 2. Verificar la navegación
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(
          `/match-lobby/${mockJoinedMatchId}`,
        );
      });
    });

    it("should alert failure if joinMatch resolves to null/undefined (res is falsy)", async () => {
      // Mock para simular que la unión no fue posible o falló, devolviendo un valor falsy.
      joinMatch.mockResolvedValue(null);

      render(<ListItemMatch match={mockMatch} joinMatch={joinMatch} />);

      const joinButton = screen.getByRole("button", { name: /join/i });

      fireEvent.click(joinButton);

      await waitFor(() => {
        // 1. Verificar la alerta de fallo
        expect(mockAlert).toHaveBeenCalledWith(
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

      render(<ListItemMatch match={mockMatch} joinMatch={joinMatch} />);

      const joinButton = screen.getByRole("button", { name: /join/i });

      fireEvent.click(joinButton);

      await waitFor(() => {
        // 1. Verificar que se llame a console.error
        expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);

        // 2. Verificar la alerta de error
        expect(mockAlert).toHaveBeenCalledWith(
          `There was a problem joining game "${mockMatch.name}", please try again later.`,
        );

        // 3. Verificar que NO haya navegación
        expect(mockNavigate).not.toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore(); // Restaurar el mock de console.error
    });
  });
});
