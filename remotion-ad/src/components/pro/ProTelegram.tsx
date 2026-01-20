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

const MESSAGES = [
  {
    type: 'bot',
    platform: 'LinkedIn',
    content: 'Your post is ready!',
    post: '"AI is transforming content creation. Here\'s the future..."',
    delay: 40,
  },
  {
    type: 'user',
    content: 'Generate for Twitter too',
    delay: 90,
  },
  {
    type: 'bot',
    platform: 'Twitter',
    content: 'Done!',
    post: '"AI content thread 🧵 Let\'s break it down..."',
    delay: 130,
  },
];

export const ProTelegram: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = TIKTOK_TIMING.sceneTelegram;

  // ===== TITLE ANIMATION =====
  const titleProgress = spring({
    frame,
    fps,
    config: SPRINGS.smooth,
  });

  const titleOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const titleY = interpolate(Math.max(0, titleProgress), [0, 1], [-50, 0]);

  // ===== PHONE ANIMATION =====
  const phoneStart = 15;
  const phoneProgress = spring({
    frame: frame - phoneStart,
    fps,
    config: SPRINGS.bouncy,
  });

  const phoneScale = interpolate(Math.max(0, phoneProgress), [0, 1], [0.85, 1]);
  const phoneY = interpolate(Math.max(0, phoneProgress), [0, 1], [100, 0]);
  const phoneOpacity = interpolate(frame, [phoneStart, phoneStart + 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Phone subtle float
  const phoneFloat = Math.sin(frame * 0.04) * 5;

  // ===== FEATURE BADGE =====
  const badgeStart = 170;
  const badgeProgress = spring({
    frame: frame - badgeStart,
    fps,
    config: SPRINGS.snappy,
  });

  const badgeOpacity = interpolate(frame, [badgeStart, badgeStart + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const badgeScale = interpolate(Math.max(0, badgeProgress), [0, 1], [0.8, 1]);

  // ===== EXIT =====
  const exitStart = duration - 30;
  const exitOpacity = interpolate(frame, [exitStart, duration], [1, 0], {
    easing: EASING.exit,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <Camera
      zoom={{ from: 1, to: 1.05, start: 0, end: duration }}
      pan={{ from: [0, 10], to: [0, -10], start: 0, end: duration }}
    >
      <AbsoluteFill
        style={{
          justifyContent: 'flex-start',
          alignItems: 'center',
          paddingTop: 100,
          opacity: exitOpacity,
        }}
      >
        {/* Background particles */}
        <Particles count={15} color={BRAND.telegram} direction="up" />

        {/* Title */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: BRAND.text,
            textAlign: 'center',
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            marginBottom: 40,
            zIndex: 10,
          }}
        >
          Posts Delivered to{' '}
          <span
            style={{
              color: BRAND.telegram,
              textShadow: `0 0 30px ${BRAND.telegram}60`,
            }}
          >
            Telegram
          </span>
        </div>

        {/* Phone mockup */}
        <div
          style={{
            width: 360,
            height: 680,
            background: `linear-gradient(145deg, ${BRAND.card} 0%, ${BRAND.surface} 100%)`,
            borderRadius: 42,
            border: `3px solid ${BRAND.primary}25`,
            overflow: 'hidden',
            opacity: phoneOpacity,
            transform: `scale(${phoneScale}) translateY(${phoneY + phoneFloat}px)`,
            boxShadow: `
              0 40px 80px rgba(0,0,0,0.5),
              0 0 60px ${BRAND.primary}15,
              inset 0 1px 0 rgba(255,255,255,0.1)
            `,
            zIndex: 10,
          }}
        >
          {/* Notch */}
          <div
            style={{
              width: 130,
              height: 28,
              background: BRAND.background,
              borderRadius: '0 0 18px 18px',
              margin: '0 auto',
            }}
          />

          {/* Telegram header */}
          <div
            style={{
              background: `linear-gradient(135deg, ${BRAND.telegram}, ${BRAND.telegramDark})`,
              padding: '40px 22px 18px',
              marginTop: -28,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            {/* Bot avatar */}
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${BRAND.primary}40`,
              }}
            >
              <span style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>P</span>
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
                Postaify Bot
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Online</div>
            </div>
          </div>

          {/* Chat messages */}
          <div
            style={{
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {MESSAGES.map((msg, i) => {
              const msgProgress = spring({
                frame: frame - msg.delay,
                fps,
                config: SPRINGS.snappy,
              });

              const msgOpacity = interpolate(
                frame,
                [msg.delay, msg.delay + 18],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              );

              const msgY = interpolate(Math.max(0, msgProgress), [0, 1], [30, 0]);
              const msgScale = interpolate(Math.max(0, msgProgress), [0, 1], [0.95, 1]);

              const isBot = msg.type === 'bot';

              return (
                <div
                  key={i}
                  style={{
                    alignSelf: isBot ? 'flex-start' : 'flex-end',
                    maxWidth: '85%',
                    opacity: msgOpacity,
                    transform: `translateY(${msgY}px) scale(${msgScale})`,
                  }}
                >
                  <div
                    style={{
                      background: isBot
                        ? BRAND.card
                        : `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryDark})`,
                      padding: '12px 16px',
                      borderRadius: 16,
                      borderBottomLeftRadius: isBot ? 4 : 16,
                      borderBottomRightRadius: isBot ? 16 : 4,
                      boxShadow: isBot
                        ? 'none'
                        : `0 4px 15px ${BRAND.primary}30`,
                    }}
                  >
                    {isBot && msg.platform && (
                      <div
                        style={{
                          display: 'inline-block',
                          background: `${BRAND.primary}25`,
                          padding: '3px 10px',
                          borderRadius: 8,
                          fontSize: 12,
                          color: BRAND.primaryLight,
                          marginBottom: 6,
                          fontWeight: 600,
                        }}
                      >
                        {msg.platform}
                      </div>
                    )}
                    <div style={{ color: '#fff', fontSize: 14, lineHeight: 1.4 }}>
                      {msg.content}
                    </div>
                    {isBot && msg.post && (
                      <div
                        style={{
                          marginTop: 8,
                          paddingTop: 8,
                          borderTop: '1px solid rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.75)',
                          fontSize: 13,
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
            marginTop: 35,
            background: `linear-gradient(135deg, ${BRAND.telegram}20, ${BRAND.telegram}10)`,
            border: `2px solid ${BRAND.telegram}40`,
            borderRadius: 20,
            padding: '14px 28px',
            opacity: badgeOpacity,
            transform: `scale(${badgeScale})`,
            boxShadow: `0 0 30px ${BRAND.telegram}20`,
            zIndex: 10,
          }}
        >
          <span style={{ color: BRAND.telegram, fontSize: 22, fontWeight: 600 }}>
            Instant Delivery
          </span>
        </div>

        {/* Glow behind phone */}
        <div
          style={{
            position: 'absolute',
            width: 300,
            height: 500,
            top: '35%',
            background: `radial-gradient(ellipse, ${BRAND.telegram}30 0%, transparent 60%)`,
            filter: 'blur(60px)',
          }}
        />
      </AbsoluteFill>
    </Camera>
  );
};
