import "@testing-library/jest-dom";
import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { toast } from "sonner";

import { useSetEvent } from "./useSetEvent";

import type { UUID } from "@/types/common";
import type { GameCard } from "@/types/card";
import type { GamePlayer } from "@/types/player";
import type { GameSecret } from "@/types/secret";

const {
  MOCK_PLAYER_ID,
  MOCK_MATCH_ID,
  MOCK_SECRET_ID,
  mockGamePlayer,
  mockSecret,
  mockRevealedSecret,
  mockCurrentPlayerSecret,
  mockGameCards,
  mockUseParams,
  mockUsePlayer,
  mockUseGame,
  defaultMockUseGame,
  mockCreateAndPlaySet,
  mockPutSecret,
  mockHttpService,
  isCardsValidSet,
  cardsToSetTypeDetective,
  isSetTargetOneSecret,
  isSetActionRevealSecret,
  isSetActionStolenSecret,
  cardsToSet,
} = vi.hoisted(() => {
  // Mocks de Datos
  const MOCK_PLAYER_ID = "p-owner-1" as UUID;
  const MOCK_OTHER_PLAYER_ID = "p-other-2" as UUID;
  const MOCK_MATCH_ID = "m-match-01" as UUID;
  const MOCK_SECRET_ID = "s-secret-01" as UUID;
  const MOCK_CARD_ID_1 = "c-card-01" as UUID;

  const mockPlayer = { id: MOCK_PLAYER_ID, name: "Current Player" };
  const mockGamePlayer: GamePlayer = {
    id: MOCK_OTHER_PLAYER_ID,
    player_id: MOCK_OTHER_PLAYER_ID,
    name: "Other Player",
    avatar: "avatar.png",
    role: "INNOCENT",
    order: 2,
    match_id: MOCK_MATCH_ID,
    birthday: new Date(),
  };
  const mockCurrentGamePlayer: GamePlayer = {
    ...mockGamePlayer,
    id: MOCK_PLAYER_ID,
    player_id: MOCK_PLAYER_ID,
    name: mockPlayer.name,
    order: 1,
  };

  const mockSecret: GameSecret = {
    id: MOCK_SECRET_ID as UUID,
    secret_id: "sec-type-01" as UUID,
    player_id: MOCK_OTHER_PLAYER_ID,
    is_revealed: false,
    content: "Secret Content",
    match_id: MOCK_MATCH_ID as UUID,
    type: "INNOCENT",
  };
  const mockRevealedSecret: GameSecret = { ...mockSecret, is_revealed: true };
  const mockCurrentPlayerSecret: GameSecret = {
    ...mockSecret,
    player_id: MOCK_PLAYER_ID,
  };

  const mockGameCards: GameCard[] = [
    {
      id: MOCK_CARD_ID_1,
      name: "HERCULE POIROT",
      player_id: MOCK_PLAYER_ID,
      type: "DETECTIVE",
      card_id: MOCK_CARD_ID_1,
      match_id: MOCK_MATCH_ID,
      description: "test",
      is_discarded: false,
      discarded_at: null,
    },
  ];

  const mockUseParams = vi.fn(() => ({ matchId: MOCK_MATCH_ID }));
  const mockUsePlayer = vi.fn(() => ({ player: mockPlayer }));

  // Mocks de Servicios
  const mockCreateAndPlaySet = vi.fn(() => undefined);
  const mockPutSecret = vi.fn(() => undefined);
  const mockHttpService = {
    createAndPlaySet: mockCreateAndPlaySet,
    putSecret: mockPutSecret,
  };

  const defaultMockUseGame: {
    secrets: GameSecret[];
    players: GamePlayer[];
    playerSelectsOneOfHisSecrets: {
      isCurrPlayer: boolean;
      isSelecting: boolean;
    };
    lastUpdatedSecretId: UUID | null; // Definimos explícitamente el tipo permitido
  } = {
    secrets: [mockSecret, mockCurrentPlayerSecret],
    players: [mockCurrentGamePlayer, mockGamePlayer],
    playerSelectsOneOfHisSecrets: { isCurrPlayer: false, isSelecting: false },
    lastUpdatedSecretId: null,
  };
  const mockUseGame = vi.fn(() => ({ ...defaultMockUseGame }));

  // Mocks para funciones de utilidad
  const isCardsValidSet = vi.fn(() => false);
  const cardsToSetTypeDetective = vi.fn(() => "HERCULE POIROT");
  const isSetTargetOneSecret = vi.fn(() => true);
  const isSetActionRevealSecret = vi.fn(() => true);
  const isSetActionStolenSecret = vi.fn(() => false);
  const cardsToSet = vi.fn();

  return {
    MOCK_PLAYER_ID,
    MOCK_OTHER_PLAYER_ID,
    MOCK_MATCH_ID,
    MOCK_SECRET_ID,
    MOCK_CARD_ID_1,
    mockGamePlayer,
    mockCurrentGamePlayer,
    mockSecret,
    mockRevealedSecret,
    mockCurrentPlayerSecret,
    mockGameCards,
    mockUseParams,
    mockUsePlayer,
    mockUseGame,
    defaultMockUseGame,
    mockCreateAndPlaySet,
    mockPutSecret,
    mockHttpService,
    isCardsValidSet,
    cardsToSetTypeDetective,
    isSetTargetOneSecret,
    isSetActionRevealSecret,
    isSetActionStolenSecret,
    cardsToSet,
  };
});

