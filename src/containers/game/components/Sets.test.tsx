import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import type { MatchSet } from "@/types/set";

import Sets from "./Sets";

// Mock Data
const MATCH_ID = "a1b2c3d4-e5f6-7890-1234-567890abcdef";
const PLAYER_ID = "00000001-0001-0001-0001-000000000001";

const playerSets: MatchSet[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    type: "Hercule_Poirot",
    player_id: PLAYER_ID,
    match_id: MATCH_ID,
    quin_play: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    type: "Miss_Marple",
    player_id: PLAYER_ID,
    match_id: MATCH_ID,
    quin_play: true,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    type: "Tommy_Beresford",
    player_id: PLAYER_ID,
    match_id: MATCH_ID,
    quin_play: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    type: "Lady_Eileen",
    player_id: PLAYER_ID,
    match_id: MATCH_ID,
    quin_play: true,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    type: "Two_Beresford",
    player_id: PLAYER_ID,
    match_id: MATCH_ID,
    quin_play: false,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    type: "Mr_Satterthwaite",
    player_id: PLAYER_ID,
    match_id: MATCH_ID,
    quin_play: false,
  },
];

const emptySets: MatchSet[] = [];

// Mocking the Set component
const { MockSet } = vi.hoisted(() => {
  const MockSet = vi.fn(
    ({ type, quin_play }: { type: string; quin_play: boolean }) => (
      <div
        data-testid={`mock-set-${type}`}
        data-quin-play={quin_play.toString()}
      >
        Set Component - Type: {type}
      </div>
    ),
  );

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

    // Verificamos las clases de estilo de Tailwind
    expect(articleElement).toHaveClass(
      "flex gap-5 flex-wrap justify-center items-center w-72",
    );
  });

  it("should render the correct number of Set components", () => {
    render(<Sets sets={playerSets} />);

    // El componente mock 'Set' fue llamado el número correcto de veces
    expect(MockSet).toHaveBeenCalledTimes(playerSets.length);

    // Los elementos mockeados están en el documento
    const renderedSets = screen.getAllByTestId(/mock-set-/);
    expect(renderedSets).toHaveLength(playerSets.length);
  });

  it("should pass the correct props (type and quin_play) to each Set component", () => {
    render(<Sets sets={playerSets} />);

    // Verificamos las props pasadas a la primera instancia de Set
    const firstSetProps = MockSet.mock.calls[0][0];
    expect(firstSetProps.type).toBe("Hercule_Poirot");
    expect(firstSetProps.quin_play).toBe(false);

    // Verificamos las props pasadas a una instancia donde quin_play es true (Miss_Marple)
    const secondSetProps = MockSet.mock.calls[1][0];
    expect(secondSetProps.type).toBe("Miss_Marple");
    expect(secondSetProps.quin_play).toBe(true);

    // Verificamos las props pasadas a la última instancia
    const lastSetProps = MockSet.mock.calls[playerSets.length - 1][0];
    expect(lastSetProps.type).toBe("Mr_Satterthwaite");
    expect(lastSetProps.quin_play).toBe(false);
  });

  it("should render the container but no Set components when the sets array is empty", () => {
    const { container } = render(<Sets sets={emptySets} />);

    // El contenedor <article> debería estar presente
    const articleElement = container.querySelector("article");
    expect(articleElement).toBeInTheDocument();

    // El componente mock 'Set' NO debería haber sido llamado
    expect(MockSet).not.toHaveBeenCalled();

    // No deberían haber elementos de Set en el documento
    const renderedSets = screen.queryAllByTestId(/mock-set-/);
    expect(renderedSets).toHaveLength(0);
  });
});
