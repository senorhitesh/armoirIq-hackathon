"use client";

import React, { useRef, useState } from "react";

export type GlideMenuProps = {
  children: React.ReactNode;
  rowSelector?: string;
  highlightClassName?: string;
  className?: string;
};

export default function GlideMenu({
  children,
  rowSelector = "[data-row], [data-menu-row]",
  highlightClassName = "rounded-[7px] bg-hover-2",
  className = "relative flex flex-col",
}: GlideMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ top: number; height: number } | null>(null);
  const [visible, setVisible] = useState(false);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const target = (e.target as Element).closest(rowSelector);
    if (target && containerRef.current.contains(target)) {
      const parentRect = containerRef.current.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      setBox({
        top: rect.top - parentRect.top,
        height: rect.height,
      });
      setVisible(true);
    }
  };

  const handlePointerLeave = () => {
    setVisible(false);
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative ${className}`}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-x-1 z-0 transition-[top,height,opacity] duration-200 ease-out ${highlightClassName}`}
        style={{
          top: box?.top ?? 0,
          height: box?.height ?? 0,
          opacity: visible && box ? 1 : 0,
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
      {children}
    </div>
  );
}
