import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import Set from "./Set"; // Componente a testear
import type { MatchSet, SetType } from "@/types/set";

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

const MOCK_MATCH_ID = "34969583-cb5c-490b-9a60-dc042694516c";
const MOCK_PLAYER_ID = "bccfde02-ca80-4b09-abc7-475ddf31bf92";

// Mock Data
const mockSetTypeStandard: SetType = "HERCULE POIROT";
const mockSetTypeQuinPlay: SetType = "MISS MARPLE";
const mockSetTypeTwoBeresford: SetType = "TWO BERESFORD";

const mockSetObjectStandard: MatchSet = {
  id: "024181f9-d11f-412a-8b4b-d1b75a177375",
  type: mockSetTypeStandard,
  player_id: MOCK_PLAYER_ID,
  match_id: MOCK_MATCH_ID,
  quin_play: false,
};

const mockSetObjectQuin: MatchSet = {
  id: "96e0e160-5b1f-469f-aad4-116513fb6f29",
  type: mockSetTypeQuinPlay,
  player_id: MOCK_PLAYER_ID,
  match_id: MOCK_MATCH_ID,
  quin_play: true,
};

const mockSetObjectBeresford: MatchSet = {
  id: "b5491a95-93ba-44e4-ae1d-b1b420178a7a",
  type: mockSetTypeTwoBeresford,
  player_id: MOCK_PLAYER_ID,
  match_id: MOCK_MATCH_ID,
  quin_play: false,
};

describe("Set Component", () => {
  it("should render a standard set type with correct image and without the crown icon", () => {
    render(
      <Set
        type={mockSetTypeStandard}
        quin_play={false}
        set_object={mockSetObjectStandard}
        quin_count={0}
      />,
    );

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
    render(
      <Set
        type={mockSetTypeQuinPlay}
        quin_play={true}
        set_object={mockSetObjectQuin}
        quin_count={0}
      />,
    );

    // El componente mock de la corona SÍ esté presente
    expect(screen.getByTestId("mock-crown")).toBeInTheDocument();
  });

  it("should render the crown icon with 'peru' color when quin_play is true and quin_count is 1", () => {
    render(
      <Set
        type={mockSetTypeQuinPlay}
        quin_play={true}
        quin_count={1}
        set_object={mockSetObjectQuin}
      />,
    );

    const crownIcon = screen.getByTestId("mock-crown");
    expect(crownIcon).toBeInTheDocument();
    expect(crownIcon).toHaveAttribute("data-color", "peru");
  });

  it("should render the crown icon with 'gold' color when quin_play is true and quin_count is greater than 1", () => {
    render(
      <Set
        type={mockSetTypeQuinPlay}
        quin_play={true}
        quin_count={2}
        set_object={mockSetObjectQuin}
      />,
    );

    const crownIcon = screen.getByTestId("mock-crown");
    expect(crownIcon).toBeInTheDocument();
    expect(crownIcon).toHaveAttribute("data-color", "gold");
  });

  it("should render Two_Beresford type with two cards and the correct container spacing", () => {
    render(
      <Set
        type={mockSetTypeTwoBeresford}
        quin_play={false}
        set_object={mockSetObjectBeresford}
        quin_count={0}
      />,
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

describe("Selection and Interaction", () => {
  const mockOnSelectTargetEvent = vi.fn();
  const mockIsSelectableSet = vi.fn(() => true);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call onSelectTargetEvent when clicked and is selectable", () => {
    render(
      <Set
        quin_count={0}
        type={mockSetTypeStandard}
        quin_play={false}
        set_object={mockSetObjectStandard}
        onSelectTargetEvent={mockOnSelectTargetEvent}
        isSelectableSet={mockIsSelectableSet}
        isTargetSet={true}
        target={null}
      />,
    );

    const container = screen.getByRole("img").closest(".relative");
    if (container) {
      fireEvent.click(container);
    }

    expect(mockIsSelectableSet).toHaveBeenCalledWith(mockSetObjectStandard);
    expect(mockOnSelectTargetEvent).toHaveBeenCalledWith(mockSetObjectStandard);
  });

  it("should NOT call onSelectTargetEvent when clicked and is NOT selectable", () => {
    mockIsSelectableSet.mockReturnValue(false);

    render(
      <Set
        quin_count={0}
        type={mockSetTypeStandard}
        quin_play={false}
        set_object={mockSetObjectStandard}
        onSelectTargetEvent={mockOnSelectTargetEvent}
        isSelectableSet={mockIsSelectableSet}
        isTargetSet={true}
        target={null}
      />,
    );

    const container = screen.getByRole("img").closest(".relative");
    if (container) {
      fireEvent.click(container);
    }

    expect(mockIsSelectableSet).toHaveBeenCalledWith(mockSetObjectStandard);
    expect(mockOnSelectTargetEvent).not.toHaveBeenCalled();
  });

  it("should NOT call onSelectTargetEvent when not in selection mode", () => {
    render(
      <Set
        quin_count={0}
        type={mockSetTypeStandard}
        quin_play={false}
        set_object={mockSetObjectStandard}
        onSelectTargetEvent={mockOnSelectTargetEvent}
        isSelectableSet={mockIsSelectableSet}
        isTargetSet={false} // Modo selección apagado
        target={null}
      />,
    );

    const container = screen.getByRole("img").closest(".relative");
    if (container) {
      fireEvent.click(container);
    }

    expect(mockOnSelectTargetEvent).not.toHaveBeenCalled();
  });

  it("should apply pulsing border when selectable and no target is selected", () => {
    render(
      <Set
        quin_count={0}
        type={mockSetTypeStandard}
        quin_play={false}
        set_object={mockSetObjectStandard}
        isSelectableSet={() => true}
        isTargetSet={true}
        target={null}
      />,
    );

    const imgContainer = screen.getByRole("img").closest(".rounded-lg");
    expect(imgContainer).toHaveClass(
      "rounded-lg overflow-hidden transition-all duration-200 w-15 h-22.5 outline outline-2 outline-red-400 shadow-lg shadow-red-400/50 animate-pulse cursor-pointer",
    );
  });

  it("should apply selected border when it is the target", () => {
    render(
      <Set
        quin_count={0}
        type={mockSetTypeStandard}
        quin_play={false}
        set_object={mockSetObjectStandard}
        isSelectableSet={() => true}
        isTargetSet={true}
        target={mockSetObjectStandard}
      />,
    );

    const imgContainer = screen.getByRole("img").closest(".rounded-lg");
    expect(imgContainer).toHaveClass(
      "rounded-lg overflow-hidden transition-all duration-200 w-15 h-22.5 outline outline-2 outline-blue-400 shadow-lg shadow-blue-400/50 animate-none",
    );
    expect(imgContainer).not.toHaveClass("animate-pulse");
  });
});
