import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Result from "./Result";
import type { MatchResult } from "@/types/match";
import { FRONTEND_PATHS } from "@/constants/frontend";

const { mockUseNavigate } = vi.hoisted(() => {
  const mockUseNavigate = vi.fn();

  return {
    mockUseNavigate,
  };
});

vi.mock("react-router", async (importOriginal) => {
  const mod = await importOriginal<typeof import("react-router")>();
  return {
    ...mod,
    useNavigate: () => mockUseNavigate,
  };
});

vi.mock("@/components/Button", () => ({
  default: ({
    onClick,
    children,
  }: {
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button data-testid="mock-button" onClick={onClick}>
      {children}
    </button>
  ),
}));

const mockResult: MatchResult = {
  reason: "deck_finished",
  details: "Poirot was the murderer!",
  match_id: crypto.randomUUID(),
  secret_murderer_id: crypto.randomUUID(),
  secret_accomplice_id: crypto.randomUUID(),
};

describe("Result", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("does not render when result is null", () => {
      render(<Result result={null} />);

      const result = screen.queryByTestId("result");
      expect(result).not.toBeInTheDocument();
    });

    it("renders correctly when result is provided", () => {
      render(<Result result={mockResult} />);

      const result = screen.queryByTestId("result");
      expect(result).toBeInTheDocument();
    });

    it("renders result details correctly", () => {
      render(<Result result={mockResult} />);

      const details = screen.getByText("Poirot was the murderer!");
      expect(details).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("navigates the user to match list on click", () => {
      mockUseNavigate.mockReturnValue(undefined);

      render(<Result result={mockResult} />);

      const returnButton = screen.getByText("Return to match list");
      expect(returnButton).toBeInTheDocument();

      fireEvent.click(returnButton);

      expect(mockUseNavigate).toHaveBeenCalledWith(FRONTEND_PATHS.MATCH_LIST);
    });
  });
});
