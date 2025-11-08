import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import type { MatchSet } from "@/types/set";

import Sets from "./Sets";

// Mock Data
const MATCH_ID = "a1b2c3d4-e5f6-7890-1234-567890abcdef";
const PLAYER_ID = "00000001-0001-0001-0001-000000000001";

const playerSets = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    type: "HERCULE POIROT",
    player_id: PLAYER_ID,
    match_id: MATCH_ID,
    quin_play: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    type: "MISS MARPLE",
    player_id: PLAYER_ID,
    match_id: MATCH_ID,
    quin_play: true,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    type: "TOMMY BERESFORD",
    player_id: PLAYER_ID,
    match_id: MATCH_ID,
    quin_play: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    type: "LADY EILEEN",
    player_id: PLAYER_ID,
    match_id: MATCH_ID,
    quin_play: true,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    type: "TWO BERESFORD",
    player_id: PLAYER_ID,
    match_id: MATCH_ID,
    quin_play: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    type: "MR SATTERTHWAITE",
    player_id: PLAYER_ID,
    match_id: MATCH_ID,
    quin_play: false,
  },
] as unknown as MatchSet[];

const emptySets: MatchSet[] = [];

// Mocking the Set component
const { MockSet } = vi.hoisted(() => {
  const MockSet = vi.fn(({ set, isTargetSet }) => {
    if (!set) return null;
    return (
      <div
        data-set-id={set.id}
        data-testid={`mock-set-${set.type}`}
        data-quin-play={set.quin_play}
        data-is-target-set={isTargetSet?.toString() || false}
      >
        Set Component - Type: {set.type}
      </div>
    );
  });

  return {
    MockSet,
  };
});

vi.mock("./Set", () => ({
  __esModule: true,
  default: MockSet,
}));

describe("Sets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the container with correct styling classes", () => {
    const { container } = render(<Sets sets={playerSets} />);

    // El componente usa un <article> como contenedor
    const articleElement = container.querySelector("article");
    expect(articleElement).toBeInTheDocument();

    // Verificamos las clases de estilo de Tailwind para el carousel
    expect(articleElement).toHaveClass(
      "flex gap-x-0.5 justify-center items-center",
    );
  });

  it("should render the correct number of Set components", () => {
    render(<Sets sets={playerSets} />);

    // El componente mock 'Set' fue llamado 3 veces (MAX_SETS_DISPLAYED = 3)
    // Se llama con los 3 primeros sets del array
    const MAX_SETS_DISPLAYED = 3;
    expect(MockSet).toHaveBeenCalledTimes(MAX_SETS_DISPLAYED);

    // Los elementos mockeados están en el documento (solo los 3 primeros)
    const renderedSets = screen.getAllByTestId(/mock-set-/);
    expect(renderedSets).toHaveLength(MAX_SETS_DISPLAYED);
  });

  it("should pass the correct props (type and quin_play) to each Set component", () => {
    const mockOnSelect = vi.fn();
    const mockIsSelectable = vi.fn(() => true);
    const mockTarget = null;
    const mockIsTargetSet = true;

    render(
      <Sets
        sets={playerSets}
        onSelectTargetEvent={mockOnSelect}
        isSelectableSet={mockIsSelectable}
        target={mockTarget}
        isTargetSet={mockIsTargetSet}
      />,
    );

    // Verificamos las props pasadas a la primera instancia de Set
    const firstSetProps = MockSet.mock.calls[0][0];
    expect(firstSetProps.set).toBe(playerSets[0]);
    expect(firstSetProps.onSelectTargetEvent).toBe(mockOnSelect);
    expect(firstSetProps.isSelectableSet).toBe(mockIsSelectable);
    expect(firstSetProps.target).toBe(mockTarget);
    expect(firstSetProps.isTargetSet).toBe(mockIsTargetSet);

    // Verificamos las props pasadas a la segunda instancia (MISS MARPLE)
    const secondSetProps = MockSet.mock.calls[1][0];
    expect(secondSetProps.set).toBe(playerSets[1]);
    expect(secondSetProps.set.type).toBe("MISS MARPLE");
    expect(secondSetProps.set.quin_play).toBe(true);

    // Verificamos las props pasadas a la tercera instancia (TOMMY BERESFORD)
    const thirdSetProps = MockSet.mock.calls[2][0];
    expect(thirdSetProps.set).toBe(playerSets[2]);
    expect(thirdSetProps.set.type).toBe("TOMMY BERESFORD");
    expect(thirdSetProps.set.quin_play).toBe(false);
  });

  it("should render the container but no Set components when the sets array is empty", () => {
    const { container } = render(<Sets sets={emptySets} />);

    // El componente retorna null cuando no hay sets
    const articleElement = container.querySelector("article");
    expect(articleElement).not.toBeInTheDocument();

    // El componente mock 'Set' NO debería haber sido llamado
    expect(MockSet).not.toHaveBeenCalled();

    // No deberían haber elementos de Set en el documento
    const renderedSets = screen.queryAllByTestId(/mock-set-/);
    expect(renderedSets).toHaveLength(0);
  });
});
