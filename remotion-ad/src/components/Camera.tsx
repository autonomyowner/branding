import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { EASING } from '../styles/brand';

interface CameraProps {
  children: React.ReactNode;
  // Zoom: 1 = normal, 1.2 = 20% zoom in, 0.8 = zoom out
  zoom?: { from: number; to: number; start: number; end: number };
  // Pan: pixels to move [x, y]
  pan?: { from: [number, number]; to: [number, number]; start: number; end: number };
  // Roll: degrees to rotate
  roll?: { from: number; to: number; start: number; end: number };
  // Shake: intensity for impact moments
  shake?: { intensity: number; start: number; duration: number };
  // 3D perspective
  perspective?: number;
  // Transform origin (default center)
  origin?: string;
}

/**
 * Camera Component - Wraps scenes with cinematic camera movements
 *
 * Usage:
 * <Camera
 *   zoom={{ from: 1, to: 1.15, start: 0, end: 120 }}
 *   pan={{ from: [0, 0], to: [50, -20], start: 30, end: 150 }}
 *   roll={{ from: -2, to: 2, start: 0, end: 180 }}
 *   shake={{ intensity: 8, start: 45, duration: 15 }}
 * >
 *   <YourScene />
 * </Camera>
 */
export const Camera: React.FC<CameraProps> = ({
  children,
  zoom,
  pan,
  roll,
  shake,
  perspective = 1000,
  origin = 'center center',
}) => {
  const frame = useCurrentFrame();

  // Zoom interpolation with smooth easing
  const scale = zoom
    ? interpolate(frame, [zoom.start, zoom.end], [zoom.from, zoom.to], {
        easing: EASING.cinematic,
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  // Pan X interpolation
  const translateX = pan
    ? interpolate(frame, [pan.start, pan.end], [pan.from[0], pan.to[0]], {
        easing: EASING.smooth,
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  // Pan Y interpolation
  const translateY = pan
    ? interpolate(frame, [pan.start, pan.end], [pan.from[1], pan.to[1]], {
        easing: EASING.smooth,
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  // Roll interpolation
  const rotation = roll
    ? interpolate(frame, [roll.start, roll.end], [roll.from, roll.to], {
        easing: EASING.smooth,
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  // Camera shake for impact moments
  let shakeX = 0;
  let shakeY = 0;
  let shakeRotation = 0;

  if (shake && frame >= shake.start && frame < shake.start + shake.duration) {
    const shakeProgress = (frame - shake.start) / shake.duration;
    const decay = Math.pow(1 - shakeProgress, 2); // Exponential decay

    // Multi-frequency shake for more organic feel
    shakeX =
      (Math.sin(frame * 1.5) * 0.6 + Math.sin(frame * 2.7) * 0.4) *
      shake.intensity *
      decay;
    shakeY =
      (Math.cos(frame * 2) * 0.5 + Math.cos(frame * 3.1) * 0.5) *
      shake.intensity *
      decay;
    shakeRotation = Math.sin(frame * 1.8) * (shake.intensity * 0.1) * decay;
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        perspective,
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `
            scale(${scale})
            translate(${translateX + shakeX}px, ${translateY + shakeY}px)
            rotate(${rotation + shakeRotation}deg)
          `,
          transformOrigin: origin,
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * Dolly Camera - Simulates camera moving towards/away from subject
 * Creates depth by scaling + subtle Y movement
 */
export const DollyCamera: React.FC<{
  children: React.ReactNode;
  from: number;
  to: number;
  start: number;
  end: number;
}> = ({ children, from, to, start, end }) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [start, end], [0, 1], {
    easing: EASING.cinematic,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(progress, [0, 1], [from, to]);
  const translateY = interpolate(progress, [0, 1], [0, (to - from) * -20]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        transform: `scale(${scale}) translateY(${translateY}px)`,
        transformOrigin: 'center center',
      }}
    >
      {children}
    </div>
  );
};

/**
 * Ken Burns Effect - Slow zoom + pan for static images/content
 */
export const KenBurns: React.FC<{
  children: React.ReactNode;
  duration: number;
  zoomFrom?: number;
  zoomTo?: number;
  panX?: number;
  panY?: number;
}> = ({
  children,
  duration,
  zoomFrom = 1,
  zoomTo = 1.15,
  panX = 30,
  panY = 20,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [0, duration], [0, 1], {
    easing: EASING.smooth,
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(progress, [0, 1], [zoomFrom, zoomTo]);
  const x = interpolate(progress, [0, 1], [0, panX]);
  const y = interpolate(progress, [0, 1], [0, panY]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        transform: `scale(${scale}) translate(${x}px, ${y}px)`,
        transformOrigin: 'center center',
      }}
    >
      {children}
    </div>
  );
};
