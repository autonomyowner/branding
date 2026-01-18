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
          <span style={{ fontSize: 13, color: BRAND.textMuted }}>app.postaify.com/generate-image</span>
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

// Style preset button
const StyleButton: React.FC<{
  label: string;
  isActive: boolean;
  delay: number;
}> = ({ label, isActive, delay }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [delay, delay + 10],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        padding: '10px 16px',
        borderRadius: 10,
        background: isActive ? BRAND.primary : 'rgba(255,255,255,0.05)',
        border: `1px solid ${isActive ? BRAND.primary : 'rgba(255,255,255,0.1)'}`,
        color: isActive ? BRAND.text : BRAND.textMuted,
        fontSize: 13,
        fontWeight: 500,
        opacity,
        transition: 'all 0.3s ease',
      }}
    >
      {label}
    </div>
  );
};

// Aspect ratio selector
const AspectRatioButton: React.FC<{
  ratio: string;
  isActive: boolean;
  delay: number;
}> = ({ ratio, isActive, delay }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [delay, delay + 10],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        padding: '8px 14px',
        borderRadius: 8,
        background: isActive ? BRAND.primary : 'rgba(255,255,255,0.05)',
        color: isActive ? BRAND.text : BRAND.textMuted,
        fontSize: 12,
        fontWeight: 600,
        opacity,
      }}
    >
      {ratio}
    </div>
  );
};

