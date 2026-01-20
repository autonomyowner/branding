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

const HEADLINE = 'Automate Your';
const HEADLINE_HIGHLIGHT = 'Social Presence';

const BENEFITS = [
  { text: 'Telegram delivery', delay: 40 },
  { text: 'AI post generation', delay: 52 },
  { text: 'Smart scheduling', delay: 64 },
];

const CTA_TEXT = 'Start Free Today';

export const ProCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = TIKTOK_TIMING.sceneCTA;

  // ===== LOGO =====
  const logoProgress = spring({
    frame,
    fps,
    config: SPRINGS.bouncy,
  });

  const logoScale = interpolate(Math.max(0, logoProgress), [0, 1], [0.5, 1]);
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Logo glow pulse
  const logoPulse = interpolate(Math.sin(frame * 0.1), [-1, 1], [25, 45]);

  // ===== HEADLINE =====
  const headlineStart = 15;
  const headlineProgress = spring({
    frame: frame - headlineStart,
    fps,
    config: SPRINGS.smooth,
  });

  const headlineOpacity = interpolate(frame, [headlineStart, headlineStart + 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const headlineY = interpolate(Math.max(0, headlineProgress), [0, 1], [40, 0]);

  // ===== CTA BUTTON =====
  const ctaStart = 90;
  const ctaProgress = spring({
    frame: frame - ctaStart,
    fps,
    config: SPRINGS.bouncy,
  });

  const ctaScale = interpolate(Math.max(0, ctaProgress), [0, 1], [0.8, 1]);
  const ctaOpacity = interpolate(frame, [ctaStart, ctaStart + 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // CTA glow pulse
  const ctaPulse = interpolate(Math.sin(frame * 0.12), [-1, 1], [0.6, 1]);

  // ===== FOOTER =====
  const footerOpacity = interpolate(frame, [130, 150], [0, 1], {
    easing: EASING.smooth,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <Camera
      zoom={{ from: 1, to: 1.06, start: 0, end: duration }}
      roll={{ from: 0.5, to: -0.5, start: 0, end: duration }}
    >
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: 50,
        }}
      >
        {/* Background particles */}
        <Particles count={25} color={BRAND.primary} direction="up" />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 35,
              opacity: logoOpacity,
              transform: `scale(${logoScale})`,
              boxShadow: `
                0 0 ${logoPulse}px ${BRAND.primary}80,
                0 0 ${logoPulse * 2}px ${BRAND.primary}40,
                0 20px 50px rgba(0,0,0,0.4)
              `,
            }}
          >
            <span style={{ fontSize: 62, fontWeight: 800, color: '#fff' }}>P</span>
          </div>

          {/* Headline */}
          <div
            style={{
              textAlign: 'center',
              opacity: headlineOpacity,
              transform: `translateY(${headlineY}px)`,
              marginBottom: 35,
            }}
          >
            <div
              style={{
                fontSize: 42,
                fontWeight: 600,
                color: BRAND.text,
                marginBottom: 8,
              }}
            >
              {HEADLINE}
            </div>
            <div
              style={{
                fontSize: 56,
                fontWeight: 800,
                background: `linear-gradient(135deg, ${BRAND.text} 0%, ${BRAND.primaryLight} 50%, ${BRAND.primary} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.1,
              }}
            >
              {HEADLINE_HIGHLIGHT}
            </div>
          </div>

          {/* Benefits */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              marginBottom: 45,
              alignItems: 'center',
            }}
          >
            {BENEFITS.map((benefit, i) => {
              const benefitProgress = spring({
                frame: frame - benefit.delay,
                fps,
                config: SPRINGS.snappy,
              });

              const benefitOpacity = interpolate(
                frame,
                [benefit.delay, benefit.delay + 18],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              );

              const benefitX = interpolate(Math.max(0, benefitProgress), [0, 1], [-30, 0]);
              const benefitScale = interpolate(Math.max(0, benefitProgress), [0, 1], [0.9, 1]);

              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    opacity: benefitOpacity,
                    transform: `translateX(${benefitX}px) scale(${benefitScale})`,
                  }}
                >
                  {/* Checkmark */}
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: `${BRAND.success}20`,
                      border: `2px solid ${BRAND.success}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 0 15px ${BRAND.success}30`,
                    }}
                  >
                    <span style={{ color: BRAND.success, fontSize: 16, fontWeight: 700 }}>
                      ✓
                    </span>
                  </div>
                  <span style={{ fontSize: 24, fontWeight: 500, color: BRAND.text }}>
                    {benefit.text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* CTA Button */}
          <div
            style={{
              background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
              padding: '24px 60px',
              borderRadius: 50,
              opacity: ctaOpacity,
              transform: `scale(${ctaScale})`,
              boxShadow: `
                0 0 ${40 * ctaPulse}px ${BRAND.primary}${Math.round(ctaPulse * 80).toString(16).padStart(2, '0')},
                0 0 ${80 * ctaPulse}px ${BRAND.primary}40,
                0 20px 40px rgba(0,0,0,0.3)
              `,
            }}
          >
            <span style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>{CTA_TEXT}</span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 70,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            opacity: footerOpacity,
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `${BRAND.primary}25`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 800, color: BRAND.primary }}>P</span>
          </div>
          <span style={{ fontSize: 22, fontWeight: 600, color: BRAND.textMuted }}>
            POSTAIFY
          </span>
          <span style={{ color: BRAND.textDim, fontSize: 18 }}>•</span>
          <span style={{ fontSize: 18, color: BRAND.textDim }}>postaify.com</span>
        </div>

        {/* Main glow */}
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            background: `radial-gradient(circle, ${BRAND.primary}30 0%, transparent 60%)`,
            filter: 'blur(100px)',
            opacity: 0.8,
          }}
        />
      </AbsoluteFill>
    </Camera>
  );
};
