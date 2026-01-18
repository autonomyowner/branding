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

// Particle component for magical effect
const Particle: React.FC<{
  delay: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
}> = ({ delay, startX, startY, endX, endY, size }) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [delay, delay + 40],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
  );

  const x = startX + (endX - startX) * progress;
  const y = startY + (endY - startY) * progress;
  const opacity = interpolate(progress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = interpolate(progress, [0, 0.5, 1], [0, 1.2, 0.8]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${BRAND.primaryLight} 0%, ${BRAND.primary} 100%)`,
        opacity,
        transform: `scale(${scale})`,
        boxShadow: `0 0 ${size * 2}px ${BRAND.primary}`,
      }}
    />
  );
};

// Image reveal animation
const ImageReveal: React.FC<{
  delay: number;
  x: number;
  y: number;
  width: number;
  height: number;
  imageColors: string[];
}> = ({ delay, x, y, width, height, imageColors }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const revealProgress = interpolate(
    frame,
    [delay, delay + 25],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
  );

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, mass: 0.8 },
  });

  // Create abstract "generated image" pattern
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        borderRadius: 12,
        overflow: 'hidden',
        opacity: revealProgress,
        transform: `scale(${Math.max(0, Math.min(1, scale))})`,
        boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)`,
      }}
    >
      {/* Abstract gradient as "generated image" */}
      <div
        style={{
          width: '100%',
          height: '100%',
          background: `linear-gradient(135deg, ${imageColors[0]} 0%, ${imageColors[1]} 50%, ${imageColors[2]} 100%)`,
          position: 'relative',
        }}
      >
        {/* Abstract shapes to simulate image content */}
        <div
          style={{
            position: 'absolute',
            width: '60%',
            height: '40%',
            left: '20%',
            top: '30%',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 100,
            filter: 'blur(20px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '30%',
            height: '30%',
            right: '10%',
            top: '10%',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '50%',
            filter: 'blur(15px)',
          }}
        />
      </div>
      {/* Shimmer effect */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`,
          transform: `translateX(${interpolate(frame, [delay, delay + 30], [-100, 200], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}%)`,
        }}
      />
    </div>
  );
};

export const ImageScene2Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const centerX = width / 2;
  const centerY = height / 2;

  // Logo reveal animation
  const logoScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12, mass: 0.5 },
  });

  const logoOpacity = interpolate(
    frame,
    [10, 25],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Tagline animation
  const taglineOpacity = interpolate(
    frame,
    [30, 45],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  const taglineY = interpolate(
    frame,
    [30, 45],
    [20, 0],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
  );

  // "Text to Image" feature highlight
  const featureOpacity = interpolate(
    frame,
    [50, 65],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  const featureScale = spring({
    frame: frame - 50,
    fps,
    config: { damping: 15, mass: 0.6 },
  });

  // Exit animation
  const exitOpacity = interpolate(
    frame,
    [70, 90],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Generate particle positions
  const particles = [];
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const radius = 300 + Math.random() * 200;
    particles.push({
      startX: centerX + Math.cos(angle) * radius,
      startY: centerY + Math.sin(angle) * radius,
      endX: centerX + Math.cos(angle) * 80,
      endY: centerY + Math.sin(angle) * 80,
      delay: i * 2,
      size: 6 + Math.random() * 8,
    });
  }

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity: exitOpacity,
      }}
    >
      {/* Particles converging */}
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      {/* Main logo */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `scale(${Math.max(0, logoScale)})`,
          opacity: logoOpacity,
        }}
      >
        {/* Logo box */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 28,
            background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 20px 60px ${BRAND.primary}40, 0 0 100px ${BRAND.primary}30`,
            marginBottom: 30,
          }}
        >
          <span
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: BRAND.text,
              letterSpacing: '-0.02em',
            }}
          >
            P
          </span>
        </div>

        {/* Product name */}
        <h1
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: BRAND.text,
            margin: 0,
            letterSpacing: '0.1em',
          }}
        >
          POSTAIFY
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontSize: 24,
            color: BRAND.textMuted,
            margin: 0,
            marginTop: 16,
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
          }}
        >
          AI-Powered Content Creation
        </p>

        {/* Text to Image feature badge */}
        <div
          style={{
            marginTop: 40,
            padding: '16px 32px',
            background: `linear-gradient(135deg, ${BRAND.primary}30 0%, ${BRAND.primaryLight}20 100%)`,
            border: `2px solid ${BRAND.primary}`,
            borderRadius: 50,
            opacity: featureOpacity,
            transform: `scale(${Math.max(0, featureScale)})`,
            boxShadow: `0 0 40px ${BRAND.primary}40`,
          }}
        >
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              background: `linear-gradient(90deg, ${BRAND.primaryLight} 0%, ${BRAND.text} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Text to Image
          </span>
        </div>
      </div>

      {/* Small preview images appearing around */}
      <ImageReveal
        delay={55}
        x={150}
        y={200}
        width={180}
        height={180}
        imageColors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
      />
      <ImageReveal
        delay={60}
        x={1590}
        y={250}
        width={160}
        height={160}
        imageColors={['#FACC15', '#EC4899', '#EAB308']}
      />
      <ImageReveal
        delay={65}
        x={200}
        y={680}
        width={140}
        height={140}
        imageColors={['#34D399', '#3B82F6', '#EAB308']}
      />
      <ImageReveal
        delay={70}
        x={1550}
        y={620}
        width={170}
        height={170}
        imageColors={['#F59E0B', '#EF4444', '#EC4899']}
      />
    </AbsoluteFill>
  );
};
