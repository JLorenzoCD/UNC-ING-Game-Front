import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import HandActions from "./HandActions";

const { mockOnFinish, mockOnDiscard, mockIsDiscarding } = vi.hoisted(() => {
  const mockOnFinish = vi.fn();
  const mockOnDiscard = vi.fn();
  const mockIsDiscarding = false;

  return { mockOnFinish, mockOnDiscard, mockIsDiscarding };
});

vi.mock("@/components/Button", () => ({
  default: ({
    children,
    onClick,
  }: {
    children: ReactNode;
    onClick: () => void;
  }) => (
    <button data-testid="mock-button" onClick={onClick}>
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
          isDiscarding={mockIsDiscarding}
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
          isDiscarding={mockIsDiscarding}
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
          isDiscarding={mockIsDiscarding}
        />,
      );

      const finishTurnButton = screen.getAllByTestId("mock-button")[1];
      expect(finishTurnButton).toBeInTheDocument();

      fireEvent.click(finishTurnButton);
      expect(mockOnFinish).toHaveBeenCalled();
    });
  });
});
