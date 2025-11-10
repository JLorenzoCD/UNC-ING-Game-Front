import "@testing-library/jest-dom";
import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { toast } from "sonner";

import { useSetEvent } from "./useSetEvent";

import type { UUID } from "@/types/common";
import type { GameCard } from "@/types/card";
import type { GamePlayer } from "@/types/player";
import type { GameSecret } from "@/types/secret";
import type { MatchSet } from "@/types/set";

const {
  MOCK_PLAYER_ID,
  MOCK_MATCH_ID,
  MOCK_SECRET_ID,
  mockGamePlayer,
  mockSecret,
  mockRevealedSecret,
  mockCurrentPlayerSecret,
  mockGameCards,
  mockPoirotSet,
  mockOliverCard,
  mockEileenCard,
  mockEileenSet,
  mockTuppenceCard,
  mockTommyCard,
  mockTwoBeresfordSet,
  mockTommySet,
  mockTuppenceSet,
  mockOtherPlayerPoirotSet,
  mockUseParams,
  mockUsePlayer,
  mockUseGame,
  defaultMockUseGame,
  mockCurrentGamePlayer,
  mockCreateAndPlaySet,
  mockPutSecret,
  mockAddDetectiveCardToSetAndPlay,
  mockHttpService,
  isCardsValidSet,
  cardsToSetCreationDataTypeDetective,
  isSetCardsTargetOneSecret,
  isSetActionRevealSecret,
  isSetActionStolenSecret,
  cardsToSetCreationData,
  isSetActionHiddenSecret,
  isSetCardsTargetOnePLayer,
  isSetTargetOneSecret,
  isSetTargetOnePlayer,
  canDownTheCardToASet,
  cardsToSetUpdateData,
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

  const mockOliverCard: GameCard = {
    id: crypto.randomUUID(),
    name: "ARIADNE OLIVER",
    player_id: MOCK_PLAYER_ID,
    type: "DETECTIVE",
    card_id: crypto.randomUUID(),
    match_id: MOCK_MATCH_ID,
    description: "test",
    is_discarded: false,
    discarded_at: null,
  };

  const mockPoirotSet: MatchSet = {
    id: crypto.randomUUID(),
    match_id: MOCK_MATCH_ID,
    player_id: MOCK_PLAYER_ID,
    quin_count: 1,
    quin_play: true,
    type: "HERCULE POIROT",
  };

  const mockEileenCard: GameCard = {
    id: crypto.randomUUID(),
    name: "LADY EILEEN",
    player_id: MOCK_PLAYER_ID,
    type: "DETECTIVE",
    card_id: crypto.randomUUID(),
    match_id: MOCK_MATCH_ID,
    description: "test",
    is_discarded: false,
    discarded_at: null,
  };

  const mockEileenSet: MatchSet = {
    id: crypto.randomUUID(),
    match_id: MOCK_MATCH_ID,
    player_id: MOCK_PLAYER_ID,
    quin_count: 1,
    quin_play: true,
    type: "LADY EILEEN",
  };

  const mockTommyCard: GameCard = {
    id: crypto.randomUUID(),
    name: "TOMMY BERESFORD",
    player_id: MOCK_PLAYER_ID,
    type: "DETECTIVE",
    card_id: crypto.randomUUID(),
    match_id: MOCK_MATCH_ID,
    description: "test",
    is_discarded: false,
    discarded_at: null,
  };

  const mockTuppenceCard: GameCard = {
    id: crypto.randomUUID(),
    name: "TUPPENCE BERESFORD",
    player_id: MOCK_PLAYER_ID,
    type: "DETECTIVE",
    card_id: crypto.randomUUID(),
    match_id: MOCK_MATCH_ID,
    description: "test",
    is_discarded: false,
    discarded_at: null,
  };

  const mockTwoBeresfordSet: MatchSet = {
    id: crypto.randomUUID(),
    match_id: MOCK_MATCH_ID,
    player_id: MOCK_PLAYER_ID,
    quin_count: 1,
    quin_play: true,
    type: "TWO BERESFORD",
  };

  const mockTommySet: MatchSet = {
    id: crypto.randomUUID(),
    match_id: MOCK_MATCH_ID,
    player_id: MOCK_PLAYER_ID,
    quin_count: 1,
    quin_play: true,
    type: "TOMMY BERESFORD",
  };

  const mockTuppenceSet: MatchSet = {
    id: crypto.randomUUID(),
    match_id: MOCK_MATCH_ID,
    player_id: MOCK_PLAYER_ID,
    quin_count: 1,
    quin_play: true,
    type: "TUPPENCE BERESFORD",
  };

  const mockOtherPlayerPoirotSet: MatchSet = {
    ...mockPoirotSet,
    id: crypto.randomUUID(),
    player_id: MOCK_OTHER_PLAYER_ID,
  };

  const mockUseParams = vi.fn(() => ({ matchId: MOCK_MATCH_ID }));
  const mockUsePlayer = vi.fn(() => ({ player: mockPlayer }));

  // Mocks de Servicios
  const mockCreateAndPlaySet = vi.fn(() => undefined);
  const mockPutSecret = vi.fn(() => undefined);
  const mockAddDetectiveCardToSetAndPlay = vi.fn(() => undefined);
  const mockHttpService = {
    createAndPlaySet: mockCreateAndPlaySet,
    putSecret: mockPutSecret,
    addDetectiveCardToSetAndPlay: mockAddDetectiveCardToSetAndPlay,
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
  const cardsToSetCreationDataTypeDetective = vi.fn(() => "HERCULE POIROT");
  const isSetCardsTargetOneSecret = vi.fn(() => true);
  const isSetActionRevealSecret = vi.fn(() => true);
  const isSetActionStolenSecret = vi.fn(() => false);
  const cardsToSetCreationData = vi.fn();
  const isSetActionHiddenSecret = vi.fn(() => false);
  const isSetCardsTargetOnePLayer = vi.fn(() => false);
  const isSetTargetOneSecret = vi.fn(() => false);
  const isSetTargetOnePlayer = vi.fn(() => false);
  const canDownTheCardToASet = vi.fn(() => false);
  const cardsToSetUpdateData = vi.fn();

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
    mockPoirotSet,
    mockOliverCard,
    mockEileenCard,
    mockEileenSet,
    mockTommyCard,
    mockTuppenceCard,
    mockTwoBeresfordSet,
    mockTommySet,
    mockTuppenceSet,
    mockOtherPlayerPoirotSet,
    mockUseParams,
    mockUsePlayer,
    mockUseGame,
    defaultMockUseGame,
    mockCreateAndPlaySet,
    mockPutSecret,
    mockAddDetectiveCardToSetAndPlay,
    mockHttpService,
    isCardsValidSet,
    cardsToSetCreationDataTypeDetective,
    isSetCardsTargetOneSecret,
    isSetActionRevealSecret,
    isSetActionStolenSecret,
    cardsToSetCreationData,
    isSetActionHiddenSecret,
    isSetCardsTargetOnePLayer,
    isSetTargetOneSecret,
    isSetTargetOnePlayer,
    canDownTheCardToASet,
    cardsToSetUpdateData,
  };
});

