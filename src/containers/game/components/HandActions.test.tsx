import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import type { ReactNode } from "react";

import { GAME_EVENTS } from "@/constants/game";
import HandActions from "./HandActions";

const {
  mockOnFinish,
  mockOnDiscard,
  mockOnPlaySet,
  mockOnSelectPlayer,
  mockOnSelectSecret,
  mockOnPlayEvent,
  mockOnSelectSet,
  mockUseGame,
  mockOnSelectDirection,
  mockOnAddDetectiveCardToSet,
} = vi.hoisted(() => {
  const mockOnFinish = vi.fn();
  const mockOnDiscard = vi.fn();
  const mockOnPlaySet = vi.fn();
  const mockOnSelectPlayer = vi.fn();
  const mockOnSelectSecret = vi.fn();
  const mockOnPlayEvent = vi.fn();
  const mockUseGame = vi.fn();
  const mockOnSelectDirection = vi.fn();
  const mockOnAddDetectiveCardToSet = vi.fn();
  const mockOnSelectSet = vi.fn();

  return {
    mockOnFinish,
    mockOnDiscard,
    mockOnPlaySet,
    mockUseGame,
    mockOnAddDetectiveCardToSet,
    mockOnSelectPlayer,
    mockOnSelectSecret,
    mockOnPlayEvent,
    mockOnSelectSet,
    mockOnSelectDirection,
  };
});

// 1. Mock de useGame

vi.mock("@/contexts/GameContext", () => ({
  useGame: mockUseGame,
}));

