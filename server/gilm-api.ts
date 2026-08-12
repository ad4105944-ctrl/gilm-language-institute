import type { Express, Request, Response } from "express";

export const GILM_USERS = {
  Ahmed: "ahmed@gilm.example",
  Amar: "amar@gilm.example",
  Cheybai: "cheybai@gilm.example",
  Tiki: "tiki@gilm.example",
} as const;

export type GilmUserName = keyof typeof GILM_USERS;
export type Language = "en" | "fr";

const SUPABASE_URL = () => (process.env.VITE_SUPABASE_URL ?? "").replace(/\/$/, "");
const SUPABASE_KEY = () => process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
const OPENAI_KEY = () => process.env.OPENAI_API_KEY ?? "";
const TEXT_MODEL = () => process.env.OPENAI_TEXT_MODEL ?? "gpt-5.6-luna";
const TRANSCRIBE_MODEL = () => process.env.OPENAI_TRANSCRIBE_MODEL ?? "gpt-4o-mini-transcribe";
const TTS_MODEL = () => process.env.OPENAI_TTS_MODEL ?? "tts-1";
const TTS_VOICE = () => process.env.OPENAI_TTS_VOICE ?? "alloy";

export function isLanguage(value: unknown): value is Language {
  return value === "en" || value === "fr";
}

export function normalizeGilmName(value: unknown): GilmUserName | null {
  if (typeof value !== "string") return null;
  return (Object.keys(GILM_USERS) as GilmUserName[]).find(
    name => name.toLowerCase() === value.trim().toLowerCase()
  ) ?? null;
}

function bearer(req: Request) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}

async function supabaseRequest<T>(path: string, token: string, init: RequestInit = {}) {
  const url = `${SUPABASE_URL()}${path}`;
  if (!SUPABASE_URL() || !SUPABASE_KEY()) throw new Error("Supabase environment is not configured");
  const headers = new Headers(init.headers);
  headers.set("apikey", SUPABASE_KEY());
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  const response = await fetch(url, { ...init, headers });
  const text = await response.text();
  let body: unknown = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!response.ok) {
    throw new Error(`Supabase error (${response.status}): ${typeof body === "string" ? body : JSON.stringify(body)}`);
  }
  return { response, body };
}

async function supabaseAuthRequest<T>(path: string, init: RequestInit = {}) {
  const url = `${SUPABASE_URL()}${path}`;
  if (!SUPABASE_URL() || !SUPABASE_KEY()) throw new Error("Supabase environment is not configured");
  const headers = new Headers(init.headers);
  headers.set("apikey", SUPABASE_KEY());
  headers.set("content-type", "application/json");
  const response = await fetch(url, { ...init, headers });
  const text = await response.text();
  let body: unknown = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { response, body };
}

export async function requireSupabaseUser(req: Request) {
  const token = bearer(req);
  if (!token) return null;
  try {
    const { response, body } = await supabaseAuthRequest("/auth/v1/user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok || !body || typeof body !== "object") return null;
    const authUser = body as { id?: string; email?: string; user_metadata?: { full_name?: string } };
    if (!authUser.id || !authUser.email) return null;
    const name = normalizeGilmName(authUser.user_metadata?.full_name ?? authUser.email.split("@")[0]);
    if (!name || authUser.email.toLowerCase() !== GILM_USERS[name]) return null;
    return { id: authUser.id, email: authUser.email, name, token };
  } catch {
    return null;
  }
}

function unauthorized(res: Response) {
  return res.status(401).json({ error: "Unauthorized session or missing Supabase token" });
}

function badLanguage(res: Response) {
  return res.status(400).json({ error: "language must be strictly 'en' or 'fr'" });
}

async function readJson(req: Request) {
  if (req.body && typeof req.body === "object") return req.body as Record<string, unknown>;
  return {};
}

async function getContext(user: { id: string; token: string }, language: Language) {
  const base = `/rest/v1`;
  const queries = await Promise.all([
    supabaseRequest<any[]>(`${base}/profiles?select=id,full_name,interests,target_goal&id=eq.${encodeURIComponent(user.id)}&limit=1`, user.token),
    supabaseRequest<any[]>(`${base}/student_language_profiles?select=*&user_id=eq.${encodeURIComponent(user.id)}&language=eq.${language}&limit=1`, user.token),
    supabaseRequest<any[]>(`${base}/learning_evidence?select=*&user_id=eq.${encodeURIComponent(user.id)}&language=eq.${language}&order=created_at.desc&limit=12`, user.token),
    supabaseRequest<any[]>(`${base}/conversation_messages?select=*&user_id=eq.${encodeURIComponent(user.id)}&order=created_at.desc&limit=12`, user.token),
    supabaseRequest<any[]>(`${base}/vocabulary_mastery?select=*&user_id=eq.${encodeURIComponent(user.id)}&language=eq.${language}&order=updated_at.desc&limit=12`, user.token),
    supabaseRequest<any[]>(`${base}/grammar_mastery?select=*&user_id=eq.${encodeURIComponent(user.id)}&language=eq.${language}&order=updated_at.desc&limit=12`, user.token),
  ]);
  return {
    profile: Array.isArray(queries[0].body) ? queries[0].body[0] ?? null : null,
    languageProfile: Array.isArray(queries[1].body) ? queries[1].body[0] ?? null : null,
    evidence: Array.isArray(queries[2].body) ? queries[2].body : [],
    messages: Array.isArray(queries[3].body) ? queries[3].body.reverse() : [],
    vocabulary: Array.isArray(queries[4].body) ? queries[4].body : [],
    grammar: Array.isArray(queries[5].body) ? queries[5].body : [],
  };
}

async function createSession(user: { id: string; token: string }, language: Language) {
  const { body } = await supabaseRequest<any[]>("/rest/v1/learning_sessions?select=*", user.token, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify([{ user_id: user.id, language, duration_minutes: 15, status: "active" }]),
  });
  if (!Array.isArray(body)) return null;
  return body[0] ?? null;
}

