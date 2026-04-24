'use client';

import { useState } from 'react';
import { Player } from '@remotion/player';
import { Mic2 } from 'lucide-react';
import HistoryVideo, {
  FPS,
  TOTAL_DURATION,
  VIDEO_WIDTH,
  VIDEO_HEIGHT,
  AVAILABLE_VOICES,
  DEFAULT_VOICE_KEY,
} from '@/remotion/HistoryVideo';

export default function HistoryRemotionPlayer() {
  const [voiceKey, setVoiceKey] = useState<string>(DEFAULT_VOICE_KEY);

  return (
    <div className="space-y-3">
      <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Mic2 className="h-4 w-4" />
        <span>Narrator voice:</span>
        <select
          value={voiceKey}
          onChange={(e) => setVoiceKey(e.target.value)}
          className="rounded-md border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {AVAILABLE_VOICES.map((v) => (
            <option key={v.key} value={v.key}>
              {v.label}
            </option>
          ))}
        </select>
      </label>
      <div className="rounded-xl overflow-hidden border shadow-lg bg-black w-full aspect-video relative">
        <Player
          key={voiceKey /* force remount on voice switch */}
          component={HistoryVideo}
          inputProps={{ voiceKey }}
          durationInFrames={TOTAL_DURATION}
          compositionWidth={VIDEO_WIDTH}
          compositionHeight={VIDEO_HEIGHT}
          fps={FPS}
          controls
          loop
          style={{ width: '100%', height: '100%' }}
          acknowledgeRemotionLicense
        />
      </div>
    </div>
  );
}
