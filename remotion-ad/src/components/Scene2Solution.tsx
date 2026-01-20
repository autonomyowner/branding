import React from 'react';
import {
  useCurrentFrame,
  interpolate,
  Easing,
  AbsoluteFill,
  spring,
  useVideoConfig,
} from 'remotion';
import { BRAND, FONTS } from '../styles/brand';

// Animated particle
const Particle: React.FC<{
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
  size: number;
}> = ({ startX, startY, endX, endY, delay, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, mass: 0.5 },
  });

  const x = interpolate(progress, [0, 1], [startX, endX]);
  const y = interpolate(progress, [0, 1], [startY, endY]);
  const opacity = interpolate(
    frame,
    [delay, delay + 10, delay + 50, delay + 60],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: '50%',
        background: BRAND.primary,
        opacity,
        boxShadow: `0 0 ${size * 2}px ${BRAND.primary}`,
      }}
    />
  );
};

export const Scene2Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entrance with spring
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.8 },
  });

  const logoOpacity = interpolate(
    frame,
    [0, 15],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // Tagline entrance
  const taglineOpacity = interpolate(
    frame,
    [25, 40],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const taglineY = interpolate(
    frame,
    [25, 40],
    [30, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
  );

  // Glow pulse
  const glowScale = interpolate(
    frame,
    [0, 30, 60, 90],
    [0.8, 1.2, 1, 1.1],
    { extrapolateRight: 'clamp' }
  );

  const glowOpacity = interpolate(
    frame,
    [0, 15, 60, 90],
    [0, 0.6, 0.4, 0.5],
    { extrapolateRight: 'clamp' }
  );

  // Exit animation
  const exitOpacity = interpolate(
    frame,
    [70, 90],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const exitScale = interpolate(
    frame,
    [70, 90],
    [1, 1.1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity: exitOpacity,
        transform: `scale(${exitScale})`,
      }}
    >
      {/* Central glow */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          background: `radial-gradient(circle, ${BRAND.primary}50 0%, transparent 60%)`,
          opacity: glowOpacity,
          transform: `scale(${glowScale})`,
          filter: 'blur(60px)',
        }}
      />

      {/* Particles converging to logo */}
      {[
        { startX: 200, startY: 200, endX: 920, endY: 500, delay: 5, size: 8 },
        { startX: 1700, startY: 250, endX: 1000, endY: 520, delay: 8, size: 6 },
        { startX: 300, startY: 800, endX: 900, endY: 560, delay: 10, size: 10 },
        { startX: 1600, startY: 850, endX: 1020, endY: 560, delay: 12, size: 7 },
        { startX: 960, startY: 100, endX: 960, endY: 480, delay: 15, size: 12 },
      ].map((particle, i) => (
        <Particle key={i} {...particle} />
      ))}

      {/* Logo container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 30,
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 28,
            background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 20px 60px ${BRAND.primary}40`,
          }}
        >
          <span
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: BRAND.text,
              letterSpacing: '-0.02em',
            }}
          >
            P
          </span>
        </div>

        {/* Logo text */}
        <h1
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: BRAND.text,
            margin: 0,
            letterSpacing: '-0.03em',
          }}
        >
          POSTA
          <span
            style={{
              background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            IFY
          </span>
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontSize: 32,
            fontWeight: 400,
            color: BRAND.textMuted,
            margin: 0,
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
          }}
        >
          AI-Powered Social Content in Seconds
        </p>
      </div>

      {/* Decorative rings */}
      <svg
        width="800"
        height="800"
        style={{
          position: 'absolute',
          opacity: interpolate(frame, [20, 35], [0, 0.3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}
      >
        <circle
          cx="400"
          cy="400"
          r="300"
          fill="none"
          stroke={BRAND.primary}
          strokeWidth="1"
          strokeDasharray="10 5"
          style={{
            transformOrigin: 'center',
            transform: `rotate(${frame * 0.5}deg)`,
          }}
        />
        <circle
          cx="400"
          cy="400"
          r="350"
          fill="none"
          stroke={BRAND.primary}
          strokeWidth="0.5"
          strokeDasharray="5 10"
          style={{
            transformOrigin: 'center',
            transform: `rotate(${-frame * 0.3}deg)`,
          }}
        />
      </svg>
    </AbsoluteFill>
  );
};