// Mocks de funciones de utilidad
vi.mock("../utils/setEvent", () => ({
  cardsToSetCreationData: cardsToSetCreationData,
  cardsToSetCreationDataTypeDetective: cardsToSetCreationDataTypeDetective,
  isCardsValidSet: isCardsValidSet,
  isSetActionRevealSecret: isSetActionRevealSecret,
  isSetActionStolenSecret: isSetActionStolenSecret,
  isSetCardsTargetOneSecret: isSetCardsTargetOneSecret,
  isSetActionHiddenSecret: isSetActionHiddenSecret,
  isSetCardsTargetOnePLayer: isSetCardsTargetOnePLayer,
  isSetTargetOneSecret: isSetTargetOneSecret,
  isSetTargetOnePlayer: isSetTargetOnePlayer,
  canDownTheCardToASet: canDownTheCardToASet,
  cardsToSetUpdateData: cardsToSetUpdateData,
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
    cardsToSetCreationDataTypeDetective.mockClear();
    isSetCardsTargetOneSecret.mockClear();
    isSetActionRevealSecret.mockClear();
    isSetActionStolenSecret.mockClear();
    cardsToSetCreationData.mockClear();
    isSetActionHiddenSecret.mockClear();
    isSetCardsTargetOnePLayer.mockClear();
    isSetTargetOneSecret.mockClear();
    isSetTargetOnePlayer.mockClear();
    canDownTheCardToASet.mockClear();
    cardsToSetUpdateData.mockClear();
  });

  describe("Initialization & State Transitions", () => {
    it("should initialize to default state and disable button", () => {
      const { result } = renderHook(() => useSetEvent());

      expect(result.current.setEvent).toEqual({
        isInEvent: false,
        isValidSet: false,

        isTargetPlayer: false,
        isTargetSecret: false,

        isRevealSecret: false,
        isHiddenSecret: false,
        isStolenSecret: false,

        isSelectingSet: false,

        cards: [],
        setType: null,
        set: null,
        target: null,

        isRevealCurrPlayerSecret: false,
        canDownTheCardToASet: false,
      });
    });

    it("should transition to TargetPlayer state when playing a player-target set", () => {
      isCardsValidSet.mockReturnValue(true);
      isSetCardsTargetOneSecret.mockReturnValue(false);
      isSetCardsTargetOnePLayer.mockReturnValue(true);
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

      expect(result.current.setEvent.isInEvent).toBe(true);
      expect(result.current.setEvent.isTargetPlayer).toBe(true);
      expect(result.current.setEvent.isTargetSecret).toBe(false);
      expect(result.current.setEvent.isValidSet).toBe(false); // Botón deshabilitado durante evento
    });

    it("should transition to TargetSecret state when playing a secret-target set", () => {
      isCardsValidSet.mockReturnValue(true);
      isSetCardsTargetOneSecret.mockReturnValue(true); // Target Secret
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

      expect(result.current.setEvent.isInEvent).toBe(true);
      expect(result.current.setEvent.isTargetSecret).toBe(true);
      expect(result.current.setEvent.isTargetPlayer).toBe(false);
      expect(result.current.setEvent.isValidSet).toBe(false);
    });

    it("should transition to TargetPlayer state when down a detective card to set with player-target", () => {
      canDownTheCardToASet.mockReturnValue(true);
      isSetTargetOneSecret.mockReturnValue(false);
      isSetTargetOnePlayer.mockReturnValue(true); // Target player

      const { result } = renderHook(() => useSetEvent());

      // Habilitar el botón
      act(() => {
        result.current.setEventToggleDisableButtonSelectSet([mockEileenCard]);
      });
      expect(result.current.setEvent.isValidSet).toBe(false);
      expect(result.current.setEvent.canDownTheCardToASet).toBe(true);

      // Ejecutar addDetectiveCardToSet
      act(() => {
        result.current.addDetectiveCardToSet(mockEileenCard);
      });
      expect(result.current.setEvent.isSelectingSet).toBe(true);

      // Ejecutar setTargeSetToDown
      act(() => {
        result.current.setTargeSetToDown(mockEileenSet);
      });
      expect(result.current.setEvent.set).toEqual(mockEileenSet);

      // Ejecutar playSet
      act(() => {
        result.current.playSet([mockEileenCard]);
      });

      expect(result.current.setEvent.isInEvent).toBe(true);
      expect(result.current.setEvent.isTargetSecret).toBe(false);
      expect(result.current.setEvent.isTargetPlayer).toBe(true);
      expect(result.current.setEvent.isValidSet).toBe(false);
    });

    it("should transition to TargetSecret state when down a detective card to set with secret-target", () => {
      canDownTheCardToASet.mockReturnValue(true);
      isSetTargetOneSecret.mockReturnValue(true); // Target Secret
      isSetTargetOnePlayer.mockReturnValue(false);

      const { result } = renderHook(() => useSetEvent());

      // Habilitar el botón
      act(() => {
        result.current.setEventToggleDisableButtonSelectSet(mockGameCards);
      });
      expect(result.current.setEvent.isValidSet).toBe(false);
      expect(result.current.setEvent.canDownTheCardToASet).toBe(true);

      // Ejecutar addDetectiveCardToSet
      act(() => {
        result.current.addDetectiveCardToSet(mockGameCards[0]);
      });
      expect(result.current.setEvent.isSelectingSet).toBe(true);

      // Ejecutar setTargeSetToDown
      act(() => {
        result.current.setTargeSetToDown(mockPoirotSet);
      });
      expect(result.current.setEvent.set).toEqual(mockPoirotSet);

      // Ejecutar playSet
      act(() => {
        result.current.playSet(mockGameCards);
      });

      expect(result.current.setEvent.isInEvent).toBe(true);
      expect(result.current.setEvent.isTargetSecret).toBe(true);
      expect(result.current.setEvent.isTargetPlayer).toBe(false);
      expect(result.current.setEvent.isValidSet).toBe(false);
    });

    it("should not transition when Oliver is down to set", async () => {
      canDownTheCardToASet.mockReturnValue(true);
      cardsToSetUpdateData.mockRejectedValue({});

      const { result } = renderHook(() => useSetEvent());

      // Habilitar el botón
      act(() => {
        result.current.setEventToggleDisableButtonSelectSet([mockOliverCard]);
      });
      expect(result.current.setEvent.isValidSet).toBe(false);
      expect(result.current.setEvent.canDownTheCardToASet).toBe(true);

      // Ejecutar addDetectiveCardToSet
      act(() => {
        result.current.addDetectiveCardToSet(mockOliverCard);
      });
      expect(result.current.setEvent.isSelectingSet).toBe(true);

      // Ejecutar setTargeSetToDown
      act(() => {
        result.current.setTargeSetToDown(mockPoirotSet);
      });
      expect(result.current.setEvent.set).toEqual(mockPoirotSet);

      // Ejecutar playSet
      await act(async () => {
        await result.current.playSet([mockOliverCard]);
      });

      expect(result.current.setEvent).toEqual({
        isInEvent: false,
        isValidSet: false,

        isTargetPlayer: false,
        isTargetSecret: false,

        isRevealSecret: false,
        isHiddenSecret: false,
        isStolenSecret: false,

        isSelectingSet: false,

        cards: [],
        setType: null,
        set: null,
        target: null,

        isRevealCurrPlayerSecret: false,
        canDownTheCardToASet: false,
      });
    });

    it("should show error message when Oliver is down to set generate error", async () => {
      canDownTheCardToASet.mockReturnValue(true);
      cardsToSetUpdateData.mockReturnValue({});
      mockAddDetectiveCardToSetAndPlay.mockRejectedValue(
        new Error("http error"),
      );

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const { result } = renderHook(() => useSetEvent());

      // Habilitar el botón
      act(() => {
        result.current.setEventToggleDisableButtonSelectSet([mockOliverCard]);
      });
      expect(result.current.setEvent.isValidSet).toBe(false);
      expect(result.current.setEvent.canDownTheCardToASet).toBe(true);

      // Ejecutar addDetectiveCardToSet
      act(() => {
        result.current.addDetectiveCardToSet(mockOliverCard);
      });
      expect(result.current.setEvent.isSelectingSet).toBe(true);

      // Ejecutar setTargeSetToDown
      act(() => {
        result.current.setTargeSetToDown(mockPoirotSet);
      });
      expect(result.current.setEvent.set).toEqual(mockPoirotSet);

      // Ejecutar playSet
      await act(async () => {
        await result.current.playSet([mockOliverCard]);
      });

      expect(toast.error).toHaveBeenCalledWith(
        "An unexpected error has occurred, please try again.",
      );
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      consoleSpy.mockRestore();
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

    it("should set isValidSet to false if valid cards and no secret has been revealed", () => {
      isCardsValidSet.mockReturnValue(true);
      isSetActionHiddenSecret.mockReturnValue(true);

      const { result } = renderHook(() => useSetEvent());
      act(() => {
        result.current.setEventToggleDisableButtonPlaySet(mockGameCards);
      });

      expect(result.current.setEvent.isValidSet).toBe(false);
    });
  });

  describe("Target Selection (setTargetSet)", () => {
    it("should set player as target for TargetPlayer event", () => {
      isCardsValidSet.mockReturnValue(true);
      isSetCardsTargetOneSecret.mockReturnValue(false);
      isSetCardsTargetOnePLayer.mockReturnValue(true);

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
      isSetCardsTargetOneSecret.mockReturnValue(true);
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
      isSetCardsTargetOneSecret.mockReturnValue(true);
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
      isSetCardsTargetOneSecret.mockReturnValue(false);
      isSetCardsTargetOnePLayer.mockReturnValue(true);

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
      isSetCardsTargetOneSecret.mockReturnValue(false);
      isSetCardsTargetOnePLayer.mockReturnValue(true);

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

      let success;
      await act(async () => {
        success = await result.current.executeSetActionToTarget();
      });

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
      let success;
      await act(async () => {
        success = await result.current.executeSetActionToTarget();
      });

      expect(success).toBe(true);
      expect(mockPutSecret).toHaveBeenCalledWith(
        MOCK_MATCH_ID,
        mockCurrentPlayerSecret.id,
        MOCK_PLAYER_ID,
        "reveal_secret",
      );
    });

    it("should successfully execute a TargetSecret set action (not curr player) and reset state", async () => {
      isCardsValidSet.mockReturnValue(true);
      isSetCardsTargetOneSecret.mockReturnValue(true); // Target Secret
      isSetActionRevealSecret.mockReturnValue(true); // Reveal Secret (Other Player's)

      const { result } = renderHook(() => useSetEvent());

      act(() => {
        result.current.setEventToggleDisableButtonPlaySet(mockGameCards);
      });
      act(() => {
        result.current.playSet(mockGameCards);
      });

      act(() => {
        result.current.setTargetSet(mockSecret);
      });

      let success;
      await act(async () => {
        success = await result.current.executeSetActionToTarget();
      });

      expect(success).toBe(true);
      expect(mockCreateAndPlaySet).toHaveBeenCalled();
      expect(result.current.setEvent.isValidSet).toBe(false);
    });

    it("should return false and show error if target secret player is not found", async () => {
      isCardsValidSet.mockReturnValue(true);
      isSetCardsTargetOneSecret.mockReturnValue(true);
      isSetActionRevealSecret.mockReturnValue(true);

      mockUseGame.mockReturnValue({
        ...defaultMockUseGame,
        players: [mockCurrentGamePlayer], // Sólo el jugador actual
      });

      const { result } = renderHook(() => useSetEvent());

      act(() => {
        result.current.setEventToggleDisableButtonPlaySet(mockGameCards);
      });
      act(() => {
        result.current.playSet(mockGameCards);
      });

      act(() => {
        result.current.setTargetSet(mockSecret);
      });

      let success;
      await act(async () => {
        success = await result.current.executeSetActionToTarget();
      });

      expect(success).toBe(false);
      expect(mockCreateAndPlaySet).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(
        "The selected secret is not valid.",
      );
    });

    it("should show error message when down a detective card to set with player-target", async () => {
      canDownTheCardToASet.mockReturnValue(true);
      isSetTargetOneSecret.mockReturnValue(false);
      isSetTargetOnePlayer.mockReturnValue(true); // Target player
      cardsToSetUpdateData.mockReturnValue({});
      mockAddDetectiveCardToSetAndPlay.mockRejectedValue(
        new Error("http error"),
      );

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const { result } = renderHook(() => useSetEvent());

      // Habilitar el botón
      act(() => {
        result.current.setEventToggleDisableButtonSelectSet([mockEileenCard]);
      });
      expect(result.current.setEvent.isValidSet).toBe(false);
      expect(result.current.setEvent.canDownTheCardToASet).toBe(true);

      // Ejecutar addDetectiveCardToSet
      act(() => {
        result.current.addDetectiveCardToSet(mockEileenCard);
      });
      expect(result.current.setEvent.isSelectingSet).toBe(true);

      // Ejecutar setTargeSetToDown
      act(() => {
        result.current.setTargeSetToDown(mockEileenSet);
      });
      expect(result.current.setEvent.set).toEqual(mockEileenSet);

      // Ejecutar playSet
      act(() => {
        result.current.playSet([mockEileenCard]);
      });

      act(() => {
        result.current.setTargetSet(mockGamePlayer);
      });

      await act(async () => {
        await result.current.executeSetActionToTarget();
      });

      expect(toast.error).toHaveBeenCalledWith(
        "An unexpected error has occurred, please try again.",
      );
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      consoleSpy.mockRestore();
    });

    it("should show error message when down a detective card to set with secret-target", async () => {
      canDownTheCardToASet.mockReturnValue(true);
      isSetTargetOneSecret.mockReturnValue(true); // Target Secret
      isSetTargetOnePlayer.mockReturnValue(false);

      cardsToSetUpdateData.mockReturnValue({});
      mockAddDetectiveCardToSetAndPlay.mockRejectedValue(
        new Error("http error"),
      );

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const { result } = renderHook(() => useSetEvent());

      // Habilitar el botón
      act(() => {
        result.current.setEventToggleDisableButtonSelectSet(mockGameCards);
      });
      expect(result.current.setEvent.isValidSet).toBe(false);
      expect(result.current.setEvent.canDownTheCardToASet).toBe(true);

      act(() => {
        result.current.addDetectiveCardToSet(mockGameCards[0]);
      });
      expect(result.current.setEvent.isSelectingSet).toBe(true);

      act(() => {
        result.current.setTargeSetToDown(mockPoirotSet);
      });
      expect(result.current.setEvent.set).toEqual(mockPoirotSet);

      act(() => {
        result.current.playSet(mockGameCards);
      });

      act(() => {
        result.current.setTargetSet(mockSecret);
      });

      await act(async () => {
        await result.current.executeSetActionToTarget();
      });

      expect(toast.error).toHaveBeenCalledWith(
        "An unexpected error has occurred, please try again.",
      );
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe("Selectability Functions", () => {
    beforeEach(() => {
      isCardsValidSet.mockReturnValue(true);
      isSetActionRevealSecret.mockReturnValue(true); // Para forzar el paso de validación en playSet
    });

    // Helper para simular el inicio de un evento de Target Player
    const startTargetPlayerEvent = (result: any) => {
      isSetCardsTargetOneSecret.mockReturnValue(false); // Target Player
      isSetCardsTargetOnePLayer.mockReturnValue(true);

      act(() => {
        result.current.setEventToggleDisableButtonPlaySet(mockGameCards);
      });
      act(() => {
        result.current.playSet(mockGameCards);
      });
    };

    // Helper para simular el inicio de un evento de Target Secret (Reveal)
    const startTargetSecretRevealEvent = (result: any) => {
      isSetCardsTargetOneSecret.mockReturnValue(true); // Target Secret
      isSetActionRevealSecret.mockReturnValue(true); // Reveal
      act(() => {
        result.current.setEventToggleDisableButtonPlaySet(mockGameCards);
      });
      act(() => {
        result.current.playSet(mockGameCards);
      });
    };

    describe("isPlayerSelectableForSetEvent", () => {
      it("should return true if in TargetPlayer event and player has unrevealed secrets", () => {
        const { result } = renderHook(() => useSetEvent());
        startTargetPlayerEvent(result);

        expect(
          result.current.isPlayerSelectableForSetEvent(mockGamePlayer),
        ).toBe(true);
      });

      it("should return false if in TargetPlayer event but player has ALL secrets revealed", () => {
        mockUseGame.mockReturnValue({
          ...defaultMockUseGame,
          secrets: [
            mockRevealedSecret, // Secreto revelado del otro jugador
            mockCurrentPlayerSecret,
          ],
        });

        const { result } = renderHook(() => useSetEvent());
        startTargetPlayerEvent(result);

        // mockGamePlayer sólo tiene mockRevealedSecret que está revelado
        expect(
          result.current.isPlayerSelectableForSetEvent(mockGamePlayer),
        ).toBe(false);
      });

      it("should return false if not in a TargetPlayer event", () => {
        const { result } = renderHook(() => useSetEvent());
        // No se inicia ningún evento de set
        expect(
          result.current.isPlayerSelectableForSetEvent(mockGamePlayer),
        ).toBe(false);
      });
    });

    describe("isCurrPlayerSecretSelectableForSetEvent", () => {
      it("should return true for unrevealed current player secret when playerSelectsOneOfHisSecrets is true (via useEffect)", () => {
        // Simula el estado post-useEffect cuando el jugador debe revelar uno de sus secretos
        mockUseGame.mockReturnValue({
          ...defaultMockUseGame,
          playerSelectsOneOfHisSecrets: {
            isCurrPlayer: true,
            isSelecting: true,
          },
        });

        const { result } = renderHook(() => useSetEvent());

        // El estado se inicializa con isRevealCurrPlayerSecret: true gracias al useEffect
        expect(result.current.setEvent.isRevealCurrPlayerSecret).toBe(true);

        expect(
          result.current.isCurrPlayerSecretSelectableForSetEvent(
            mockCurrentPlayerSecret, // No revelado
          ),
        ).toBe(true);
      });

      it("should return false if secret belongs to another player", () => {
        const { result } = renderHook(() => useSetEvent());
        startTargetSecretRevealEvent(result);

        expect(
          result.current.isCurrPlayerSecretSelectableForSetEvent(mockSecret),
        ).toBe(false); // mockSecret pertenece a MOCK_OTHER_PLAYER_ID
      });
    });

    describe("isOtherPlayerSecretSelectableForSetEvent", () => {
      it("should return true for an UNREVEALED other player secret during a REVEAL set event", () => {
        const { result } = renderHook(() => useSetEvent());
        startTargetSecretRevealEvent(result); // isRevealSecret: true

        expect(
          result.current.isOtherPlayerSecretSelectableForSetEvent(mockSecret), // mockSecret no revelado, de otro jugador
        ).toBe(true);
      });

      it("should return false if secret belongs to the current player", () => {
        const { result } = renderHook(() => useSetEvent());
        startTargetSecretRevealEvent(result);

        expect(
          result.current.isOtherPlayerSecretSelectableForSetEvent(
            mockCurrentPlayerSecret,
          ),
        ).toBe(false); // mockCurrentPlayerSecret es del jugador actual
      });
    });

    describe("isSetSelectableForSetEvent", () => {
      it("should return false if setEvent.isValidSet is true", () => {
        // Asume que la tarjeta puede bajarse, y empieza el evento de selección
        canDownTheCardToASet.mockReturnValue(true);
        const { result } = renderHook(() => useSetEvent());

        act(() => {
          result.current.setEvent.isValidSet = true; // Estado que bloquearía la selección
        });

        expect(result.current.isSetSelectableForSetEvent(mockPoirotSet)).toBe(
          false,
        );

        act(() => {
          result.current.setEvent.isValidSet = false;
        });
      });

      it("should return true for ARIADNE OLIVER regardless of set type", () => {
        // Asume que la tarjeta puede bajarse, y empieza el evento de selección
        canDownTheCardToASet.mockReturnValue(true);

        const { result } = renderHook(() => useSetEvent());

        // Habilitar el botón
        act(() => {
          result.current.setEventToggleDisableButtonSelectSet([mockOliverCard]);
        });
        expect(result.current.setEvent.isValidSet).toBe(false);
        expect(result.current.setEvent.canDownTheCardToASet).toBe(true);

        // Ejecutar addDetectiveCardToSet
        act(() => {
          result.current.addDetectiveCardToSet(mockOliverCard);
        });

        expect(result.current.isSetSelectableForSetEvent(mockPoirotSet)).toBe(
          true,
        );
        expect(result.current.isSetSelectableForSetEvent(mockEileenSet)).toBe(
          true,
        );
      });

      it("should return false if the set belongs to another player", () => {
        // Asume que la tarjeta puede bajarse, y empieza el evento de selección
        canDownTheCardToASet.mockReturnValue(true);
        const { result } = renderHook(() => useSetEvent());

        // Habilitar el botón
        act(() => {
          result.current.setEventToggleDisableButtonSelectSet(mockGameCards);
        });
        expect(result.current.setEvent.isValidSet).toBe(false);
        expect(result.current.setEvent.canDownTheCardToASet).toBe(true);

        // Inicia el evento con Poirot
        act(() => {
          result.current.addDetectiveCardToSet(mockGameCards[0]);
        });

        expect(
          result.current.isSetSelectableForSetEvent(mockOtherPlayerPoirotSet),
        ).toBe(false);
      });

      it("should return true if card name matches set type (e.g., Poirot to Poirot set)", () => {
        // Asume que la tarjeta puede bajarse, y empieza el evento de selección
        canDownTheCardToASet.mockReturnValue(true);
        const { result } = renderHook(() => useSetEvent());

        act(() => {
          result.current.setEventToggleDisableButtonSelectSet(mockGameCards);
        });
        expect(result.current.setEvent.isValidSet).toBe(false);
        expect(result.current.setEvent.canDownTheCardToASet).toBe(true);

        // Inicia el evento con Poirot
        act(() => {
          result.current.addDetectiveCardToSet(mockGameCards[0]); // HERCULE POIROT
        });

        // mockPoirotSet es de tipo HERCULE POIROT
        expect(result.current.isSetSelectableForSetEvent(mockPoirotSet)).toBe(
          true,
        );
      });

      it("should return true if card is TOMMY/TUPPENCE BERESFORD and set is TWO BERESFORD", () => {
        // Asume que la tarjeta puede bajarse, y empieza el evento de selección
        canDownTheCardToASet.mockReturnValue(true);
        const { result } = renderHook(() => useSetEvent());

        act(() => {
          result.current.setEventToggleDisableButtonSelectSet([mockTommyCard]);
        });
        expect(result.current.setEvent.isValidSet).toBe(false);
        expect(result.current.setEvent.canDownTheCardToASet).toBe(true);

        act(() => {
          result.current.addDetectiveCardToSet(mockTommyCard);
        });
        expect(
          result.current.isSetSelectableForSetEvent(mockTwoBeresfordSet),
        ).toBe(true);

        act(() => {
          result.current.addDetectiveCardToSet(mockTuppenceCard);
        });
        expect(
          result.current.isSetSelectableForSetEvent(mockTwoBeresfordSet),
        ).toBe(true);
      });

      it("should return true if card is TUPPENCE BERESFORD and set is TOMMY BERESFORD", () => {
        // Asume que la tarjeta puede bajarse, y empieza el evento de selección
        canDownTheCardToASet.mockReturnValue(true);
        const { result } = renderHook(() => useSetEvent());

        act(() => {
          result.current.setEventToggleDisableButtonSelectSet([
            mockTuppenceCard,
          ]);
        });
        expect(result.current.setEvent.isValidSet).toBe(false);
        expect(result.current.setEvent.canDownTheCardToASet).toBe(true);

        act(() => {
          result.current.addDetectiveCardToSet(mockTuppenceCard);
        });

        expect(result.current.isSetSelectableForSetEvent(mockTommySet)).toBe(
          true,
        );
      });

      it("should return true if card is TOMMY BERESFORD and set is TUPPENCE BERESFORD", () => {
        // Asume que la tarjeta puede bajarse, y empieza el evento de selección
        canDownTheCardToASet.mockReturnValue(true);
        const { result } = renderHook(() => useSetEvent());

        act(() => {
          result.current.setEventToggleDisableButtonSelectSet([mockTommyCard]);
        });

        act(() => {
          result.current.addDetectiveCardToSet(mockTommyCard);
        });

        expect(result.current.isSetSelectableForSetEvent(mockTuppenceSet)).toBe(
          true,
        );
      });

      it("should return false for card and set type mismatch (e.g., Poirot to Eileen set)", () => {
        // Asume que la tarjeta puede bajarse, y empieza el evento de selección
        canDownTheCardToASet.mockReturnValue(true);
        const { result } = renderHook(() => useSetEvent());

        act(() => {
          result.current.setEventToggleDisableButtonSelectSet(mockGameCards);
        });

        // Inicia el evento con Poirot
        act(() => {
          result.current.addDetectiveCardToSet(mockGameCards[0]); // HERCULE POIROT
        });

        // mockEileenSet es de tipo LADY EILEEN
        expect(result.current.isSetSelectableForSetEvent(mockEileenSet)).toBe(
          false,
        );
      });
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
