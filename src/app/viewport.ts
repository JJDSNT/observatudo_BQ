// src/app/viewport.ts
import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
    // PWA específicos
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#00d6d6' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ]
};
