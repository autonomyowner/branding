import React from 'react';
import {
  useCurrentFrame,
  interpolate,
  Easing,
  AbsoluteFill,
  spring,
  useVideoConfig,
} from 'remotion';
import { BRAND } from '../styles/brand';

// Benefit check item
const BenefitItem: React.FC<{
  text: string;
  delay: number;
}> = ({ text, delay }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [delay, delay + 15],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const x = interpolate(
    frame,
    [delay, delay + 15],
    [-30, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
  );

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
      {/* Check circle */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: `${BRAND.success}20`,
          border: `2px solid ${BRAND.success}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12L10 17L19 8"
            stroke={BRAND.success}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span style={{ color: BRAND.text, fontSize: 20, fontWeight: 500 }}>
        {text}
      </span>
    </div>
  );
};

// Floating generated image thumbnail
const FloatingImage: React.FC<{
  x: number;
  y: number;
  size: number;
  delay: number;
  colors: string[];
  rotation: number;
}> = ({ x, y, size, delay, colors, rotation }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [delay, delay + 20],
    [0, 0.8],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, mass: 0.6 },
  });

  const float = Math.sin((frame + delay) * 0.05) * 8;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: 12,
        overflow: 'hidden',
        opacity,
        transform: `translate(-50%, -50%) scale(${Math.max(0, scale)}) rotate(${rotation}deg) translateY(${float}px)`,
        boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)`,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          background: `linear-gradient(${135 + rotation}deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`,
        }}
      />
    </div>
  );
};

// Pulsing CTA button
const CTAButton: React.FC<{
  delay: number;
}> = ({ delay }) => {
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
    config: { damping: 10, mass: 0.5 },
  });

  const pulseScale = 1 + Math.sin(frame * 0.1) * 0.02;
  const glowIntensity = 40 + Math.sin(frame * 0.15) * 20;

  return (
    <div
      style={{
        opacity,
        transform: `scale(${Math.max(0, scale) * pulseScale})`,
      }}
    >
      <button
        style={{
          padding: '20px 60px',
          fontSize: 24,
          fontWeight: 700,
          color: BRAND.text,
          background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
          border: 'none',
          borderRadius: 16,
          cursor: 'pointer',
          boxShadow: `0 8px ${glowIntensity}px ${BRAND.primary}50`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <span style={{ position: 'relative', zIndex: 1 }}>
          Start Creating Free
        </span>
        {/* Shimmer effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '200%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
            transform: `translateX(${interpolate(frame % 60, [0, 60], [0, 100])}%)`,
          }}
        />
      </button>
    </div>
  );
};

export const ImageScene4CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Main headline animation
  const headlineOpacity = interpolate(
    frame,
    [0, 20],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  const headlineY = interpolate(
    frame,
    [0, 20],
    [50, 0],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
  );

  const headlineScale = spring({
    frame,
    fps,
    config: { damping: 15, mass: 0.8 },
  });

  // Footer animation
  const footerOpacity = interpolate(
    frame,
    [60, 75],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Floating generated images in background */}
      <FloatingImage x={10} y={25} size={120} delay={5} colors={['#FF6B6B', '#4ECDC4', '#45B7D1']} rotation={-8} />
      <FloatingImage x={88} y={20} size={100} delay={8} colors={['#FACC15', '#EC4899', '#EAB308']} rotation={5} />
      <FloatingImage x={5} y={70} size={90} delay={12} colors={['#34D399', '#3B82F6', '#EAB308']} rotation={-5} />
      <FloatingImage x={92} y={75} size={110} delay={10} colors={['#F59E0B', '#EF4444', '#EC4899']} rotation={8} />
      <FloatingImage x={15} y={48} size={70} delay={15} colors={['#06B6D4', '#EAB308', '#EC4899']} rotation={-12} />
      <FloatingImage x={85} y={50} size={80} delay={18} colors={['#F472B6', '#FB923C', '#FBBF24']} rotation={10} />

      {/* Main content */}
      <div
        style={{
          textAlign: 'center',
          maxWidth: 900,
          zIndex: 10,
        }}
      >
        {/* Headline */}
        <div
          style={{
            opacity: headlineOpacity,
            transform: `translateY(${headlineY}px) scale(${Math.max(0, headlineScale)})`,
          }}
        >
          <h1
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: BRAND.text,
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Create Stunning Images
          </h1>
          <h1
            style={{
              fontSize: 72,
              fontWeight: 800,
              background: `linear-gradient(90deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
              marginTop: 8,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            in Seconds
          </h1>
        </div>

        {/* Benefits */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 50,
          }}
        >
          <BenefitItem text="No design skills required" delay={15} />
          <BenefitItem text="Multiple AI models available" delay={20} />
          <BenefitItem text="Commercial use included" delay={25} />
        </div>

        {/* CTA Button */}
        <div style={{ marginTop: 50 }}>
          <CTAButton delay={35} />
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 40,
            opacity: footerOpacity,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            {/* Logo */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 20, fontWeight: 800, color: BRAND.text }}>P</span>
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: BRAND.text, letterSpacing: '0.05em' }}>
              POSTAIFY
            </span>
            <span style={{ color: BRAND.textMuted, fontSize: 16 }}>
              postaify.com
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
