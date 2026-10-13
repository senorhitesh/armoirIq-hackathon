"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Sparkles,
  Copy,
  Check,
  MessageSquare,
  Image as ImageIcon,
  CheckCircle2,
  Share2,
  ExternalLink,
  ShieldCheck,
  Wand2,
  Brain,
  GripHorizontal,
} from "lucide-react";
import { MemoryItem, PLATFORMS_CONFIG } from "@/stores/memory-store";
import { useUiStore } from "@/stores/ui-store";
import { useChatStore } from "@/stores/chat-store";

interface MemoryDetailModalProps {
  memory: MemoryItem | null;
  onClose: () => void;
}

export default function MemoryDetailModal({
  memory,
  onClose,
}: MemoryDetailModalProps) {
  const toast = useUiStore((state) => state.toast);
  const setNav = useUiStore((state) => state.setNav);
  const setInputValue = useChatStore((state) => state.setInputValue);

  const [copiedSlug, setCopiedSlug] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImagePreview, setGeneratedImagePreview] = useState<string | null>(
    null
  );

  // Draggable Modal Offset
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const startMouseRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (memory) {
      setModalPos({ x: 0, y: 0 });
    }
  }, [memory]);

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startMouseRef.current = { x: e.clientX, y: e.clientY };
    startPosRef.current = { ...modalPos };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = moveEvent.clientX - startMouseRef.current.x;
      const dy = moveEvent.clientY - startMouseRef.current.y;
      setModalPos({
        x: startPosRef.current.x + dx,
        y: startPosRef.current.y + dy,
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  if (!memory) return null;

  const platformInfo = PLATFORMS_CONFIG[memory.platform];

  const handleCopySlug = () => {
    navigator.clipboard.writeText(memory.slug);
    setCopiedSlug(true);
    toast(`Copied ${memory.slug}`);
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(memory.originalContent);
    setCopiedContent(true);
    toast("Copied post content");
    setTimeout(() => setCopiedContent(false), 2000);
  };

  const handleGenerateImageCreative = () => {
    setGeneratingImage(true);
    setTimeout(() => {
      setGeneratedImagePreview(
        memory.photos[0] ||
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"
      );
      setGeneratingImage(false);
      toast("Generated image creative from memory blueprint!");
    }, 1200);
  };

  const handleJumpToChat = () => {
    setInputValue(
      `hey /post-${Date.now().toString().slice(-4)} create 3 variation based on ${memory.slug}`
    );
    setNav("chat");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        style={{
          transform: `translate(${modalPos.x}px, ${modalPos.y}px)`,
        }}
        className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl border border-slate-200 transition-shadow max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header (Draggable) */}
        <div
          onMouseDown={handleHeaderMouseDown}
          className="flex items-center justify-between pb-4 border-b border-slate-200 cursor-grab active:cursor-grabbing select-none"
          title="Drag to reposition window"
        >
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-2xs">
              <Brain className="size-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">
                  {memory.title}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium border ${platformInfo.badgeColor}`}
                >
                  {platformInfo.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Slug: <span className="text-slate-800 font-semibold">{memory.slug}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GripHorizontal className="size-4 text-slate-300 hover:text-slate-500 mr-1" />
            <button
              onClick={handleCopySlug}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-mono text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {copiedSlug ? (
                <Check className="size-3 text-emerald-600" />
              ) : (
                <Copy className="size-3 text-slate-400" />
              )}
              <span>Copy Slug</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* 2-Column Content */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Viral Content & Photos */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Original Viral Content
                </span>
                <button
                  onClick={handleCopyContent}
                  className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  {copiedContent ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                  <span>Copy text</span>
                </button>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans max-h-56 overflow-y-auto">
                {memory.originalContent}
              </div>
            </div>

            {/* Photos & Visual Assets */}
            <div>
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <ImageIcon className="size-3.5 text-slate-500" />
                Learned Photo & Visual Assets
              </span>
              {memory.photos && memory.photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {memory.photos.map((url, idx) => (
                    <div
                      key={idx}
                      className="group relative h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-100"
                    >
                      <img
                        src={url}
                        alt={`Asset ${idx + 1}`}
                        className="h-full w-full object-cover transition-transform group-hover:scale-102"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No attached image assets.</p>
              )}
            </div>

            {/* AI Image Prompt Formula */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1">
                  <Wand2 className="size-3 text-slate-500" />
                  AI Image Ad Generation Prompt:
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-mono leading-relaxed">
                "{memory.imagePrompt}"
              </p>
              <button
                type="button"
                onClick={handleGenerateImageCreative}
                disabled={generatingImage}
                className="mt-2.5 w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white py-1.5 text-xs font-medium transition-colors shadow-2xs"
              >
                <Sparkles className="size-3 text-slate-300" />
                <span>{generatingImage ? "Generating Creative..." : "Generate Image Creative"}</span>
              </button>
            </div>
          </div>

          {/* Right Column: AI Learnings & Shared Memory Rules */}
          <div className="space-y-4">
            {/* Metrics */}
            <div className="grid grid-cols-4 gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-center">
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Views</p>
                <p className="text-xs font-semibold text-slate-800">{memory.metrics.views}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Likes</p>
                <p className="text-xs font-semibold text-slate-800">{memory.metrics.likes}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Shares</p>
                <p className="text-xs font-semibold text-slate-800">{memory.metrics.shares}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">CTR</p>
                <p className="text-xs font-semibold text-slate-800">{memory.metrics.ctr}</p>
              </div>
            </div>

            {/* AI Learnings Breakdown */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-slate-500" />
                AI Learning Blueprint
              </h4>

              <div>
                <p className="text-[11px] font-semibold text-slate-700">Hook Formula:</p>
                <p className="text-xs font-mono text-slate-800 bg-white p-2 rounded-lg border border-slate-200 mt-1">
                  {memory.aiLearnings.hookFormula}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-700">Tone & Cadence:</p>
                <p className="text-xs text-slate-600 mt-0.5">{memory.aiLearnings.tone}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-700">Structural Sequence:</p>
                <p className="text-xs text-slate-600 mt-0.5 font-mono text-[11px]">
                  {memory.aiLearnings.structure}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-700 mb-1">Why It Went Viral:</p>
                <ul className="space-y-1">
                  {memory.aiLearnings.whyItWorked.map((reason, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                      <CheckCircle2 className="size-3 text-slate-500 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ArmorIQ Policy Verified */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-600" />
                <span className="font-medium">ArmorIQ Shared Memory Policy:</span>
              </div>
              <code className="text-[10px] font-mono text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                pol-agent-shared-memory (Verified)
              </code>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Type <code className="text-slate-800 font-mono font-semibold bg-slate-100 px-1 py-0.5 rounded border border-slate-200">{memory.slug}</code> in AI Chat to generate variations.
          </p>

          <button
            type="button"
            onClick={handleJumpToChat}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-2xs hover:bg-slate-800 transition-all cursor-pointer"
          >
            <MessageSquare className="size-3.5 text-slate-300" />
            <span>Generate 3 Variations in Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
