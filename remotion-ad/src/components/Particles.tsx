import React, { useMemo } from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface ParticleData {
  x: number;
  y: number;
  size: number;
  speed: number;
  delay: number;
  opacity: number;
}

interface ParticlesProps {
  count?: number;
  color?: string;
  minSize?: number;
  maxSize?: number;
  direction?: 'up' | 'down' | 'random';
  blur?: boolean;
}

/**
 * Floating Particles - Creates ambient depth in backgrounds
 *
 * Usage:
 * <Particles count={30} color="#EAB308" direction="up" />
 */
export const Particles: React.FC<ParticlesProps> = ({
  count = 25,
  color = '#EAB308',
  minSize = 2,
  maxSize = 6,
  direction = 'up',
  blur = true,
}) => {
  const frame = useCurrentFrame();

  // Generate particles once using deterministic seed
  const particles = useMemo<ParticleData[]>(() => {
    const result: ParticleData[] = [];
    for (let i = 0; i < count; i++) {
      // Use deterministic pseudo-random based on index
      const seed = i * 1.618033988749;
      const pseudoRandom = (n: number) => ((seed * n * 9301 + 49297) % 233280) / 233280;

      result.push({
        x: pseudoRandom(1) * 100,
        y: pseudoRandom(2) * 120 - 10,
        size: minSize + pseudoRandom(3) * (maxSize - minSize),
        speed: 0.3 + pseudoRandom(4) * 0.7,
        delay: pseudoRandom(5) * 60,
        opacity: 0.3 + pseudoRandom(6) * 0.5,
      });
    }
    return result;
  }, [count, minSize, maxSize]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {particles.map((p, i) => {
        // Calculate Y position based on direction
        let y: number;
        if (direction === 'up') {
          y = ((p.y - frame * p.speed * 0.15) % 130) + 10;
          if (y < -10) y += 140;
        } else if (direction === 'down') {
          y = ((p.y + frame * p.speed * 0.15) % 130) - 10;
        } else {
          // Random drift
          y = p.y + Math.sin((frame + p.delay) * 0.03) * 20;
        }

        // Horizontal drift
        const drift = Math.sin((frame + p.delay) * 0.02) * 15;

        // Fade at edges
        const fadeOpacity = interpolate(y, [-5, 15, 85, 105], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        // Twinkle effect
        const twinkle = 0.7 + Math.sin((frame + p.delay * 10) * 0.08) * 0.3;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${p.x + drift * 0.3}%`,
              top: `${y}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: color,
              opacity: fadeOpacity * p.opacity * twinkle,
              filter: blur ? `blur(${p.size / 4}px)` : 'none',
              boxShadow: `0 0 ${p.size * 2}px ${color}`,
            }}
          />
        );
      })}
    </div>
  );
};

/**
 * Converging Particles - Particles that fly towards a center point
 * Great for logo reveals
 */
export const ConvergingParticles: React.FC<{
  count?: number;
  color?: string;
  targetX?: number;
  targetY?: number;
  startFrame?: number;
  duration?: number;
}> = ({
  count = 15,
  color = '#EAB308',
  targetX = 50,
  targetY = 50,
  startFrame = 0,
  duration = 60,
}) => {
  const frame = useCurrentFrame();

  const particles = useMemo(() => {
    const result = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const distance = 80 + (i % 3) * 20;
      const seed = i * 1.618;
      const pseudoRandom = (n: number) => ((seed * n * 9301 + 49297) % 233280) / 233280;

      result.push({
        startX: targetX + Math.cos(angle) * distance,
        startY: targetY + Math.sin(angle) * distance,
        size: 4 + pseudoRandom(1) * 6,
        delay: i * 3,
      });
    }
    return result;
  }, [count, targetX, targetY]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {particles.map((p, i) => {
        const particleStart = startFrame + p.delay;
        const particleEnd = particleStart + duration;

        const progress = interpolate(frame, [particleStart, particleEnd], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        // Ease in strongly, then decelerate at target
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        const x = interpolate(easedProgress, [0, 1], [p.startX, targetX]);
        const y = interpolate(easedProgress, [0, 1], [p.startY, targetY]);

        // Fade in, then fade out as it reaches center
        const opacity = interpolate(
          progress,
          [0, 0.2, 0.8, 1],
          [0, 1, 1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        // Scale down as it approaches
        const scale = interpolate(progress, [0, 1], [1, 0.3]);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: color,
              opacity,
              transform: `translate(-50%, -50%) scale(${scale})`,
              boxShadow: `0 0 ${p.size * 3}px ${color}`,
            }}
          />
        );
      })}
    </div>
  );
};

/**
 * Spark Burst - Explosive particle burst for impact moments
 */
export const SparkBurst: React.FC<{
  x?: number;
  y?: number;
  color?: string;
  startFrame: number;
  count?: number;
}> = ({ x = 50, y = 50, color = '#EAB308', startFrame, count = 12 }) => {
  const frame = useCurrentFrame();

  const sparks = useMemo(() => {
    const result = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
      const speed = 150 + Math.random() * 100;
      result.push({ angle, speed, size: 3 + Math.random() * 4 });
    }
    return result;
  }, [count]);

  const localFrame = frame - startFrame;
  if (localFrame < 0 || localFrame > 45) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {sparks.map((spark, i) => {
        const progress = localFrame / 45;
        const distance = spark.speed * progress;
        const sparkX = x + Math.cos(spark.angle) * distance * 0.5;
        const sparkY = y + Math.sin(spark.angle) * distance * 0.5;

        const opacity = interpolate(progress, [0, 0.1, 0.7, 1], [0, 1, 0.5, 0]);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${sparkX}%`,
              top: `${sparkY}%`,
              width: spark.size,
              height: spark.size,
              borderRadius: '50%',
              background: color,
              opacity,
              boxShadow: `0 0 ${spark.size * 2}px ${color}`,
            }}
          />
        );
      })}
    </div>
  );
};
