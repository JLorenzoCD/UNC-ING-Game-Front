import "@testing-library/jest-dom/vitest";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useBasicGame } from "@/contexts/BasicGameContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useHttpService } from "@/contexts/HttpServiceContext";

import TimerTurn, { getTimerColor, isTimerExecuted } from "./TimerTurn";

import type { Player, GamePlayer } from "@/types/player";
import type { Match } from "@/types/match";

const {
  mockTimeOutPlayerTurn,
  mockGAME_RULES,
  MOCK_PLAYER_ID,
  MOCK_OTHER_PLAYER_ID,
  MOCK_MATCH_ID,
  MOCK_TIME_TURN,
} = vi.hoisted(() => {
  const MOCK_PLAYER_ID = crypto.randomUUID();
  const MOCK_OTHER_PLAYER_ID = crypto.randomUUID();
  const MOCK_MATCH_ID = crypto.randomUUID();
  const MOCK_TIME_TURN = 60;

  const mockTimeOutPlayerTurn = vi.fn();
  const mockGAME_RULES = {
    TIME_TURN: MOCK_TIME_TURN,
  };

  return {
    mockTimeOutPlayerTurn,
    mockGAME_RULES,
    MOCK_PLAYER_ID,
    MOCK_OTHER_PLAYER_ID,
    MOCK_MATCH_ID,
    MOCK_TIME_TURN,
  };
});

vi.mock("@/constants/game", () => ({
  GAME_RULES: mockGAME_RULES,
}));

const mockPlayer: Player = {
  id: MOCK_PLAYER_ID,
  name: "Test Player",
  avatar: "avatar.png",
  birthday: new Date("2000-01-01"),
};

const mockCurrGamePlayer: GamePlayer = {
  ...mockPlayer,
  match_id: MOCK_MATCH_ID,
  player_id: MOCK_PLAYER_ID,
  role: "INNOCENT",
  order: 1, // Current player order
};

const mockOtherGamePlayer: GamePlayer = {
  id: MOCK_OTHER_PLAYER_ID,
  name: "Other Player",
  avatar: "avatar2.png",
  birthday: new Date("2000-01-01"),
  match_id: MOCK_MATCH_ID,
  player_id: MOCK_OTHER_PLAYER_ID,
  role: "INNOCENT",
  order: 2,
};

const mockMatch: Match = {
  id: MOCK_MATCH_ID,
  min_players: 2,
  max_players: 4,
  name: "Test Match",
  status: "IN_PROGRESS",
  owner_id: crypto.randomUUID(),
  current_player_order: 1,
  timer_turn: new Date().toISOString() as any,
};

const baseuseBasicGameMock = {
  sets: [],
  messages: [],
  secrets: [],
  cards: [],
  match: mockMatch,
  players: [mockCurrGamePlayer, mockOtherGamePlayer],
  result: null,
  isLoading: false,
  hasError: false,
  error: null,
  hasFinishedAction: false,
  lastUpdatedSecretId: null,
  playerFinishActionTurn: vi.fn(),
  playerSelectsOneOfHisSecrets: {
    isCurrPlayer: false,
    isSelecting: false,
  },
  notSoFastEvent: {
    isActivate: false,
    eventId: null,
    nsfCount: 0,
    resolvedAtUtc: null,
    toastId: null,
    discardedCard: null,
  },
  clearNotSoFastEvent: vi.fn(),
  pendingResponse: {
    isPending: false,
    eventId: null,
    eventType: null,
  },
  clearPendingResponse: vi.fn(),
};

// --- Mocking Hooks ---

vi.mock("@/contexts/BasicGameContext", () => ({
  useBasicGame: vi.fn(),
}));

vi.mock("@/contexts/PlayerContext", () => ({
  usePlayer: vi.fn(),
}));

vi.mock("@/contexts/HttpServiceContext", () => ({
  useHttpService: vi.fn(),
}));

// --- Setup ---

// Usamos fake timers para controlar el tiempo, esencial para este componente.
vi.useFakeTimers();

