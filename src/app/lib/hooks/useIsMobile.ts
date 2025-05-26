"use client";

import { useEffect, useState } from 'react';

// Tailwind breakpoints
const MOBILE_MAX = 767; // < md
const TABLET_MIN = 768; // >= md
const TABLET_MAX = 1023; // < lg
const DESKTOP_MIN = 1024; // >= lg

export function useIsMobile() {
  const [device, setDevice] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    function checkDevice() {
      const width = window.innerWidth;
      setDevice({
        isMobile: width < TABLET_MIN,
        isTablet: width >= TABLET_MIN && width < DESKTOP_MIN,
        isDesktop: width >= DESKTOP_MIN,
      });
    }
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return device;
} 