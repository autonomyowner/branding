import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from 'remotion';
import { BRAND, TIKTOK_TIMING } from '../styles/brand';

const PRODUCT_NAME = "POSTAIFY";
const TAGLINE = "AI-Powered Content Automation";

export const TikTokSolution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const duration = TIKTOK_TIMING.sceneSolution;

  // Logo circle animation
  const logoScale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 8, mass: 0.4, stiffness: 100 },
  });

  const logoRotate = interpolate(frame, [0, 20], [-180, 0], {
    extrapolateRight: 'clamp',
  });

  // Brand name animation
  const nameOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const nameY = spring({
    frame: frame - 15,
    fps,
    from: 40,
    to: 0,
    config: { damping: 12, mass: 0.5 },
  });

  // Tagline animation
  const taglineOpacity = interpolate(frame, [30, 45], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Glow ring animation
  const ringScale = spring({
    frame: frame - 5,
    fps,
    from: 0.5,
    to: 1,
    config: { damping: 15, mass: 0.8 },
  });

  const ringOpacity = interpolate(frame, [5, 20], [0, 0.5], {
    extrapolateRight: 'clamp',
  });

  // Particles
  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const delay = i * 2;
    const distance = interpolate(
      frame,
      [delay, delay + 30],
      [0, 200],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const particleOpacity = interpolate(
      frame,
      [delay, delay + 10, delay + 25, delay + 30],
      [0, 1, 1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      opacity: particleOpacity,
    };
  });

  // Exit animation
  const exitOpacity = interpolate(
    frame,
    [duration - 12, duration],
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
      {/* Glow ring */}
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          border: `3px solid ${BRAND.primary}`,
          opacity: ringOpacity,
          transform: `scale(${ringScale})`,
          boxShadow: `0 0 80px ${BRAND.primary}40, inset 0 0 60px ${BRAND.primary}20`,
        }}
      />

      {/* Particles */}
      {particles.map((particle, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: BRAND.primary,
            transform: `translate(${particle.x}px, ${particle.y - 80}px)`,
            opacity: particle.opacity,
            boxShadow: `0 0 20px ${BRAND.primary}`,
          }}
        />
      ))}

      {/* Logo circle */}
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${logoScale}) rotate(${logoRotate}deg)`,
          boxShadow: `0 20px 60px ${BRAND.primary}50`,
          marginBottom: 40,
        }}
      >
        <span
          style={{
            fontSize: 100,
            fontWeight: 800,
            color: BRAND.text,
            transform: `rotate(${-logoRotate}deg)`,
          }}
        >
          P
        </span>
      </div>

      {/* Brand name */}
      <div
        style={{
          fontSize: 80,
          fontWeight: 800,
          color: BRAND.text,
          letterSpacing: 8,
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
          fontSize: 32,
          fontWeight: 500,
          color: BRAND.textMuted,
          opacity: taglineOpacity,
          marginTop: 20,
        }}
      >
        {TAGLINE}
      </div>
    </AbsoluteFill>
  );
};