function outputText(payload: any) {
  if (typeof payload?.output_text === "string") return payload.output_text;
  const content = payload?.output?.flatMap?.((item: any) => item?.content ?? []) ?? [];
  return content.find((item: any) => typeof item?.text === "string")?.text ?? "";
}

async function openAIJson<T>(system: string, userPrompt: string, schemaName: string, schema: Record<string, unknown>): Promise<T> {
  if (!OPENAI_KEY()) throw new Error("OPENAI_API_KEY is not configured on the server.");
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_KEY()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: TEXT_MODEL(),
      input: [
        { role: "system", content: [{ type: "input_text", text: system }] },
        { role: "user", content: [{ type: "input_text", text: userPrompt }] },
      ],
      text: { format: { type: "json_schema", name: schemaName, strict: true, schema } },
    }),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errText}`);
  }
  const payload = await response.json();
  const text = outputText(payload);
  return JSON.parse(text) as T;
}

const teacherSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    teacher_reply: { type: "string" },
    analysis: {
      type: "object",
      additionalProperties: false,
      properties: {
        evidence: { type: "array", items: { type: "object", additionalProperties: false, properties: { skill_type: { type: "string" }, evidence_snippet: { type: "string" }, confidence: { type: "number" } }, required: ["skill_type", "evidence_snippet", "confidence"] } },
        observed_errors: { type: "array", items: { type: "object", additionalProperties: false, properties: { error_pattern: { type: "string" }, correction: { type: "string" } }, required: ["error_pattern", "correction"] } },
        vocabulary: { type: "array", items: { type: "object", additionalProperties: false, properties: { word: { type: "string" }, mastery_state: { type: "string" } }, required: ["word", "mastery_state"] } },
        grammar: { type: "array", items: { type: "object", additionalProperties: false, properties: { grammar_concept: { type: "string" }, mastery_state: { type: "string" } }, required: ["grammar_concept", "mastery_state"] } },
        next_focus: { type: "string" },
      },
      required: ["evidence", "observed_errors", "vocabulary", "grammar", "next_focus"],
    },
  },
  required: ["teacher_reply", "analysis"],
};

async function updateScoresWithEMA(user: { id: string; token: string }, language: Language, evidenceList: Array<{ confidence: number }>) {
  if (!evidenceList.length) return;
  const currentRes = await supabaseRequest<any[]>(`/rest/v1/student_language_profiles?select=*&user_id=eq.${user.id}&language=eq.${language}&limit=1`, user.token);
  const current = Array.isArray(currentRes.body) ? currentRes.body[0] : null;
  const oldSpeaking = Number(current?.speaking_score ?? 0);
  const oldVocab = Number(current?.vocabulary_score ?? 0);
  const alpha = 0.3;
  const avgConfidence = evidenceList.reduce((sum, item) => sum + item.confidence, 0) / evidenceList.length;
  const newSnippetScore = avgConfidence * 100;
  const updatedSpeaking = oldSpeaking === 0 ? newSnippetScore : oldSpeaking * (1 - alpha) + newSnippetScore * alpha;
  const updatedVocab = oldVocab === 0 ? newSnippetScore : oldVocab * (1 - alpha) + newSnippetScore * alpha;

  await supabaseRequest(`/rest/v1/student_language_profiles?user_id=eq.${user.id}&language=eq.${language}`, user.token, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ speaking_score: Number(updatedSpeaking.toFixed(2)), vocabulary_score: Number(updatedVocab.toFixed(2)), updated_at: new Date().toISOString() }),
  });
}

async function persistTeacherTurn(user: { id: string; token: string }, language: Language, message: string, result: any, sessionId?: string | null) {
  let session = sessionId ? { id: sessionId } : null;
  if (!session) session = await createSession(user, language);
  if (!session?.id) throw new Error("Failed to create or find learning session");

  await supabaseRequest("/rest/v1/conversation_messages", user.token, {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify([
      { session_id: session.id, user_id: user.id, sender: "student", message_text: message },
      { session_id: session.id, user_id: user.id, sender: "teacher", message_text: result.teacher_reply },
    ]),
  });

  const evidence = Array.isArray(result.analysis?.evidence) ? result.analysis.evidence.filter((item: any) => item.confidence >= 0.5 && item.evidence_snippet) : [];
  if (evidence.length) {
    await supabaseRequest("/rest/v1/learning_evidence", user.token, {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(evidence.map((item: any) => ({ user_id: user.id, session_id: session.id, language, skill_type: item.skill_type, evidence_snippet: item.evidence_snippet, confidence: Math.min(1, Math.max(0, item.confidence)) }))),
    });
    await updateScoresWithEMA(user, language, evidence);
  }

  const vocabItems = Array.isArray(result.analysis?.vocabulary) ? result.analysis.vocabulary : [];
  for (const v of vocabItems) {
    if (!v.word) continue;
    await supabaseRequest("/rest/v1/vocabulary_mastery", user.token, {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify([{ user_id: user.id, language, word: v.word, mastery_state: v.mastery_state ?? "seen", mastery_score: 50, updated_at: new Date().toISOString() }]),
    });
  }

  const grammarItems = Array.isArray(result.analysis?.grammar) ? result.analysis.grammar : [];
  for (const g of grammarItems) {
    if (!g.grammar_concept) continue;
    await supabaseRequest("/rest/v1/grammar_mastery", user.token, {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify([{ user_id: user.id, language, grammar_concept: g.grammar_concept, mastery_state: g.mastery_state ?? "correct_with_help", mastery_score: 50, updated_at: new Date().toISOString() }]),
    });
  }

  await supabaseRequest("/rest/v1/ai_decisions", user.token, {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify([{ user_id: user.id, session_id: session.id, decision_summary: `Processed turn with ${evidence.length} evidence items.`, next_focus: result.analysis?.next_focus ?? "Continue practice." }]),
  });

  return session.id;
}

async function handleLogin(req: Request, res: Response) {
  const body = await readJson(req);
  const name = normalizeGilmName(body.name);
  const password = typeof body.password === "string" ? body.password : "";
  if (!name || !password) return res.status(400).json({ error: "Choose one authorized user and enter a password." });
  try {
    const { response, body: authBody } = await supabaseAuthRequest("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ email: GILM_USERS[name], password }),
    });
    if (!response.ok) return res.status(401).json({ error: "Invalid login against Supabase Auth." });
    const data = authBody as { access_token?: string; refresh_token?: string; user?: unknown };
    if (!data.access_token) return res.status(401).json({ error: "Supabase session token missing." });
    return res.json({ access_token: data.access_token, refresh_token: data.refresh_token, user: { name, email: GILM_USERS[name] } });
  } catch (err) {
    return res.status(503).json({ error: err instanceof Error ? err.message : "Supabase connection error." });
  }
}

async function handlePlan(req: Request, res: Response) {
  const user = await requireSupabaseUser(req);
  if (!user) return unauthorized(res);
  const language = String(req.query.language ?? "en");
  if (!isLanguage(language)) return badLanguage(res);
  try {
    const context = await getContext(user, language);
    const today = new Date().toISOString().slice(0, 10);
    const plan = await openAIJson<{ duration_minutes: number; focus_elements: string[]; tasks: string[] }>(
      "You are GILM's adaptive language planner. Build a daily plan based exclusively on student evidence and history.",
      JSON.stringify({ language, today, profile: context.profile, languageProfile: context.languageProfile, evidence: context.evidence, vocabulary: context.vocabulary, grammar: context.grammar }),
      "daily_plan",
      { type: "object", additionalProperties: false, properties: { duration_minutes: { type: "integer" }, focus_elements: { type: "array", items: { type: "string" } }, tasks: { type: "array", items: { type: "string" } } }, required: ["duration_minutes", "focus_elements", "tasks"] },
    );
    await supabaseRequest("/rest/v1/daily_plans", user.token, { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify([{ user_id: user.id, language, plan_date: today, focus_elements: plan.focus_elements, tasks: plan.tasks }]) });
    const hasEvidence = context.evidence.length > 0;
    return res.json({ language, plan, evidenceCount: context.evidence.length, scores: hasEvidence ? { speaking: context.languageProfile?.speaking_score ?? null, vocabulary: context.languageProfile?.vocabulary_score ?? null } : { speaking: null, vocabulary: null } });
  } catch (err) {
    return res.status(503).json({ error: err instanceof Error ? err.message : "Failed to generate plan." });
  }
}

async function handleTeacher(req: Request, res: Response) {
  const user = await requireSupabaseUser(req);
  if (!user) return unauthorized(res);
  const body = await readJson(req);
  const language = body.language;
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!isLanguage(language)) return badLanguage(res);
  if (!message) return res.status(400).json({ error: "message is required" });
  try {
    const context = await getContext(user, language);
    const result = await openAIJson<any>(
      `You are GILM, a patient ${language === "fr" ? "French" : "English"} teacher and learning analyst. Reply naturally. Analyze evidence present in the student's message.`,
      JSON.stringify({ language, student_message: message, profile: context.profile, language_profile: context.languageProfile, recent_evidence: context.evidence, recent_messages: context.messages, vocabulary: context.vocabulary, grammar: context.grammar }),
      "teacher_turn",
      teacherSchema,
    );
    const sessionId = await persistTeacherTurn(user, language, message, result, typeof body.sessionId === "string" ? body.sessionId : null);
    return res.json({ ...result, sessionId, evidenceCreated: result.analysis.evidence.length });
  } catch (err) {
    return res.status(503).json({ error: err instanceof Error ? err.message : "Teacher execution failed." });
  }
}

