import { describe, expect, it } from "vitest";
import { GILM_USERS, isLanguage, normalizeGilmName } from "./gilm-api";

describe("GILM security invariants", () => {
  it("accepts exactly the four authorized learner names", () => {
    expect(Object.keys(GILM_USERS)).toEqual(["Ahmed", "Amar", "Cheybai", "Tiki"]);
    expect(normalizeGilmName("ahmed")).toBe("Ahmed");
    expect(normalizeGilmName("TIKI")).toBe("Tiki");
    expect(normalizeGilmName("public-user")).toBeNull();
  });

  it("accepts only English and French language codes", () => {
    expect(isLanguage("en")).toBe(true);
    expect(isLanguage("fr")).toBe(true);
    expect(isLanguage("es")).toBe(false);
    expect(isLanguage(undefined)).toBe(false);
  });
});
