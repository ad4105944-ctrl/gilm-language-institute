import { createSupabaseAuthClient, emailForGilmName, getSupabaseRuntimeConfig } from "@/lib/supabase";

export type Language = "en" | "fr";

const TOKEN_KEY = "gilm-access-token";

export function getAccessToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string | null) {
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(path, { ...init, headers });
  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json") ? await response.json() : await response.blob();
  if (!response.ok) {
    const message = data && typeof data === "object" && "error" in data ? String((data as { error: unknown }).error) : "Request failed";
    throw new Error(message);
  }
  return data as T;
}

export type GilmUser = { name: string; email: string };
export type GilmPlan = { duration_minutes: number; focus_elements: string[]; tasks: string[] };
export type PlanResponse = { language: Language; plan: GilmPlan; evidenceCount: number; scores: { speaking: number | null; vocabulary: number | null } };
export type TeacherResponse = { teacher_reply: string; analysis: { evidence: Array<{ skill_type: string; evidence_snippet: string; confidence: number }>; observed_errors: Array<{ error_pattern: string; correction: string }>; vocabulary: Array<{ word: string; mastery_state: string }>; grammar: Array<{ grammar_concept: string; mastery_state: string }>; next_focus: string }; sessionId: string | null; evidenceCreated: number };
export type ProgressResponse = { languages: Array<{ language: Language; evidenceCount: number; latestEvidence: Array<{ skill_type: string; evidence_snippet: string; confidence: number; created_at: string }>; speaking: number | null; vocabulary: number | null; grammar: number | null; label: string }> };

export const gilmApi = {
  login: async (name: string, password: string) => {
    const email = emailForGilmName(name);
    const { url } = getSupabaseRuntimeConfig();
    // Deliberately log only the non-secret identifier and runtime URL; never log password or publishable key.
    console.info("[GILM Auth] signInWithPassword", { email, supabaseUrl: url });
    const supabase = createSupabaseAuthClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const code = error.code ? ` [${error.code}]` : "";
      throw new Error(`Supabase Auth${code}: ${error.message}`);
    }
    if (!data.session?.access_token) {
      throw new Error("Supabase Auth: sign-in succeeded without an access token.");
    }
    return { access_token: data.session.access_token, user: { name, email } };
  },
  plan: (language: Language) => request<PlanResponse>(`/api/plan?language=${language}`),
  teacher: (language: Language, message: string, sessionId?: string | null) => request<TeacherResponse>("/api/teacher", { method: "POST", body: JSON.stringify({ language, message, sessionId }) }),
  transcribe: (language: Language, audioBase64: string, mimeType: string) => request<{ text: string }>("/api/transcribe", { method: "POST", body: JSON.stringify({ language, audioBase64, mimeType }) }),
  speech: async (text: string) => request<Blob>("/api/speech", { method: "POST", body: JSON.stringify({ text }) }),
  progress: () => request<ProgressResponse>("/api/progress"),
};
