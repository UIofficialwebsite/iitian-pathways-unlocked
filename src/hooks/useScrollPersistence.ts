import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const STORAGE_KEY = 'app_scroll_state';
const DEBOUNCE_MS = 100;

interface ScrollState {
  path: string;
  scrollY: number;
  timestamp: number;
}

export const useScrollPersistence = () => {
  const location = useLocation();
  const isRestoringRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Disable browser's default scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Save scroll position (debounced)
  const saveScrollPosition = useCallback(() => {
    if (isRestoringRef.current) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const state: ScrollState = {
        path: location.pathname + location.search + location.hash,
        scrollY: window.scrollY,
        timestamp: Date.now(),
      };
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        // Ignore storage errors
      }
    }, DEBOUNCE_MS);
  }, [location.pathname, location.search, location.hash]);

  // Restore scroll position smoothly
  const restoreScrollPosition = useCallback(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const state: ScrollState = JSON.parse(stored);
      const currentPath = location.pathname + location.search + location.hash;

      // Only restore if we're on the same path
      if (state.path === currentPath && state.scrollY > 0) {
        isRestoringRef.current = true;
        
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo({
              top: state.scrollY,
              behavior: 'instant'
            });
            
            // Reset restoring flag after a short delay
            setTimeout(() => {
              isRestoringRef.current = false;
            }, 50);
          });
        });
      }
    } catch (e) {
      // Ignore parse errors
    }
  }, [location.pathname, location.search, location.hash]);

  // Handle visibility change (tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Save immediately when leaving
        const state: ScrollState = {
          path: location.pathname + location.search + location.hash,
          scrollY: window.scrollY,
          timestamp: Date.now(),
        };
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
          // Ignore storage errors
        }
      } else if (document.visibilityState === 'visible') {
        // Restore when coming back
        restoreScrollPosition();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [location.pathname, location.search, location.hash, restoreScrollPosition]);

  // Handle window focus/blur
  useEffect(() => {
    const handleBlur = () => {
      const state: ScrollState = {
        path: location.pathname + location.search + location.hash,
        scrollY: window.scrollY,
        timestamp: Date.now(),
      };
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        // Ignore storage errors
      }
    };

    const handleFocus = () => {
      restoreScrollPosition();
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [location.pathname, location.search, location.hash, restoreScrollPosition]);

  // Save on scroll
  useEffect(() => {
    window.addEventListener('scroll', saveScrollPosition, { passive: true });
    return () => window.removeEventListener('scroll', saveScrollPosition);
  }, [saveScrollPosition]);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const state: ScrollState = {
        path: location.pathname + location.search + location.hash,
        scrollY: window.scrollY,
        timestamp: Date.now(),
      };
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        // Ignore storage errors
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [location.pathname, location.search, location.hash]);

  // Restore on initial mount and route changes
  useEffect(() => {
    restoreScrollPosition();
  }, [restoreScrollPosition]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
};

export default useScrollPersistence;
