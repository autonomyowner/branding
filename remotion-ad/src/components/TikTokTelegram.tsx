import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from 'remotion';
import { BRAND, TELEGRAM, TIKTOK_TIMING } from '../styles/brand';

const MESSAGES = [
  {
    type: 'bot',
    platform: 'LinkedIn',
    content: 'Your post is ready!',
    post: '"AI is transforming how we create content. Here\'s why..."',
    delay: 20,
  },
  {
    type: 'user',
    content: 'Generate for Twitter',
    delay: 50,
  },
  {
    type: 'bot',
    platform: 'Twitter',
    content: 'Done!',
    post: '"AI content creation thread 🧵"',
    delay: 70,
  },
];

export const TikTokTelegram: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const duration = TIKTOK_TIMING.sceneTelegram;

  // Title animation
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const titleY = spring({
    frame,
    fps,
    from: -40,
    to: 0,
    config: { damping: 12, mass: 0.5 },
  });

  // Phone animation
  const phoneScale = spring({
    frame: frame - 10,
    fps,
    from: 0.8,
    to: 1,
    config: { damping: 12, mass: 0.6 },
  });

  const phoneOpacity = interpolate(frame, [8, 25], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Exit animation
  const exitOpacity = interpolate(
    frame,
    [duration - 15, duration],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 120,
        opacity: exitOpacity,
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 52,
          fontWeight: 700,
          color: BRAND.text,
          textAlign: 'center',
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          marginBottom: 50,
        }}
      >
        Posts Delivered to{' '}
        <span style={{ color: TELEGRAM.blue }}>Telegram</span>
      </div>

      {/* Phone mockup */}
      <div
        style={{
          width: 380,
          height: 720,
          background: `linear-gradient(145deg, ${BRAND.card} 0%, ${BRAND.surface} 100%)`,
          borderRadius: 45,
          border: `3px solid ${BRAND.primary}30`,
          overflow: 'hidden',
          opacity: phoneOpacity,
          transform: `scale(${Math.max(0.8, phoneScale)})`,
          boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 60px ${BRAND.primary}20`,
        }}
      >
        {/* Notch */}
        <div
          style={{
            width: 140,
            height: 30,
            background: BRAND.background,
            borderRadius: '0 0 20px 20px',
            margin: '0 auto',
          }}
        />

        {/* Telegram header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${TELEGRAM.blue}, ${TELEGRAM.blueDark})`,
            padding: '45px 25px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 15,
            marginTop: -30,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>P</span>
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>
              Postaify Bot
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
              Online
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div
          style={{
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {MESSAGES.map((msg, index) => {
            const msgOpacity = interpolate(
              frame,
              [msg.delay, msg.delay + 12],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );

            const msgY = spring({
              frame: frame - msg.delay,
              fps,
              from: 25,
              to: 0,
              config: { damping: 14, mass: 0.5 },
            });

            const isBot = msg.type === 'bot';

            return (
              <div
                key={index}
                style={{
                  alignSelf: isBot ? 'flex-start' : 'flex-end',
                  maxWidth: '85%',
                  opacity: msgOpacity,
                  transform: `translateY(${msgY}px)`,
                }}
              >
                <div
                  style={{
                    background: isBot
                      ? BRAND.card
                      : `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})`,
                    padding: '14px 18px',
                    borderRadius: 18,
                    borderBottomLeftRadius: isBot ? 6 : 18,
                    borderBottomRightRadius: isBot ? 18 : 6,
                  }}
                >
                  {isBot && msg.platform && (
                    <div
                      style={{
                        display: 'inline-block',
                        background: `${BRAND.primary}30`,
                        padding: '4px 12px',
                        borderRadius: 10,
                        fontSize: 13,
                        color: BRAND.primaryLight,
                        marginBottom: 8,
                      }}
                    >
                      {msg.platform}
                    </div>
                  )}
                  <div style={{ color: '#fff', fontSize: 16, lineHeight: 1.4 }}>
                    {msg.content}
                  </div>
                  {isBot && msg.post && (
                    <div
                      style={{
                        marginTop: 10,
                        paddingTop: 10,
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: 15,
                        fontStyle: 'italic',
                      }}
                    >
                      {msg.post}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature badge */}
      <div
        style={{
          marginTop: 40,
          background: `${BRAND.primary}20`,
          border: `2px solid ${BRAND.primary}40`,
          borderRadius: 20,
          padding: '16px 32px',
          opacity: interpolate(frame, [85, 100], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        <span style={{ color: BRAND.primaryLight, fontSize: 24, fontWeight: 600 }}>
          Instant Delivery
        </span>
      </div>
    </AbsoluteFill>
  );
};
