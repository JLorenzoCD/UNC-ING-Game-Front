import { describe, it, expect } from "vitest";
import { getBoderPlayer, truncateName } from "./player";

const BORDER_RED_TARGET =
  "border-red-400 border-10 shadow-lg shadow-red-400/50 animate-none";
const BORDER_BLUE_SELECTING =
  "border-blue-400 border-10 shadow-lg shadow-blue-400/50 animate-pulse cursor-pointer";
const BORDER_GREEN_TURN =
  "border-green-400 shadow-lg shadow-green-400/50 animate-pulse";
const BORDER_DIMMED =
  "border-4 border-transparent shadow-none brightness-50 cursor-default";
const BORDER_TRANSPARENT = "border-transparent";

describe("truncateName", () => {
  it("should truncate a name longer than 15 characters and append '...'", () => {
    const longName = "This name is definitely too long";
    expect(truncateName(longName)).toBe("This name is de...");
  });

  it("should not truncate a name with exactly 15 characters", () => {
    const exactName = "FifteenCharName"; // 15 caracteres
    expect(truncateName(exactName)).toBe("FifteenCharName");
  });

  it("should return the original name if it is shorter than 15 characters", () => {
    const shortName = "Short";
    expect(truncateName(shortName)).toBe("Short");
  });

  it("should truncate the name using a custom maxLength", () => {
    const name = "A very long name for testing";
    const customLength = 10;
    expect(truncateName(name, customLength)).toBe("A very lon...");
  });

  it("should handle an empty string", () => {
    expect(truncateName("")).toBe("");
  });
});

// Orden de las props:
// hasCurrentTurn, isActivePlayerSelection, isSelectable, isTarget, isSelectingTarget
describe("getBoderPlayer - Border Class Logic", () => {
  it("should return RED border for selected target in selection mode (isSelectable, isTarget)", () => {
    // Escenario: Modo Selección ON, Es Seleccionable, Es Target
    const result = getBoderPlayer(false, true, true, true, false);
    expect(result).toBe(BORDER_RED_TARGET);
  });

  it("should return BLUE pulse border for a valid option in selection mode (isSelectable, isSelectingTarget)", () => {
    // Escenario: Modo Selección ON, Es Seleccionable, Es Opción Válida
    const result = getBoderPlayer(false, true, true, false, true);
    expect(result).toBe(BORDER_BLUE_SELECTING);
  });

  it("should return TRANSPARENT border for a selectable player that is neither target nor selecting (isSelectable, neither target)", () => {
    // Escenario: Modo Selección ON, Es Seleccionable, pero neutro.
    const result = getBoderPlayer(false, true, true, false, false);
    expect(result).toBe(BORDER_TRANSPARENT);
  });

  it("should return DIMMED class for a player that is NOT selectable in selection mode", () => {
    // Escenario: Modo Selección ON, NO es Seleccionable
    const result = getBoderPlayer(false, true, false, false, false);
    expect(result).toBe(BORDER_DIMMED);
  });

  it("should return GREEN pulse border when not in selection mode but has current turn", () => {
    // Escenario: Modo Selección OFF, Turno ON
    const result = getBoderPlayer(true, false, false, false, false);
    expect(result).toBe(BORDER_GREEN_TURN);
  });

  it("should prioritize Selection Mode classes over the Current Turn class if a selection class is set", () => {
    // Escenario: Turno ON, Modo Selección ON, Es Target (Debe ser RED)
    const result = getBoderPlayer(true, true, true, true, false);
    expect(result).toBe(BORDER_RED_TARGET);
  });

  it("should return TRANSPARENT border in the base case (no selection mode, no current turn)", () => {
    // Escenario: Modo Selección OFF, Turno OFF
    const result = getBoderPlayer(false, false, false, false, false);
    expect(result).toBe(BORDER_TRANSPARENT);
  });
});
