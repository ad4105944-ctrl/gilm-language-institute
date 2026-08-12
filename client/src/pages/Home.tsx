import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  ChevronDown,
  CircleDot,
  Clock3,
  Globe2,
  Headphones,
  LockKeyhole,
  LogOut,
  Menu,
  Mic,
  Play,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Volume2,
  WandSparkles,
  X,
} from "lucide-react";
import { gilmApi, getAccessToken, setAccessToken, type GilmPlan, type GilmUser, type Language, type PlanResponse, type ProgressResponse, type TeacherResponse } from "@/lib/gilmApi";

const AUTHORIZED_USERS = ["Ahmed", "Amar", "Cheybai", "Tiki"];

function Pill({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.08em] uppercase ${muted ? "bg-[#f0ede8] text-[#817a70]" : "bg-[#e7f2ee] text-[#1f6a50]"}`}>{children}</span>;
}

function Logo() {
  return <div className="flex items-center gap-3"><div className="relative flex size-10 items-center justify-center rounded-[14px] bg-[#113d38] text-[#e8f3ed] shadow-[0_9px_24px_rgba(17,61,56,0.22)]"><span className="font-serif text-xl italic">G</span><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#c7ef7d]" /></div><div><div className="font-serif text-[19px] font-semibold leading-none tracking-[-0.03em] text-[#163f3a]">GILM</div><div className="mt-1 text-[9px] font-bold uppercase tracking-[0.17em] text-[#9a948b]">Language institute</div></div></div>;
}

function LoginPage({ onLogin }: { onLogin: (user: GilmUser) => void }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!AUTHORIZED_USERS.includes(name)) {
      setError("Choose one of the four authorized learners.");
      return;
    }
    if (!password) {
      setError("Enter your private password to continue.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await gilmApi.login(name, password);
      setAccessToken(result.access_token);
      window.localStorage.setItem("gilm-user", JSON.stringify(result.user));
      onLogin(result.user);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="min-h-screen overflow-hidden bg-[#f6f5f1] text-[#183e3a]">
    <div className="grid min-h-screen lg:grid-cols-[0.96fr_1.04fr]">
      <section className="relative hidden overflow-hidden bg-[#123e39] px-12 py-10 text-[#eef7ee] lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-28 -top-28 size-[420px] rounded-full border border-[#b4dc87]/20" />
        <div className="absolute -bottom-36 -left-20 size-[450px] rounded-full border border-[#b4dc87]/10" />
        <div className="relative z-10"><Logo /><div className="mt-28 max-w-xl"><Pill><Sparkles className="size-3" /> Evidence-led learning</Pill><h1 className="mt-7 max-w-lg font-serif text-6xl font-medium leading-[0.98] tracking-[-0.055em] text-[#f0f5ed]">Build a language practice that remembers you.</h1><p className="mt-7 max-w-md text-[15px] leading-7 text-[#bed2c8]">GILM combines thoughtful conversation, adaptive plans, and a learning memory grounded in what you actually say.</p></div></div>
        <div className="relative z-10 flex items-end justify-between border-t border-[#e7f0e7]/15 pt-5 text-xs text-[#a9c1b7]"><span>Global Institute for Language Mastery</span><span className="flex items-center gap-2"><ShieldCheck className="size-4 text-[#c7ef7d]" /> Private by design</span></div>
      </section>
      <section className="flex min-h-screen flex-col justify-between px-6 py-8 sm:px-12 lg:px-20 lg:py-10">
        <div className="lg:hidden"><Logo /></div>
        <div className="mx-auto w-full max-w-[470px] self-center py-12 lg:py-0"><Pill muted><LockKeyhole className="size-3" /> Private learner access</Pill><h2 className="mt-6 font-serif text-5xl font-medium leading-[0.98] tracking-[-0.05em] text-[#183e3a]">Welcome back.</h2><p className="mt-5 max-w-sm text-[15px] leading-7 text-[#77766e]">Choose your learner profile and continue the next precise step in your language practice.</p>
          <form onSubmit={submit} className="mt-10 space-y-5"><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#8b867d]">Learner profile</span><div className="relative"><select value={name} onChange={event => setName(event.target.value)} className="h-14 w-full appearance-none rounded-2xl border border-[#deddd7] bg-white px-4 text-[15px] text-[#183e3a] outline-none transition focus:border-[#4f9677] focus:ring-4 focus:ring-[#d8eee1]"><option value="">Select your name</option>{AUTHORIZED_USERS.map(item => <option key={item} value={item}>{item}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#969188]" /></div></label><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#8b867d]">Private password</span><input value={password} onChange={event => setPassword(event.target.value)} type="password" placeholder="Enter password" className="h-14 w-full rounded-2xl border border-[#deddd7] bg-white px-4 text-[15px] outline-none transition placeholder:text-[#b1ada5] focus:border-[#4f9677] focus:ring-4 focus:ring-[#d8eee1]" /></label>{error && <div className="rounded-2xl border border-[#efc7c1] bg-[#fff5f3] px-4 py-3 text-sm leading-6 text-[#ab4b3d]">{error}</div>}<button type="submit" disabled={loading} className="group flex h-14 w-full items-center justify-between rounded-2xl bg-[#153f39] px-5 text-sm font-semibold text-white transition hover:bg-[#245f52] disabled:cursor-wait disabled:opacity-60">{loading ? "Connecting…" : "Enter GILM"}<span className="flex size-9 items-center justify-center rounded-xl bg-[#c7ef7d] text-[#153f39] transition group-hover:translate-x-1"><ArrowRight className="size-4" /></span></button></form>
          <div className="mt-8 flex items-start gap-3 text-xs leading-5 text-[#99948a]"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#4b9673]" /><span>Four private accounts only. There is no public sign-up and no learner data is sent to the browser without a valid session.</span></div>
        </div>
        <div className="flex items-center justify-between text-xs text-[#a6a098]"><span>© 2026 GILM</span><span>English · Français</span></div>
      </section>
    </div>
  </main>;
}

function MetricCard({ label, value, detail, icon: Icon, empty = false }: { label: string; value: string; detail: string; icon: typeof Target; empty?: boolean }) {
  return <div className="rounded-[24px] border border-[#e9e6df] bg-white p-5 shadow-[0_10px_30px_rgba(32,54,47,0.035)]"><div className="flex items-center justify-between"><div className="flex size-9 items-center justify-center rounded-xl bg-[#edf5ee] text-[#43816a]"><Icon className="size-4" /></div>{empty ? <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#afa99f]">No evidence</span> : <TrendingUp className="size-4 text-[#62a178]" />}</div><div className={`mt-6 font-serif text-3xl tracking-[-0.04em] ${empty ? "text-[#9a958b]" : "text-[#163e39]"}`}>{value}</div><div className="mt-1 text-xs font-semibold uppercase tracking-[0.11em] text-[#8e8a82]">{label}</div><div className="mt-3 text-xs leading-5 text-[#aaa49a]">{detail}</div></div>;
}

function TodayView({ language, onLanguage, user }: { language: Language; onLanguage: (value: Language) => void; user: GilmUser }) {
  const [data, setData] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; setLoading(true); setError(""); gilmApi.plan(language).then(value => { if (active) setData(value); }).catch(reason => { if (active) setError(reason instanceof Error ? reason.message : "Unable to build today’s plan."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [language]);
  const plan: GilmPlan = data?.plan ?? { duration_minutes: 15, focus_elements: ["Conversation practice", "Evidence collection", "Guided correction"], tasks: ["Start with one honest answer", "Listen for the next prompt", "Reflect on one useful phrase"] };
  const hasEvidence = Boolean(data?.evidenceCount);
  return <div className="space-y-7"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#77a286]">Good morning, {user.name}</p><h1 className="mt-3 font-serif text-5xl font-medium tracking-[-0.055em] text-[#173f3a]">Your next step is ready.</h1><p className="mt-3 text-sm text-[#8a887f]">A focused practice built from your real learning memory.</p></div><div className="flex items-center gap-2 rounded-2xl border border-[#e5e2dc] bg-white p-1"><button onClick={() => onLanguage("en")} className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${language === "en" ? "bg-[#153f39] text-white" : "text-[#8d887f] hover:bg-[#f4f3ef]"}`}>EN</button><button onClick={() => onLanguage("fr")} className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${language === "fr" ? "bg-[#153f39] text-white" : "text-[#8d887f] hover:bg-[#f4f3ef]"}`}>FR</button></div></div>{error && <div className="rounded-2xl border border-[#efd4c4] bg-[#fff8f2] px-4 py-3 text-sm text-[#9a5a3b]">{error}</div>}<div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]"><section className="relative overflow-hidden rounded-[28px] bg-[#dff0de] p-7 md:p-9"><div className="absolute -right-12 -top-16 size-56 rounded-full border border-[#78ad79]/20" /><div className="relative flex items-start justify-between"><div><Pill><WandSparkles className="size-3" /> Adaptive lesson</Pill><h2 className="mt-6 max-w-md font-serif text-4xl font-medium leading-[1.03] tracking-[-0.05em] text-[#245449]">{language === "fr" ? "Rendre votre expression plus naturelle." : "Make your expression more natural."}</h2><p className="mt-4 max-w-md text-sm leading-6 text-[#527766]">{loading ? "Reading your learning memory…" : `${plan.duration_minutes} minutes of practice, shaped around today’s focus.`}</p></div><div className="hidden size-14 items-center justify-center rounded-2xl bg-white/65 text-[#2d7255] sm:flex"><Brain className="size-6" /></div></div><div className="relative mt-10 flex flex-wrap gap-2">{plan.focus_elements.map(item => <span key={item} className="rounded-full border border-[#9bc69a]/50 bg-white/45 px-3 py-2 text-xs font-semibold text-[#376a55]">{item}</span>)}</div></section><section className="rounded-[28px] border border-[#e9e6df] bg-white p-7"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[0.15em] text-[#9a958c]">Session map</span><Clock3 className="size-4 text-[#6c9c80]" /></div><div className="mt-6 space-y-4">{plan.tasks.map((task, index) => <div key={task} className="flex items-start gap-3"><div className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg ${index === 0 ? "bg-[#153f39] text-white" : "bg-[#eef4ec] text-[#6f9c7c]"}`}>{index === 0 ? <Play className="ml-0.5 size-3" /> : <span className="text-[10px] font-bold">0{index + 1}</span>}</div><p className="text-sm leading-5 text-[#5e6a63]">{task}</p></div>)}</div><div className="mt-7 flex items-center justify-between border-t border-[#eeece7] pt-5"><span className="text-xs text-[#a09b92]">Estimated duration</span><strong className="text-sm text-[#244d43]">{plan.duration_minutes} min</strong></div></section></div><div><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#9b958b]">Evidence ledger</p><h3 className="mt-2 font-serif text-2xl tracking-[-0.04em] text-[#204b43]">Progress, without guesswork.</h3></div><span className="text-xs text-[#aaa59c]">{data?.evidenceCount ?? 0} evidence items</span></div><div className="grid gap-4 sm:grid-cols-2"><MetricCard label="Speaking" value={hasEvidence && data?.scores.speaking != null ? `${Math.round(data.scores.speaking)}%` : "—"} detail={hasEvidence ? "Updated gradually from observed evidence." : "Collecting evidence from your conversations."} icon={Headphones} empty={!hasEvidence} /><MetricCard label="Vocabulary" value={hasEvidence && data?.scores.vocabulary != null ? `${Math.round(data.scores.vocabulary)}%` : "—"} detail={hasEvidence ? "Based on words used and recalled in context." : "No score appears before evidence exists."} icon={BookOpen} empty={!hasEvidence} /></div></div></div>;
}

