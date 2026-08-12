import { describe, expect, it } from "vitest";
import { EXPECTED_SUPABASE_URL, emailForGilmName } from "./supabase";

describe("GILM Supabase Auth mapping", () => {
  it("maps the visible Ahmed profile to the exact internal Auth email", () => {
    expect(emailForGilmName("Ahmed")).toBe("ahmed@gilm.example");
  });

  it("keeps the expected project URL explicit without exposing the publishable key", () => {
    expect(EXPECTED_SUPABASE_URL).toBe("https://feaxpoleoyptdtaldgwx.supabase.co");
  });
});
