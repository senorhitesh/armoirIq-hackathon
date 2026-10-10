"use client";

import { createContext, useContext, type ReactNode } from "react";

export const LIGHTBOX_ITEM_SELECTOR = "a[data-pswp-item]";

export type LightboxContextValue = {
  id: string;
  open: (element: HTMLElement) => void;
  prefetch: () => void;
};

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function useLightboxGallery() {
  return useContext(LightboxContext);
}

export type LightboxGalleryProps = {
  id: string;
  children: ReactNode;
  className?: string;
};

export default function LightboxGallery({ id, children, className }: LightboxGalleryProps) {
  return (
    <LightboxContext.Provider value={{ id, open: () => {}, prefetch: () => {} }}>
      <div className={className}>{children}</div>
    </LightboxContext.Provider>
  );
}
