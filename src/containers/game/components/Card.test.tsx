import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Card from "./Card";

describe("Card", () => {
  describe("Rendering", () => {
    it("renders the card image when a valid name is provided", () => {
      render(<Card name={"POIROT"} description="A famous detective" />);

      const imgElement = screen.getByRole("img", {
        name: /A famous detective/i,
      });
      expect(imgElement).toBeInTheDocument();
      expect(imgElement).toHaveAttribute(
        "src",
        expect.stringContaining("detective_poirot.png"),
      );
    });

    it("renders the empty card placeholder when an invalid name is provided", () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      render(<Card name={"UNKNOWN_CARD"} description="Unknown card" />);

      expect(screen.getByText("No image available")).toBeInTheDocument();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "No image found for card: UNKNOWN_CARD",
      );

      consoleWarnSpy.mockRestore();
    });

    beforeEach(() => {
      vi.clearAllMocks();
    });
  });
});
