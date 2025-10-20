import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import Set from "./Set"; // Componente a testear
import type { SetType } from "@/types/set";

// Mocking Components and Assets
const { mockCardPoirot, mockCardMarple, mockCardTommy, mockCardTuppence } =
  vi.hoisted(() => {
    const mockCardPoirot = "/assets/07-detective_poirot.png";
    const mockCardMarple = "/assets/08-detective_marple.png";
    const mockCardTommy = "/assets/12-detective_tommyberesford.png";
    const mockCardTuppence = "/assets/13-detective_tuppenceberesford.png";
    return { mockCardPoirot, mockCardMarple, mockCardTommy, mockCardTuppence };
  });

vi.mock("@/assets/07-detective_poirot.png", () => ({
  default: mockCardPoirot,
}));
vi.mock("@/assets/08-detective_marple.png", () => ({
  default: mockCardMarple,
}));
vi.mock("@/assets/12-detective_tommyberesford.png", () => ({
  default: mockCardTommy,
}));
vi.mock("@/assets/13-detective_tuppenceberesford.png", () => ({
  default: mockCardTuppence,
}));
// El resto de imágenes no es necesario mockearlas si no se testean sus rutas específicas.

vi.mock("@remixicon/react", () => ({
  RiVipCrown2Fill: vi.fn(({ color }) => (
    <div data-testid="mock-crown" data-color={color} />
  )),
}));

// Mock Data
const mockSetTypeStandard: SetType = "HERCULE POIROT";
const mockSetTypeQuinPlay: SetType = "MISS MARPLE";
const mockSetTypeTwoBeresford: SetType = "TWO BERESFORD";

describe("Set Component", () => {
  it("should render a standard set type with correct image and without the crown icon", () => {
    render(<Set type={mockSetTypeStandard} quin_play={false} quin_count={0} />);

    const setImage = screen.getByRole("img", {
      name: `set-type-${mockSetTypeStandard}`,
    });
    expect(setImage).toBeInTheDocument();
    expect(setImage).toHaveAttribute("src", mockCardPoirot);
    expect(setImage).toHaveAttribute("title", mockSetTypeStandard);

    const cardContainer = setImage.closest(".rounded-lg");
    expect(cardContainer).toHaveClass("w-15 h-22.5");

    // La corona NO esté presente
    expect(screen.queryByTestId("mock-crown")).not.toBeInTheDocument();

    // El contenedor principal NO tenga la clase "mr-4" (solo para Two_Beresford)
    expect(setImage.closest(".relative")).not.toHaveClass("mr-4");

    // No haya una segunda imagen (solo para Two_Beresford)
    expect(
      screen.queryByRole("img", { name: /TUPPENCE BERESFORD/i }),
    ).not.toBeInTheDocument();
  });

  it("should render the crown icon when quin_play is true", () => {
    render(<Set type={mockSetTypeQuinPlay} quin_play={true} quin_count={1} />);

    // El componente mock de la corona SÍ esté presente
    expect(screen.getByTestId("mock-crown")).toBeInTheDocument();
  });

  it("should render the crown icon with 'peru' color when quin_play is true and quin_count is 1", () => {
    render(<Set type={mockSetTypeQuinPlay} quin_play={true} quin_count={1} />);

    const crownIcon = screen.getByTestId("mock-crown");
    expect(crownIcon).toBeInTheDocument();
    expect(crownIcon).toHaveAttribute("data-color", "peru");
  });

  it("should render the crown icon with 'gold' color when quin_play is true and quin_count is greater than 1", () => {
    render(<Set type={mockSetTypeQuinPlay} quin_play={true} quin_count={2} />);

    const crownIcon = screen.getByTestId("mock-crown");
    expect(crownIcon).toBeInTheDocument();
    expect(crownIcon).toHaveAttribute("data-color", "gold");
  });

  it("should render Two_Beresford type with two cards and the correct container spacing", () => {
    render(
      <Set type={mockSetTypeTwoBeresford} quin_play={false} quin_count={0} />,
    );

    expect(screen.getAllByTestId("set")).toHaveLength(2);

    // Espaciado en el contenedor principal
    const container = screen.getAllByTestId("set")[0].closest(".relative");
    expect(container).toHaveClass("mr-4");

    // Primera imagen (TOMMY BERESFORD)
    const tommyImage = screen.getByRole("img", {
      name: "set-type-TOMMY BERESFORD",
    });
    expect(tommyImage).toBeInTheDocument();
    expect(tommyImage).toHaveAttribute("src", mockCardTommy);
    expect(tommyImage).toHaveAttribute("title", "TOMMY BERESFORD");

    // Segunda imagen (TUPPENCE BERESFORD)
    const tuppenceImage = screen.getByRole("img", {
      name: "set-type-TUPPENCE BERESFORD",
    });
    expect(tuppenceImage).toBeInTheDocument();
    expect(tuppenceImage).toHaveAttribute("src", mockCardTuppence);
    expect(tuppenceImage).toHaveAttribute("title", "TUPPENCE BERESFORD");

    // El componente de la corona NO esté presente
    expect(screen.queryByTestId("mock-crown")).not.toBeInTheDocument();
  });
});
