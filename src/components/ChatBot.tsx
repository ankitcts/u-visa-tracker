'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED: string[] = [
  'What is the U-visa 10,000 cap?',
  'How long is the current backlog?',
  'Who counts as a qualifying crime victim?',
  'What is a Bona Fide Determination?',
];

const STARTER: Message = {
  role: 'assistant',
  content:
    "Hi! I'm U-Bot. I can answer questions about the U nonimmigrant visa — eligibility, the 10,000 cap, backlog, derivatives, Bona Fide Determinations, and what the data on this site means. I don't give legal advice and I won't identify any individual petitioner. Tap the mic to talk to me.",
};

// Strip markdown/punctuation noise that reads awkwardly when spoken aloud.
function forSpeech(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .replace(/§/g, 'section ')
    .replace(/U\.S\.C\./g, 'U S C')
    .replace(/[#_>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([STARTER]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceOut, setVoiceOut] = useState(true);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [supportsSTT, setSupportsSTT] = useState(false);
  const [supportsTTS, setSupportsTTS] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const lastSpokenRef = useRef<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setSupportsTTS('speechSynthesis' in window);
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (Ctor) {
      setSupportsSTT(true);
      const rec = new Ctor();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';
      rec.maxAlternatives = 1;
      rec.onresult = (ev: SpeechRecognitionEvent) => {
        let transcript = '';
        for (let i = 0; i < ev.results.length; i++) {
          transcript += ev.results[i][0].transcript;
        }
        setInput(transcript);
        if (ev.results[ev.results.length - 1].isFinal) {
          send(transcript);
          setListening(false);
        }
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      recognitionRef.current = rec;
    }
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {}
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  useEffect(() => {
    if (open && !listening) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open, listening]);

  // Auto-speak the latest assistant reply.
  useEffect(() => {
    if (!supportsTTS || !voiceOut || !open) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'assistant') return;
    if (last.content === lastSpokenRef.current) return;
    if (last === STARTER && messages.length === 1) return; // skip greeting until interaction

    lastSpokenRef.current = last.content;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(forSpeech(last.content));
    utter.rate = 1.05;
    utter.pitch = 1.0;
    utter.lang = 'en-US';
    // Pick a pleasant default voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find(
        (v) => /en-US/.test(v.lang) && /Google|Samantha|Ava|Natural/i.test(v.name),
      ) || voices.find((v) => v.lang === 'en-US');
    if (preferred) utter.voice = preferred;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  }, [messages, supportsTTS, voiceOut, open]);

  const stopSpeaking = () => {
    if (supportsTTS) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const toggleListen = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      setInput('');
      stopSpeaking();
      try {
        rec.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  };

  const toggleVoice = () => {
    if (speaking) stopSpeaking();
    setVoiceOut((v) => !v);
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: Message[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(1) }),
      });
      const data = (await res.json()) as { reply?: string };
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content:
            data.reply ?? "I didn't get a response — please try again.",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Network error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        aria-expanded={open}
        className={cn(
          'fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform',
          'bg-primary text-primary-foreground hover:scale-105 active:scale-95',
          open && 'rotate-90',
          speaking && !open && 'ring-4 ring-primary/40 animate-pulse',
        )}
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      {/* Panel */}
      <div
        role="dialog"
        aria-label="U-Bot chat"
        aria-hidden={!open}
        className={cn(
          'fixed z-40 transition-all',
          'bottom-24 right-5',
          'w-[min(380px,calc(100vw-2.5rem))] h-[min(560px,calc(100vh-8rem))]',
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none',
        )}
      >
        <Card className="h-full flex flex-col overflow-hidden shadow-xl">
          <CardHeader className="p-4 border-b">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 transition-all',
                  speaking && 'ring-2 ring-primary animate-pulse',
                )}
              >
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm flex items-center gap-2">
                  U-Bot
                  {speaking && (
                    <SpeakingWaveform />
                  )}
                  {listening && (
                    <span className="inline-flex items-center gap-1 text-xs text-destructive">
                      <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                      listening
                    </span>
                  )}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  U-visa Q&amp;A · voice enabled
                </p>
              </div>
              {supportsTTS && (
                <button
                  type="button"
                  onClick={toggleVoice}
                  aria-label={voiceOut ? 'Mute voice' : 'Enable voice'}
                  aria-pressed={voiceOut}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                >
                  {voiceOut ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </button>
              )}
              {speaking && (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  aria-label="Stop speaking"
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                >
                  <Square className="h-3.5 w-3.5" fill="currentColor" />
                </button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex gap-2 text-sm',
                    m.role === 'user' && 'justify-end',
                  )}
                >
                  {m.role === 'assistant' && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'rounded-lg px-3 py-2 max-w-[85%]',
                      m.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted',
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2 text-sm">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                  <div className="rounded-lg px-3 py-2 bg-muted inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                      style={{ animationDelay: '120ms' }}
                    />
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                      style={{ animationDelay: '240ms' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {messages.length === 1 && !loading && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="text-xs px-2.5 py-1 rounded-full border border-border bg-background hover:bg-accent inline-flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3 text-primary" />
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form
              className="border-t p-3 flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              {supportsSTT && (
                <Button
                  type="button"
                  size="icon"
                  variant={listening ? 'destructive' : 'outline'}
                  onClick={toggleListen}
                  aria-label={listening ? 'Stop listening' : 'Start voice input'}
                  aria-pressed={listening}
                  className={cn(listening && 'animate-pulse')}
                >
                  {listening ? (
                    <Mic className="h-4 w-4" />
                  ) : (
                    <MicOff className="h-4 w-4" />
                  )}
                </Button>
              )}
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                placeholder={
                  listening ? 'Listening…' : 'Ask or press the mic…'
                }
                className="flex-1 h-9 px-3 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading || !input.trim()}
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function SpeakingWaveform() {
  return (
    <span className="inline-flex items-end gap-0.5 h-3">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-0.5 bg-primary rounded-full animate-[pulse_0.8s_ease-in-out_infinite]"
          style={{
            height: '100%',
            animationDelay: `${i * 120}ms`,
            animationName: 'waveform',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes waveform {
          0%,
          100% {
            transform: scaleY(0.4);
          }
          50% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </span>
  );
}
