import { useEffect, useState } from 'react';

export default function useMedia(mediaQueryString, { initialMatches = true } = {}) {
  const [matches, setMatches] = useState(initialMatches);

  useEffect(
    () => {
      const mediaQueryList = window.matchMedia(mediaQueryString); //eslint-disable-line

      setMatches(mediaQueryList.matches);
      mediaQueryList.addListener(handleChange);

      return () => mediaQueryList.removeListener(handleChange);
    },
    [mediaQueryString]
  );

  return matches;

  //

  function handleChange(e) {
    setMatches(e.matches);
  }
}

export const mobile = '(max-width: 767px)';
export const tablet = '(min-width: 768px) and (max-width: 991px)';
export const tabletUp = '(min-width: 768px)';
export const computer = '(min-width: 992px) and (max-width: 1199px)';
export const computerUp = '(min-width: 992px)';
export const large = '(min-width: 1200px) and (max-width: 1919px)';
export const widescreen = '(min-width: 1920px)';
