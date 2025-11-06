import { describe, it, expect } from "vitest";
import { getPlayerBorderClass, truncateName } from "./player";

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
// isTarget, isSelectable, isSelectingTarget, hasCurrentTurn, shouldHighlightRole, isActivePlayerSelection
describe("getBoderPlayer - Border Class Logic", () => {
  it("should return RED border for selected target in selection mode (isSelectable, isTarget)", () => {
    // Escenario: Modo Selección ON, Es Seleccionable, Es Target
    const result = getPlayerBorderClass(true, true, true, false, false, true);
    expect(result).toContain("border-red-400");
    expect(result).toContain("shadow-red-400/50");
    expect(result).toContain("animate-none");
    expect(result).toContain("border-10");
    expect(result).toContain("shadow-lg");
  });

  it("should return BLUE pulse border for a valid option in selection mode (isSelectable, isSelectingTarget)", () => {
    // Escenario: Modo Selección ON, Es Seleccionable, Es Opción Válida
    const result = getPlayerBorderClass(false, true, true, false, false, true);
    expect(result).toContain("border-blue-400");
    expect(result).toContain("shadow-blue-400/50");
    expect(result).toContain("animate-pulse");
    expect(result).toContain("cursor-pointer");
    expect(result).toContain("border-10");
    expect(result).toContain("shadow-lg");
  });

  it("should return TRANSPARENT border for a selectable player that is neither target nor selecting (isSelectable, neither target)", () => {
    // Escenario: Modo Selección ON, Es Seleccionable, pero neutro.
    const result = getPlayerBorderClass(false, true, false, false, false, true);
    expect(result).toContain("border-transparent");
    expect(result).toContain("border-10");
    expect(result).toContain("shadow-lg");
  });

  it("should return DIMMED class for a player that is NOT selectable in selection mode", () => {
    // Escenario: Modo Selección ON, NO es Seleccionable
    const result = getPlayerBorderClass(
      false,
      false,
      false,
      false,
      false,
      true,
    );
    expect(result).toBe(BORDER_DIMMED);
  });

  it("should return GREEN pulse border when not in selection mode but has current turn", () => {
    // Escenario: Modo Selección OFF, Turno ON
    const result = getPlayerBorderClass(
      false,
      false,
      false,
      true,
      false,
      false,
    );
    expect(result).toBe(BORDER_GREEN_TURN);
  });

  it("should prioritize Selection Mode classes over the Current Turn class if a selection class is set", () => {
    // Escenario: Turno ON, Modo Selección ON, Es Target (Debe ser RED)
    const result = getPlayerBorderClass(true, true, true, true, false, true);
    expect(result).toContain("border-red-400");
    expect(result).toContain("shadow-red-400/50");
    expect(result).toContain("animate-none");
    expect(result).not.toContain("border-green-400");
  });

  it("should return TRANSPARENT border in the base case (no selection mode, no current turn)", () => {
    // Escenario: Modo Selección OFF, Turno OFF
    const result = getPlayerBorderClass(
      false,
      false,
      false,
      false,
      false,
      false,
    );
    expect(result).toBe(BORDER_TRANSPARENT);
  });

  it("should return YELLOW border when shouldHighlightRole is true (no selection mode, no turn)", () => {
    // Escenario: Modo Selección OFF, Turno OFF, shouldHighlightRole ON
    const result = getPlayerBorderClass(
      false,
      false,
      false,
      false,
      true,
      false,
    );
    expect(result).toContain("border-yellow-400");
    expect(result).toContain("shadow-lg");
    expect(result).toContain("shadow-yellow-400/50");
  });

  it("should prioritize selection mode over role highlighting", () => {
    // Escenario: Modo Selección ON, Es Target, shouldHighlightRole ON
    // La selección debe tener prioridad sobre el highlight de rol
    const result = getPlayerBorderClass(true, true, true, false, true, true);
    expect(result).toContain("border-red-400");
    expect(result).toContain("shadow-red-400/50");
    expect(result).not.toContain("border-yellow-400");
  });

  it("should prioritize current turn over role highlighting", () => {
    // Escenario: Modo Selección OFF, Turno ON, shouldHighlightRole ON
    // El turno debe tener prioridad sobre el highlight de rol
    const result = getPlayerBorderClass(false, false, false, true, true, false);
    expect(result).toContain("border-green-400");
    expect(result).toContain("shadow-green-400/50");
    expect(result).not.toContain("border-yellow-400");
  });

  it("should show role highlighting when no other conditions are active", () => {
    // Escenario: Solo shouldHighlightRole ON, todo lo demás OFF
    const result = getPlayerBorderClass(
      false,
      false,
      false,
      false,
      true,
      false,
    );
    expect(result).toContain("border-yellow-400");
    expect(result).toContain("shadow-yellow-400/50");
  });
});
