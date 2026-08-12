import { describe, expect, it } from "vitest";
import { GILM_USERS, isLanguage, normalizeGilmName } from "./gilm-api";

describe("GILM strict invariants and authentication helpers", () => {
  it("only recognizes Ahmed, Amar, Cheybai, and Tiki", () => {
    expect(normalizeGilmName("Ahmed")).toBe("Ahmed");
    expect(normalizeGilmName("tiki")).toBe("Tiki");
    expect(normalizeGilmName("Stranger")).toBeNull();
    expect(GILM_USERS["Ahmed"]).toBe("ahmed@gilm.example");
  });

  it("validates language codes strictly", () => {
    expect(isLanguage("en")).toBe(true);
    expect(isLanguage("fr")).toBe(true);
    expect(isLanguage("de")).toBe(false);
  });
});