// Generated image preview with reveal animation
const GeneratedImage: React.FC<{
  startFrame: number;
}> = ({ startFrame }) => {
  const frame = useCurrentFrame();

  // Loading progress
  const loadingProgress = interpolate(
    frame,
    [startFrame, startFrame + 40],
    [0, 100],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const isLoading = frame >= startFrame && frame < startFrame + 40;
  const isRevealed = frame >= startFrame + 40;

  // Image reveal effect
  const revealProgress = interpolate(
    frame,
    [startFrame + 40, startFrame + 55],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
  );

  const imageScale = interpolate(
    frame,
    [startFrame + 40, startFrame + 60],
    [1.1, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
  );

  return (
    <div
      style={{
        width: '100%',
        height: 380,
        borderRadius: 12,
        background: BRAND.card,
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Loading state */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
          }}
        >
          {/* Spinning loader */}
          <div
            style={{
              width: 48,
              height: 48,
              border: `3px solid rgba(255,255,255,0.1)`,
              borderTopColor: BRAND.primary,
              borderRadius: '50%',
              transform: `rotate(${frame * 8}deg)`,
            }}
          />
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: BRAND.text, fontSize: 16, fontWeight: 500, margin: 0 }}>
              Generating your image...
            </p>
            <p style={{ color: BRAND.textMuted, fontSize: 14, margin: '8px 0 0' }}>
              {Math.round(loadingProgress)}%
            </p>
          </div>
          {/* Progress bar */}
          <div
            style={{
              width: 200,
              height: 4,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${loadingProgress}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%)`,
                borderRadius: 2,
              }}
            />
          </div>
        </div>
      )}

      {/* Generated image */}
      {isRevealed && (
        <div
          style={{
            width: '100%',
            height: '100%',
            opacity: revealProgress,
            transform: `scale(${imageScale})`,
          }}
        >
          {/* Beautiful gradient as placeholder for generated image */}
          <div
            style={{
              width: '100%',
              height: '100%',
              background: `
                linear-gradient(135deg,
                  #1a1a2e 0%,
                  #16213e 25%,
                  #0f3460 50%,
                  #533483 75%,
                  #e94560 100%
                )
              `,
              position: 'relative',
            }}
          >
            {/* Ethereal glow effects */}
            <div
              style={{
                position: 'absolute',
                width: '60%',
                height: '60%',
                left: '20%',
                top: '20%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
                filter: 'blur(30px)',
              }}
            />
            {/* Floating orbs */}
            <div
              style={{
                position: 'absolute',
                width: 100,
                height: 100,
                left: '30%',
                top: '25%',
                background: 'radial-gradient(circle, rgba(234, 179, 8, 0.4) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(20px)',
                transform: `translateY(${Math.sin(frame * 0.1) * 10}px)`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: 80,
                height: 80,
                right: '25%',
                bottom: '30%',
                background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(15px)',
                transform: `translateY(${Math.cos(frame * 0.1) * 8}px)`,
              }}
            />
            {/* Text overlay showing "AI Generated" */}
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                padding: '6px 12px',
                background: 'rgba(0,0,0,0.5)',
                borderRadius: 6,
                backdropFilter: 'blur(10px)',
              }}
            >
              <span style={{ color: BRAND.text, fontSize: 11, fontWeight: 500 }}>
                AI Generated
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ImageScene3Features: React.FC = () => {
  const frame = useCurrentFrame();

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

  // Typing animation for prompt
  const promptText = "A mystical forest at twilight with glowing golden flowers and soft ethereal light filtering through ancient trees";
  const typedChars = Math.floor(Math.max(0, frame - 20) * 2);
  const displayPrompt = promptText.slice(0, Math.min(typedChars, promptText.length));

  // Active style changes over time
  const activeStyle = frame < 80 ? 'Cinematic' : frame < 100 ? 'Digital Art' : 'Photographic';

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
        <div style={{ display: 'flex', height: '100%', padding: 30, gap: 30 }}>
          {/* Left side - Input controls */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header */}
            <div style={{ marginBottom: 8 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: BRAND.text, margin: 0 }}>
                Generate Image
              </h2>
              <p style={{ color: BRAND.textMuted, fontSize: 14, margin: '8px 0 0' }}>
                Transform your text into stunning visuals
              </p>
            </div>

            {/* Prompt input */}
            <div>
              <label style={{ display: 'block', color: BRAND.text, fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                Prompt
              </label>
              <div
                style={{
                  padding: 16,
                  background: BRAND.card,
                  borderRadius: 12,
                  border: `1px solid ${BRAND.primary}40`,
                  minHeight: 100,
                }}
              >
                <p style={{ color: BRAND.text, fontSize: 15, lineHeight: 1.6, margin: 0 }}>
                  {displayPrompt}
                  {typedChars < promptText.length && (
                    <span style={{ opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0, color: BRAND.primary }}>|</span>
                  )}
                </p>
              </div>
            </div>

            {/* Model selector */}
            <div>
              <label style={{ display: 'block', color: BRAND.text, fontSize: 14, fontWeight: 500, marginBottom: 10 }}>
                Model
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <div
                  style={{
                    flex: 1,
                    padding: '14px 16px',
                    background: `${BRAND.primary}20`,
                    border: `1px solid ${BRAND.primary}`,
                    borderRadius: 10,
                  }}
                >
                  <span style={{ color: BRAND.text, fontSize: 14, fontWeight: 600 }}>FLUX Schnell</span>
                  <span style={{ display: 'block', color: BRAND.textMuted, fontSize: 12, marginTop: 4 }}>Fast</span>
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10,
                  }}
                >
                  <span style={{ color: BRAND.textMuted, fontSize: 14, fontWeight: 600 }}>FLUX Pro</span>
                  <span style={{ display: 'block', color: BRAND.textDim, fontSize: 12, marginTop: 4 }}>High Quality</span>
                </div>
              </div>
            </div>

            {/* Style selector */}
            <div>
              <label style={{ display: 'block', color: BRAND.text, fontSize: 14, fontWeight: 500, marginBottom: 10 }}>
                Style Enhancement
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Photographic', 'Digital Art', 'Cinematic', 'Anime', '3D Model'].map((style, i) => (
                  <StyleButton key={style} label={style} isActive={style === activeStyle} delay={10 + i * 3} />
                ))}
              </div>
            </div>

            {/* Aspect ratio */}
            <div>
              <label style={{ display: 'block', color: BRAND.text, fontSize: 14, fontWeight: 500, marginBottom: 10 }}>
                Aspect Ratio
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['1:1', '16:9', '9:16', '4:3', '3:4'].map((ratio, i) => (
                  <AspectRatioButton key={ratio} ratio={ratio} isActive={ratio === '1:1'} delay={25 + i * 2} />
                ))}
              </div>
            </div>

            {/* Generate button */}
            <button
              style={{
                marginTop: 'auto',
                padding: '16px 24px',
                background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
                border: 'none',
                borderRadius: 12,
                color: BRAND.text,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: `0 8px 30px ${BRAND.primary}40`,
              }}
            >
              Generate Image
            </button>
          </div>

          {/* Right side - Generated image preview */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ color: BRAND.text, fontSize: 18, fontWeight: 600, margin: 0 }}>Preview</h3>
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
            <GeneratedImage startFrame={60} />

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
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
                  opacity: frame > 110 ? 1 : 0,
                }}
              >
                New Image
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: 10,
                  border: 'none',
                  background: frame > 110 ? `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)` : BRAND.card,
                  color: BRAND.text,
                  fontSize: 14,
                  fontWeight: 600,
                  opacity: frame > 110 ? 1 : 0,
                }}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </BrowserWindow>

      {/* Feature badges */}
      <FeatureBadge text="Multiple AI Models" x={120} y={180} delay={40} />
      <FeatureBadge text="6 Style Presets" x={1580} y={220} delay={50} />
      <FeatureBadge text="5 Aspect Ratios" x={1520} y={720} delay={60} />
      <FeatureBadge text="Instant Download" x={150} y={680} delay={70} />
    </AbsoluteFill>
  );
};
