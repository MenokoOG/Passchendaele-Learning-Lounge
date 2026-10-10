// src/components/Icons.tsx
// Lucide-style inline SVG icons. The design brief bans emojis as icons.
import React from "react";

type IconProps = { size?: number; className?: string; title?: string };

function base(
  { size = 20, className, title }: IconProps,
  children: React.ReactNode
) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {children}
    </svg>
  );
}

export const IconBook = (p: IconProps) =>
  base(
    p,
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
      <path d="M4 5.5v16" />
      <path d="M9 8h7" />
    </>
  );

export const IconArchive = (p: IconProps) =>
  base(
    p,
    <>
      <rect x="3" y="4" width="18" height="5" rx="1" />
      <path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" />
      <path d="M10 13h4" />
    </>
  );

export const IconGlobe = (p: IconProps) =>
  base(
    p,
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18" />
    </>
  );

export const IconEye = (p: IconProps) =>
  base(
    p,
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  );

export const IconFilm = (p: IconProps) =>
  base(
    p,
    <>
      <rect x="3" y="4" width="18" height="16" rx="1" />
      <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" />
    </>
  );

export const IconNote = (p: IconProps) =>
  base(
    p,
    <>
      <path d="M5 3h10l4 4v14H5z" />
      <path d="M14 3v5h5M8 13h8M8 17h5" />
    </>
  );

export const IconBoard = (p: IconProps) =>
  base(
    p,
    <>
      <rect x="3" y="4" width="5" height="16" rx="1" />
      <rect x="10" y="4" width="5" height="10" rx="1" />
      <rect x="17" y="4" width="4" height="13" rx="1" />
    </>
  );

export const IconCalendar = (p: IconProps) =>
  base(
    p,
    <>
      <rect x="3" y="5" width="18" height="16" rx="1" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  );

export const IconFolder = (p: IconProps) =>
  base(p, <path d="M3 6a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />);

export const IconChart = (p: IconProps) =>
  base(p, <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />);

export const IconLock = (p: IconProps) =>
  base(
    p,
    <>
      <rect x="5" y="11" width="14" height="10" rx="1" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  );

export const IconArrowRight = (p: IconProps) =>
  base(p, <path d="M5 12h14M13 6l6 6-6 6" />);

export const IconCheck = (p: IconProps) => base(p, <path d="M5 12.5l4.5 4.5L19 7" />);

export const IconExternal = (p: IconProps) =>
  base(p, <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />);

export const IconGithub = (p: IconProps) =>
  base(
    p,
    <path d="M9 19c-4 1.3-4-2-6-2.5m12 4.5v-3.2a2.8 2.8 0 0 0-.8-2.2c2.700-.3 5.500-1.300 5.500-6a4.600 4.600 0 0 0-1.300-3.200 4.300 4.300 0 0 0-.1-3.200s-1-.3-3.400 1.300a11.600 11.600 0 0 0-6 0C6.500 2.700 5.500 3 5.500 3a4.300 4.300 0 0 0-.1 3.200A4.600 4.600 0 0 0 4 9.500c0 4.600 2.800 5.700 5.500 6a2.800 2.800 0 0 0-.8 2.200V21" />
  );

export const IconMenu = (p: IconProps) => base(p, <path d="M4 7h16M4 12h16M4 17h16" />);
export const IconClose = (p: IconProps) => base(p, <path d="M6 6l12 12M18 6L6 18" />);