function TeacherView({ language, onLanguage }: { language: Language; onLanguage: (value: Language) => void }) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "student" | "teacher"; text: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [recording, setRecording] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const sendingRef = useRef(false);

  async function sendMessage(text = draft) {
    const clean = text.trim();
    if (!clean || sendingRef.current) return;
    sendingRef.current = true; setBusy(true); setError(""); setDraft(""); setMessages(previous => [...previous, { role: "student", text: clean }]);
    try { const result = await gilmApi.teacher(language, clean, sessionId); setSessionId(result.sessionId); setMessages(previous => [...previous, { role: "teacher", text: result.teacher_reply }]); } catch (reason) { setError(reason instanceof Error ? reason.message : "Teacher is temporarily unavailable."); } finally { sendingRef.current = false; setBusy(false); }
  }

  async function startRecording() {
    if (recording || !navigator.mediaDevices?.getUserMedia) { setError("Microphone access is not available in this browser."); return; }
    try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); const recorder = new MediaRecorder(stream); chunksRef.current = []; recorderRef.current = recorder; recorder.ondataavailable = event => { if (event.data.size) chunksRef.current.push(event.data); }; recorder.onstop = async () => { stream.getTracks().forEach(track => track.stop()); const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" }); const bytes = new Uint8Array(await blob.arrayBuffer()); let binary = ""; for (let index = 0; index < bytes.byteLength; index += 1) binary += String.fromCharCode(bytes[index]); try { setBusy(true); const result = await gilmApi.transcribe(language, btoa(binary), blob.type); setDraft(result.text); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to transcribe recording."); } finally { setBusy(false); } }; recorder.start(); setRecording(true); } catch { setError("Allow microphone access to use Push-to-Talk."); }
  }
  function stopRecording() { if (!recorderRef.current || recorderRef.current.state === "inactive") return; recorderRef.current.stop(); setRecording(false); }
  async function speak(text: string) { try { const blob = await gilmApi.speech(text); const audio = new Audio(URL.createObjectURL(blob)); void audio.play(); } catch (reason) { setError(reason instanceof Error ? reason.message : "Audio is unavailable."); } }

  return <div className="space-y-7"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#77a286]">Teacher studio</p><h1 className="mt-3 font-serif text-5xl font-medium tracking-[-0.055em] text-[#173f3a]">A conversation with memory.</h1><p className="mt-3 text-sm text-[#8a887f]">The teacher responds. The analyst quietly tracks what your words show.</p></div><div className="flex items-center gap-2 rounded-2xl border border-[#e5e2dc] bg-white p-1"><button onClick={() => onLanguage("en")} className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${language === "en" ? "bg-[#153f39] text-white" : "text-[#8d887f] hover:bg-[#f4f3ef]"}`}>EN</button><button onClick={() => onLanguage("fr")} className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${language === "fr" ? "bg-[#153f39] text-white" : "text-[#8d887f] hover:bg-[#f4f3ef]"}`}>FR</button></div></div>{error && <div className="rounded-2xl border border-[#efd4c4] bg-[#fff8f2] px-4 py-3 text-sm text-[#9a5a3b]">{error}</div>}<div className="grid gap-5 xl:grid-cols-[1fr_310px]"><section className="flex min-h-[560px] flex-col overflow-hidden rounded-[28px] border border-[#e9e6df] bg-white"><div className="flex items-center justify-between border-b border-[#eeece7] px-6 py-5"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-2xl bg-[#e5f2e7] text-[#3f8666]"><Sparkles className="size-4" /></div><div><p className="text-sm font-semibold text-[#214e44]">GILM Teacher</p><p className="text-xs text-[#9e998f]">{language === "fr" ? "Français · guidé" : "English · guided"}</p></div></div><Pill muted><CircleDot className="size-3 text-[#5ba578]" /> Memory on</Pill></div><div className="flex-1 space-y-6 overflow-y-auto px-6 py-7">{messages.length === 0 && <div className="mx-auto max-w-md py-12 text-center"><div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#f1f5ef] text-[#75a586]"><WandSparkles className="size-6" /></div><h3 className="mt-5 font-serif text-2xl tracking-[-0.03em] text-[#245248]">Start with something real.</h3><p className="mt-3 text-sm leading-6 text-[#8c8b84]">Tell your teacher what you did today, what you are curious about, or where a phrase felt difficult.</p></div>}{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === "student" ? "justify-end" : "justify-start"}`}><div className={`max-w-[78%] rounded-3xl px-5 py-4 text-sm leading-6 ${message.role === "student" ? "rounded-br-md bg-[#153f39] text-white" : "rounded-bl-md bg-[#f1f4ee] text-[#3d5f52]"}`}><div>{message.text}</div>{message.role === "teacher" && <button onClick={() => void speak(message.text)} className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#5a9278] hover:text-[#2d6d53]"><Volume2 className="size-3.5" /> Listen</button>}</div></div>)}</div><div className="border-t border-[#eeece7] p-5"><div className="flex items-end gap-3 rounded-2xl border border-[#e5e2dc] bg-[#fbfaf8] p-2 focus-within:border-[#78a98a]"><textarea value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} placeholder={language === "fr" ? "Écrivez votre réponse…" : "Write your answer…"} rows={2} className="min-h-[54px] flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[#aaa69e]" /><div className="flex items-center gap-2"><button onPointerDown={() => void startRecording()} onPointerUp={stopRecording} onPointerLeave={stopRecording} aria-label="Push to talk" className={`flex size-11 items-center justify-center rounded-xl transition ${recording ? "bg-[#d95747] text-white" : "bg-[#e7f2e9] text-[#438267] hover:bg-[#d6ebdc]"}`}><Mic className={`size-4 ${recording ? "animate-pulse" : ""}`} /></button><button onClick={() => void sendMessage()} disabled={busy || !draft.trim()} className="flex size-11 items-center justify-center rounded-xl bg-[#153f39] text-white transition hover:bg-[#285e51] disabled:cursor-not-allowed disabled:opacity-40"><Send className="size-4" /></button></div></div><p className="mt-3 flex items-center justify-between text-[11px] text-[#aaa59c]"><span>Hold the microphone to speak</span><span>{busy ? "Processing evidence…" : "Enter to send"}</span></p></div></section><aside className="space-y-5"><div className="rounded-[28px] bg-[#dff0de] p-6"><Pill><Target className="size-3" /> Current focus</Pill><h3 className="mt-5 font-serif text-2xl tracking-[-0.04em] text-[#245248]">Keep the meaning. Refine the shape.</h3><p className="mt-3 text-sm leading-6 text-[#567866]">GILM will only turn a moment into learning evidence when the signal is strong enough.</p></div><div className="rounded-[28px] border border-[#e9e6df] bg-white p-6"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-[#9a958c]"><ShieldCheck className="size-4 text-[#5e9b7a]" /> Evidence rules</div><div className="mt-5 space-y-4">{["No invented scores", "Each update cites a real snippet", "EN and FR memories stay separate"].map(item => <div key={item} className="flex items-start gap-3 text-sm leading-5 text-[#5f6d65]"><Check className="mt-0.5 size-4 shrink-0 text-[#5a9a78]" />{item}</div>)}</div></div></aside></div></div>;
}

