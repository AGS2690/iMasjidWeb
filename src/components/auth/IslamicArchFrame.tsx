import React from 'react';

interface IslamicArchFrameProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * IslamicArchFrame — Sample B Architectural Motif
 * Renders an ornamental Islamic pointed archway with corner arabesques,
 * dual-tone gold/teal strokes, and an ambient luminous halo behind the logo.
 */
export const IslamicArchFrame: React.FC<IslamicArchFrameProps> = ({ className, style }) => {
  return (
    <svg
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        ...style,
      }}
      viewBox="0 0 360 430"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Ambient Halo Behind Golden Dome Logo */}
        <radialGradient id="archHalo" cx="50%" cy="30%" r="35%">
          <stop offset="0%" stopColor="#f3ca65" stopOpacity="0.28" />
          <stop offset="35%" stopColor="#00a3c4" stopOpacity="0.2" />
          <stop offset="70%" stopColor="#006e8c" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#006e8c" stopOpacity="0" />
        </radialGradient>

        {/* Gold Metallic Stroke Gradient */}
        <linearGradient id="goldStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b88e40" stopOpacity="0.3" />
          <stop offset="30%" stopColor="#f0cf7e" stopOpacity="0.75" />
          <stop offset="50%" stopColor="#b88e40" stopOpacity="0.4" />
          <stop offset="75%" stopColor="#f5dd9e" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#8c6827" stopOpacity="0.35" />
        </linearGradient>

        {/* Teal Accent Stroke Gradient */}
        <linearGradient id="tealStroke" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00b4d8" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#006e8c" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#003544" stopOpacity="0.15" />
        </linearGradient>

        {/* Soft Golden Glow Filter */}
        <filter id="goldAura" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Luminous Core Glow Behind Logo */}
      <rect x="0" y="0" width="360" height="430" fill="url(#archHalo)" />

      {/* Outer Border Rim of Left Column */}
      <rect
        x="10"
        y="10"
        width="340"
        height="410"
        rx="16"
        stroke="url(#goldStroke)"
        strokeWidth="1.2"
        strokeOpacity="0.35"
      />
      <rect
        x="14"
        y="14"
        width="332"
        height="402"
        rx="13"
        stroke="url(#tealStroke)"
        strokeWidth="0.8"
        strokeOpacity="0.3"
      />

      {/* TOP-LEFT SPANDREL ARABESQUE ORNAMENT */}
      <g stroke="url(#goldStroke)" strokeWidth="0.9" opacity="0.75" fill="none">
        {/* Corner filigree vines */}
        <path d="M 18 18 C 36 20, 52 32, 60 48 C 50 42, 38 40, 26 44" />
        <path d="M 22 46 C 32 40, 42 46, 40 56 C 36 66, 22 62, 28 50 C 30 45, 38 48, 36 53" />
        <path d="M 18 64 C 28 58, 36 68, 44 76" strokeWidth="0.7" strokeDasharray="2 3" opacity="0.6" />
        <path d="M 64 18 C 58 28, 68 36, 76 44" strokeWidth="0.7" strokeDasharray="2 3" opacity="0.6" />
        {/* 8-pointed Islamic star in corner */}
        <g transform="translate(36, 32) scale(0.65)">
          <rect x="-7" y="-7" width="14" height="14" stroke="url(#goldStroke)" strokeWidth="1" fill="rgba(240, 207, 126, 0.12)" />
          <rect x="-7" y="-7" width="14" height="14" transform="rotate(45)" stroke="url(#goldStroke)" strokeWidth="1" fill="rgba(240, 207, 126, 0.12)" />
          <circle cx="0" cy="0" r="2" fill="#f0cf7e" />
        </g>
      </g>

      {/* TOP-RIGHT SPANDREL ARABESQUE ORNAMENT (Symmetrical Mirror) */}
      <g stroke="url(#goldStroke)" strokeWidth="0.9" opacity="0.75" fill="none" transform="translate(360, 0) scale(-1, 1)">
        {/* Corner filigree vines */}
        <path d="M 18 18 C 36 20, 52 32, 60 48 C 50 42, 38 40, 26 44" />
        <path d="M 22 46 C 32 40, 42 46, 40 56 C 36 66, 22 62, 28 50 C 30 45, 38 48, 36 53" />
        <path d="M 18 64 C 28 58, 36 68, 44 76" strokeWidth="0.7" strokeDasharray="2 3" opacity="0.6" />
        <path d="M 64 18 C 58 28, 68 36, 76 44" strokeWidth="0.7" strokeDasharray="2 3" opacity="0.6" />
        {/* 8-pointed Islamic star in corner */}
        <g transform="translate(36, 32) scale(0.65)">
          <rect x="-7" y="-7" width="14" height="14" stroke="url(#goldStroke)" strokeWidth="1" fill="rgba(240, 207, 126, 0.12)" />
          <rect x="-7" y="-7" width="14" height="14" transform="rotate(45)" stroke="url(#goldStroke)" strokeWidth="1" fill="rgba(240, 207, 126, 0.12)" />
          <circle cx="0" cy="0" r="2" fill="#f0cf7e" />
        </g>
      </g>

      {/* MAIN ISLAMIC KEEL ARCHWAY */}
      {/* Outer Glow Halo Arch */}
      <path
        d="M 28 415 L 28 165 C 28 105, 95 62, 142 36 C 160 26, 174 15, 180 10 C 186 15, 200 26, 218 36 C 265 62, 332 105, 332 165 L 332 415"
        stroke="url(#goldStroke)"
        strokeWidth="2.8"
        strokeOpacity="0.45"
        filter="url(#goldAura)"
      />

      {/* Primary Crisp Gold Keel Arch */}
      <path
        d="M 28 415 L 28 165 C 28 105, 95 62, 142 36 C 160 26, 174 15, 180 10 C 186 15, 200 26, 218 36 C 265 62, 332 105, 332 165 L 332 415"
        stroke="url(#goldStroke)"
        strokeWidth="1.5"
      />

      {/* Inner Dashed Teal Accent Line Arch */}
      <path
        d="M 36 415 L 36 168 C 36 112, 100 72, 145 46 C 162 36, 175 24, 180 18 C 185 24, 198 36, 215 46 C 260 72, 324 112, 324 168 L 324 415"
        stroke="url(#tealStroke)"
        strokeWidth="0.85"
        strokeDasharray="4 2.5"
        strokeOpacity="0.75"
      />

      {/* Third Fine Gold Trim Arch */}
      <path
        d="M 42 415 L 42 172 C 42 120, 104 82, 148 56 C 164 46, 176 34, 180 26 C 184 34, 196 46, 212 56 C 256 82, 318 120, 318 172 L 318 415"
        stroke="url(#goldStroke)"
        strokeWidth="0.65"
        strokeOpacity="0.5"
      />

      {/* ARCH APEX FINIAL (Crescent & Star Motif) */}
      <g transform="translate(180, 8)">
        {/* Crescent */}
        <path
          d="M -3 -11 A 5.5 5.5 0 0 0 3 -3 A 4.2 4.2 0 0 1 -3 -11 Z"
          fill="url(#goldStroke)"
        />
        {/* Top Finial Bead */}
        <circle cx="0" cy="-14" r="1.5" fill="#f0cf7e" />
      </g>
    </svg>
  );
};