async function handleTranscribe(req: Request, res: Response) {
  const user = await requireSupabaseUser(req);
  if (!user) return unauthorized(res);
  const body = await readJson(req);
  if (!isLanguage(body.language)) return badLanguage(res);
  const base64 = typeof body.audioBase64 === "string" ? body.audioBase64 : "";
  if (!base64) return res.status(400).json({ error: "audioBase64 is required" });
  if (!OPENAI_KEY()) return res.status(503).json({ error: "OpenAI is not configured." });
  try {
    const raw = Buffer.from(base64.replace(/^data:[^;]+;base64,/, ""), "base64");
    if (raw.byteLength > 16 * 1024 * 1024) return res.status(413).json({ error: "Audio size exceeds 16MB." });
    const form = new FormData();
    form.append("file", new Blob([raw], { type: typeof body.mimeType === "string" ? body.mimeType : "audio/webm" }), "gilm.webm");
    form.append("model", TRANSCRIBE_MODEL());
    form.append("language", body.language);
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: { Authorization: `Bearer ${OPENAI_KEY()}` }, body: form });
    const payload = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: "Transcription failed." });
    return res.json({ text: payload.text ?? "" });
  } catch (err) {
    return res.status(503).json({ error: err instanceof Error ? err.message : "Transcription error." });
  }
}

