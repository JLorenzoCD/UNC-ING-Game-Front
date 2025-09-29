import { describe, expect, it } from "vitest";
import { isUUID } from "./utils";

describe("utils", () => {
  describe("isUUID", () => {
    it("should return true for valid UUIDs", () => {
      const validUUID = crypto.randomUUID();

      expect(isUUID(validUUID)).toBe(true);
    });

    it("should return false for invalid UUIDs", () => {
      const invalidUUID = "invalid-uuid-string";

      expect(isUUID(invalidUUID)).toBe(false);
    });
  });
});
