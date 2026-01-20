import React from 'react';
import {
  useCurrentFrame,
  interpolate,
  Easing,
  AbsoluteFill,
} from 'remotion';
import { BRAND, FONTS } from '../styles/brand';

// Animated typing text effect
const TypedText: React.FC<{
  text: string;
  startFrame: number;
  charsPerFrame?: number;
  style?: React.CSSProperties;
}> = ({ text, startFrame, charsPerFrame = 0.8, style }) => {
  const frame = useCurrentFrame();
  const adjustedFrame = Math.max(0, frame - startFrame);
  const charCount = Math.floor(adjustedFrame * charsPerFrame);
  const displayText = text.slice(0, Math.min(charCount, text.length));
  const isComplete = charCount >= text.length;
  const cursorVisible = !isComplete || Math.floor(frame / 15) % 2 === 0;

  return (
    <span style={style}>
      {displayText}
      <span style={{ opacity: cursorVisible ? 1 : 0, fontWeight: 300 }}>|</span>
    </span>
  );
};

// Floating stress element
const StressElement: React.FC<{
  x: number;
  y: number;
  delay: number;
  text: string;
}> = ({ x, y, delay, text }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [delay, delay + 15, delay + 60, delay + 75],
    [0, 0.8, 0.8, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const translateY = interpolate(
    frame,
    [delay, delay + 60],
    [20, -10],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
  );

  const scale = interpolate(
    frame,
    [delay, delay + 15],
    [0.8, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.5)) }
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
        padding: '12px 20px',
        background: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 12,
        color: '#EF4444',
        fontSize: 18,
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();

  // Main headline animation
  const headlineOpacity = interpolate(
    frame,
    [0, 20],
    [0, 1],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
  );

  const headlineY = interpolate(
    frame,
    [0, 20],
    [40, 0],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
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
    [1, 0.95],
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
      {/* Main problem statement */}
      <div
        style={{
          textAlign: 'center',
          opacity: headlineOpacity,
          transform: `translateY(${headlineY}px)`,
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: BRAND.text,
            margin: 0,
            marginBottom: 20,
            letterSpacing: '-0.02em',
          }}
        >
          Tired of spending <span style={{ color: BRAND.error }}>hours</span>
        </h1>
        <h1
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: BRAND.text,
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          on social media content?
        </h1>
      </div>

      {/* Floating stress indicators */}
      <StressElement x={15} y={25} delay={20} text="8+ hours/week" />
      <StressElement x={75} y={30} delay={25} text="Writer's block" />
      <StressElement x={10} y={65} delay={30} text="Inconsistent posting" />
      <StressElement x={70} y={70} delay={35} text="Low engagement" />
      <StressElement x={40} y={80} delay={40} text="Multiple platforms" />

      {/* Clock animation showing time waste */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          style={{
            opacity: interpolate(frame, [25, 40], [0, 0.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}
        >
          <circle
            cx="60"
            cy="60"
            r="55"
            fill="none"
            stroke="rgba(239, 68, 68, 0.3)"
            strokeWidth="2"
            strokeDasharray="8 4"
          />
          <line
            x1="60"
            y1="60"
            x2="60"
            y2="25"
            stroke="#EF4444"
            strokeWidth="3"
            strokeLinecap="round"
            style={{
              transformOrigin: '60px 60px',
              transform: `rotate(${frame * 6}deg)`,
            }}
          />
          <line
            x1="60"
            y1="60"
            x2="85"
            y2="60"
            stroke="#EF4444"
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              transformOrigin: '60px 60px',
              transform: `rotate(${frame * 0.5}deg)`,
            }}
          />
          <circle cx="60" cy="60" r="5" fill="#EF4444" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