async function handleSpeech(req: Request, res: Response) {
  const user = await requireSupabaseUser(req);
  if (!user) return unauthorized(res);
  const body = await readJson(req);
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return res.status(400).json({ error: "text is required" });
  if (!OPENAI_KEY()) return res.status(503).json({ error: "OpenAI is not configured." });
  try {
    const response = await fetch("https://api.openai.com/v1/audio/speech", { method: "POST", headers: { Authorization: `Bearer ${OPENAI_KEY()}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: TTS_MODEL(), voice: TTS_VOICE(), input: text, response_format: "mp3" }) });
    if (!response.ok) return res.status(response.status).json({ error: "TTS failed." });
    const bytes = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    return res.status(200).send(bytes);
  } catch (err) {
    return res.status(503).json({ error: err instanceof Error ? err.message : "TTS error." });
  }
}

async function handleProgress(req: Request, res: Response) {
  const user = await requireSupabaseUser(req);
  if (!user) return unauthorized(res);
  try {
    const languages = await Promise.all((['en', 'fr'] as Language[]).map(async language => {
      const context = await getContext(user, language);
      const evidence = context.evidence;
      return { language, evidenceCount: evidence.length, latestEvidence: evidence.slice(0, 5), speaking: evidence.length ? context.languageProfile?.speaking_score ?? null : null, vocabulary: evidence.length ? context.languageProfile?.vocabulary_score ?? null : null, grammar: evidence.length ? context.languageProfile?.grammar_score ?? null : null, label: evidence.length ? "Evidence-backed" : "Collecting evidence" };
    }));
    return res.json({ languages });
  } catch (err) {
    return res.status(503).json({ error: err instanceof Error ? err.message : "Progress error." });
  }
}

export function registerGilmRoutes(app: Express) {
  app.post("/api/auth/login", handleLogin);
  app.get("/api/plan", handlePlan);
  app.post("/api/teacher", handleTeacher);
  app.post("/api/transcribe", handleTranscribe);
  app.post("/api/speech", handleSpeech);
  app.get("/api/progress", handleProgress);
}
