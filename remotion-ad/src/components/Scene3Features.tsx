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

// Mock browser window component
const BrowserWindow: React.FC<{
  children: React.ReactNode;
  opacity: number;
  scale: number;
}> = ({ children, opacity, scale }) => {
  return (
    <div
      style={{
        width: 1400,
        height: 800,
        background: BRAND.surface,
        borderRadius: 16,
        border: `1px solid rgba(255,255,255,0.1)`,
        overflow: 'hidden',
        boxShadow: `0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)`,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {/* Browser bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: BRAND.card,
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FEBC2E' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28C840' }} />
        <div
          style={{
            marginLeft: 20,
            flex: 1,
            height: 32,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
          }}
        >
          <span style={{ fontSize: 13, color: BRAND.textMuted }}>app.postaify.com/dashboard</span>
        </div>
      </div>
      {/* Content */}
      <div style={{ padding: 0, height: 'calc(100% - 52px)' }}>
        {children}
      </div>
    </div>
  );
};

// Feature highlight badge
const FeatureBadge: React.FC<{
  text: string;
  x: number;
  y: number;
  delay: number;
}> = ({ text, x, y, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [delay, delay + 15],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, mass: 0.5 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        padding: '10px 18px',
        background: `linear-gradient(135deg, ${BRAND.primary}20 0%, ${BRAND.primaryLight}10 100%)`,
        border: `1px solid ${BRAND.primary}50`,
        borderRadius: 20,
        color: BRAND.primaryLight,
        fontSize: 14,
        fontWeight: 600,
        opacity,
        transform: `scale(${Math.max(0, scale)})`,
        whiteSpace: 'nowrap',
        boxShadow: `0 4px 20px ${BRAND.primary}30`,
      }}
    >
      {text}
    </div>
  );
};

// Dashboard sidebar
const Sidebar: React.FC<{ activeItem: number }> = ({ activeItem }) => {
  const items = ['Dashboard', 'Generate', 'Posts', 'Calendar', 'Settings'];

  return (
    <div
      style={{
        width: 220,
        height: '100%',
        background: BRAND.card,
        borderRight: '1px solid rgba(255,255,255,0.05)',
        padding: '20px 12px',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', marginBottom: 30 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 800, color: BRAND.text }}>P</span>
        </div>
        <span style={{ fontSize: 18, fontWeight: 700, color: BRAND.text }}>Postaify</span>
      </div>

      {/* Menu items */}
      {items.map((item, i) => (
        <div
          key={item}
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            marginBottom: 4,
            background: activeItem === i ? `${BRAND.primary}20` : 'transparent',
            color: activeItem === i ? BRAND.primary : BRAND.textMuted,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

// Content generation card
const GenerateCard: React.FC<{
  frame: number;
  isGenerating: boolean;
  generatedText: string;
}> = ({ frame, isGenerating, generatedText }) => {
  const typedChars = Math.floor(Math.max(0, frame - 60) * 1.5);
  const displayText = generatedText.slice(0, typedChars);

  return (
    <div
      style={{
        background: BRAND.card,
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.1)',
        padding: 24,
        width: '100%',
      }}
    >
      {/* Card header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: BRAND.text, margin: 0 }}>Generate Content</h3>
        <div
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            background: `${BRAND.primary}20`,
            color: BRAND.primary,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          AI Powered
        </div>
      </div>

      {/* Platform selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['Instagram', 'Twitter', 'LinkedIn'].map((platform, i) => (
          <div
            key={platform}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              background: i === 0 ? BRAND.primary : 'rgba(255,255,255,0.05)',
              color: i === 0 ? BRAND.text : BRAND.textMuted,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {platform}
          </div>
        ))}
      </div>

      {/* Generated content area */}
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 12,
          padding: 20,
          minHeight: 200,
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {isGenerating ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 20,
                height: 20,
                border: `2px solid ${BRAND.primary}`,
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <span style={{ color: BRAND.textMuted, fontSize: 14 }}>Generating content...</span>
          </div>
        ) : (
          <p style={{ color: BRAND.text, fontSize: 15, lineHeight: 1.7, margin: 0 }}>
            {displayText}
            {typedChars < generatedText.length && (
              <span style={{ opacity: Math.floor(frame / 10) % 2 === 0 ? 1 : 0 }}>|</span>
            )}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button
          style={{
            flex: 1,
            padding: '12px 20px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent',
            color: BRAND.textMuted,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Regenerate
        </button>
        <button
          style={{
            flex: 1,
            padding: '12px 20px',
            borderRadius: 10,
            border: 'none',
            background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
            color: BRAND.text,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Schedule Post
        </button>
      </div>
    </div>
  );
};

// Stats card
const StatCard: React.FC<{
  label: string;
  value: string;
  change: string;
  delay: number;
}> = ({ label, value, change, delay }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [delay, delay + 20],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const y = interpolate(
    frame,
    [delay, delay + 20],
    [20, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
  );

  return (
    <div
      style={{
        background: BRAND.card,
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.1)',
        padding: 20,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <p style={{ color: BRAND.textMuted, fontSize: 13, margin: 0, marginBottom: 8 }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: BRAND.text }}>{value}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: BRAND.success }}>{change}</span>
      </div>
    </div>
  );
};

export const Scene3Features: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Browser entrance
  const browserOpacity = interpolate(
    frame,
    [0, 30],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  const browserScale = interpolate(
    frame,
    [0, 30],
    [0.9, 1],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
  );

  const isGenerating = frame >= 30 && frame < 60;

  const generatedText = `Ready to boost your Instagram engagement? Here's what top creators know:

Consistency beats perfection. Your audience craves authentic content that speaks to their journey.

Start with value. End with action.

What's the ONE thing holding you back from posting daily? Drop it below and let's solve it together.

#ContentCreation #SocialMediaTips #GrowthMindset`;

  // Exit animation
  const exitOpacity = interpolate(
    frame,
    [160, 180],
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
      <BrowserWindow opacity={browserOpacity} scale={browserScale}>
        <div style={{ display: 'flex', height: '100%' }}>
          <Sidebar activeItem={1} />

          {/* Main content */}
          <div style={{ flex: 1, padding: 30, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: BRAND.text, margin: 0 }}>
                Welcome back, Creator
              </h2>
              <p style={{ color: BRAND.textMuted, fontSize: 14, margin: '8px 0 0' }}>
                Your content is performing 23% better this week
              </p>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              <StatCard label="Posts This Month" value="47" change="+12%" delay={20} />
              <StatCard label="Total Engagement" value="12.4K" change="+34%" delay={25} />
              <StatCard label="Time Saved" value="18hrs" change="+8hrs" delay={30} />
            </div>

            {/* Generate card */}
            <GenerateCard frame={frame} isGenerating={isGenerating} generatedText={generatedText} />
          </div>
        </div>
      </BrowserWindow>

      {/* Feature badges */}
      <FeatureBadge text="Multiple Platforms" x={150} y={200} delay={40} />
      <FeatureBadge text="AI Content Styles" x={1550} y={280} delay={50} />
      <FeatureBadge text="Smart Scheduling" x={1500} y={700} delay={60} />
      <FeatureBadge text="Brand Voice" x={180} y={650} delay={70} />
    </AbsoluteFill>
  );
};
