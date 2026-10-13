"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Eye,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Trash2,
  TrendingUp,
  Image as ImageIcon,
} from "lucide-react";
import {
  MemoryItem,
  PLATFORMS_CONFIG,
  useMemoryStore,
} from "@/stores/memory-store";
import { useUiStore } from "@/stores/ui-store";
import { useChatStore } from "@/stores/chat-store";

interface MemoryCardProps {
  memory: MemoryItem;
  onSelect: (memory: MemoryItem) => void;
  isSelected?: boolean;
}

export default function MemoryCard({
  memory,
  onSelect,
  isSelected = false,
}: MemoryCardProps) {
  const deleteMemory = useMemoryStore((state) => state.deleteMemory);
  const toast = useUiStore((state) => state.toast);
  const setNav = useUiStore((state) => state.setNav);
  const setInputValue = useChatStore((state) => state.setInputValue);

  const [copied, setCopied] = useState(false);

  const platformInfo = PLATFORMS_CONFIG[memory.platform];

  const handleCopySlug = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(memory.slug);
    setCopied(true);
    toast(`Copied ${memory.slug} to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestInChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue(
      `hey /post-${Date.now().toString().slice(-4)} create 3 variation based on ${memory.slug}`
    );
    setNav("chat");
    toast(`Loaded ${memory.slug} into AI Chat`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMemory(memory.id);
    toast("Memory item removed");
  };

  return (
    <div
      onClick={() => onSelect(memory)}
      className={`group relative flex flex-col justify-between rounded-xl border bg-white p-5 transition-all duration-200 cursor-pointer ${
        isSelected
          ? "border-slate-800 ring-1 ring-slate-800 shadow-xs"
          : "border-slate-200 hover:border-slate-400 hover:shadow-xs"
      }`}
    >
      <div>
        {/* Header badges: Slug + Platform */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            type="button"
            onClick={handleCopySlug}
            title="Click to copy slug for chat"
            className="flex items-center gap-1.5 rounded-md bg-slate-100 hover:bg-slate-200/80 px-2 py-0.8 text-[11px] font-mono font-medium text-slate-700 hover:text-slate-900 transition-colors border border-slate-200"
          >
            <span className="truncate max-w-[170px]">{memory.slug}</span>
            {copied ? (
              <Check className="size-3 text-emerald-600" />
            ) : (
              <Copy className="size-3 text-slate-400" />
            )}
          </button>

          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-tight border ${platformInfo.badgeColor}`}
          >
            {platformInfo.name}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
          {memory.title}
        </h4>

        {/* Snippet of original post */}
        <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed whitespace-pre-line font-normal">
          {memory.originalContent}
        </p>

        {/* Attached Photo Asset Preview */}
        {memory.photos && memory.photos.length > 0 && (
          <div className="mt-3 relative h-28 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
            <img
              src={memory.photos[0]}
              alt={memory.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
            />
            <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-black/60 backdrop-blur-xs text-white text-[10px] px-1.5 py-0.5 rounded-md font-medium">
              <ImageIcon className="size-3" />
              <span>Learned Visual Asset</span>
            </div>
          </div>
        )}

        {/* AI Learning Pill */}
        <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 p-2 text-[11px] text-slate-700">
          <div className="flex items-center gap-1 font-medium text-slate-600 mb-0.5 text-[10.5px]">
            <Sparkles className="size-3 text-slate-500" />
            <span>Learned Formula:</span>
          </div>
          <p className="line-clamp-1 text-slate-800 font-mono text-[10.5px]">
            {memory.aiLearnings.hookFormula}
          </p>
        </div>
      </div>

      {/* Footer Metrics & Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
          <span title="Estimated Views">👁️ {memory.metrics.views}</span>
          <span title="Likes">❤️ {memory.metrics.likes}</span>
          <span title="CTR Delivery" className="text-slate-700 font-semibold">
            {memory.metrics.ctr}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleTestInChat}
            title="Use this memory in AI Chat to generate 3 variations"
            className="flex items-center gap-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 text-xs font-medium shadow-2xs transition-colors"
          >
            <MessageSquare className="size-3" />
            <span>Use in Chat</span>
          </button>

          <button
            type="button"
            onClick={handleDelete}
            title="Delete memory"
            className="rounded-lg p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
