import React from 'react';
import { Composition } from 'remotion';
import { PostaifyAd } from './compositions/PostaifyAd';
import { TikTokAd } from './compositions/TikTokAd';
import { ProTikTokAd } from './compositions/ProTikTokAd';
import { TIMING, TIKTOK_TIMING } from './styles/brand';

// Dimensions for different formats
const LANDSCAPE = { width: 1920, height: 1080 };
const TIKTOK_VERTICAL = { width: 1080, height: 1920 };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ========================================
          PRO TIKTOK AD - 60fps Cinematic Quality
          ======================================== */}
      <Composition
        id="ProTikTokAd"
        component={ProTikTokAd}
        durationInFrames={TIKTOK_TIMING.totalDuration} // 900 frames @ 60fps = 15s
        fps={60}
        width={TIKTOK_VERTICAL.width}
        height={TIKTOK_VERTICAL.height}
      />

      {/* ========================================
          Standard TikTok Ad (30fps)
          ======================================== */}
      <Composition
        id="TikTokAd"
        component={TikTokAd}
        durationInFrames={450} // 450 frames @ 30fps = 15s
        fps={30}
        width={TIKTOK_VERTICAL.width}
        height={TIKTOK_VERTICAL.height}
      />

      {/* ========================================
          Original Landscape Ads
          ======================================== */}
      <Composition
        id="PostaifyAd"
        component={PostaifyAd}
        durationInFrames={450}
        fps={TIMING.fps}
        width={LANDSCAPE.width}
        height={LANDSCAPE.height}
      />
    </>
  );
};
