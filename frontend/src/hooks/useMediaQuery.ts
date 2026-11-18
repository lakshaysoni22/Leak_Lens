import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const getMatches = (q: string): boolean => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(q).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(() => getMatches(query));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueryList = window.matchMedia(query);
    const updateMatches = () => {
      setMatches(mediaQueryList.matches);
    };

    updateMatches();

    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', updateMatches);
      return () => mediaQueryList.removeEventListener('change', updateMatches);
    } else {
      // Legacy fallback
      const mql = mediaQueryList as MediaQueryList & {
        addListener?: (listener: () => void) => void;
        removeListener?: (listener: () => void) => void;
      };
      if (typeof mql.addListener === 'function') {
        mql.addListener(updateMatches);
        return () => {
          if (typeof mql.removeListener === 'function') {
            mql.removeListener(updateMatches);
          }
        };
      }
    }
  }, [query]);

  return matches;
}

export default useMediaQuery;
