import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import type { UUID } from "@/types/common";
import type { MatchWithPlayerCount } from "@/types/match";

import LobbyLayout from "./LobbyLayout";

// --- Mocks de componentes y recursos ---

// Mock del componente Container (se asume que está bien y con tests)
vi.mock("@/components/Container", () => ({
  default: vi.fn(({ children, ...props }) => (
    <div data-testid="mock-container" {...props}>
      {children}
    </div>
  )),
}));

// Mock del componente Button (se asume que está bien y con tests)
vi.mock("@/components/Button", () => ({
  default: vi.fn(({ children, ...props }) => (
    <button data-testid="mock-button" {...props}>
      {children}
    </button>
  )),
}));

vi.mock("@/assets/logo.png", () => ({
  default: "mock-logo.png",
}));

// Mock de la imagen de fondo
vi.mock("src/assets/fondopartida.jpeg", () => ({
  default: "mock-background.jpeg",
}));

// --- Datos de prueba ---

const mockMatch: MatchWithPlayerCount = {
  id: "mock-match-id" as UUID,
  name: "The Best Lobby",
  min_players: 4,
  max_players: 6,
  status: "WAITING",
  owner_id: "mock-owner-id" as UUID,
  current_player_order: 0,
  current_player_count: 1,
  timer_turn: new Date(),
  is_private: false,
};
const mockMatchNotEnoughPlayers: MatchWithPlayerCount = {
  ...mockMatch,
  min_players: 4,
  max_players: 6,
  current_player_count: 2,
};

const mockMatchEnoughPlayers: MatchWithPlayerCount = {
  ...mockMatch,
  min_players: 4,
  max_players: 6,
  current_player_count: 6,
};

// Un componente hijo simple para testear que se renderiza
const MockChildComponent = () => (
  <div data-testid="mock-child">Mocked Content</div>
);

describe("LobbyLayout", () => {
  const startGameMock = vi.fn();

  const consoleErrorMock = vi
    .spyOn(console, "error")
    .mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    consoleErrorMock.mockClear();
  });

  it("should render the layout with header, main content, and children", () => {
    render(
      <LobbyLayout match={mockMatch} startGame={startGameMock} isOwner={false}>
        <MockChildComponent />
      </LobbyLayout>,
    );

    // 1. Verificar el logo
    const logoImage = screen.getByAltText(
      "AGATHA CHRISTIE'S - DEATH ON THE CARDS",
    );
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute("src", "mock-logo.png");

    // 2. Verificar el título del lobby con datos del match
    const h1Title = screen.getByRole("heading", { level: 1 });
    expect(h1Title).toBeInTheDocument();
    expect(h1Title).toHaveTextContent(`"${mockMatch.name}"`);

    // 3. Verificar el contenido hijo
    expect(screen.getByTestId("mock-child")).toBeInTheDocument();
  });

  it("should render the correct player status (🟢 or 🟡) and the current players count", () => {
    const matchWithInsufficientPlayers: MatchWithPlayerCount = {
      ...mockMatch,
      min_players: 4,
      max_players: 6,
      current_player_count: 2,
    };
    render(
      <LobbyLayout
        match={matchWithInsufficientPlayers}
        startGame={startGameMock}
        isOwner={false}
      >
        <MockChildComponent />
      </LobbyLayout>,
    );
    expect(screen.getByText(/🟡 2/)).toBeInTheDocument();

    const matchWithEnoughPlayers: MatchWithPlayerCount = {
      ...mockMatch,
      min_players: 2,
      max_players: 6,
      current_player_count: 4,
    };
    render(
      <LobbyLayout
        match={matchWithEnoughPlayers}
        startGame={startGameMock}
        isOwner={false}
      >
        <MockChildComponent />
      </LobbyLayout>,
    );
    expect(screen.getByText(/🟢 4/)).toBeInTheDocument();
  });

  it('should NOT render the "Start game" button when the user is not the owner', () => {
    render(
      <LobbyLayout match={mockMatch} startGame={startGameMock} isOwner={false}>
        <MockChildComponent />
      </LobbyLayout>,
    );

    // El botón no debe estar en el documento
    expect(
      screen.queryByRole("button", { name: /start game/i }),
    ).not.toBeInTheDocument();
  });

  it("should be disabled the 'Start game' if there are not enough players.", () => {
    render(
      <LobbyLayout
        match={mockMatchNotEnoughPlayers}
        startGame={startGameMock}
        isOwner={true}
      >
        <MockChildComponent />
      </LobbyLayout>,
    );

    // El botón debe estar en el documento
    const startButtonDisabled = screen.getByRole("button", {
      name: /start game/i,
    });
    expect(startButtonDisabled).toBeInTheDocument();
    expect(startButtonDisabled).toBeDisabled();
    expect(startButtonDisabled).toHaveTextContent("Start game");
  });

  it("should be not disabled the 'Start game' if there are enough players.", () => {
    render(
      <LobbyLayout
        match={mockMatchEnoughPlayers}
        startGame={startGameMock}
        isOwner={true}
      >
        <MockChildComponent />
      </LobbyLayout>,
    );

    // El botón debe estar en el documento
    const startButtonNotDisabled = screen.getByRole("button", {
      name: /start game/i,
    });
    expect(startButtonNotDisabled).toBeInTheDocument();
    expect(startButtonNotDisabled).not.toBeDisabled();
    expect(startButtonNotDisabled).toHaveTextContent("Start game");
  });

  it('should render the "Start game" button when the user is the owner', () => {
    render(
      <LobbyLayout match={mockMatch} startGame={startGameMock} isOwner={true}>
        <MockChildComponent />
      </LobbyLayout>,
    );

    // El botón debe estar en el documento
    const startButton = screen.getByRole("button", { name: /start game/i });
    expect(startButton).toBeInTheDocument();
    expect(startButton).toHaveTextContent("Start game");
  });

  it('should call startGame when the owner clicks the "Start game" button and handle success', async () => {
    startGameMock.mockResolvedValue(true);

    render(
      <LobbyLayout
        match={mockMatchEnoughPlayers}
        startGame={startGameMock}
        isOwner={true}
      >
        <MockChildComponent />
      </LobbyLayout>,
    );

    const startButton = screen.getByRole("button", { name: /start game/i });

    fireEvent.click(startButton);

    await waitFor(() => {
      expect(startGameMock).toHaveBeenCalledTimes(1);
    });

    expect(consoleErrorMock).not.toHaveBeenCalled();
  });
});
