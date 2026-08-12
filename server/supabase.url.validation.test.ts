import { describe, expect, it } from "vitest";

describe("Supabase URL configuration", () => {
  it("reaches the configured project REST endpoint without changing data", async () => {
    const url = "https://feaxpoleoyptdtaldgwx.supabase.co";
    const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    expect(url).toBe("https://feaxpoleoyptdtaldgwx.supabase.co");
    expect(publishableKey).toBeTruthy();
    const response = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
      headers: {
        apikey: publishableKey!,
        Authorization: `Bearer ${publishableKey!}`,
      },
    });
    expect(response.ok).toBe(true);
  }, 30_000);
});
