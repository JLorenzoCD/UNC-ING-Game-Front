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
      render(<HandActions onFinish={mockOnFinish} onDiscard={mockOnDiscard} />);

      const handActions = screen.getByTestId("hand-actions");
      expect(handActions).toBeInTheDocument();

      const buttons = screen.getAllByTestId("mock-button");
      expect(buttons.length).toBe(2);
      expect(buttons[0]).toHaveTextContent("Discard cards");
      expect(buttons[1]).toHaveTextContent("Finish turn");
    });
  });

  describe("Interactions", () => {
    it("calls onDiscard when 'Discard cards' button is clicked", () => {
      render(<HandActions onFinish={mockOnFinish} onDiscard={mockOnDiscard} />);

      const discardCardsButton = screen.getAllByTestId("mock-button")[0];
      expect(discardCardsButton).toBeInTheDocument();

      fireEvent.click(discardCardsButton);
      expect(mockOnDiscard).toHaveBeenCalled();
    });

    it("calls onFinish when 'Finish turn' button is clicked", () => {
      render(<HandActions onFinish={mockOnFinish} onDiscard={mockOnDiscard} />);

      const finishTurnButton = screen.getAllByTestId("mock-button")[1];
      expect(finishTurnButton).toBeInTheDocument();

      fireEvent.click(finishTurnButton);
      expect(mockOnFinish).toHaveBeenCalled();
    });
  });
});
