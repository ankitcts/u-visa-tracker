/**
 * Chatbot route — provider-agnostic OpenAI-compatible completions.
 *
 * Reads the same LLM env as the news classifier:
 *   LLM_BASE_URL   (default https://api.groq.com/openai/v1)
 *   LLM_API_KEY | GROQ_API_KEY | OPENAI_API_KEY
 *   LLM_MODEL      (default llama-3.3-70b-versatile)
 *
 * POST /api/chat
 * Body: { messages: [{role: 'user'|'assistant'|'system', content: string}, ...] }
 * Response: { reply: string }
 */
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const DEFAULT_BASE = 'https://api.groq.com/openai/v1';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are U-Bot, a concise assistant embedded in a public U-visa stats dashboard.

Your job: answer factual questions about the U nonimmigrant visa (Form I-918) program in the United States. Cite USCIS / DHS / statute when helpful.

HARD RULES:
1. Never identify any individual U-visa petitioner or offer PII. Individual filings are sealed by 8 U.S.C. § 1367. If asked, explain the confidentiality rule.
2. Never guess statistics. If you don't have a published figure, say "I don't have a published figure for that."
3. Never give legal advice. Direct users to AILA, a qualified immigration attorney, or a legal-aid provider.
4. Keep answers under 120 words unless the user asks for more. Use plain prose — no headings, no markdown tables.
5. If the question is off-topic (not U-visa / I-918 / crime-victim immigration), say you're scoped to U-visa topics and decline briefly.

FACTS YOU KNOW:
- U visa created by Victims of Trafficking and Violence Protection Act of 2000.
- USCIS began accepting filings after regs finalized in 2007.
- Statutory annual cap: 10,000 U-1 principal approvals per FY (8 USC 1184(p)(2)(A)).
- Derivatives (U-2 spouse, U-3 child, U-4 parent, U-5 sibling) do NOT count against the cap.
- 28 statutory qualifying crimes per INA § 101(a)(15)(U)(iii).
- Pending principals as of late FY2024: roughly 273k.
- FY2012-18 top states by I-918B certifications: California 35%, Texas 7%, Florida/NY/WA 5% each, AZ/GA/IL 4% each.
- Top certified crimes FY2012-18: felonious assault 46%, domestic violence 41%, sexual assault 15%.
- USCIS issued Bona Fide Determination policy June 2021 (PM-602-0184).
- Landmark case: Barrios Garcia v. DHS, 25 F.4th 430 (6th Cir. 2022).
- After 3 years in U status, a petitioner may file Form I-485 to adjust to LPR.

If the user asks for exact figures you don't know, tell them to check the dashboard or the Sources page of this site.`;

interface IncomingMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: Request) {
  let body: { messages?: IncomingMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const messages = (body.messages ?? []).filter(
    (m) =>
      typeof m?.content === 'string' &&
      (m.role === 'user' || m.role === 'assistant'),
  );

  if (messages.length === 0) {
    return NextResponse.json(
      { error: 'No messages provided' },
      { status: 400 },
    );
  }

  // Cap context to last 12 turns (user + assistant) to control token use.
  const trimmed = messages.slice(-12);

  const apiKey =
    process.env.LLM_API_KEY ||
    process.env.GROQ_API_KEY ||
    process.env.OPENAI_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL || DEFAULT_BASE;
  const model = process.env.LLM_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    return NextResponse.json(
      {
        reply:
          "I'm not configured yet — an API key for the chat model isn't set. Add GROQ_API_KEY to .env.local (free from console.groq.com) and I'll be able to answer questions.",
        unconfigured: true,
      },
      { status: 200 },
    );
  }

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...trimmed,
        ],
        temperature: 0.3,
        max_tokens: 400,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn(`Chat LLM ${res.status}:`, err);
      return NextResponse.json(
        { reply: 'I hit a snag reaching the model. Try again in a moment.' },
        { status: 200 },
      );
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply =
      json.choices?.[0]?.message?.content?.trim() ??
      "I didn't get a response — please try again.";
    return NextResponse.json({ reply });
  } catch (err) {
    console.warn('Chat route error', err);
    return NextResponse.json(
      { reply: 'Something went wrong. Please try again.' },
      { status: 200 },
    );
  }
}
