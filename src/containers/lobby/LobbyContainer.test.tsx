import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
} from "vitest";
import userEvent from "@testing-library/user-event";

import type { UUID } from "@/types/common";
import type { Player } from "@/types/player";
import type { MatchWithPlayerCount } from "@/types/match";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let LobbyContainer: any;

const {
  MOCK_MATCH_ID,
  MOCK_OWNER_ID,
  MOCK_PLAYER_ID,
  mockMatch,
  mockPlayers,
  mockUseLobbyData,
  mockStartMatch,
  mockGetMatch,
  mockGetMatchPlayers,
  mockNavigate,
  mockUseParams,
  mockUsePlayer,
  FRONTEND_PATHS,
  mockFillAndShufflePlayers,
} = vi.hoisted(() => {
  const MOCK_MATCH_ID = "match-id" as UUID;
  const MOCK_OWNER_ID = "owner-id" as UUID;
  const MOCK_PLAYER_ID = "simple-player-id" as UUID;

  const mockMatch = {
    id: MOCK_MATCH_ID,
    name: "Test Lobby",
    status: "WAITING",
    min_players: 2,
    max_players: 4,
    owner_id: MOCK_OWNER_ID,
    current_player_count: 2,
    current_player_order: 0,
  } as MatchWithPlayerCount;

  const mockPlayers = [
    { id: MOCK_OWNER_ID, name: "Owner Player" },
    { id: MOCK_PLAYER_ID, name: "Current Player" },
  ] as Player[];

  const mockUseLobbyData = vi.fn();

  const mockStartMatch = vi.fn().mockResolvedValue({ status: true });
  const mockGetMatch = vi.fn();
  const mockGetMatchPlayers = vi.fn();

  const mockNavigate = vi.fn();
  const mockUseParams = vi.fn(() => ({ matchId: MOCK_MATCH_ID }));

  const mockUsePlayer = vi.fn(() => ({
    player: { id: MOCK_PLAYER_ID, name: "Current Player" },
  }));

  const FRONTEND_PATHS = {
    MATCH_GAME: (id: string) => `/match/${id}/game`,
  };

  const mockFillAndShufflePlayers = vi.fn((players, max_players) => {
    let playersToView;
    if (players.length < max_players) {
      const emptySlotsCount = max_players - players.length;
      playersToView = [...players, ...new Array(emptySlotsCount).fill(null)];
    } else {
      playersToView = players;
    }
    return playersToView;
  });

  return {
    MOCK_MATCH_ID,
    MOCK_OWNER_ID,
    MOCK_PLAYER_ID,
    mockMatch,
    mockPlayers,
    mockUseLobbyData,
    mockStartMatch,
    mockGetMatch,
    mockGetMatchPlayers,
    mockNavigate,
    mockUseParams,
    mockUsePlayer,
    FRONTEND_PATHS,
    mockFillAndShufflePlayers,
  };
});

// --- Mocks de módulos ---
vi.mock("./useLobbyData", () => ({
  useLobbyData: mockUseLobbyData,
}));

vi.mock("@/contexts/HttpServiceContext", () => ({
  useHttpService: vi.fn(() => ({
    httpService: {
      getMatch: mockGetMatch,
      getMatchPlayers: mockGetMatchPlayers,
      startMatch: mockStartMatch,
    },
  })),
}));

vi.mock("react-router", async (importOriginal) => {
  const mod = await importOriginal<typeof import("react-router")>();
  return {
    ...mod,
    useNavigate: () => mockNavigate,
    useParams: mockUseParams,
  };
});

vi.mock("@/contexts/PlayerContext", () => ({
  usePlayer: mockUsePlayer,
}));

vi.mock("@/utils", () => ({
  isUUID: vi.fn().mockReturnValue(true),
}));

vi.mock("@/constants/frontend", () => ({
  FRONTEND_PATHS,
}));

vi.mock("./components/LobbyLayout", () => ({
  default: vi.fn(({ children, isOwner, match, startGame }) => (
    <div
      data-testid="mock-lobby-layout"
      data-isowner={isOwner}
      data-match-name={match.name}
    >
      {isOwner && (
        <button data-testid="start-game-button" onClick={startGame}>
          Start Game
        </button>
      )}
      <div data-testid="player-list">{children}</div>
    </div>
  )),
}));

vi.mock("./components/PlayerCard", () => ({
  default: vi.fn(({ player, isOwner, isMe }) => (
    <div
      data-testid={`player-card-${player.id}`}
      data-isowner={isOwner}
      data-isme={isMe}
    >
      {player.name}
    </div>
  )),
  EmptyPlayerPosition: vi.fn(() => (
    <div data-testid="empty-position">Empty Slot</div>
  )),
}));