// Mocks de funciones de utilidad
vi.mock("../utils/setEvent", () => ({
  cardsToSet: cardsToSet,
  cardsToSetTypeDetective: cardsToSetTypeDetective,
  isCardsValidSet: isCardsValidSet,
  isSetActionRevealSecret: isSetActionRevealSecret,
  isSetActionStolenSecret: isSetActionStolenSecret,
  isSetTargetOneSecret: isSetTargetOneSecret,
}));

// Mocks de Hooks de Contexto y Router
vi.mock("react-router", () => ({ useParams: mockUseParams }));
vi.mock("@/contexts/GameContext", () => ({ useGame: mockUseGame }));
vi.mock("@/contexts/PlayerContext", () => ({ usePlayer: mockUsePlayer }));
vi.mock("@/contexts/HttpServiceContext", () => ({
  useHttpService: vi.fn(() => ({ httpService: mockHttpService })),
}));
vi.mock("sonner", () => {
  const mockToast = {
    warning: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    custom: vi.fn(),
  };

  const mainToastFunction = vi.fn();
  Object.assign(mainToastFunction, mockToast);

  return {
    toast: mainToastFunction,
  };
});

describe("useSetEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseGame.mockReturnValue({ ...defaultMockUseGame });
  });

  afterEach(() => {
    vi.restoreAllMocks();

    isCardsValidSet.mockClear();
    cardsToSetTypeDetective.mockClear();
    isSetTargetOneSecret.mockClear();
    isSetActionRevealSecret.mockClear();
    isSetActionStolenSecret.mockClear();
    cardsToSet.mockClear();
  });

  describe("Initialization & State Transitions", () => {
    it("should initialize to default state and disable button", () => {
      const { result } = renderHook(() => useSetEvent());

      expect(result.current.isSetEvent).toBe(false);
      expect(result.current.isSetEventButtonDisabled).toBe(true);
      expect(result.current.setEvent.cards).toEqual([]);
    });

    it("should transition to TargetPlayer state when playing a player-target set", () => {
      isCardsValidSet.mockReturnValue(true);
      isSetTargetOneSecret.mockReturnValue(false); // Target Player
      isSetActionRevealSecret.mockReturnValue(true); // Para que pase la validación de toggle

      const { result } = renderHook(() => useSetEvent());

      // Habilitar el botón (establecer isValidSet = true)
      act(() => {
        result.current.setEventToggleDisableButtonPlaySet(mockGameCards);
      });
      expect(result.current.setEvent.isValidSet).toBe(true);

      // Ejecutar playSet
      act(() => {
        result.current.playSet(mockGameCards);
      });

      expect(result.current.isSetEvent).toBe(true);
      expect(result.current.setEvent.isTargetPlayer).toBe(true);
      expect(result.current.setEvent.isTargetSecret).toBe(false);
      expect(result.current.setEvent.isValidSet).toBe(false); // Botón deshabilitado durante evento
    });

    it("should transition to TargetSecret state when playing a secret-target set", () => {
      isCardsValidSet.mockReturnValue(true);
      isSetTargetOneSecret.mockReturnValue(true); // Target Secret
      isSetActionRevealSecret.mockReturnValue(true); // Para que pase la validación de toggle

      const { result } = renderHook(() => useSetEvent());

      // Habilitar el botón
      act(() => {
        result.current.setEventToggleDisableButtonPlaySet(mockGameCards);
      });
      expect(result.current.setEvent.isValidSet).toBe(true);

      // Ejecutar playSet
      act(() => {
        result.current.playSet(mockGameCards);
      });

      expect(result.current.isSetEvent).toBe(true);
      expect(result.current.setEvent.isTargetSecret).toBe(true);
      expect(result.current.setEvent.isTargetPlayer).toBe(false);
      expect(result.current.setEvent.isValidSet).toBe(false);
    });
  });

  describe("Validation (Toggle Play Set Button)", () => {
    it("should set isValidSet to true if valid cards and action conditions met", () => {
      isCardsValidSet.mockReturnValue(true);
      isSetActionRevealSecret.mockReturnValue(true); // Por defecto, hay secretos no revelados

      const { result } = renderHook(() => useSetEvent());
      act(() => {
        result.current.setEventToggleDisableButtonPlaySet(mockGameCards);
      });

      expect(result.current.setEvent.isValidSet).toBe(true);
      expect(toast.warning).not.toHaveBeenCalled();
    });

    it("should disable button and show warning if 'Reveal' set played but no secrets to reveal", () => {
      isCardsValidSet.mockReturnValue(true);
      isSetActionRevealSecret.mockReturnValue(true);
      mockUseGame.mockReturnValue({
        ...defaultMockUseGame,
        secrets: [
          mockRevealedSecret,
          { ...mockCurrentPlayerSecret, is_revealed: true },
        ], // Todos revelados
      });

      const { result } = renderHook(() => useSetEvent());
      act(() => {
        result.current.setEventToggleDisableButtonPlaySet(mockGameCards);
      });

      expect(result.current.setEvent.isValidSet).toBe(false);
      expect(toast.warning).toHaveBeenCalledOnce();
    });
  });

  describe("Target Selection (setTargetSet)", () => {
    it("should set player as target for TargetPlayer event", () => {
      isCardsValidSet.mockReturnValue(true);
      isSetTargetOneSecret.mockReturnValue(false);

      const { result } = renderHook(() => useSetEvent());
      act(() => {
        result.current.setEventToggleDisableButtonPlaySet(mockGameCards);
      });

      act(() => {
        result.current.playSet(mockGameCards);
      }); // Target Player

      act(() => {
        result.current.setTargetSet(mockGamePlayer);
      });

      expect(result.current.setEvent.target).toEqual(mockGamePlayer);
    });

    it("should set other player's unrevealed secret as target for Reveal event", () => {
      isCardsValidSet.mockReturnValue(true);
      isSetTargetOneSecret.mockReturnValue(true);
      isSetActionRevealSecret.mockReturnValue(true);

      const { result } = renderHook(() => useSetEvent());
      act(() => {
        result.current.setEventToggleDisableButtonPlaySet(mockGameCards);
      });

      act(() => {
        result.current.playSet(mockGameCards);
      }); // Target Secret (Reveal)

      act(() => {
        result.current.setTargetSet(mockSecret); // Unrevealed
      });

      expect(result.current.setEvent.target).toEqual(mockSecret);
    });

    it("should NOT set an already revealed secret for a Reveal event", () => {
      isCardsValidSet.mockReturnValue(true);
      isSetTargetOneSecret.mockReturnValue(true);
      isSetActionRevealSecret.mockReturnValue(true);

      const { result } = renderHook(() => useSetEvent());
      act(() => {
        result.current.setEventToggleDisableButtonPlaySet(mockGameCards);
      });

      act(() => {
        result.current.playSet(mockGameCards);
      }); // Target Secret (Reveal)

      act(() => {
        result.current.setTargetSet(mockRevealedSecret); // Already revealed
      });

      expect(result.current.setEvent.target).toBe(null);
    });
  });

  describe("Action Execution (executeSetActionToTarget)", () => {
    it("should return false and show error if target is null", async () => {
      isCardsValidSet.mockReturnValue(true);
      isSetTargetOneSecret.mockReturnValue(false);

      const { result } = renderHook(() => useSetEvent());

      act(() => {
        result.current.setEventToggleDisableButtonPlaySet(mockGameCards);
      });

      act(() => {
        result.current.playSet(mockGameCards);
      }); // Start event (Target Player)

      const success = await result.current.executeSetActionToTarget();

      expect(success).toBe(false);
      expect(toast.error).toHaveBeenCalledWith(
        "The target of the set must be selected.",
      );
    });

    it("should successfully execute a TargetPlayer set action and reset state", async () => {
      isCardsValidSet.mockReturnValue(true);
      isSetTargetOneSecret.mockReturnValue(false);

      const { result } = renderHook(() => useSetEvent());
      act(() => {
        result.current.setEventToggleDisableButtonPlaySet(mockGameCards);
      });

      act(() => {
        result.current.playSet(mockGameCards);
      });
      act(() => {
        result.current.setTargetSet(mockGamePlayer);
      });

      const success = await result.current.executeSetActionToTarget();

      expect(success).toBe(true);
      expect(mockCreateAndPlaySet).toHaveBeenCalledOnce();
    });

    it("should successfully execute current player secret reveal action (via useEffect) and reset state", async () => {
      // Estado inicial por useEffect
      mockUseGame.mockReturnValue({
        ...defaultMockUseGame,
        playerSelectsOneOfHisSecrets: { isCurrPlayer: true, isSelecting: true },
      });

      const { result } = renderHook(() => useSetEvent());

      act(() => {
        result.current.setEventToggleDisableButtonPlaySet(mockGameCards);
      });

      // Establecer el target (Secreto no revelado del jugador actual)
      act(() => {
        result.current.setTargetSet(mockCurrentPlayerSecret);
      });

      // Ejecutar la acción
      const success = await result.current.executeSetActionToTarget();

      expect(success).toBe(true);
      expect(mockPutSecret).toHaveBeenCalledWith(
        MOCK_MATCH_ID,
        mockCurrentPlayerSecret.id,
        MOCK_PLAYER_ID,
        "reveal_secret",
      );
    });
  });

  describe("Finish Turn (Stolen Secret)", () => {
    it("should call putSecret with steal_secret if isStolenSecret is true", async () => {
      mockUseGame.mockReturnValue({
        ...defaultMockUseGame,
        lastUpdatedSecretId: MOCK_SECRET_ID as UUID,
      });

      const { result } = renderHook(() => useSetEvent());
      act(() => {
        result.current.setEventToggleDisableButtonPlaySet(mockGameCards);
      });

      act(() => {
        result.current.setEvent.isStolenSecret = true;
      });

      await act(async () => {
        await result.current.executeFinishTurnSetEvent();
      });

      expect(mockPutSecret).toHaveBeenCalledWith(
        MOCK_MATCH_ID,
        MOCK_SECRET_ID,
        MOCK_PLAYER_ID,
        "steal_secret",
      );
      expect(result.current.setEvent.isStolenSecret).toBe(false); // Reset state
    });
  });
});
