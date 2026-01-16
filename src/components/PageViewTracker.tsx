import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMetaPixel } from '../hooks/useMetaPixel';
import { useGA4 } from '../hooks/useGA4';

/**
 * PageViewTracker component
 *
 * Automatically tracks PageView events when the route changes for both
 * Meta Pixel and Google Analytics 4.
 * Place this component inside BrowserRouter to enable automatic tracking.
 *
 * Note: The initial PageView is already tracked by the analytics initialization
 * in index.html, so this component tracks subsequent navigation events.
 */
export function PageViewTracker() {
  const location = useLocation();
  const { trackPageView: trackMetaPageView, isPixelLoaded } = useMetaPixel();
  const { trackPageView: trackGA4PageView, isGtagLoaded } = useGA4();

  useEffect(() => {
    // Track Meta Pixel PageView
    if (isPixelLoaded()) {
      trackMetaPageView();
    }

    // Track GA4 PageView
    if (isGtagLoaded()) {
      trackGA4PageView(document.title, location.pathname);
    }

    if (import.meta.env.DEV) {
      console.log('[PageViewTracker] Route changed:', location.pathname);
    }
  }, [location.pathname, trackMetaPageView, trackGA4PageView, isPixelLoaded, isGtagLoaded, location]);

  // This component doesn't render anything
  return null;
}
