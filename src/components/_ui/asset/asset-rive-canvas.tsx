"use client";

import type { AssetFit } from "./asset-types";

export type AssetRiveCanvasProps = {
  buffer: ArrayBuffer;
  fit?: AssetFit;
  artboard?: string;
  animations?: string | string[];
  stateMachines?: string | string[];
  autoplay?: boolean;
  active?: boolean;
  className?: string;
  onLoad?: () => void;
};

export default function AssetRiveCanvas({ className }: AssetRiveCanvasProps) {
  return <div className={className} />;
}
