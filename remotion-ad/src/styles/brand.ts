import { Easing } from 'remotion';

// POSTAIFY Brand Colors - Extracted from project theme
export const BRAND = {
  // Primary yellow gradient
  primary: '#EAB308',
  primaryLight: '#FACC15',
  primaryDark: '#CA8A04',
  primaryGlow: '#EAB30880',

  // Background colors
  background: '#000000',
  surface: '#0A0A0F',
  card: '#12121A',
  cardHover: '#1A1A25',

  // Text colors
  text: '#FFFFFF',
  textMuted: '#A3A3A3',
  textDim: '#666666',

  // Accent colors
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',

  // Platform colors
  instagram: '#E4405F',
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
  facebook: '#1877F2',
  tiktok: '#FFFFFF',

  // Telegram
  telegram: '#0088CC',
  telegramDark: '#006699',
};

// Typography
export const FONTS = {
  sans: 'Inter, system-ui, -apple-system, sans-serif',
  display: 'Inter, system-ui, sans-serif',
};

// ===========================================
// PRO EASING LIBRARY - NEVER USE LINEAR
// ===========================================
export const EASING = {
  // Smooth & elegant (default for most animations)
  smooth: Easing.bezier(0.16, 1, 0.3, 1),

  // Quick snap with overshoot (buttons, badges, small elements)
  snap: Easing.bezier(0.34, 1.56, 0.64, 1),

  // Elastic bounce (logos, emphasis moments)
  elastic: Easing.bezier(0.68, -0.6, 0.32, 1.6),

  // Heavy deceleration (large elements, cards)
  heavy: Easing.bezier(0.22, 1, 0.36, 1),

  // Anticipation (wind up before main action)
  anticipate: Easing.bezier(0.36, 0, 0.66, -0.56),

  // Exit (quick start, smooth end)
  exit: Easing.bezier(0.4, 0, 1, 1),

  // Cinematic (film-like, dramatic)
  cinematic: Easing.bezier(0.76, 0, 0.24, 1),

  // Expo out (very fast start, slow end)
  expoOut: Easing.bezier(0.16, 1, 0.3, 1),
};

// ===========================================
// SPRING CONFIGURATIONS
// ===========================================
export const SPRINGS = {
  // Snappy UI elements (buttons, badges)
  snappy: { damping: 15, mass: 0.5, stiffness: 200 },

  // Bouncy (logos, emphasis)
  bouncy: { damping: 8, mass: 0.8, stiffness: 150 },

  // Smooth large movements
  smooth: { damping: 20, mass: 1, stiffness: 100 },

  // Wobbly playful
  wobbly: { damping: 5, mass: 0.5, stiffness: 120 },

  // Stiff/precise
  stiff: { damping: 25, mass: 0.3, stiffness: 300 },

  // Gentle float
  gentle: { damping: 30, mass: 1.5, stiffness: 50 },

  // Quick response
  quick: { damping: 12, mass: 0.4, stiffness: 250 },
};

// ===========================================
// 60FPS TIMING (CRITICAL)
// ===========================================
export const TIMING = {
  fps: 60, // ALWAYS 60fps

  // Animation durations in frames (at 60fps)
  microInteraction: 12,   // 0.2s - hover, click
  quickReveal: 24,        // 0.4s - badges, small text
  standardEntrance: 45,   // 0.75s - cards, main elements
  dramaticReveal: 72,     // 1.2s - logo, hero text
  sceneTransition: 36,    // 0.6s - between scenes
  staggerDelay: 8,        // 0.13s - between list items
};

// Video dimensions - TikTok Vertical
export const DIMENSIONS = {
  width: 1080,
  height: 1920,
};

// ===========================================
// TIKTOK AD TIMING (15s @ 60fps = 900 frames)
// ===========================================
export const TIKTOK_TIMING = {
  fps: 60,
  totalDuration: 900, // 15 seconds @ 60fps

  // Scene durations (in frames)
  sceneHook: 150,       // 0-2.5s - Pain point
  sceneSolution: 120,   // 2.5-4.5s - Brand reveal
  sceneTelegram: 210,   // 4.5-8s - Telegram feature
  sceneCalendar: 210,   // 8-11.5s - Calendar feature
  sceneCTA: 210,        // 11.5-15s - Call to action
};

// Scene start frames (calculated)
export const SCENE_STARTS = {
  hook: 0,
  solution: TIKTOK_TIMING.sceneHook,
  telegram: TIKTOK_TIMING.sceneHook + TIKTOK_TIMING.sceneSolution,
  calendar: TIKTOK_TIMING.sceneHook + TIKTOK_TIMING.sceneSolution + TIKTOK_TIMING.sceneTelegram,
  cta: TIKTOK_TIMING.sceneHook + TIKTOK_TIMING.sceneSolution + TIKTOK_TIMING.sceneTelegram + TIKTOK_TIMING.sceneCalendar,
};
