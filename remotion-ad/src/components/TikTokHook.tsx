import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  AbsoluteFill,
} from 'remotion';
import { BRAND, FONTS, TIKTOK_TIMING } from '../styles/brand';

// Scene content
const HEADLINE_LINE_1 = "Still copying posts";
const HEADLINE_LINE_2 = "MANUALLY?";
const SUBTEXT = "One platform at a time...";

// Floating stress badges
const STRESS_ITEMS = [
  { x: 12, y: 22, delay: 15, text: "8+ hours/week" },
  { x: 65, y: 18, delay: 25, text: "Repetitive work" },
  { x: 20, y: 72, delay: 35, text: "5 platforms" },
  { x: 58, y: 68, delay: 45, text: "Copy & paste" },
];

export const TikTokHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const duration = TIKTOK_TIMING.sceneHook;

  // Headline animations
  const line1Y = spring({
    frame,
    fps,
    from: 60,
    to: 0,
    config: { damping: 12, mass: 0.5 },
  });

  const line1Opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const line2Scale = spring({
    frame: frame - 12,
    fps,
    from: 0.5,
    to: 1,
    config: { damping: 10, mass: 0.8 },
  });

  const line2Opacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const subtextOpacity = interpolate(frame, [30, 45], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Exit animation
  const exitOpacity = interpolate(
    frame,
    [duration - 15, duration],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity: exitOpacity,
      }}
    >
      {/* Floating stress badges */}
      {STRESS_ITEMS.map((item, index) => {
        const badgeOpacity = interpolate(
          frame,
          [item.delay, item.delay + 15],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        const badgeY = spring({
          frame: frame - item.delay,
          fps,
          from: 30,
          to: 0,
          config: { damping: 14, mass: 0.6 },
        });

        const floatY = Math.sin((frame + index * 20) * 0.08) * 8;

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `translateY(${badgeY + floatY}px)`,
              opacity: badgeOpacity,
              background: 'rgba(239, 68, 68, 0.15)',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 16,
              padding: '16px 28px',
              fontSize: 26,
              fontWeight: 600,
              color: '#FCA5A5',
              whiteSpace: 'nowrap',
            }}
          >
            {item.text}
          </div>
        );
      })}

      {/* Main headline container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 60px',
        }}
      >
        {/* Line 1 */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            color: BRAND.text,
            opacity: line1Opacity,
            transform: `translateY(${line1Y}px)`,
            marginBottom: 20,
          }}
        >
          {HEADLINE_LINE_1}
        </div>

        {/* Line 2 - Emphasized */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: BRAND.error,
            opacity: line2Opacity,
            transform: `scale(${Math.max(0.5, line2Scale)})`,
            textShadow: `0 0 60px ${BRAND.error}50`,
          }}
        >
          {HEADLINE_LINE_2}
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 500,
            color: BRAND.textMuted,
            opacity: subtextOpacity,
            marginTop: 40,
          }}
        >
          {SUBTEXT}
        </div>
      </div>
    </AbsoluteFill>
  );
};
