import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
  AbsoluteFill,
} from 'remotion';
import { BRAND, FONTS, TIKTOK_TIMING, DIMENSIONS } from '../styles/brand';
import { TikTokHook } from '../components/TikTokHook';
import { TikTokSolution } from '../components/TikTokSolution';
import { TikTokTelegram } from '../components/TikTokTelegram';
import { TikTokCalendar } from '../components/TikTokCalendar';
import { TikTokCTA } from '../components/TikTokCTA';

/**
 * POSTAIFY TikTok Ad - Telegram Bot & Calendar Feature
 *
 * Duration: 15 seconds (450 frames @ 30fps)
 * Format: Vertical 1080x1920 (9:16)
 *
 * Scene Timeline:
 * - Scene 1 (Hook): 0-75 frames (0-2.5s) - Pain point about manual posting
 * - Scene 2 (Solution): 75-135 frames (2.5-4.5s) - Postaify brand reveal
 * - Scene 3 (Telegram): 135-240 frames (4.5-8s) - Telegram bot feature
 * - Scene 4 (Calendar): 240-345 frames (8-11.5s) - Calendar scheduling
 * - Scene 5 (CTA): 345-450 frames (11.5-15s) - Call to action
 */

export const TikTokAd: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Calculate scene start frames
  const sceneStarts = {
    hook: 0,
    solution: TIKTOK_TIMING.sceneHook,
    telegram: TIKTOK_TIMING.sceneHook + TIKTOK_TIMING.sceneSolution,
    calendar: TIKTOK_TIMING.sceneHook + TIKTOK_TIMING.sceneSolution + TIKTOK_TIMING.sceneTelegram,
    cta: TIKTOK_TIMING.sceneHook + TIKTOK_TIMING.sceneSolution + TIKTOK_TIMING.sceneTelegram + TIKTOK_TIMING.sceneCalendar,
  };

  // Animated background glow
  const glowOpacity = interpolate(
    frame,
    [0, 100, 200, 300, 400],
    [0.3, 0.5, 0.4, 0.6, 0.5],
    { extrapolateRight: 'clamp' }
  );

  const glowX = interpolate(
    frame,
    [0, 450],
    [30, 70],
    { extrapolateRight: 'clamp' }
  );

  const glowY = interpolate(
    frame,
    [0, 450],
    [25, 75],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND.background,
        fontFamily: FONTS.sans,
        overflow: 'hidden',
      }}
    >
      {/* Primary animated glow */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          left: `${glowX}%`,
          top: `${glowY}%`,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${BRAND.primary}40 0%, transparent 60%)`,
          opacity: glowOpacity,
          filter: 'blur(100px)',
        }}
      />

      {/* Secondary glow */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          left: `${100 - glowX}%`,
          top: `${100 - glowY}%`,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${BRAND.primaryLight}25 0%, transparent 60%)`,
          opacity: glowOpacity * 0.6,
          filter: 'blur(80px)',
        }}
      />

      {/* Grid pattern overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Scene 1: Hook - Pain Point (0-2.5s) */}
      <Sequence from={sceneStarts.hook} durationInFrames={TIKTOK_TIMING.sceneHook}>
        <TikTokHook />
      </Sequence>

      {/* Scene 2: Solution - Brand Reveal (2.5-4.5s) */}
      <Sequence from={sceneStarts.solution} durationInFrames={TIKTOK_TIMING.sceneSolution}>
        <TikTokSolution />
      </Sequence>

      {/* Scene 3: Telegram Bot Feature (4.5-8s) */}
      <Sequence from={sceneStarts.telegram} durationInFrames={TIKTOK_TIMING.sceneTelegram}>
        <TikTokTelegram />
      </Sequence>

      {/* Scene 4: Calendar Scheduling (8-11.5s) */}
      <Sequence from={sceneStarts.calendar} durationInFrames={TIKTOK_TIMING.sceneCalendar}>
        <TikTokCalendar />
      </Sequence>

      {/* Scene 5: Call to Action (11.5-15s) */}
      <Sequence from={sceneStarts.cta} durationInFrames={TIKTOK_TIMING.sceneCTA}>
        <TikTokCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