vi.mock("@/components/Button", () => ({
  default: ({
    children,
    onClick,
    disabled,
  }: {
    children: ReactNode;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button
      data-testid="mock-button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

const baseProps = {
  onFinish: mockOnFinish,
  onDiscard: mockOnDiscard,
  onPlaySet: mockOnPlaySet,
  onSelectPlayer: mockOnSelectPlayer,
  onSelectSecret: mockOnSelectSecret,
  onPlayEvent: mockOnPlayEvent,
  onAddDetectiveCardToSet: mockOnAddDetectiveCardToSet,
  onSelectSet: mockOnSelectSet,
  onSelectDirection: mockOnSelectDirection,
  isSetEventSelectSetButtonDisabled: true,
  isAddingCardToSet: false,
  canSelectMeAsPlayer: false,
  isSelectionPlayerEvent: false,
  isSelectionSecretEvent: false,
  isSetButtonDisabled: true,
  isDisabled: false,
  isSelectionSetEvent: false,
  isDisabledEvent: true,
  isSelectDirectionEvent: false,
};

describe("HandActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGame.mockReturnValue({
      hasFinishedAction: false,
      playerSelectsOneOfHisSecrets: {
        isSelecting: false,
        isCurrPlayer: false,
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
      pendingResponse: { isPending: false, eventType: null },
    });
  });

  describe("Rendering", () => {
    it("renders correctly with default props", () => {
      render(
        <HandActions
          {...baseProps}
          isSetEventSelectSetButtonDisabled={false}
          isAddingCardToSet={false}
          canSelectMeAsPlayer={false}
          isSelectionPlayerEvent={false}
          isSelectionSecretEvent={false}
          isSelectionSetEvent={false}
          isSetButtonDisabled={false}
          isDisabledEvent={false}
          isDisabled={false}
        />,
      );

      const handActions = screen.getByTestId("hand-actions");
      expect(handActions).toBeInTheDocument();

      const buttons = screen.getAllByTestId("mock-button");
      expect(buttons.length).toBe(8);
      expect(buttons[0]).toHaveTextContent("Discard cards");
      expect(buttons[1]).toHaveTextContent("Play set");
      expect(buttons[2]).toHaveTextContent("Play event");
      expect(buttons[3]).toHaveTextContent("Add detective");
      expect(buttons[4]).toHaveTextContent("Select set");
      expect(buttons[5]).toHaveTextContent("Select secret");
      expect(buttons[6]).toHaveTextContent("Select player");
      expect(buttons[7]).toHaveTextContent("Finish turn");
    });
  });

  describe("Interactions", () => {
    it("calls onDiscard when 'Discard cards' button is clicked", async () => {
      render(<HandActions {...baseProps} />);

      const buttons = screen.getAllByTestId("mock-button");
      expect(buttons).toHaveLength(8);

      expect(screen.getByText("Discard cards")).toBeInTheDocument();
      expect(screen.getByText("Play set")).toBeInTheDocument();
      expect(screen.getByText("Select player")).toBeInTheDocument();
      expect(screen.getByText("Select secret")).toBeInTheDocument();
      expect(screen.getByText("Finish turn")).toBeInTheDocument();
      expect(screen.getByText("Play event")).toBeInTheDocument();
      expect(screen.getByText("Add detective")).toBeInTheDocument();
      expect(screen.getByText("Select set")).toBeInTheDocument();

      expect(buttons[0]).not.toBeDisabled();
      expect(buttons[1]).toBeDisabled();
      expect(buttons[2]).toBeDisabled();
      expect(buttons[3]).toBeDisabled();
      expect(buttons[4]).toBeDisabled();
      expect(buttons[5]).toBeDisabled();
      expect(buttons[6]).toBeDisabled();
      expect(buttons[7]).not.toBeDisabled();
    });

    it("disables the 'Play set' button based on isSetButtonDisabled prop", () => {
      render(<HandActions {...baseProps} isSetButtonDisabled={true} />);

      expect(screen.getByText("Play set")).toBeDisabled();
      expect(screen.getByText("Discard cards")).not.toBeDisabled();
    });

    it("disables the 'Select player' button based on isSelectionPlayerEvent prop (inverted logic)", async () => {
      render(<HandActions {...baseProps} isSelectionPlayerEvent={false} />);
      expect(screen.getByText("Select player")).toBeDisabled();

      const discardCardsButton = screen.getAllByTestId("mock-button")[0];
      expect(discardCardsButton).toBeInTheDocument();

      await fireEvent.click(discardCardsButton);
      expect(mockOnDiscard).toHaveBeenCalled();
    });
  });

  describe("Click actions", () => {
    it("calls onDiscard when 'Discard cards' button is clicked", () => {
      render(<HandActions {...baseProps} />);

      fireEvent.click(screen.getByText("Discard cards"));
      expect(mockOnDiscard).toHaveBeenCalledTimes(1);
    });

    it("calls onPlaySet when 'Play set' button is clicked", () => {
      render(<HandActions {...baseProps} isSetButtonDisabled={false} />);

      fireEvent.click(screen.getByText("Play set"));
      expect(mockOnPlaySet).toHaveBeenCalledTimes(1);
    });

    it("calls onSelectPlayer when 'Select player' button is clicked", () => {
      render(<HandActions {...baseProps} isSelectionPlayerEvent={true} />);

      fireEvent.click(screen.getByText("Select player"));
      expect(mockOnSelectPlayer).toHaveBeenCalledTimes(1);
    });

    it("calls onSelectSecret when 'Select secret' button is clicked", () => {
      render(<HandActions {...baseProps} isSelectionSecretEvent={true} />);

      fireEvent.click(screen.getByText("Select secret"));
      expect(mockOnSelectSecret).toHaveBeenCalledTimes(1);
    });

    it("calls onFinish when 'Finish turn' button is clicked", () => {
      render(<HandActions {...baseProps} />);

      fireEvent.click(screen.getByText("Finish turn"));
      expect(mockOnFinish).toHaveBeenCalledTimes(1);
    });

    it("does not call any callback when main isDisabled prop is true", () => {
      render(<HandActions {...baseProps} isDisabled={true} />);

      const buttons = screen.getAllByTestId("mock-button");
      expect(buttons.length).toBe(8);

      fireEvent.click(buttons[0]);
      fireEvent.click(buttons[4]);
      buttons.forEach((button) => fireEvent.click(button));

      expect(mockOnDiscard).not.toHaveBeenCalled();
      expect(mockOnPlaySet).not.toHaveBeenCalled();
      expect(mockOnSelectPlayer).not.toHaveBeenCalled();
      expect(mockOnSelectSecret).not.toHaveBeenCalled();
      expect(mockOnFinish).not.toHaveBeenCalled();
      expect(mockOnAddDetectiveCardToSet).not.toHaveBeenCalled();
      expect(mockOnPlayEvent).not.toHaveBeenCalled();
    });

    it("disables Discard and Finish turn when 'isSelectionSetEvent' is true", () => {
      render(
        <HandActions
          {...baseProps}
          isSelectionPlayerEvent={false}
          isSelectionSecretEvent={false}
          isSelectionSetEvent={true}
          isSetButtonDisabled={false}
          isDisabledEvent={false}
          isDisabled={false}
          canSelectMeAsPlayer={false}
          isSelectDirectionEvent={false}
        />,
      );

      const discardButton = screen.getAllByTestId("mock-button")[0];
      const finishButton = screen.getAllByTestId("mock-button")[6];

      fireEvent.click(discardButton);
      fireEvent.click(finishButton);

      expect(mockOnDiscard).not.toHaveBeenCalled();
      expect(mockOnFinish).not.toHaveBeenCalled();
    });
  });

  describe("useGame logic", () => {
    it("disables all main action buttons when hasFinishedAction is true", () => {
      mockUseGame.mockReturnValue({
        hasFinishedAction: true,
        playerSelectsOneOfHisSecrets: {
          isSelecting: false,
          isCurrPlayer: false,
        },
        notSoFastEvent: { isActivate: false },
        pendingResponse: { isPending: false, eventType: null },
      });

      render(<HandActions {...baseProps} />);

      expect(screen.getByText("Discard cards")).toBeDisabled();
      expect(screen.getByText("Play set")).toBeDisabled();
      expect(screen.getByText("Select player")).toBeDisabled();
      expect(screen.getByText("Select secret")).toBeDisabled();

      expect(screen.getByText("Finish turn")).not.toBeDisabled();
    });

    it("disables 'Finish turn' when playerSelectsOneOfHisSecrets.isSelecting is true", () => {
      mockUseGame.mockReturnValue({
        hasFinishedAction: false,
        playerSelectsOneOfHisSecrets: {
          isSelecting: true,
          isCurrPlayer: false,
        },
        pendingResponse: { isPending: false, eventType: null },
        notSoFastEvent: { isActivate: false },
      });

      render(<HandActions {...baseProps} isSelectionSecretEvent />);

      // Botón Finish turn se deshabilita
      expect(screen.getByText("Finish turn")).toBeDisabled();

      expect(screen.getByText("Discard cards")).toBeDisabled();
      expect(screen.getByText("Play set")).toBeDisabled();
    });

    it("ENABLES 'Select secret' even if event conditions fail, when isCurrPlayer is true", () => {
      mockUseGame.mockReturnValue({
        hasFinishedAction: false,
        playerSelectsOneOfHisSecrets: {
          isSelecting: false,
          isCurrPlayer: true,
        },
        notSoFastEvent: { isActivate: false },
        pendingResponse: { isPending: false, eventType: null },
      });

      render(<HandActions {...baseProps} isSelectionSecretEvent={false} />);

      expect(screen.getByText("Select secret")).not.toBeDisabled();
      expect(screen.getByText("Discard cards")).not.toBeDisabled();
    });

    it("should ENABLE Select player button for POINT_YOUR_SUSPICIONS pending response", () => {
      // 1. Simular el estado de PENDING_RESPONSE para PYS
      mockUseGame.mockReturnValue({
        ...mockUseGame(), // Obtiene el mock base
        pendingResponse: {
          isPending: true,
          eventType: "POINT YOUR SUSPICIONS",
        },
      });

      // 2. Renderizar (isSelectionPlayerEvent es true, que viene de GameContainer)
      render(<HandActions {...baseProps} isSelectionPlayerEvent={true} />);

      // 3. Verificar
      // El botón está HABILITADO porque la lógica de 'disabled'
      expect(screen.getByText("Select player")).not.toBeDisabled();

      // Los otros botones sí están deshabilitados
      expect(screen.getByText("Discard cards")).toBeDisabled();
      expect(screen.getByText("Finish turn")).toBeDisabled();
    });
  });

  describe("Conditional Event Rendering", () => {
    // Importa GAME_EVENTS al principio de este archivo de test
    // import { GAME_EVENTS } from "@/constants/game";

    it("should show Left and Right buttons for DEAD_CARD_FOLLY initiator", () => {
      render(
        <HandActions
          {...baseProps}
          isSelectDirectionEvent={true} //
        />,
      );

      // Los botones "Discard" y "Select set" desaparecen
      expect(screen.queryByText("Discard cards")).not.toBeInTheDocument();
      expect(screen.queryByText("Select set")).not.toBeInTheDocument();

      // Los botones "Left" y "Right" aparecen
      expect(screen.getByText("Left")).toBeInTheDocument();
      expect(screen.getByText("Right")).toBeInTheDocument();

      // Los otros botones siguen ahí
      expect(screen.getByText("Play set")).toBeInTheDocument();
      expect(screen.getByText("Select player")).toBeInTheDocument();
    });

    it("should disable Select player button for CARD_TRADE pending response", () => {
      mockUseGame.mockReturnValue({
        ...mockUseGame(),
        pendingResponse: {
          isPending: true,
          eventType: GAME_EVENTS.CARD_TRADE, //
        },
      });

      render(<HandActions {...baseProps} isSelectionPlayerEvent={true} />);

      // El botón está deshabilitado por la lógica de CARD_TRADE
      expect(screen.getByText("Select player")).toBeDisabled();
    });

    it("should disable Select player button for DEAD_CARD_FOLLY pending response", () => {
      mockUseGame.mockReturnValue({
        ...mockUseGame(),
        pendingResponse: {
          isPending: true,
          eventType: GAME_EVENTS.DEAD_CARD_FOLLY, //
        },
      });

      render(<HandActions {...baseProps} isSelectionPlayerEvent={true} />);

      // El botón está deshabilitado por la lógica de DEAD_CARD_FOLLY
      expect(screen.getByText("Select player")).toBeDisabled();
    });

    it("should ENABLE Select player button for POINT_YOUR_SUSPICIONS pending response", () => {
      mockUseGame.mockReturnValue({
        ...mockUseGame(),
        pendingResponse: {
          isPending: true,
          eventType: GAME_EVENTS.POINT_YOUR_SUSPICIONS, //
        },
      });

      render(<HandActions {...baseProps} isSelectionPlayerEvent={true} />);

      // El botón está habilitado
      expect(screen.getByText("Select player")).not.toBeDisabled();
    });
  });

  describe("Button: Discard cards logic", () => {
    it("should disable Discard cards when hasFinishedAction is true", () => {
      mockUseGame.mockReturnValue({
        ...mockUseGame(),
        hasFinishedAction: true,
      });

      render(<HandActions {...baseProps} />);
      expect(screen.getByText("Discard cards")).toBeDisabled();
    });

    it("should disable Discard cards when notSoFastEvent.isActivate is true", () => {
      mockUseGame.mockReturnValue({
        ...mockUseGame(),
        notSoFastEvent: { isActivate: true },
      });

      render(<HandActions {...baseProps} />);
      expect(screen.getByText("Discard cards")).toBeDisabled();
    });

    it("should disable Discard cards when pendingResponse.isPending is true", () => {
      mockUseGame.mockReturnValue({
        ...mockUseGame(),
        pendingResponse: { isPending: true, eventType: null },
      });

      render(<HandActions {...baseProps} />);
      expect(screen.getByText("Discard cards")).toBeDisabled();
    });
  });

  describe("Button: Select player logic (Extended coverage)", () => {
    it("should disable Select player when isDisabled is true and no pending response", () => {
      render(
        <HandActions
          {...baseProps}
          isDisabled={true}
          isSelectionPlayerEvent={true}
        />,
      );
      expect(screen.getByText("Select player")).toBeDisabled();
    });

    it("should disable Select player when hasFinishedAction is true and no pending response", () => {
      mockUseGame.mockReturnValue({
        ...mockUseGame(),
        hasFinishedAction: true,
      });

      render(<HandActions {...baseProps} isSelectionPlayerEvent={true} />);
      expect(screen.getByText("Select player")).toBeDisabled();
    });

    it("should disable Select player when notSoFastEvent.isActivate is true", () => {
      mockUseGame.mockReturnValue({
        ...mockUseGame(),
        notSoFastEvent: { isActivate: true },
      });

      render(<HandActions {...baseProps} isSelectionPlayerEvent={true} />);
      expect(screen.getByText("Select player")).toBeDisabled();
    });

    it("should change text to 'Select me' when canSelectMeAsPlayer is true", () => {
      render(
        <HandActions
          {...baseProps}
          isSelectionPlayerEvent={true}
          canSelectMeAsPlayer={true}
        />,
      );
      expect(screen.getByText("Select me")).toBeInTheDocument();
    });
  });

  describe("Button: Select secret logic (Extended coverage)", () => {
    it("should disable Select secret when notSoFastEvent.isActivate is true", () => {
      mockUseGame.mockReturnValue({
        ...mockUseGame(),
        notSoFastEvent: { isActivate: true },
      });

      render(<HandActions {...baseProps} isSelectionSecretEvent={true} />);
      expect(screen.getByText("Select secret")).toBeDisabled();
    });

    it("should disable Select secret when isSelectionSecretEvent is false and isCurrPlayer is false", () => {
      render(<HandActions {...baseProps} isSelectionSecretEvent={false} />);
      expect(screen.getByText("Select secret")).toBeDisabled();
    });

    it("should ENABLE Select secret when isSelectionSecretEvent is true", () => {
      render(<HandActions {...baseProps} isSelectionSecretEvent={true} />);
      expect(screen.getByText("Select secret")).not.toBeDisabled();
    });
  });

  describe("Button: Finish turn logic (Extended coverage)", () => {
    it("should disable Finish turn when shouldDisableOption is true (e.g., isSelectionPlayerEvent=true)", () => {
      render(<HandActions {...baseProps} isSelectionPlayerEvent={true} />);
      expect(screen.getByText("Finish turn")).toBeDisabled();
    });

    it("should disable Finish turn when playerSelectsOneOfHisSecrets.isSelecting is true", () => {
      mockUseGame.mockReturnValue({
        ...mockUseGame(),
        playerSelectsOneOfHisSecrets: {
          isSelecting: true,
          isCurrPlayer: false,
        },
      });
      render(<HandActions {...baseProps} />);
      expect(screen.getByText("Finish turn")).toBeDisabled();
    });

    it("should disable Finish turn when notSoFastEvent.isActivate is true", () => {
      mockUseGame.mockReturnValue({
        ...mockUseGame(),
        notSoFastEvent: { isActivate: true },
      });
      render(<HandActions {...baseProps} />);
      expect(screen.getByText("Finish turn")).toBeDisabled();
    });
  });

  describe("Direction buttons", () => {
    beforeEach(() => {
      baseProps.isSelectDirectionEvent = true;
    });

    it("should call onSelectDirection('LEFT') when Left button is clicked", () => {
      render(<HandActions {...baseProps} />);
      fireEvent.click(screen.getByText("Left"));
      expect(mockOnSelectDirection).toHaveBeenCalledWith("LEFT");
      expect(mockOnSelectDirection).toHaveBeenCalledTimes(1);
    });

    it("should call onSelectDirection('RIGHT') when Right button is clicked", () => {
      render(<HandActions {...baseProps} />);
      fireEvent.click(screen.getByText("Right"));
      expect(mockOnSelectDirection).toHaveBeenCalledWith("RIGHT");
      expect(mockOnSelectDirection).toHaveBeenCalledTimes(1);
    });
  });

  describe("Button: Add detective (Extended coverage)", () => {
    it("calls onAddDetectiveCardToSet when button is clicked", () => {
      mockUseGame.mockReturnValue({
        ...mockUseGame(),
        hasFinishedAction: false,
      });

      render(
        <HandActions
          {...baseProps}
          isSetEventSelectSetButtonDisabled={false}
          isDisabled={false}
        />,
      );
      fireEvent.click(screen.getByText("Add detective"));
      expect(mockOnAddDetectiveCardToSet).toHaveBeenCalledTimes(1);
    });

    it("disables 'Add detective' when isSetEventSelectSetButtonDisabled is true", () => {
      render(
        <HandActions {...baseProps} isSetEventSelectSetButtonDisabled={true} />,
      );
      expect(screen.getByText("Add detective")).toBeDisabled();
    });
  });
});
