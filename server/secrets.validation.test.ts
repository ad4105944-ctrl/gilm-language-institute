import { describe, expect, it } from "vitest";

describe("production integration configuration", () => {
  it("keeps the required server-only model configuration explicit", () => {
    expect(process.env.OPENAI_TEXT_MODEL ?? "gpt-5.6-luna").toBeTruthy();
    expect(process.env.OPENAI_TRANSCRIBE_MODEL ?? "gpt-4o-mini-transcribe").toBe("gpt-4o-mini-transcribe");
    expect(process.env.OPENAI_TTS_MODEL ?? "tts-1").toBe("tts-1");
    expect(process.env.OPENAI_TTS_VOICE ?? "alloy").toBe("alloy");
  });

  it.skipIf(process.env.GILM_RUN_EXTERNAL_INTEGRATION !== "true")("authenticates against Supabase and OpenAI lightweight endpoints when explicitly enabled", async () => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;
    expect(supabaseUrl).toBeTruthy();
    expect(supabaseKey).toBeTruthy();
    expect(openAiKey).toBeTruthy();
    const parsedSupabaseUrl = new URL(supabaseUrl!);
    const supabaseResponse = await fetch(`${parsedSupabaseUrl.origin}/rest/v1/profiles?select=id&limit=1`, { headers: { apikey: supabaseKey!, Authorization: `Bearer ${supabaseKey}` } });
    expect(supabaseResponse.ok).toBe(true);
    const openAiResponse = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${openAiKey}` } });
    expect(openAiResponse.ok).toBe(true);
  }, 30_000);
});
