import { describe, it, expect } from "vitest";

import { getBoderClass } from "./secretClassName";

const BORDER_RED_REVEALED =
  "border-4 border-red-500 shadow-lg shadow-red-500/50";
const BORDER_RED_TARGET_SELECTED =
  "border-2 border-red-400 shadow-lg shadow-red-400/50 animate-none";
const BORDER_BLUE_SELECTING =
  "border-2 border-blue-400 shadow-lg shadow-blue-400/50 animate-pulse cursor-pointer";
const BORDER_BLUE_TARGET_REVEALED =
  "border-4 border-blue-500 shadow-lg shadow-blue-500/50";
const BORDER_TRANSPARENT_DIMMED =
  "border-2 border-transparent shadow-none brightness-50";
const BORDER_ANIMATED_PULSE = " animate-pulse cursor-pointer";

// Orden de las props:
// isSelfRevealed, isSelectionMode, isSelectable, isTarget, isSelectingTarget
// getBoderClass(isSelfRevealed, isSelectionMode, isSelectable, isTarget, isSelectingTarget)

describe("getBoderClass - Tests Case by Case", () => {
  it("should return the pulse class when revealed, selectable, and selectingTarget", () => {
    // isSelfRevealed: true, isSelectable: true, isSelectingTarget: true
    const result = getBoderClass(true, true, true, false, true);
    expect(result).toBe(`${BORDER_RED_REVEALED}${BORDER_ANIMATED_PULSE}`);
  });

  it("should return the blue target class when revealed, selectable, and isTarget", () => {
    // isSelfRevealed: true, isSelectable: true, isTarget: true
    const result = getBoderClass(true, true, true, true, false);
    expect(result).toBe(BORDER_BLUE_TARGET_REVEALED);
  });

  it("should return the base red class when revealed but not meeting sub-conditions", () => {
    // isSelfRevealed: true, isSelectable: false
    const result = getBoderClass(true, false, false, false, false);
    expect(result).toBe(BORDER_RED_REVEALED);
  });

  it("should return the selected red border class when selection mode, selectable, and isTarget", () => {
    // isSelectionMode: true, isSelectable: true, isTarget: true
    const result = getBoderClass(false, true, true, true, false);
    expect(result).toBe(BORDER_RED_TARGET_SELECTED);
  });

  it("should return the pulse blue class when selection mode, selectable, and selectingTarget (not yet selected)", () => {
    // isSelectionMode: true, isSelectable: true, isSelectingTarget: true, isTarget: false
    const result = getBoderClass(false, true, true, false, true);
    expect(result).toBe(BORDER_BLUE_SELECTING);
  });

  it("should return the dimmed class when selectable but not the target or selecting", () => {
    // isSelectionMode: true, isSelectable: true, isTarget: false, isSelectingTarget: false
    const result = getBoderClass(false, true, true, false, false);
    expect(result).toBe(BORDER_TRANSPARENT_DIMMED);
  });

  it("should return the dimmed class when in selection mode but NOT selectable", () => {
    // isSelectionMode: true, isSelectable: false (Independientemente de isTarget/isSelectingTarget)
    const result = getBoderClass(false, true, false, true, true);
    expect(result).toBe(BORDER_TRANSPARENT_DIMMED);
  });

  it("should return an empty string when NOT in selection mode and NOT self revealed", () => {
    // isSelfRevealed: false, isSelectionMode: false
    const result = getBoderClass(false, false, true, true, true);
    expect(result).toBe("");
  });

  it("should return an empty string when all flags are false", () => {
    const result = getBoderClass(false, false, false, false, false);
    expect(result).toBe("");
  });
});
