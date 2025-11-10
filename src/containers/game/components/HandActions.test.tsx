import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import type { ReactNode } from "react";

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
} = vi.hoisted(() => {
  const mockOnFinish = vi.fn();
  const mockOnDiscard = vi.fn();
  const mockOnPlaySet = vi.fn();
  const mockOnSelectPlayer = vi.fn();
  const mockOnSelectSecret = vi.fn();
  const mockOnPlayEvent = vi.fn();
  const mockOnSelectSet = vi.fn();
  const mockUseGame = vi.fn();

  return {
    mockOnFinish,
    mockOnDiscard,
    mockOnPlaySet,
    mockUseGame,
    mockOnSelectPlayer,
    mockOnSelectSecret,
    mockOnPlayEvent,
    mockOnSelectSet,
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
  onSelectSet: mockOnSelectSet,
  isSelectionPlayerEvent: false,
  isSelectionSecretEvent: false,
  isSetButtonDisabled: true,
  isDisabled: false,
  isSelectionSetEvent: false,
  isDisabledEvent: true,
  canSelectMeAsPlayer: false,
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
          onFinish={mockOnFinish}
          onDiscard={mockOnDiscard}
          onPlaySet={mockOnPlaySet}
          onSelectSecret={mockOnSelectSecret}
          onSelectPlayer={mockOnSelectPlayer}
          onPlayEvent={mockOnPlayEvent}
          onSelectSet={mockOnSelectSet}
          isSelectionPlayerEvent={false}
          isSelectionSecretEvent={false}
          isSelectionSetEvent={false}
          isSetButtonDisabled={false}
          isDisabledEvent={false}
          isDisabled={false}
          canSelectMeAsPlayer={false}
        />,
      );

      const handActions = screen.getByTestId("hand-actions");
      expect(handActions).toBeInTheDocument();

      const buttons = screen.getAllByTestId("mock-button");
      expect(buttons.length).toBe(7);
      expect(buttons[0]).toHaveTextContent("Discard cards");
      expect(buttons[1]).toHaveTextContent("Play set");
      expect(buttons[2]).toHaveTextContent("Play event");
      expect(buttons[3]).toHaveTextContent("Select set");
      expect(buttons[4]).toHaveTextContent("Select secret");
      expect(buttons[5]).toHaveTextContent("Select player");
      expect(buttons[6]).toHaveTextContent("Finish turn");
    });
  });

  describe("Interactions", () => {
    it("calls onDiscard when 'Discard cards' button is clicked", async () => {
      render(<HandActions {...baseProps} />);

      const buttons = screen.getAllByTestId("mock-button");
      expect(buttons).toHaveLength(7);

      expect(screen.getByText("Discard cards")).toBeInTheDocument();
      expect(screen.getByText("Play set")).toBeInTheDocument();
      expect(screen.getByText("Select player")).toBeInTheDocument();
      expect(screen.getByText("Select secret")).toBeInTheDocument();
      expect(screen.getByText("Finish turn")).toBeInTheDocument();
      expect(screen.getByText("Play event")).toBeInTheDocument();
      expect(screen.getByText("Select set")).toBeInTheDocument();

      expect(buttons[0]).not.toBeDisabled();
      expect(buttons[1]).toBeDisabled();
      expect(buttons[2]).toBeDisabled();
      expect(buttons[3]).toBeDisabled();
      expect(buttons[4]).toBeDisabled();
      expect(buttons[5]).toBeDisabled();
      expect(buttons[6]).not.toBeDisabled();
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
      expect(buttons.length).toBe(7);

      fireEvent.click(buttons[0]);
      fireEvent.click(buttons[4]);
      buttons.forEach((button) => fireEvent.click(button));

      expect(mockOnDiscard).not.toHaveBeenCalled();
      expect(mockOnPlaySet).not.toHaveBeenCalled();
      expect(mockOnSelectPlayer).not.toHaveBeenCalled();
      expect(mockOnSelectSecret).not.toHaveBeenCalled();
      expect(mockOnFinish).not.toHaveBeenCalled();
    });

    it("disables Discard and Finish turn when 'isSelectionSetEvent' is true", () => {
      render(
        <HandActions
          onFinish={mockOnFinish}
          onDiscard={mockOnDiscard}
          onPlaySet={mockOnPlaySet}
          onSelectSecret={mockOnSelectSecret}
          onSelectPlayer={mockOnSelectPlayer}
          onPlayEvent={mockOnPlayEvent}
          onSelectSet={mockOnSelectSet}
          isSelectionPlayerEvent={false}
          isSelectionSecretEvent={false}
          isSelectionSetEvent={true}
          isSetButtonDisabled={false}
          isDisabledEvent={false}
          isDisabled={false}
          canSelectMeAsPlayer={false}
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
  });
});
