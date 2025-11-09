import "@testing-library/jest-dom";
import { act, renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { useCarousel } from "./useCarousel";

describe("useCarousel", () => {
  describe("Initial state", () => {
    it("should initialize with first page of items", () => {
      const items = ["a", "b", "c", "d", "e"];
      const { result } = renderHook(() => useCarousel(items, 3));

      expect(result.current.displayedItems).toEqual(["a", "b", "c"]);
      expect(result.current.canGoPrevPage).toBe(false);
      expect(result.current.canGoNextPage).toBe(true);
    });

    it("should pad displayed items with null when items are fewer than itemsPerPage", () => {
      const items = ["a", "b"];
      const { result } = renderHook(() => useCarousel(items, 4));

      expect(result.current.displayedItems).toEqual(["a", "b", null, null]);
      expect(result.current.canGoPrevPage).toBe(false);
      expect(result.current.canGoNextPage).toBe(false);
    });

    it("should handle empty items array", () => {
      const items: string[] = [];
      const { result } = renderHook(() => useCarousel(items, 3));

      expect(result.current.displayedItems).toEqual([null, null, null]);
      expect(result.current.canGoPrevPage).toBe(false);
      expect(result.current.canGoNextPage).toBe(false);
    });

    it("should work with complex object types", () => {
      const items = [
        { id: 1, name: "item1" },
        { id: 2, name: "item2" },
      ];
      const { result } = renderHook(() => useCarousel(items, 2));

      expect(result.current.displayedItems).toEqual([
        { id: 1, name: "item1" },
        { id: 2, name: "item2" },
      ]);
    });
  });

  describe("Next page navigation", () => {
    it("should navigate to next page when available", () => {
      const items = ["a", "b", "c", "d", "e", "f"];
      const { result } = renderHook(() => useCarousel(items, 3));

      act(() => {
        result.current.handleNextPage();
      });

      expect(result.current.displayedItems).toEqual(["d", "e", "f"]);
      expect(result.current.canGoPrevPage).toBe(true);
      expect(result.current.canGoNextPage).toBe(false);
    });

    it("should not navigate beyond last page", () => {
      const items = ["a", "b", "c"];
      const { result } = renderHook(() => useCarousel(items, 3));

      act(() => {
        result.current.handleNextPage();
      });

      expect(result.current.displayedItems).toEqual(["a", "b", "c"]);
      expect(result.current.canGoNextPage).toBe(false);
    });

    it("should pad last page with null when items don't fill the page", () => {
      const items = ["a", "b", "c", "d", "e"];
      const { result } = renderHook(() => useCarousel(items, 3));

      act(() => {
        result.current.handleNextPage();
      });

      expect(result.current.displayedItems).toEqual(["d", "e", null]);
      expect(result.current.canGoNextPage).toBe(false);
    });

    it("should navigate through multiple pages", () => {
      const items = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];
      const { result } = renderHook(() => useCarousel(items, 3));

      act(() => {
        result.current.handleNextPage();
      });
      expect(result.current.displayedItems).toEqual(["d", "e", "f"]);

      act(() => {
        result.current.handleNextPage();
      });
      expect(result.current.displayedItems).toEqual(["g", "h", "i"]);
      expect(result.current.canGoNextPage).toBe(false);
    });
  });

  describe("Previous page navigation", () => {
    it("should navigate to previous page when available", () => {
      const items = ["a", "b", "c", "d", "e", "f"];
      const { result } = renderHook(() => useCarousel(items, 3));

      act(() => {
        result.current.handleNextPage();
      });

      act(() => {
        result.current.handlePrevPage();
      });

      expect(result.current.displayedItems).toEqual(["a", "b", "c"]);
      expect(result.current.canGoPrevPage).toBe(false);
      expect(result.current.canGoNextPage).toBe(true);
    });

    it("should not navigate before first page", () => {
      const items = ["a", "b", "c"];
      const { result } = renderHook(() => useCarousel(items, 3));

      act(() => {
        result.current.handlePrevPage();
      });

      expect(result.current.displayedItems).toEqual(["a", "b", "c"]);
      expect(result.current.canGoPrevPage).toBe(false);
    });
  });

  describe("Bidirectional navigation", () => {
    it("should correctly navigate back and forth", () => {
      const items = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];
      const { result } = renderHook(() => useCarousel(items, 3));

      expect(result.current.displayedItems).toEqual(["a", "b", "c"]);

      act(() => {
        result.current.handleNextPage();
      });
      expect(result.current.displayedItems).toEqual(["d", "e", "f"]);

      act(() => {
        result.current.handleNextPage();
      });
      expect(result.current.displayedItems).toEqual(["g", "h", "i"]);

      act(() => {
        result.current.handlePrevPage();
      });
      expect(result.current.displayedItems).toEqual(["d", "e", "f"]);

      act(() => {
        result.current.handlePrevPage();
      });
      expect(result.current.displayedItems).toEqual(["a", "b", "c"]);
    });
  });

  describe("Edge cases", () => {
    it("should handle itemsPerPage of 1", () => {
      const items = ["a", "b", "c"];
      const { result } = renderHook(() => useCarousel(items, 1));

      expect(result.current.displayedItems).toEqual(["a"]);

      act(() => {
        result.current.handleNextPage();
      });
      expect(result.current.displayedItems).toEqual(["b"]);

      act(() => {
        result.current.handleNextPage();
      });
      expect(result.current.displayedItems).toEqual(["c"]);
      expect(result.current.canGoNextPage).toBe(false);
    });

    it("should handle large itemsPerPage value", () => {
      const items = ["a", "b", "c"];
      const { result } = renderHook(() => useCarousel(items, 10));

      expect(result.current.displayedItems).toEqual([
        "a",
        "b",
        "c",
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ]);
      expect(result.current.canGoNextPage).toBe(false);
    });

    it("should handle exact multiple of itemsPerPage", () => {
      const items = ["a", "b", "c", "d", "e", "f"];
      const { result } = renderHook(() => useCarousel(items, 3));

      act(() => {
        result.current.handleNextPage();
      });

      expect(result.current.displayedItems).toEqual(["d", "e", "f"]);
      expect(result.current.canGoNextPage).toBe(false);
    });
  });

  describe("Reactivity to items changes", () => {
    it("should update displayedItems when items array changes", () => {
      const { result, rerender } = renderHook(
        ({ items, itemsPerPage }) => useCarousel(items, itemsPerPage),
        {
          initialProps: { items: ["a", "b", "c"], itemsPerPage: 2 },
        },
      );

      expect(result.current.displayedItems).toEqual(["a", "b"]);

      rerender({ items: ["x", "y", "z"], itemsPerPage: 2 });

      expect(result.current.displayedItems).toEqual(["x", "y"]);
    });

    it("should adjust pagination when items array shrinks", () => {
      const { result, rerender } = renderHook(
        ({ items, itemsPerPage }) => useCarousel(items, itemsPerPage),
        {
          initialProps: { items: ["a", "b", "c", "d", "e", "f"], itemsPerPage: 3 },
        },
      );

      act(() => {
        result.current.handleNextPage();
      });
      expect(result.current.displayedItems).toEqual(["d", "e", "f"]);

      rerender({ items: ["a", "b", "c"], itemsPerPage: 3 });

      expect(result.current.displayedItems).toEqual([null, null, null]);
    });

    it("should update itemsPerPage dynamically", () => {
      const { result, rerender } = renderHook(
        ({ items, itemsPerPage }) => useCarousel(items, itemsPerPage),
        {
          initialProps: { items: ["a", "b", "c", "d"], itemsPerPage: 2 },
        },
      );

      expect(result.current.displayedItems).toEqual(["a", "b"]);

      rerender({ items: ["a", "b", "c", "d"], itemsPerPage: 3 });

      expect(result.current.displayedItems).toEqual(["a", "b", "c"]);
    });
  });
});
