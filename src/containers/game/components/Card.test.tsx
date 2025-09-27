import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react";
import Card from "./Card";

describe("Card", () => {
  describe("Rendering", () => {
    it("renders the card image when a valid name is provided", () => {
      render(<Card name={"HERCULE POIROT"} description="A famous detective" />);

      const imgElement = screen.getByRole("img", { name: /A famous detective/i });
      expect(imgElement).toBeInTheDocument();
      expect(imgElement).toHaveAttribute("src", expect.stringContaining("detective_poirot.png"));
    })

    beforeEach(() => {
      vi.clearAllMocks();
    })
  })
})