import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import HandActions from "./HandActions";

const {
  mockOnFinish,
  mockOnDiscard,
  mockOnPlaySet,
  mockOnSelectPlayer,
  mockOnSelectSecret,
  mockOnPlayEvent,
  mockOnEndEvent,
} = vi.hoisted(() => {
  const mockOnFinish = vi.fn();
  const mockOnDiscard = vi.fn();
  const mockOnPlaySet = vi.fn();
  const mockOnSelectPlayer = vi.fn();
  const mockOnSelectSecret = vi.fn();
  const mockOnPlayEvent = vi.fn();
  const mockOnEndEvent = vi.fn();

  return {
    mockOnFinish,
    mockOnDiscard,
    mockOnPlaySet,
    mockOnSelectPlayer,
    mockOnSelectSecret,
    mockOnPlayEvent,
    mockOnEndEvent,
  };
});

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

describe("HandActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
          onEndEvent={mockOnEndEvent}
          isSelectionPlayerEvent={false}
          isSelectionSecretEvent={false}
          isSelectionSetEvent={false}
          isSetButtonDisabled={false}
          isDisabledEvent={false}
          isDisabledEndEvent={false}
          isDisabled={false}
        />,
      );

      const handActions = screen.getByTestId("hand-actions");
      expect(handActions).toBeInTheDocument();

      const buttons = screen.getAllByTestId("mock-button");
      expect(buttons.length).toBe(7);
      expect(buttons[0]).toHaveTextContent("Discard cards");
      expect(buttons[1]).toHaveTextContent("Play set");
      expect(buttons[2]).toHaveTextContent("Select player");
      expect(buttons[3]).toHaveTextContent("Select secret");
      expect(buttons[4]).toHaveTextContent("Finish turn");
      expect(buttons[5]).toHaveTextContent("Play event");
      expect(buttons[6]).toHaveTextContent("Apply effect");
    });
  });

  describe("Interactions", () => {
    it("calls onDiscard when 'Discard cards' button is clicked", async () => {
      render(
        <HandActions
          onFinish={mockOnFinish}
          onDiscard={mockOnDiscard}
          onPlaySet={mockOnPlaySet}
          onSelectSecret={mockOnSelectSecret}
          onSelectPlayer={mockOnSelectPlayer}
          onPlayEvent={mockOnPlayEvent}
          onEndEvent={mockOnEndEvent}
          isSelectionPlayerEvent={false}
          isSelectionSecretEvent={false}
          isSelectionSetEvent={false}
          isSetButtonDisabled={false}
          isDisabledEvent={false}
          isDisabledEndEvent={false}
          isDisabled={false}
        />,
      );

      const discardCardsButton = screen.getAllByTestId("mock-button")[0];
      expect(discardCardsButton).toBeInTheDocument();

      await fireEvent.click(discardCardsButton);
      expect(mockOnDiscard).toHaveBeenCalled();
    });

    it("calls onFinish when 'Finish turn' button is clicked", () => {
      render(
        <HandActions
          onFinish={mockOnFinish}
          onDiscard={mockOnDiscard}
          onPlaySet={mockOnPlaySet}
          onSelectSecret={mockOnSelectSecret}
          onSelectPlayer={mockOnSelectPlayer}
          onPlayEvent={mockOnPlayEvent}
          onEndEvent={mockOnEndEvent}
          isSelectionPlayerEvent={false}
          isSelectionSecretEvent={false}
          isSelectionSetEvent={false}
          isSetButtonDisabled={false}
          isDisabledEvent={false}
          isDisabledEndEvent={false}
          isDisabled={false}
        />,
      );

      const finishTurnButton = screen.getAllByTestId("mock-button")[4];
      expect(finishTurnButton).toBeInTheDocument();

      fireEvent.click(finishTurnButton);
      expect(mockOnFinish).toHaveBeenCalled();
    });

    it("does not call onDiscard or onFinish when buttons are disabled", () => {
      render(
        <HandActions
          onFinish={mockOnFinish}
          onDiscard={mockOnDiscard}
          onPlaySet={mockOnPlaySet}
          onSelectSecret={mockOnSelectSecret}
          onSelectPlayer={mockOnSelectPlayer}
          onPlayEvent={mockOnPlayEvent}
          onEndEvent={mockOnEndEvent}
          isSelectionPlayerEvent={false}
          isSelectionSecretEvent={false}
          isSelectionSetEvent={false}
          isSetButtonDisabled={false}
          isDisabledEvent={false}
          isDisabledEndEvent={false}
          isDisabled={true}
        />,
      );

      const buttons = screen.getAllByTestId("mock-button");
      expect(buttons.length).toBe(7);

      fireEvent.click(buttons[0]);
      fireEvent.click(buttons[4]);

      expect(mockOnDiscard).not.toHaveBeenCalled();
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
          onEndEvent={mockOnEndEvent}
          isSelectionPlayerEvent={false}
          isSelectionSecretEvent={false}
          isSelectionSetEvent={true}
          isSetButtonDisabled={false}
          isDisabledEvent={false}
          isDisabledEndEvent={false}
          isDisabled={false}
        />,
      );

      const discardButton = screen.getAllByTestId("mock-button")[0];
      const finishButton = screen.getAllByTestId("mock-button")[4];

      fireEvent.click(discardButton);
      fireEvent.click(finishButton);

      expect(mockOnDiscard).not.toHaveBeenCalled();
      expect(mockOnFinish).not.toHaveBeenCalled();
    });
  });
});
