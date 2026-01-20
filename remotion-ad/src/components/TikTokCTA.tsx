import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from 'remotion';
import { BRAND, TIKTOK_TIMING } from '../styles/brand';

const HEADLINE = "Automate Your";
const HEADLINE_HIGHLIGHT = "Social Presence";
const CHECK_ITEMS = [
  { text: "Telegram delivery", delay: 25 },
  { text: "AI post generation", delay: 35 },
  { text: "Smart scheduling", delay: 45 },
];
const CTA_TEXT = "Start Free Today";
const PRODUCT_NAME = "POSTAIFY";

export const TikTokCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const duration = TIKTOK_TIMING.sceneCTA;

  // Logo animation
  const logoScale = spring({
    frame,
    fps,
    from: 0.5,
    to: 1,
    config: { damping: 10, mass: 0.5, stiffness: 120 },
  });

  const logoOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Headline animation
  const headlineOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const headlineY = spring({
    frame: frame - 10,
    fps,
    from: 30,
    to: 0,
    config: { damping: 12, mass: 0.5 },
  });

  // CTA button animation
  const ctaScale = spring({
    frame: frame - 55,
    fps,
    from: 0.8,
    to: 1,
    config: { damping: 8, mass: 0.4, stiffness: 100 },
  });

  const ctaOpacity = interpolate(frame, [55, 70], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Button glow pulse
  const glowPulse = Math.sin(frame * 0.15) * 0.3 + 0.7;

  // Footer animation
  const footerOpacity = interpolate(frame, [75, 90], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: 60,
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 40,
          opacity: logoOpacity,
          transform: `scale(${Math.max(0.5, logoScale)})`,
          boxShadow: `0 20px 60px ${BRAND.primary}50`,
        }}
      >
        <span style={{ fontSize: 70, fontWeight: 800, color: '#fff' }}>P</span>
      </div>

      {/* Headline */}
      <div
        style={{
          textAlign: 'center',
          opacity: headlineOpacity,
          transform: `translateY(${headlineY}px)`,
          marginBottom: 40,
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 600, color: BRAND.text }}>
          {HEADLINE}
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            background: `linear-gradient(135deg, ${BRAND.text} 0%, ${BRAND.primaryLight} 50%, ${BRAND.primary} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {HEADLINE_HIGHLIGHT}
        </div>
      </div>

      {/* Check items */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          marginBottom: 50,
          alignItems: 'center',
        }}
      >
        {CHECK_ITEMS.map((item, index) => {
          const itemOpacity = interpolate(
            frame,
            [item.delay, item.delay + 12],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          const itemX = spring({
            frame: frame - item.delay,
            fps,
            from: -30,
            to: 0,
            config: { damping: 14, mass: 0.5 },
          });

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                opacity: itemOpacity,
                transform: `translateX(${itemX}px)`,
              }}
            >
              {/* Checkmark */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: `${BRAND.success}20`,
                  border: `2px solid ${BRAND.success}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: BRAND.success, fontSize: 18, fontWeight: 700 }}>
                  ✓
                </span>
              </div>
              <span style={{ fontSize: 28, fontWeight: 500, color: BRAND.text }}>
                {item.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* CTA Button */}
      <div
        style={{
          background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
          padding: '28px 70px',
          borderRadius: 50,
          opacity: ctaOpacity,
          transform: `scale(${Math.max(0.8, ctaScale)})`,
          boxShadow: `0 20px 50px ${BRAND.primary}${Math.round(glowPulse * 80).toString(16)}, 0 0 ${60 * glowPulse}px ${BRAND.primary}60`,
        }}
      >
        <span style={{ fontSize: 36, fontWeight: 700, color: '#fff' }}>
          {CTA_TEXT}
        </span>
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          opacity: footerOpacity,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `${BRAND.primary}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 24, fontWeight: 800, color: BRAND.primary }}>
            P
          </span>
        </div>
        <span style={{ fontSize: 24, fontWeight: 600, color: BRAND.textMuted }}>
          {PRODUCT_NAME}
        </span>
        <span style={{ color: BRAND.textDim, fontSize: 20 }}>•</span>
        <span style={{ fontSize: 20, color: BRAND.textDim }}>
          postaify.com
        </span>
      </div>
    </AbsoluteFill>
  );
};
