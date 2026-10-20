'use client';

import React from 'react';
import { Platform } from '@/lib/types';
import { Instagram, Youtube } from 'lucide-react';

interface PlatformIconProps {
  platform?: Platform | string;
  className?: string;
}

export default function PlatformIcon({ platform, className = 'w-3.5 h-3.5' }: PlatformIconProps) {
  if (platform === 'TikTok') {
    return (
      <svg
        className={`${className} shrink-0 fill-current text-zinc-900`}
        viewBox="0 0 24 24"
        aria-label="TikTok"
      >
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.93-4.57V8.71a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.93-.14z" />
      </svg>
    );
  }

  if (platform === 'YouTube') {
    return <Youtube className={`${className} text-red-600 shrink-0`} />;
  }

  // Default to Instagram
  return <Instagram className={`${className} text-pink-600 shrink-0`} />;
}
