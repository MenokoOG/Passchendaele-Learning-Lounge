// src/components/Section.tsx
import React from "react";

export default function Section({
  children,
  className = "",
  "aria-label": ariaLabel,
}: {
  children?: React.ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <section className={`space-y-4 ${className}`} aria-label={ariaLabel}>
      {children}
    </section>
  );
}