function ProgressView() {
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { gilmApi.progress().then(setData).catch(reason => setError(reason instanceof Error ? reason.message : "Unable to load progress.")); }, []);
  return <div className="space-y-7"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#77a286]">Learning evidence</p><h1 className="mt-3 font-serif text-5xl font-medium tracking-[-0.055em] text-[#173f3a]">See what your practice shows.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#8a887f]">Progress is separated by language and appears only when the learning memory has something real to cite.</p></div>{error && <div className="rounded-2xl border border-[#efd4c4] bg-[#fff8f2] px-4 py-3 text-sm text-[#9a5a3b]">{error}</div>}<div className="grid gap-5 md:grid-cols-2">{(data?.languages ?? (["en", "fr"] as Language[]).map(language => ({ language, evidenceCount: 0, latestEvidence: [], speaking: null, vocabulary: null, grammar: null, label: "Collecting evidence" }))).map(item => <section key={item.language} className="rounded-[28px] border border-[#e9e6df] bg-white p-7"><div className="flex items-center justify-between"><div><Pill muted><Globe2 className="size-3" /> {item.language.toUpperCase()}</Pill><h2 className="mt-5 font-serif text-3xl tracking-[-0.04em] text-[#204b43]">{item.language === "fr" ? "French memory" : "English memory"}</h2></div><div className="flex size-12 items-center justify-center rounded-2xl bg-[#eff5ec] text-[#5b9a78]"><Brain className="size-5" /></div></div><div className="mt-7 grid grid-cols-3 gap-3">{[["Speaking", item.speaking], ["Vocabulary", item.vocabulary], ["Grammar", item.grammar]].map(([label, value]) => <div key={String(label)} className="rounded-2xl bg-[#f7f7f3] p-3"><div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#aaa59b]">{label}</div><div className="mt-3 font-serif text-xl text-[#264e44]">{value == null ? "—" : `${Math.round(Number(value))}%`}</div></div>)}</div><div className="mt-6 flex items-center justify-between border-t border-[#efede8] pt-5"><span className="text-xs text-[#9c978d]">{item.label}</span><span className="text-xs font-semibold text-[#4e8b6d]">{item.evidenceCount} cited item{item.evidenceCount === 1 ? "" : "s"}</span></div><div className="mt-5 space-y-3">{item.latestEvidence.length ? item.latestEvidence.map((evidence, index) => <div key={`${evidence.created_at}-${index}`} className="rounded-2xl bg-[#f5f7f2] px-4 py-3"><div className="flex items-center justify-between gap-3"><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6b9e7d]">{evidence.skill_type}</span><span className="text-[10px] text-[#aaa59c]">{Math.round(evidence.confidence * 100)}% confidence</span></div><p className="mt-2 text-sm leading-5 text-[#5e6d64]">“{evidence.evidence_snippet}”</p></div>) : <div className="rounded-2xl border border-dashed border-[#dddcd4] px-4 py-5 text-center text-sm text-[#aaa59c]">Collecting evidence from your next conversations.</div>}</div></section>)}</div><div className="rounded-[28px] bg-[#153f39] p-7 text-[#eaf4eb] md:flex md:items-center md:justify-between"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-[#aed0b9]"><ShieldCheck className="size-4 text-[#c7ef7d]" /> Evidence policy</div><p className="mt-3 max-w-2xl text-sm leading-6 text-[#bad0c4]">GILM does not show a CEFR level or a fabricated score. Each metric must be supported by a real learning evidence record linked to a session.</p></div><BookOpen className="mt-5 size-9 text-[#c7ef7d] md:mt-0" /></div></div>;
}

