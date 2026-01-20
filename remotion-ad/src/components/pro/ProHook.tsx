import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from 'remotion';
import { BRAND, EASING, SPRINGS, TIKTOK_TIMING } from '../../styles/brand';
import { Camera } from '../Camera';
import { Particles } from '../Particles';

const HEADLINE_LINE_1 = 'Still copying posts';
const HEADLINE_LINE_2 = 'MANUALLY?';
const SUBTEXT = 'One platform at a time...';

const STRESS_BADGES = [
  { text: '8+ hours/week', x: 10, y: 20, delay: 20 },
  { text: 'Repetitive work', x: 62, y: 16, delay: 32 },
  { text: '5 platforms', x: 15, y: 70, delay: 44 },
  { text: 'Copy & paste', x: 58, y: 72, delay: 56 },
];

export const ProHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = TIKTOK_TIMING.sceneHook;

  // ===== HEADLINE ANIMATIONS =====

  // Line 1: Slide up with spring
  const line1Progress = spring({
    frame,
    fps,
    config: SPRINGS.smooth,
  });

  const line1Y = interpolate(line1Progress, [0, 1], [80, 0]);
  const line1Opacity = interpolate(frame, [0, 25], [0, 1], {
    easing: EASING.smooth,
    extrapolateRight: 'clamp',
  });

  // Line 2: Scale in with elastic bounce + shake
  const line2Start = 20;
  const line2Progress = spring({
    frame: frame - line2Start,
    fps,
    config: SPRINGS.bouncy,
  });

  const line2Scale = interpolate(Math.max(0, line2Progress), [0, 1], [0.3, 1]);
  const line2Opacity = interpolate(frame, [line2Start, line2Start + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Subtext fade in
  const subtextOpacity = interpolate(frame, [50, 70], [0, 1], {
    easing: EASING.smooth,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ===== EXIT ANIMATION =====
  const exitStart = duration - 30;
  const exitOpacity = interpolate(frame, [exitStart, duration], [1, 0], {
    easing: EASING.exit,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const exitScale = interpolate(frame, [exitStart, duration], [1, 0.95], {
    easing: EASING.exit,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <Camera
      zoom={{ from: 1, to: 1.08, start: 0, end: duration }}
      roll={{ from: -1, to: 1, start: 0, end: duration }}
      shake={{ intensity: 12, start: line2Start + 10, duration: 20 }}
    >
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          opacity: exitOpacity,
          transform: `scale(${exitScale})`,
        }}
      >
        {/* Background particles */}
        <Particles count={20} color={BRAND.error} direction="up" />

        {/* Stress badges floating */}
        {STRESS_BADGES.map((badge, i) => {
          const badgeProgress = spring({
            frame: frame - badge.delay,
            fps,
            config: SPRINGS.snappy,
          });

          const badgeOpacity = interpolate(
            frame,
            [badge.delay, badge.delay + 20],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          const badgeY = interpolate(Math.max(0, badgeProgress), [0, 1], [50, 0]);
          const badgeScale = interpolate(Math.max(0, badgeProgress), [0, 1], [0.8, 1]);

          // Floating animation
          const floatY = Math.sin((frame + i * 30) * 0.06) * 8;
          const floatX = Math.cos((frame + i * 20) * 0.04) * 4;

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${badge.x}%`,
                top: `${badge.y}%`,
                transform: `
                  translateY(${badgeY + floatY}px)
                  translateX(${floatX}px)
                  scale(${badgeScale})
                `,
                opacity: badgeOpacity,
                background: 'rgba(239, 68, 68, 0.12)',
                border: '2px solid rgba(239, 68, 68, 0.35)',
                borderRadius: 16,
                padding: '14px 24px',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: '#FCA5A5',
                  whiteSpace: 'nowrap',
                }}
              >
                {badge.text}
              </span>
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
            padding: '0 50px',
            zIndex: 10,
          }}
        >
          {/* Line 1 */}
          <div
            style={{
              fontSize: 58,
              fontWeight: 600,
              color: BRAND.text,
              opacity: line1Opacity,
              transform: `translateY(${line1Y}px)`,
              marginBottom: 16,
              letterSpacing: '-0.02em',
            }}
          >
            {HEADLINE_LINE_1}
          </div>

          {/* Line 2 - Impact word */}
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              color: BRAND.error,
              opacity: line2Opacity,
              transform: `scale(${line2Scale})`,
              textShadow: `
                0 0 40px ${BRAND.error}60,
                0 0 80px ${BRAND.error}30
              `,
              letterSpacing: '-0.03em',
            }}
          >
            {HEADLINE_LINE_2}
          </div>

          {/* Subtext */}
          <div
            style={{
              fontSize: 32,
              fontWeight: 500,
              color: BRAND.textMuted,
              opacity: subtextOpacity,
              marginTop: 30,
            }}
          >
            {SUBTEXT}
          </div>
        </div>

        {/* Red glow behind */}
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            background: `radial-gradient(circle, ${BRAND.error}25 0%, transparent 60%)`,
            filter: 'blur(60px)',
            opacity: interpolate(frame, [line2Start, line2Start + 30], [0, 0.8], {
              extrapolateRight: 'clamp',
            }),
          }}
        />
      </AbsoluteFill>
    </Camera>
  );
};
