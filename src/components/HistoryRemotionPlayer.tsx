'use client';

import { Player } from '@remotion/player';
import HistoryVideo, {
  FPS,
  TOTAL_DURATION,
  VIDEO_WIDTH,
  VIDEO_HEIGHT,
} from '@/remotion/HistoryVideo';

/**
 * In-browser Remotion player — plays the animated U-visa history composition
 * directly in the page, no MP4 export required. The video can later be
 * rendered server-side via `npx remotion render` for a downloadable MP4.
 */
export default function HistoryRemotionPlayer() {
  // Reserve the 16:9 box up front so the Player has a measurable height to
  // fill. Without this the Player can render at height 0 inside flex/grid
  // layouts and the video appears collapsed.
  return (
    <div className="rounded-xl overflow-hidden border shadow-lg bg-black w-full aspect-video relative">
      <Player
        component={HistoryVideo}
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
  );
}
