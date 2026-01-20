import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
  AbsoluteFill,
} from 'remotion';
import { BRAND, FONTS, TIKTOK_TIMING, SCENE_STARTS } from '../styles/brand';
import { ProHook } from '../components/pro/ProHook';
import { ProSolution } from '../components/pro/ProSolution';
import { ProTelegram } from '../components/pro/ProTelegram';
import { ProCalendar } from '../components/pro/ProCalendar';
import { ProCTA } from '../components/pro/ProCTA';

/**
 * POSTAIFY Pro TikTok Ad - Telegram Bot & Calendar Feature
 *
 * PRO QUALITY FEATURES:
 * - 60fps smooth animations
 * - Camera movements on every scene (zoom, pan, roll, shake)
 * - Particle systems for depth
 * - Professional spring easing (no linear)
 * - Staggered element reveals
 * - Glow effects on key elements
 * - Proper exit animations
 *
 * Duration: 15 seconds (900 frames @ 60fps)
 * Format: Vertical 1080x1920 (9:16)
 *
 * Scene Timeline:
 * - Scene 1 (Hook): 0-150 frames (0-2.5s)
 * - Scene 2 (Solution): 150-270 frames (2.5-4.5s)
 * - Scene 3 (Telegram): 270-480 frames (4.5-8s)
 * - Scene 4 (Calendar): 480-690 frames (8-11.5s)
 * - Scene 5 (CTA): 690-900 frames (11.5-15s)
 */

export const ProTikTokAd: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // ===== ANIMATED BACKGROUND =====

  // Primary glow moves across screen
  const glowX = interpolate(frame, [0, 900], [25, 75], {
    extrapolateRight: 'clamp',
  });

  const glowY = interpolate(frame, [0, 900], [30, 70], {
    extrapolateRight: 'clamp',
  });

  // Glow intensity pulses
  const glowIntensity = interpolate(
    Math.sin(frame * 0.015),
    [-1, 1],
    [0.3, 0.6]
  );

  // Secondary glow for depth
  const glow2X = interpolate(frame, [0, 900], [70, 30], {
    extrapolateRight: 'clamp',
  });

  const glow2Y = interpolate(frame, [0, 900], [60, 40], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND.background,
        fontFamily: FONTS.sans,
        overflow: 'hidden',
      }}
    >
      {/* ===== BACKGROUND LAYER ===== */}

      {/* Primary animated glow */}
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          left: `${glowX}%`,
          top: `${glowY}%`,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${BRAND.primary}50 0%, transparent 60%)`,
          opacity: glowIntensity,
          filter: 'blur(120px)',
          willChange: 'transform, opacity',
        }}
      />

      {/* Secondary glow */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          left: `${glow2X}%`,
          top: `${glow2Y}%`,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${BRAND.primaryLight}30 0%, transparent 60%)`,
          opacity: glowIntensity * 0.6,
          filter: 'blur(100px)',
          willChange: 'transform, opacity',
        }}
      />

      {/* Grid pattern overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Vignette overlay for cinematic feel */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 40%, ${BRAND.background}90 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* ===== SCENES ===== */}

      {/* Scene 1: Hook - Pain Point */}
      <Sequence from={SCENE_STARTS.hook} durationInFrames={TIKTOK_TIMING.sceneHook}>
        <ProHook />
      </Sequence>

      {/* Scene 2: Solution - Brand Reveal */}
      <Sequence from={SCENE_STARTS.solution} durationInFrames={TIKTOK_TIMING.sceneSolution}>
        <ProSolution />
      </Sequence>

      {/* Scene 3: Telegram Bot Feature */}
      <Sequence from={SCENE_STARTS.telegram} durationInFrames={TIKTOK_TIMING.sceneTelegram}>
        <ProTelegram />
      </Sequence>

      {/* Scene 4: Calendar Scheduling */}
      <Sequence from={SCENE_STARTS.calendar} durationInFrames={TIKTOK_TIMING.sceneCalendar}>
        <ProCalendar />
      </Sequence>

      {/* Scene 5: Call to Action */}
      <Sequence from={SCENE_STARTS.cta} durationInFrames={TIKTOK_TIMING.sceneCTA}>
        <ProCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
