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

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const CALENDAR_POSTS = [
  { day: 2, platforms: ['instagram'] },
  { day: 4, platforms: ['linkedin', 'twitter'] },
  { day: 6, platforms: ['tiktok'] },
  { day: 9, platforms: ['instagram', 'linkedin'] },
  { day: 11, platforms: ['twitter'] },
  { day: 13, platforms: ['instagram', 'twitter', 'linkedin'] },
  { day: 15, platforms: ['tiktok', 'instagram'] },
  { day: 17, platforms: ['linkedin'] },
  { day: 19, platforms: ['twitter', 'instagram'] },
];

const PLATFORM_COLORS: Record<string, string> = {
  instagram: BRAND.instagram,
  twitter: BRAND.twitter,
  linkedin: BRAND.linkedin,
  tiktok: '#FFFFFF',
};

export const ProCalendar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = TIKTOK_TIMING.sceneCalendar;

  // ===== TITLE ANIMATION =====
  const titleProgress = spring({
    frame,
    fps,
    config: SPRINGS.smooth,
  });

  const titleOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const titleY = interpolate(Math.max(0, titleProgress), [0, 1], [-40, 0]);

  // ===== CALENDAR CARD =====
  const cardStart = 15;
  const cardProgress = spring({
    frame: frame - cardStart,
    fps,
    config: SPRINGS.smooth,
  });

  const cardScale = interpolate(Math.max(0, cardProgress), [0, 1], [0.9, 1]);
  const cardOpacity = interpolate(frame, [cardStart, cardStart + 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ===== BADGE =====
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

  // ===== EXIT =====
  const exitStart = duration - 30;
  const exitOpacity = interpolate(frame, [exitStart, duration], [1, 0], {
    easing: EASING.exit,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Generate 21 days
  const calendarCells = [];
  for (let i = 1; i <= 21; i++) {
    const postData = CALENDAR_POSTS.find((p) => p.day === i);
    calendarCells.push({
      day: i,
      platforms: postData?.platforms || [],
    });
  }

  return (
    <Camera
      zoom={{ from: 1.05, to: 1, start: 0, end: 60 }}
      roll={{ from: 1, to: -1, start: 0, end: duration }}
      pan={{ from: [0, -15], to: [0, 15], start: 0, end: duration }}
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
        <Particles count={18} color={BRAND.primary} direction="up" />

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
          Schedule{' '}
          <span
            style={{
              background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryLight})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Weeks Ahead
          </span>
        </div>

        {/* Calendar card */}
        <div
          style={{
            width: 880,
            background: `linear-gradient(145deg, ${BRAND.card} 0%, ${BRAND.surface} 100%)`,
            borderRadius: 28,
            border: `2px solid ${BRAND.primary}20`,
            padding: 30,
            opacity: cardOpacity,
            transform: `scale(${cardScale})`,
            boxShadow: `
              0 40px 80px rgba(0,0,0,0.4),
              0 0 60px ${BRAND.primary}10,
              inset 0 1px 0 rgba(255,255,255,0.05)
            `,
            zIndex: 10,
          }}
        >
          {/* Month header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: `1px solid ${BRAND.primary}15`,
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 700, color: BRAND.text }}>
              January 2025
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['<', '>'].map((arrow, i) => (
                <div
                  key={i}
                  style={{
                    width: 40,
                    height: 40,
                    background: `${BRAND.primary}15`,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: BRAND.primary,
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  {arrow}
                </div>
              ))}
            </div>
          </div>

          {/* Day names */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 6,
              marginBottom: 10,
            }}
          >
            {DAYS.map((day, i) => (
              <div
                key={i}
                style={{
                  textAlign: 'center',
                  fontSize: 15,
                  fontWeight: 600,
                  color: BRAND.textMuted,
                  padding: 8,
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 6,
            }}
          >
            {calendarCells.map((cell, index) => {
              const cellDelay = 40 + index * 3;
              const cellProgress = spring({
                frame: frame - cellDelay,
                fps,
                config: SPRINGS.snappy,
              });

              const cellOpacity = interpolate(
                frame,
                [cellDelay, cellDelay + 15],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              );

              const cellScale = interpolate(Math.max(0, cellProgress), [0, 1], [0.7, 1]);

              const isToday = cell.day === 9;
              const hasPosts = cell.platforms.length > 0;

              return (
                <div
                  key={index}
                  style={{
                    aspectRatio: '1',
                    background: isToday
                      ? `linear-gradient(135deg, ${BRAND.primary}35, ${BRAND.primary}15)`
                      : 'rgba(255,255,255,0.02)',
                    borderRadius: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 6,
                    border: isToday ? `2px solid ${BRAND.primary}` : '1px solid transparent',
                    opacity: cellOpacity,
                    transform: `scale(${cellScale})`,
                    boxShadow: isToday ? `0 0 20px ${BRAND.primary}30` : 'none',
                  }}
                >
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: BRAND.text,
                      marginBottom: hasPosts ? 5 : 0,
                    }}
                  >
                    {cell.day}
                  </span>

                  {hasPosts && (
                    <div
                      style={{
                        display: 'flex',
                        gap: 3,
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                      }}
                    >
                      {cell.platforms.map((platform, pIndex) => {
                        const dotDelay = cellDelay + 12 + pIndex * 4;
                        const dotProgress = spring({
                          frame: frame - dotDelay,
                          fps,
                          config: { damping: 10, mass: 0.3, stiffness: 200 },
                        });

                        const dotScale = interpolate(Math.max(0, dotProgress), [0, 1], [0, 1]);
                        const dotOpacity = interpolate(
                          frame,
                          [dotDelay, dotDelay + 10],
                          [0, 1],
                          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                        );

                        return (
                          <div
                            key={pIndex}
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: PLATFORM_COLORS[platform],
                              opacity: dotOpacity,
                              transform: `scale(${dotScale})`,
                              boxShadow: `0 0 8px ${PLATFORM_COLORS[platform]}80`,
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature badge */}
        <div
          style={{
            marginTop: 35,
            background: `linear-gradient(135deg, ${BRAND.primary}20, ${BRAND.primary}10)`,
            border: `2px solid ${BRAND.primary}40`,
            borderRadius: 20,
            padding: '14px 28px',
            opacity: badgeOpacity,
            transform: `scale(${Math.max(0.8, badgeProgress)})`,
            boxShadow: `0 0 30px ${BRAND.primary}20`,
            zIndex: 10,
          }}
        >
          <span style={{ color: BRAND.primaryLight, fontSize: 22, fontWeight: 600 }}>
            Auto-Schedule Posts
          </span>
        </div>

        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            top: '40%',
            background: `radial-gradient(circle, ${BRAND.primary}25 0%, transparent 60%)`,
            filter: 'blur(80px)',
          }}
        />
      </AbsoluteFill>
    </Camera>
  );
};
