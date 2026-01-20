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
import { ConvergingParticles, SparkBurst } from '../Particles';

const PRODUCT_NAME = 'POSTAIFY';
const TAGLINE = 'AI-Powered Content Automation';

export const ProSolution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = TIKTOK_TIMING.sceneSolution;

  // ===== LOGO ANIMATION =====

  // Logo circle scales in with bounce
  const logoProgress = spring({
    frame,
    fps,
    config: { damping: 10, mass: 0.6, stiffness: 180 },
  });

  const logoScale = interpolate(Math.max(0, logoProgress), [0, 1], [0, 1]);
  const logoRotation = interpolate(frame, [0, 40], [-180, 0], {
    easing: EASING.elastic,
    extrapolateRight: 'clamp',
  });

  // Logo glow pulse
  const glowPulse = interpolate(Math.sin(frame * 0.12), [-1, 1], [30, 50]);

  // ===== BRAND NAME ANIMATION =====
  const nameStart = 25;
  const nameProgress = spring({
    frame: frame - nameStart,
    fps,
    config: SPRINGS.bouncy,
  });

  const nameOpacity = interpolate(frame, [nameStart, nameStart + 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const nameY = interpolate(Math.max(0, nameProgress), [0, 1], [60, 0]);

  // ===== TAGLINE =====
  const taglineStart = 50;
  const taglineOpacity = interpolate(frame, [taglineStart, taglineStart + 25], [0, 1], {
    easing: EASING.smooth,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const taglineY = interpolate(frame, [taglineStart, taglineStart + 35], [30, 0], {
    easing: EASING.smooth,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ===== DECORATIVE RINGS =====
  const ringOpacity = interpolate(frame, [30, 50], [0, 0.4], {
    extrapolateRight: 'clamp',
  });

  const ringScale = spring({
    frame: frame - 30,
    fps,
    config: SPRINGS.gentle,
  });

  // ===== EXIT =====
  const exitStart = duration - 25;
  const exitOpacity = interpolate(frame, [exitStart, duration], [1, 0], {
    easing: EASING.exit,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const exitScale = interpolate(frame, [exitStart, duration], [1, 1.1], {
    easing: EASING.smooth,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <Camera
      zoom={{ from: 1.2, to: 1, start: 0, end: 70 }}
      roll={{ from: 2, to: 0, start: 0, end: 60 }}
    >
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          opacity: exitOpacity,
          transform: `scale(${exitScale})`,
        }}
      >
        {/* Converging particles to logo */}
        <ConvergingParticles
          count={18}
          color={BRAND.primary}
          targetX={50}
          targetY={42}
          startFrame={5}
          duration={50}
        />

        {/* Spark burst on logo land */}
        <SparkBurst x={50} y={42} color={BRAND.primaryLight} startFrame={35} count={16} />

        {/* Decorative rotating rings */}
        <svg
          width="600"
          height="600"
          style={{
            position: 'absolute',
            opacity: ringOpacity,
            transform: `scale(${Math.max(0.5, ringScale)})`,
          }}
        >
          <circle
            cx="300"
            cy="300"
            r="250"
            fill="none"
            stroke={BRAND.primary}
            strokeWidth="1.5"
            strokeDasharray="15 10"
            style={{
              transformOrigin: 'center',
              transform: `rotate(${frame * 0.4}deg)`,
            }}
          />
          <circle
            cx="300"
            cy="300"
            r="280"
            fill="none"
            stroke={BRAND.primaryLight}
            strokeWidth="1"
            strokeDasharray="8 15"
            style={{
              transformOrigin: 'center',
              transform: `rotate(${-frame * 0.25}deg)`,
            }}
          />
        </svg>

        {/* Main glow behind logo */}
        <div
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            background: `radial-gradient(circle, ${BRAND.primary}50 0%, transparent 60%)`,
            filter: 'blur(80px)',
            opacity: interpolate(frame, [0, 30], [0, 0.7], { extrapolateRight: 'clamp' }),
          }}
        />

        {/* Logo + Text container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 30,
            zIndex: 10,
          }}
        >
          {/* Logo circle */}
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${logoScale}) rotate(${logoRotation}deg)`,
              boxShadow: `
                0 0 ${glowPulse}px ${BRAND.primary}80,
                0 0 ${glowPulse * 2}px ${BRAND.primary}40,
                0 25px 50px rgba(0,0,0,0.4)
              `,
            }}
          >
            <span
              style={{
                fontSize: 90,
                fontWeight: 800,
                color: BRAND.text,
                transform: `rotate(${-logoRotation}deg)`,
              }}
            >
              P
            </span>
          </div>

          {/* Brand name */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: BRAND.text,
              letterSpacing: 6,
              opacity: nameOpacity,
              transform: `translateY(${nameY}px)`,
              textShadow: `0 0 40px ${BRAND.primary}40`,
            }}
          >
            {PRODUCT_NAME}
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: BRAND.textMuted,
              opacity: taglineOpacity,
              transform: `translateY(${taglineY}px)`,
            }}
          >
            {TAGLINE}
          </div>
        </div>
      </AbsoluteFill>
    </Camera>
  );
};