beforeEach(() => {
  vi.clearAllMocks();
  vi.setSystemTime(new Date("2025-01-01T12:00:00.000Z")); // Tiempo inicial fijo

  // Configurar mocks base
  vi.mocked(usePlayer).mockReturnValue({
    player: mockPlayer,
    setPlayer: vi.fn(),
  });

  vi.mocked(useHttpService).mockReturnValue({
    httpService: {
      timeOutPlayerTurn: mockTimeOutPlayerTurn,
    } as any,
  });

  // El match time debe ser dinámico para simular el inicio del turno
  baseuseBasicGameMock.match = {
    ...mockMatch,
    timer_turn: new Date().toISOString() as any,
  };

  vi.mocked(useBasicGame).mockReturnValue({
    ...baseuseBasicGameMock,
    messages: [
      {
        event_type: "Turn",
        created_at: new Date().toISOString(),
        is_system_msg: true,
      },
    ] as any,
  });
});

describe("Utility Functions", () => {
  describe("getTimerColor", () => {
    const defaultColor = "bg-[#535353] border-[#313030]";

    it("should return default color when it is not current player's turn", () => {
      expect(getTimerColor(50, false)).toBe(defaultColor);
    });

    it("should return green for timer > 20 seconds", () => {
      expect(getTimerColor(21, true)).toBe("bg-[#359b21] border-[#277c16]");
      expect(getTimerColor(60, true)).toBe("bg-[#359b21] border-[#277c16]");
    });

    it("should return yellow for timer > 15 seconds", () => {
      expect(getTimerColor(16, true)).toBe("bg-[#e2c62a] border-[#978215]");
      expect(getTimerColor(20, true)).toBe("bg-[#e2c62a] border-[#978215]");
    });

    it("should return orange for timer > 10 seconds", () => {
      expect(getTimerColor(11, true)).toBe("bg-[#c08630] border-[#885b17]");
      expect(getTimerColor(15, true)).toBe("bg-[#c08630] border-[#885b17]");
    });

    it("should return red for timer <= 10 seconds", () => {
      expect(getTimerColor(10, true)).toBe("bg-[#810a0c] border-[#64090a]");
      expect(getTimerColor(0, true)).toBe("bg-[#810a0c] border-[#64090a]");
    });
  });

  describe("isTimerExecuted", () => {
    const NOW = new Date("2025-01-01T12:00:00.000Z");
    const PAST_TIME = new Date(
      NOW.getTime() - MOCK_TIME_TURN * 1000,
    ).toISOString();

    const createMsg = (type: string, date: string = NOW.toISOString()) =>
      ({ event_type: type, created_at: date, is_system_msg: true }) as any;

    const createMatch = (timerTurn: string | null) =>
      ({ timer_turn: timerTurn }) as any;

    it("should return false if there are no messages", () => {
      expect(isTimerExecuted(createMatch(NOW.toISOString()), [])).toBe(false);
    });

    it("should return false if last msg is not 'Turn'", () => {
      const messages = [createMsg("Action"), createMsg("Draw")];
      expect(isTimerExecuted(createMatch(NOW.toISOString()), messages)).toBe(
        false,
      );
    });

    it("should return true if last msg is 'Turn' and timer_turn is still running (future time)", () => {
      const messages = [createMsg("Turn", NOW.toISOString())];
      expect(isTimerExecuted(createMatch(NOW.toISOString()), messages)).toBe(
        true,
      );
    });

    it("should return false if last msg is 'Turn' but timer_turn has expired (past time)", () => {
      const messages = [createMsg("Turn", NOW.toISOString())];
      expect(isTimerExecuted(createMatch(PAST_TIME), messages)).toBe(false);
    });
  });
});

