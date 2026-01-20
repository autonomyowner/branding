import React from 'react';
import {
  useCurrentFrame,
  interpolate,
  Easing,
  AbsoluteFill,
} from 'remotion';
import { BRAND } from '../styles/brand';

// Floating stress element for image problems
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

// Broken image placeholder
const BrokenImagePlaceholder: React.FC<{
  size: number;
  delay: number;
  x: number;
  y: number;
}> = ({ size, delay, x, y }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [delay, delay + 15],
    [0, 0.6],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const shake = Math.sin(frame * 0.5) * 2;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: 'rgba(255,255,255,0.03)',
        border: '2px dashed rgba(239, 68, 68, 0.4)',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        transform: `translate(-50%, -50%) translateX(${shake}px)`,
      }}
    >
      <svg width={size * 0.3} height={size * 0.3} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="rgba(239, 68, 68, 0.5)" strokeWidth="1.5" />
        <path d="M3 16L8 11L12 15" stroke="rgba(239, 68, 68, 0.5)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14 13L17 10L21 14" stroke="rgba(239, 68, 68, 0.5)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8.5" cy="8.5" r="1.5" fill="rgba(239, 68, 68, 0.5)" />
        <path d="M4 4L20 20" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span style={{ color: 'rgba(239, 68, 68, 0.6)', fontSize: 12, marginTop: 8 }}>No image</span>
    </div>
  );
};

export const ImageScene1Hook: React.FC = () => {
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
          Need <span style={{ color: BRAND.error }}>unique images</span>
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
          for your social posts?
        </h1>
      </div>

      {/* Floating stress indicators */}
      <StressElement x={12} y={22} delay={20} text="Stock photos look generic" />
      <StressElement x={72} y={25} delay={25} text="Designers are expensive" />
      <StressElement x={8} y={68} delay={30} text="No design skills" />
      <StressElement x={68} y={72} delay={35} text="Inconsistent branding" />
      <StressElement x={38} y={82} delay={40} text="Hours searching for images" />

      {/* Broken image placeholders */}
      <BrokenImagePlaceholder size={100} delay={15} x={20} y={45} />
      <BrokenImagePlaceholder size={80} delay={22} x={80} y={48} />
      <BrokenImagePlaceholder size={60} delay={28} x={88} y={25} />

      {/* Dollar signs floating away - showing cost */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: interpolate(frame, [35, 50], [0, 0.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}
      >
        <div style={{ display: 'flex', gap: 20 }}>
          {['$49', '$99', '$199'].map((price, i) => (
            <div
              key={price}
              style={{
                padding: '8px 16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 8,
                color: BRAND.error,
                fontSize: 16,
                fontWeight: 600,
                transform: `translateY(${interpolate(frame, [35 + i * 5, 70], [0, -30], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
                opacity: interpolate(frame, [35 + i * 5, 50, 65, 75], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
              }}
            >
              {price}/mo
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
