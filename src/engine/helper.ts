import type { MLCEngine } from '@mlc-ai/web-llm'
import type { Alert } from './guidance'

/**
 * The AI helper explains the health report in simple words. It has two ways to run:
 *
 * 1. On this device: a language model inside the browser, on the graphics chip (WebGPU).
 *    Nothing is sent anywhere, so it works with no link to Earth once the model is downloaded.
 * 2. Online: the Claude API. Better answers, but it needs a link and sends the report to Anthropic.
 *
 * Either way the model only explains. The fixed rules in guidance.ts decide what is wrong and what to do.
 */

export interface HelperModel {
  id: string
  name: string
  note: string
  /** rough download size */
  downloadGB: number
  /** graphics memory the library says the model needs */
  vramGB: number
}

/** Plain instruction models (no "thinking" text) from one family that handles Arabic. Ids come from web-llm's model list. */
export const MODELS: HelperModel[] = [
  { id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC', name: 'Small', note: 'Fastest. Runs on most laptops.', downloadGB: 1, vramGB: 1.6 },
  { id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC', name: 'Medium', note: 'Better answers. Needs a real graphics card.', downloadGB: 2, vramGB: 2.5 },
  { id: 'Qwen2.5-7B-Instruct-q4f16_1-MLC', name: 'Large', note: 'Best answers and best Arabic. Needs a strong graphics card.', downloadGB: 4.5, vramGB: 5.1 },
]

const MODEL_SLOT = 'bovd-helper-model'

export function chosenModel(): HelperModel {
  try {
    return MODELS.find((m) => m.id === localStorage.getItem(MODEL_SLOT)) ?? MODELS[0]
  } catch {
    return MODELS[0]
  }
}
export function chooseModel(id: string) {
  try { localStorage.setItem(MODEL_SLOT, id) } catch { /* the choice just lasts for this visit */ }
}

let engine: MLCEngine | null = null
let loadedId: string | null = null

export const gpuAvailable = () => typeof navigator !== 'undefined' && 'gpu' in navigator
/** Id of the on-device model that is loaded and ready to answer, if any. */
export const loadedModel = () => loadedId

/** True when the model files are already on this device. */
export async function isDownloaded(id: string): Promise<boolean> {
  try {
    const { hasModelInCache } = await import('@mlc-ai/web-llm')
    return await hasModelInCache(id)
  } catch {
    return false
  }
}

export async function loadHelper(id: string, onProgress: (fraction: number) => void): Promise<void> {
  if (engine && loadedId === id) return
  // the library is large, so it is only fetched when the helper is first opened
  const { CreateMLCEngine } = await import('@mlc-ai/web-llm')
  if (engine) {
    // free the graphics memory of the old model before loading another
    await engine.unload()
    engine = null
    loadedId = null
  }
  engine = await CreateMLCEngine(id, { initProgressCallback: (p) => onProgress(p.progress) })
  loadedId = id
}

export interface Turn {
  role: 'user' | 'assistant'
  text: string
}

/** Hands the model the rule engine's results and forbids it from adding medical advice of its own. */
export function systemPrompt(report: string, alerts: Alert[], lang: 'en' | 'ar'): string {
  const steps = alerts
    .map((a) => `${a.title}:\n${a.doNow.map((s) => `- ${s.text}`).join('\n')}\nWho to tell: ${a.escalate}`)
    .join('\n\n')
  return [
    'You are the on-board health helper in the BÖVD app for astronauts on a long space mission.',
    'Your job is to explain the health report below in simple, calm words.',
    'Rules:',
    '1. Use only the facts in the report. Do not invent readings.',
    '2. Never name a disease as a diagnosis. Never suggest medicines or doses.',
    '3. When asked what to do, repeat the steps listed under "Steps the app recommends". Do not add new medical steps.',
    '4. If the question is not answered by the report, or you are unsure, say so and tell the astronaut to ask the crew medical officer or the flight surgeon.',
    '5. Keep each answer under 120 words. Use short sentences.',
    `6. Answer in ${lang === 'ar' ? 'Arabic' : 'English'}.`,
    '',
    '--- HEALTH REPORT ---',
    report,
    '',
    '--- Steps the app recommends ---',
    steps || 'None. All indicators are in range.',
  ].join('\n')
}

// a short memory keeps the prompt inside a small model's context window
const recent = (history: Turn[]) => history.slice(-6).map((t) => ({ role: t.role, content: t.text }))

/** On-device answer, streamed piece by piece. */
export async function* askLocal(system: string, history: Turn[], question: string): AsyncGenerator<string> {
  if (!engine) throw new Error('helper not loaded')
  const stream = await engine.chat.completions.create({
    stream: true,
    temperature: 0.3,
    max_tokens: 320,
    messages: [{ role: 'system', content: system }, ...recent(history), { role: 'user', content: question }],
  })
  for await (const chunk of stream) {
    const piece = chunk.choices[0]?.delta?.content
    if (piece) yield piece
  }
}

// --- Online: the Claude API ---------------------------------------------------------------------
// The key is typed in by the user and kept in this tab only (sessionStorage). It is never in the
// code, so it cannot leak through the public repository.

export const ONLINE_MODEL = 'claude-opus-5-5'
const KEY_SLOT = 'bovd-claude-key'

export function onlineKey(): string {
  try { return sessionStorage.getItem(KEY_SLOT) ?? '' } catch { return '' }
}
export function setOnlineKey(key: string) {
  try {
    if (key) sessionStorage.setItem(KEY_SLOT, key)
    else sessionStorage.removeItem(KEY_SLOT)
  } catch { /* no storage: the key is simply not remembered */ }
}

/** Why an online answer failed, so the screen can say what to do about it. */
export type OnlineProblem = 'key' | 'limit' | 'link' | 'refused' | 'other'
export class HelperError extends Error {
  constructor(public problem: OnlineProblem) {
    super(problem)
  }
}

export async function* askOnline(key: string, system: string, history: Turn[], question: string): AsyncGenerator<string> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  // dangerouslyAllowBrowser: the SDK blocks browsers by default because a key in page code is
  // public. Here the key is the user's own, pasted on their own device, so that risk does not apply.
  const client = new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true })
  try {
    const stream = client.beta.messages.stream({
      model: ONLINE_MODEL,
      max_tokens: 16000,
      // thinking is always on for this model; low effort keeps a short explanation fast
      output_config: { effort: 'low' },
      // if a safety check declines the request, let the API retry on its default fallback model
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system,
      messages: [...recent(history), { role: 'user' as const, content: question }],
    })
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') yield event.delta.text
    }
    const final = await stream.finalMessage()
    if (final.stop_reason === 'refusal') throw new HelperError('refused')
  } catch (e) {
    if (e instanceof HelperError) throw e
    if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) throw new HelperError('key')
    if (e instanceof Anthropic.RateLimitError) throw new HelperError('limit')
    if (e instanceof Anthropic.APIConnectionError) throw new HelperError('link')
    throw new HelperError('other')
  }
}