describe("TimerTurn Component", () => {
  it("should return null if match is null", () => {
    vi.mocked(useBasicGame).mockReturnValue({
      ...baseuseBasicGameMock,
      match: null,
    });

    const { container } = render(<TimerTurn />);
    expect(container.firstChild).toBeNull();
  });

  it("should return null if player is null", () => {
    vi.mocked(usePlayer).mockReturnValue({
      player: null,
      setPlayer: vi.fn(),
    });

    const { container } = render(<TimerTurn />);
    expect(container.firstChild).toBeNull();
  });

  it.only("should return null if the timer has not started (timer === -1)", () => {
    const { container } = render(<TimerTurn />);
    expect(container.firstChild).toBeNull();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(container.firstChild).not.toBeNull();
  });

  it("should correctly initialize and display the timer countdown (full time)", () => {
    render(<TimerTurn />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("59")).toBeInTheDocument();

    // Color verde ( > 20s)
    const element = screen.getByText("59");
    expect(element).toHaveClass("bg-[#359b21]");

    act(() => {
      vi.advanceTimersByTime((MOCK_TIME_TURN - 22) * 1000);
    });
    // Aun debería de ser verde
    expect(screen.getByText("21")).toBeInTheDocument();
    expect(screen.getByText("21")).toHaveClass("bg-[#359b21]");
  });

  it("should change colors correctly based on countdown time", () => {
    render(<TimerTurn />);

    // Color amarillo
    act(() => {
      vi.advanceTimersByTime((MOCK_TIME_TURN - 20) * 1000);
    });
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("20")).toHaveClass("bg-[#e2c62a]");

    // Color naranja
    act(() => {
      vi.advanceTimersByTime(5 * 1000);
    });
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("15")).toHaveClass("bg-[#c08630]");

    // Color rojo
    act(() => {
      vi.advanceTimersByTime(5 * 1000);
    });
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("10")).toHaveClass("bg-[#810a0c]");
  });

  it("should pad single digit numbers with a leading zero", () => {
    render(<TimerTurn />);

    act(() => {
      vi.advanceTimersByTime((MOCK_TIME_TURN - 5) * 1000);
    });

    // Quedan 5 segundos
    expect(screen.getByText("05")).toBeInTheDocument();
  });

  it("should call timeOutPlayerTurn when timer reaches 0", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<TimerTurn />);

    // Quedan 0 seg
    await act(async () => {
      vi.advanceTimersByTime(MOCK_TIME_TURN * 1000);
    });

    expect(screen.getByText("00")).toBeInTheDocument();

    // Se llama a la fun http para el timeout
    expect(mockTimeOutPlayerTurn).toHaveBeenCalledTimes(1);
    expect(mockTimeOutPlayerTurn).toHaveBeenCalledWith(
      MOCK_MATCH_ID,
      MOCK_PLAYER_ID,
    );

    // No se llamo mas de 2 veces
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });
    expect(mockTimeOutPlayerTurn).toHaveBeenCalledTimes(1);

    consoleErrorSpy.mockRestore();
  });

  it("should handle race condition error during timeout gracefully", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockTimeOutPlayerTurn.mockRejectedValue(new Error("Race condition error"));

    render(<TimerTurn />);

    // Quedan 0 seg
    await act(async () => {
      vi.advanceTimersByTime(MOCK_TIME_TURN * 1000);
    });

    expect(mockTimeOutPlayerTurn).toHaveBeenCalledTimes(1);
    expect(mockTimeOutPlayerTurn).toHaveBeenCalledWith(
      MOCK_MATCH_ID,
      MOCK_PLAYER_ID,
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  it("should reset timer when hasFinishedAction changes", () => {
    const { rerender, container } = render(<TimerTurn />);

    // 30 seg
    act(() => {
      vi.advanceTimersByTime(30 * 1000);
    });
    expect(screen.getByText("30")).toBeInTheDocument();

    // Sucede alguna acción
    vi.mocked(useBasicGame).mockReturnValue({
      ...baseuseBasicGameMock,
      hasFinishedAction: true,
    });

    rerender(<TimerTurn />);

    expect(screen.queryByText("30")).not.toBeInTheDocument();

    // Se avanza 1 seg mas y se ve que timer === -1, por lo que retorna null
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(container.firstChild).toBeNull();
  });

  it("should reset timer when match changes (e.g., turn change)", () => {
    const { rerender, container } = render(<TimerTurn />);

    // 30s
    act(() => {
      vi.advanceTimersByTime(30 * 1000);
    });
    expect(screen.getByText("30")).toBeInTheDocument();

    // Cambia match
    vi.mocked(useBasicGame).mockReturnValue({
      ...baseuseBasicGameMock,
      match: {
        ...mockMatch,
        current_player_order: 2, // New turn
        timer_turn: new Date().toISOString() as any,
      },
      players: [mockCurrGamePlayer, mockOtherGamePlayer],
      messages: [
        {
          event_type: "Turn",
          created_at: new Date().toISOString(),
        },
      ] as any,
    });

    rerender(<TimerTurn />);

    expect(container.firstChild).toBeNull();

    // Avanza 1 seg para que se vea que paso el turno
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("59")).toBeInTheDocument();
  });
});
