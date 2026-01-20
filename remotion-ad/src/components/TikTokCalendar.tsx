import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from 'remotion';
import { BRAND, TIKTOK_TIMING } from '../styles/brand';

// Calendar data
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const CALENDAR_POSTS = [
  { day: 2, platforms: ['instagram'] },
  { day: 4, platforms: ['linkedin', 'twitter'] },
  { day: 6, platforms: ['tiktok'] },
  { day: 9, platforms: ['instagram', 'linkedin'] },
  { day: 11, platforms: ['twitter'] },
  { day: 13, platforms: ['instagram', 'twitter', 'linkedin'] },
  { day: 15, platforms: ['tiktok', 'instagram'] },
];

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E4405F',
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
  tiktok: '#FFFFFF',
};

export const TikTokCalendar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const duration = TIKTOK_TIMING.sceneCalendar;

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

  // Calendar animation
  const calendarScale = spring({
    frame: frame - 10,
    fps,
    from: 0.85,
    to: 1,
    config: { damping: 12, mass: 0.6 },
  });

  const calendarOpacity = interpolate(frame, [8, 25], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Exit animation
  const exitOpacity = interpolate(
    frame,
    [duration - 15, duration],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Generate calendar cells
  const calendarCells = [];
  for (let i = 1; i <= 21; i++) {
    const postData = CALENDAR_POSTS.find((p) => p.day === i);
    calendarCells.push({
      day: i,
      platforms: postData?.platforms || [],
    });
  }

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
        Schedule{' '}
        <span style={{ color: BRAND.primary }}>Weeks Ahead</span>
      </div>

      {/* Calendar card */}
      <div
        style={{
          width: 900,
          background: `linear-gradient(145deg, ${BRAND.card} 0%, ${BRAND.surface} 100%)`,
          borderRadius: 32,
          border: `2px solid ${BRAND.primary}20`,
          padding: 35,
          opacity: calendarOpacity,
          transform: `scale(${Math.max(0.85, calendarScale)})`,
          boxShadow: `0 30px 80px rgba(0,0,0,0.4), 0 0 60px ${BRAND.primary}15`,
        }}
      >
        {/* Month header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 25,
            paddingBottom: 20,
            borderBottom: `1px solid ${BRAND.primary}20`,
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 700, color: BRAND.text }}>
            January 2025
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div
              style={{
                width: 44,
                height: 44,
                background: `${BRAND.primary}20`,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: BRAND.primary,
                fontSize: 22,
              }}
            >
              &lt;
            </div>
            <div
              style={{
                width: 44,
                height: 44,
                background: `${BRAND.primary}20`,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: BRAND.primary,
                fontSize: 22,
              }}
            >
              &gt;
            </div>
          </div>
        </div>

        {/* Day names */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 8,
            marginBottom: 12,
          }}
        >
          {DAYS.map((day, i) => (
            <div
              key={i}
              style={{
                textAlign: 'center',
                fontSize: 18,
                fontWeight: 600,
                color: BRAND.textMuted,
                padding: 10,
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
            gap: 8,
          }}
        >
          {calendarCells.map((cell, index) => {
            const cellDelay = 25 + index * 2;
            const cellOpacity = interpolate(
              frame,
              [cellDelay, cellDelay + 10],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );

            const cellScale = spring({
              frame: frame - cellDelay,
              fps,
              from: 0.7,
              to: 1,
              config: { damping: 15, mass: 0.4 },
            });

            const isToday = cell.day === 9;
            const hasPosts = cell.platforms.length > 0;

            return (
              <div
                key={index}
                style={{
                  aspectRatio: '1',
                  background: isToday
                    ? `linear-gradient(135deg, ${BRAND.primary}40, ${BRAND.primary}20)`
                    : `rgba(255,255,255,0.03)`,
                  borderRadius: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 8,
                  border: isToday ? `2px solid ${BRAND.primary}` : 'none',
                  opacity: cellOpacity,
                  transform: `scale(${Math.max(0.7, cellScale)})`,
                }}
              >
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: BRAND.text,
                    marginBottom: hasPosts ? 6 : 0,
                  }}
                >
                  {cell.day}
                </span>

                {/* Platform dots */}
                {hasPosts && (
                  <div
                    style={{
                      display: 'flex',
                      gap: 4,
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                    }}
                  >
                    {cell.platforms.map((platform, pIndex) => {
                      const dotDelay = cellDelay + 8 + pIndex * 3;
                      const dotOpacity = interpolate(
                        frame,
                        [dotDelay, dotDelay + 8],
                        [0, 1],
                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                      );

                      const dotScale = spring({
                        frame: frame - dotDelay,
                        fps,
                        from: 0,
                        to: 1,
                        config: { damping: 10, mass: 0.3, stiffness: 150 },
                      });

                      return (
                        <div
                          key={pIndex}
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: PLATFORM_COLORS[platform],
                            opacity: dotOpacity,
                            transform: `scale(${Math.max(0, dotScale)})`,
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
          marginTop: 40,
          background: `${BRAND.primary}20`,
          border: `2px solid ${BRAND.primary}40`,
          borderRadius: 20,
          padding: '16px 32px',
          opacity: interpolate(frame, [85, 100], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        <span style={{ color: BRAND.primaryLight, fontSize: 24, fontWeight: 600 }}>
          Auto-Schedule Posts
        </span>
      </div>
    </AbsoluteFill>
  );
};