vi.mock("./utils", () => ({
  fillAndShufflePlayers: mockFillAndShufflePlayers,
}));

// --- Estado base de lobby ---
const defaultLobbyState = {
  match: mockMatch,
  players: mockPlayers,
  loading: false,
  error: false,
};

describe("LobbyContainer", () => {
  const originalAlert = window.alert;

  beforeAll(async () => {
    const module = await import("./LobbyContainer");
    LobbyContainer = module.default;
  });

  beforeEach(() => {
    vi.clearAllMocks();

    window.alert = vi.fn();

    mockUseLobbyData.mockReturnValue(defaultLobbyState);
    mockStartMatch.mockResolvedValue({ status: true });
    mockUsePlayer.mockReturnValue({
      player: { id: MOCK_PLAYER_ID, name: "Current Player" },
    });
    mockUseParams.mockReturnValue({ matchId: MOCK_MATCH_ID });
  });

  afterEach(() => {
    window.alert = originalAlert;
  });

  it("should render loading state when useLobbyData is loading", () => {
    mockUseLobbyData.mockReturnValue({
      ...defaultLobbyState,
      loading: true,
      match: null,
      players: [],
    });

    render(<LobbyContainer />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should render error state when useLobbyData has an error", () => {
    mockUseLobbyData.mockReturnValue({
      ...defaultLobbyState,
      error: true,
      match: null,
    });

    render(<LobbyContainer />);
    expect(screen.getByText("Fatal error!!")).toBeInTheDocument();
  });

  it("should render the lobby correctly with players and empty slots", async () => {
    render(<LobbyContainer />);

    const layout = screen.getByTestId("mock-lobby-layout");
    expect(layout).toHaveAttribute("data-match-name", mockMatch.name);

    expect(mockFillAndShufflePlayers).toHaveBeenCalledWith(
      mockPlayers,
      mockMatch.max_players,
    );

    expect(screen.getByText("Owner Player")).toBeInTheDocument();
    expect(screen.getByText("Current Player")).toBeInTheDocument();
    expect(screen.getAllByTestId("empty-position").length).toBe(2);

    const ownerCard = screen.getByTestId(`player-card-${MOCK_OWNER_ID}`);
    expect(ownerCard).toHaveAttribute("data-isowner", "true");
    expect(ownerCard).toHaveAttribute("data-isme", "false");

    const myCard = screen.getByTestId(`player-card-${MOCK_PLAYER_ID}`);
    expect(myCard).toHaveAttribute("data-isowner", "false");
    expect(myCard).toHaveAttribute("data-isme", "true");
  });

  it("should allow the match owner to start the game and navigate", async () => {
    mockUsePlayer.mockReturnValue({
      player: { id: MOCK_OWNER_ID, name: "Owner Player" },
    });

    render(<LobbyContainer />);
    const startGameButton = screen.getByTestId("start-game-button");
    expect(startGameButton).toBeInTheDocument();

    await act(async () => {
      await userEvent.click(startGameButton);
    });

    expect(mockStartMatch).toHaveBeenCalledWith(MOCK_MATCH_ID);
    expect(mockNavigate).toHaveBeenCalledWith(
      FRONTEND_PATHS.MATCH_GAME(MOCK_MATCH_ID),
    );
  });

  it("should not allow the owner to start the game if min_players condition is not met", async () => {
    mockUsePlayer.mockReturnValue({
      player: { id: MOCK_OWNER_ID, name: "Owner Player" },
    });
    mockUseLobbyData.mockReturnValue({
      ...defaultLobbyState,
      match: { ...mockMatch, min_players: 3, current_player_count: 2 },
    });

    render(<LobbyContainer />);
    const startGameButton = screen.getByTestId("start-game-button");

    await act(async () => {
      await userEvent.click(startGameButton);
    });

    expect(mockStartMatch).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should show an alert if startMatch fails", async () => {
    const mockConsoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockUsePlayer.mockReturnValue({
      player: { id: MOCK_OWNER_ID, name: "Owner Player" },
    });
    mockStartMatch.mockRejectedValue(new Error("API Error"));

    render(<LobbyContainer />);
    const startGameButton = screen.getByTestId("start-game-button");

    await act(async () => {
      await userEvent.click(startGameButton);
    });

    expect(mockStartMatch).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith("The game could not be started.");
    expect(mockNavigate).not.toHaveBeenCalled();

    mockConsoleError.mockRestore();
  });
});
