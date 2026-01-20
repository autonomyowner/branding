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

// Animated check item
const CheckItem: React.FC<{
  text: string;
  delay: number;
}> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [delay, delay + 15],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const x = interpolate(
    frame,
    [delay, delay + 15],
    [-20, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
  );

  const checkScale = spring({
    frame: frame - delay - 5,
    fps,
    config: { damping: 10, mass: 0.3 },
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        opacity,
        transform: `translateX(${x}px)`,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: `${BRAND.success}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${Math.max(0, checkScale)})`,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M2 7L5.5 10.5L12 3.5"
            stroke={BRAND.success}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span style={{ fontSize: 20, color: BRAND.textMuted, fontWeight: 400 }}>{text}</span>
    </div>
  );
};

// Animated CTA button
const CTAButton: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [delay, delay + 20],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, mass: 0.6 },
  });

  // Glow pulse
  const glowOpacity = interpolate(
    frame,
    [delay + 30, delay + 45, delay + 60, delay + 75],
    [0.3, 0.6, 0.3, 0.6],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'relative',
        opacity,
        transform: `scale(${Math.max(0, scale)})`,
      }}
    >
      {/* Button glow */}
      <div
        style={{
          position: 'absolute',
          inset: -20,
          background: `radial-gradient(ellipse, ${BRAND.primary}40 0%, transparent 70%)`,
          opacity: glowOpacity,
          filter: 'blur(30px)',
        }}
      />

      {/* Button */}
      <div
        style={{
          position: 'relative',
          padding: '20px 60px',
          background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: `0 10px 40px ${BRAND.primary}50`,
        }}
      >
        <span style={{ fontSize: 22, fontWeight: 600, color: BRAND.text }}>
          Start Free Today
        </span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12H19M19 12L12 5M19 12L12 19"
            stroke={BRAND.text}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

export const Scene4CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Main headline entrance
  const headlineOpacity = interpolate(
    frame,
    [0, 20],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  const headlineY = interpolate(
    frame,
    [0, 20],
    [40, 0],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
  );

  // Logo scale pulse at the end
  const logoPulse = interpolate(
    frame,
    [60, 70, 80, 90],
    [1, 1.05, 1, 1.02],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, ${BRAND.primary}15 0%, transparent 60%)`,
        }}
      />

      {/* Content container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: 900,
        }}
      >
        {/* Headline */}
        <div
          style={{
            opacity: headlineOpacity,
            transform: `translateY(${headlineY}px)`,
            marginBottom: 40,
          }}
        >
          <h1
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: BRAND.text,
              margin: 0,
              marginBottom: 16,
              letterSpacing: '-0.02em',
            }}
          >
            Create Content{' '}
            <span
              style={{
                background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              10x Faster
            </span>
          </h1>
          <p
            style={{
              fontSize: 24,
              color: BRAND.textMuted,
              margin: 0,
              fontWeight: 400,
            }}
          >
            Join thousands of creators automating their social media
          </p>
        </div>

        {/* Check items */}
        <div style={{ marginBottom: 40, textAlign: 'left' }}>
          <CheckItem text="No credit card required" delay={15} />
          <CheckItem text="2 brands, 20 posts/month free" delay={20} />
          <CheckItem text="Cancel anytime" delay={25} />
        </div>

        {/* CTA Button */}
        <CTAButton delay={35} />

        {/* Logo at bottom */}
        <div
          style={{
            marginTop: 60,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            opacity: interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            transform: `scale(${logoPulse})`,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 800, color: BRAND.text }}>P</span>
          </div>
          <span style={{ fontSize: 24, fontWeight: 700, color: BRAND.text }}>
            POSTA
            <span style={{ color: BRAND.primary }}>IFY</span>
          </span>
        </div>

        {/* Website URL */}
        <p
          style={{
            marginTop: 16,
            fontSize: 16,
            color: BRAND.textMuted,
            opacity: interpolate(frame, [60, 75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}
        >
          postaify.com
        </p>
      </div>

      {/* Decorative particles */}
      {[
        { x: '10%', y: '20%', size: 6, delay: 10 },
        { x: '90%', y: '25%', size: 8, delay: 15 },
        { x: '15%', y: '75%', size: 5, delay: 20 },
        { x: '85%', y: '80%', size: 7, delay: 25 },
        { x: '5%', y: '50%', size: 4, delay: 30 },
        { x: '95%', y: '55%', size: 6, delay: 35 },
      ].map((particle, i) => {
        const opacity = interpolate(
          frame,
          [particle.delay, particle.delay + 15],
          [0, 0.5],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        const y = interpolate(
          frame,
          [particle.delay, particle.delay + 60],
          [0, -20],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              background: BRAND.primary,
              opacity,
              transform: `translateY(${y}px)`,
              boxShadow: `0 0 ${particle.size * 3}px ${BRAND.primary}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