function AppShell({ user, onLogout }: { user: GilmUser; onLogout: () => void }) {
  const [location, navigate] = useLocation();
  const [language, setLanguage] = useState<Language>(() => (window.localStorage.getItem("gilm-language") as Language) || "en");
  const [mobileOpen, setMobileOpen] = useState(false);
  const section = location === "/teacher" ? "teacher" : location === "/progress" ? "progress" : "today";
  useEffect(() => { window.localStorage.setItem("gilm-language", language); }, [language]);
  const title = useMemo(() => section === "teacher" ? "Teacher" : section === "progress" ? "Progress" : "Today", [section]);
  function go(path: string) { navigate(path); setMobileOpen(false); }
  return <div className="min-h-screen bg-[#f6f5f1] text-[#183e3a]"><div className="mx-auto flex min-h-screen max-w-[1600px]"><aside className={`fixed inset-y-0 left-0 z-30 w-[270px] border-r border-[#e7e4dd] bg-[#fbfaf7] px-6 py-8 transition-transform lg:static lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}><div className="flex items-center justify-between"><Logo /><button onClick={() => setMobileOpen(false)} className="flex size-9 items-center justify-center rounded-xl text-[#89867e] lg:hidden"><X className="size-4" /></button></div><div className="mt-16"><p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a19b91]">Your practice</p><nav className="mt-4 space-y-2">{[{ path: "/today", label: "Today", Icon: WandSparkles }, { path: "/teacher", label: "Teacher", Icon: Sparkles }, { path: "/progress", label: "Progress", Icon: TrendingUp }].map(({ path, label, Icon }) => <button key={path} onClick={() => go(path)} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${location === path || (path === "/today" && location === "/") ? "bg-[#e4f0e5] text-[#1f604f]" : "text-[#8f8d84] hover:bg-[#f0eee8] hover:text-[#315a4d]"}`}><Icon className="size-4" />{label}<ArrowRight className={`ml-auto size-3.5 transition ${location === path || (path === "/today" && location === "/") ? "opacity-100" : "opacity-0"}`} /></button>)}</nav></div><div className="mt-auto hidden rounded-[22px] bg-[#e9f3e5] p-4 lg:block"><div className="flex size-9 items-center justify-center rounded-xl bg-white/70 text-[#4a8d6e]"><Target className="size-4" /></div><p className="mt-4 text-sm font-semibold text-[#315c4c]">Small steps, real memory.</p><p className="mt-2 text-xs leading-5 text-[#6f8b79]">Your next plan is shaped by your last honest turn.</p></div></aside>{mobileOpen && <button aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-20 bg-[#173f3a]/20 backdrop-blur-sm lg:hidden" />}<main className="min-w-0 flex-1"><header className="flex h-[86px] items-center justify-between border-b border-[#e8e5df] bg-[#f6f5f1]/80 px-6 backdrop-blur sm:px-10 lg:px-14"><div className="flex items-center gap-4"><button onClick={() => setMobileOpen(true)} className="flex size-10 items-center justify-center rounded-xl border border-[#e2dfd8] bg-white text-[#557267] lg:hidden"><Menu className="size-4" /></button><div><div className="text-xs font-bold uppercase tracking-[0.14em] text-[#a09b92]">GILM workspace</div><div className="mt-1 text-sm font-semibold text-[#2b5b4d]">{title}</div></div></div><div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-full border border-[#e4e1da] bg-white px-3 py-2 text-xs font-semibold text-[#6f8478] sm:flex"><CircleDot className="size-3 text-[#5da37b]" /> Memory active</div><div className="flex items-center gap-3 border-l border-[#e3e0d9] pl-3"><div className="hidden text-right sm:block"><div className="text-sm font-semibold text-[#285346]">{user.name}</div><div className="text-[11px] text-[#a19c93]">Learner profile</div></div><button onClick={onLogout} aria-label="Log out" className="flex size-10 items-center justify-center rounded-xl bg-[#e7f0e7] text-[#4d896d] transition hover:bg-[#d9eadd]"><LogOut className="size-4" /></button></div></div></header><div className="px-6 py-9 sm:px-10 lg:px-14 lg:py-12">{section === "teacher" ? <TeacherView language={language} onLanguage={setLanguage} /> : section === "progress" ? <ProgressView /> : <TodayView language={language} onLanguage={setLanguage} user={user} />}</div></main></div></div>;
}

export default function Home() {
  const [user, setUser] = useState<GilmUser | null>(() => { try { const saved = window.localStorage.getItem("gilm-user"); return saved ? JSON.parse(saved) : null; } catch { return null; } });
  const [, navigate] = useLocation();
  function logout() { setAccessToken(null); window.localStorage.removeItem("gilm-user"); setUser(null); navigate("/"); }
  if (!user || !getAccessToken()) return <LoginPage onLogin={setUser} />;
  return <AppShell user={user} onLogout={logout} />;
}
