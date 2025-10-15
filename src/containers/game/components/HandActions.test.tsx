import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import HandActions from "./HandActions";

const { mockOnFinish, mockOnDiscard } = vi.hoisted(() => {
  const mockOnFinish = vi.fn();
  const mockOnDiscard = vi.fn();

  return { mockOnFinish, mockOnDiscard };
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
    <button data-testid="mock-button" onClick={onClick} disabled={disabled}>
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
          isDisabled={false}
          isDiscarding={false}
        />,
      );

      const handActions = screen.getByTestId("hand-actions");
      expect(handActions).toBeInTheDocument();

      const buttons = screen.getAllByTestId("mock-button");
      expect(buttons.length).toBe(2);
      expect(buttons[0]).toHaveTextContent("Discard cards");
      expect(buttons[1]).toHaveTextContent("Finish turn");
    });

    it("shows 'Cancel discard' when the user is discarding", () => {
      render(
        <HandActions
          onFinish={mockOnFinish}
          onDiscard={mockOnDiscard}
          isDisabled={false}
          isDiscarding={true}
        />,
      );

      const cancelDiscardButton = screen.getAllByTestId("mock-button")[0];

      expect(cancelDiscardButton).toBeInTheDocument();
      expect(cancelDiscardButton).toHaveTextContent("Cancel discard");
    });
  });

  describe("Interactions", () => {
    it("calls onDiscard when 'Discard cards' button is clicked", () => {
      render(
        <HandActions
          onFinish={mockOnFinish}
          onDiscard={mockOnDiscard}
          isDisabled={false}
          isDiscarding={false}
        />,
      );

      const discardCardsButton = screen.getAllByTestId("mock-button")[0];
      expect(discardCardsButton).toBeInTheDocument();

      fireEvent.click(discardCardsButton);
      expect(mockOnDiscard).toHaveBeenCalled();
    });

    it("calls onFinish when 'Finish turn' button is clicked", () => {
      render(
        <HandActions
          onFinish={mockOnFinish}
          onDiscard={mockOnDiscard}
          isDisabled={false}
          isDiscarding={false}
        />,
      );

      const finishTurnButton = screen.getAllByTestId("mock-button")[1];
      expect(finishTurnButton).toBeInTheDocument();

      fireEvent.click(finishTurnButton);
      expect(mockOnFinish).toHaveBeenCalled();
    });

    it("does not call onDiscard or onFinish when buttons are disabled", () => {
      render(
        <HandActions
          onFinish={mockOnFinish}
          onDiscard={mockOnDiscard}
          isDisabled={true}
          isDiscarding={false}
        />,
      );

      const buttons = screen.getAllByTestId("mock-button");
      expect(buttons.length).toBe(2);

      fireEvent.click(buttons[0]);
      fireEvent.click(buttons[1]);

      expect(mockOnDiscard).not.toHaveBeenCalled();
      expect(mockOnFinish).not.toHaveBeenCalled();
    });
  });
});
