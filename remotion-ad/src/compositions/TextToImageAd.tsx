import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
  AbsoluteFill,
} from 'remotion';
import { BRAND, FONTS } from '../styles/brand';
import { ImageScene1Hook } from '../components/ImageScene1Hook';
import { ImageScene2Solution } from '../components/ImageScene2Solution';
import { ImageScene3Features } from '../components/ImageScene3Features';
import { ImageScene4CTA } from '../components/ImageScene4CTA';

export const TextToImageAd: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Global background with animated glow
  const glowOpacity = interpolate(
    frame,
    [0, 60, 120, 180],
    [0.2, 0.4, 0.3, 0.5],
    { extrapolateRight: 'clamp' }
  );

  const glowX = interpolate(
    frame,
    [0, 450],
    [30, 70],
    { extrapolateRight: 'clamp' }
  );

  const glowY = interpolate(
    frame,
    [0, 450],
    [40, 60],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND.background,
        fontFamily: FONTS.sans,
        overflow: 'hidden',
      }}
    >
      {/* Animated background glow */}
      <div
        style={{
          position: 'absolute',
          width: 800,
          height: 800,
          left: `${glowX}%`,
          top: `${glowY}%`,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${BRAND.primary}30 0%, transparent 60%)`,
          opacity: glowOpacity,
          filter: 'blur(100px)',
        }}
      />

      {/* Secondary glow */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          left: `${100 - glowX}%`,
          top: `${100 - glowY}%`,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${BRAND.primaryLight}20 0%, transparent 60%)`,
          opacity: glowOpacity * 0.7,
          filter: 'blur(80px)',
        }}
      />

      {/* Accent glow for image theme */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          left: `${50 + Math.sin(frame * 0.02) * 20}%`,
          top: `${30 + Math.cos(frame * 0.02) * 15}%`,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 60%)`,
          opacity: glowOpacity * 0.5,
          filter: 'blur(60px)',
        }}
      />

      {/* Grid pattern overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Scene 1: Hook - Problem Statement (0-90 frames / 0-3s) */}
      <Sequence from={0} durationInFrames={90}>
        <ImageScene1Hook />
      </Sequence>

      {/* Scene 2: Solution Reveal - POSTAIFY brand + Text to Image (90-180 frames / 3-6s) */}
      <Sequence from={90} durationInFrames={90}>
        <ImageScene2Solution />
      </Sequence>

      {/* Scene 3: Feature Showcase - Image Generation UI (180-360 frames / 6-12s) */}
      <Sequence from={180} durationInFrames={180}>
        <ImageScene3Features />
      </Sequence>

      {/* Scene 4: Call to Action (360-450 frames / 12-15s) */}
      <Sequence from={360} durationInFrames={90}>
        <ImageScene4CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
