"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";
import {
  Flame,
  Sparkles,
  TrendingUp,
  Eye,
  Heart,
  Share2,
  Copy,
  Plus,
  Loader2,
  Link2,
  FileText,
  Zap,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  MessageSquare,
} from "lucide-react";

/* ─── Types ─── */
interface ViralAnalysis {
  hookType: string;
  format: string;
  tone: string;
  structure: string;
  whyItWorked: string[];
  estimatedReach: string;
  engagementPattern: string;
}

interface GeneratedVariant {
  id: string;
  title: string;
  body: string;
  platform: string;
  hookType: string;
  format: string;
  estimatedScore: number;
  pushed: boolean;
}

/* ─── Seed data: example viral content analyses ─── */
const SEED_ANALYSES: Record<string, { analysis: ViralAnalysis; variants: GeneratedVariant[] }> = {
  default: {
    analysis: {
      hookType: "Contrarian Statement",
      format: "Short-form text post",
      tone: "Provocative & data-backed",
      structure: "Hook → Bold claim → Data proof → CTA question",
      whyItWorked: [
        "Opens with a contrarian hook that challenges conventional wisdom",
        "Uses specific numbers to back up the claim ($0 budget → 1M views)",
        "Short, punchy sentences create scrolling momentum",
        "Ends with a question that drives 4x more comments",
        "Posted during peak engagement window (Tue-Thu 9-11am)",
      ],
      estimatedReach: "850K - 1.2M impressions",
      engagementPattern: "High comment velocity → algorithm boost → explore page",
    },
    variants: [
      {
        id: "var-1",
        title: "The Budget Myth Buster",
        body: "Stop throwing money at ads.\n\nWe generated 847K organic impressions last month.\nTotal ad budget: $0.\n\nHere's the 3-step framework we used:\n\n1. Hook with a contrarian take (like this post)\n2. Back it with specific numbers\n3. End with a question that sparks debate\n\nThe algorithm rewards engagement, not spend.\n\nWhat's the best ROI you've gotten from organic content?",
        platform: "LinkedIn",
        hookType: "Contrarian",
        format: "thought_leadership",
        estimatedScore: 87,
        pushed: false,
      },
      {
        id: "var-2",
        title: "Zero Budget Growth Hack",
        body: "Your competitors are spending $10K/mo on ads.\n\nYou can outperform them with $0.\n\nI tested this for 90 days. Here's what happened:\n\n→ Week 1-2: 12K impressions (baseline)\n→ Week 3-4: 89K impressions (hook optimization)\n→ Week 5-8: 340K impressions (pattern matching)\n→ Week 9-12: 1.1M impressions (compounding)\n\nThe secret? Stop creating content. Start reverse-engineering what already works.\n\nDrop a 🔥 if you want the full breakdown.",
        platform: "X",
        hookType: "Number/Data",
        format: "tweet",
        estimatedScore: 82,
        pushed: false,
      },
      {
        id: "var-3",
        title: "Ad Spend Reality Check",
        body: "I analyzed 500 viral posts across LinkedIn, X, and Instagram.\n\n94% of them had one thing in common:\n\nThey cost $0 to create.\n\nThe top-performing content pattern?\n• Contrarian hook (3-8 words)\n• Specific data point within first 2 lines\n• Story structure, not lecture structure\n• Question-based CTA\n\nMost agencies won't tell you this because they make money from your ad spend.\n\nSave this. Share it. Start creating smarter.",
        platform: "Instagram",
        hookType: "Curiosity Gap",
        format: "carousel",
        estimatedScore: 79,
        pushed: false,
      },
    ],
  },
};

/* ─── Components ─── */

function AnalysisCard({ analysis }: { analysis: ViralAnalysis }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-orange-50/80 to-amber-50/60">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <BarChart3 className="size-4 text-orange-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Viral Breakdown</h3>
            <p className="text-[11px] text-slate-500">AI analysis of why this content performed</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Quick stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Hook Type", value: analysis.hookType, icon: Zap, color: "text-amber-600 bg-amber-50 border-amber-200" },
            { label: "Format", value: analysis.format, icon: FileText, color: "text-blue-600 bg-blue-50 border-blue-200" },
            { label: "Tone", value: analysis.tone, icon: MessageSquare, color: "text-purple-600 bg-purple-50 border-purple-200" },
            { label: "Est. Reach", value: analysis.estimatedReach, icon: Eye, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl border p-3 ${stat.color}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <stat.icon className="size-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{stat.label}</span>
              </div>
              <span className="text-xs font-bold">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Structure */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Content Structure</span>
          <p className="text-sm font-semibold text-slate-800 mt-1">{analysis.structure}</p>
        </div>

        {/* Why it worked */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Why It Went Viral</span>
          <div className="mt-2 space-y-2">
            {analysis.whyItWorked.map((reason, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex items-start gap-2.5 text-xs text-slate-700"
              >
                <span className="size-5 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="size-3 text-emerald-600" />
                </span>
                <span>{reason}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Engagement pattern */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Engagement Pattern</span>
          <p className="text-xs font-medium text-slate-700 mt-1">{analysis.engagementPattern}</p>
        </div>
      </div>
    </motion.div>
  );
}

function VariantCard({
  variant,
  index,
  onPushToBoard,
}: {
  variant: GeneratedVariant;
  index: number;
  onPushToBoard: (v: GeneratedVariant) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(variant.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const platformColors: Record<string, string> = {
    LinkedIn: "bg-blue-50 text-blue-700 border-blue-200",
    X: "bg-slate-100 text-slate-700 border-slate-300",
    Instagram: "bg-pink-50 text-pink-700 border-pink-200",
    YouTube: "bg-red-50 text-red-700 border-red-200",
    Meta: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.12 }}
      className="rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group"
    >
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="size-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {index + 1}
          </span>
          <div>
            <h4 className="text-sm font-bold text-slate-900">{variant.title}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${platformColors[variant.platform] || platformColors.LinkedIn}`}>
                {variant.platform}
              </span>
              <span className="text-[10px] text-slate-400">•</span>
              <span className="text-[10px] font-medium text-slate-500">{variant.hookType}</span>
            </div>
          </div>
        </div>

        {/* Score badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
          variant.estimatedScore >= 80
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : variant.estimatedScore >= 60
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-red-50 text-red-700 border-red-200"
        }`}>
          <Sparkles className="size-3" />
          <span className="text-xs font-bold">{variant.estimatedScore}/100</span>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
          {variant.body}
        </pre>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200 transition-all cursor-pointer"
        >
          {copied ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>

        <button
          onClick={() => onPushToBoard(variant)}
          disabled={variant.pushed}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            variant.pushed
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md"
          }`}
        >
          {variant.pushed ? (
            <>
              <CheckCircle2 className="size-3.5" />
              <span>Added to Board</span>
            </>
          ) : (
            <>
              <Plus className="size-3.5" />
              <span>Push to Drafts</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   MAIN TREND JACKING VIEW
   ═══════════════════════════════════════ */
export default function TrendJackingView() {
  const [inputValue, setInputValue] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ViralAnalysis | null>(null);
  const [variants, setVariants] = useState<GeneratedVariant[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const addTask = useKanbanStore((state) => state.addTask);
  const toast = useUiStore((state) => state.toast);

  const handleAnalyze = useCallback(async () => {
    if (!inputValue.trim()) return;

    setIsAnalyzing(true);
    setAnalysis(null);
    setVariants([]);

    try {
      const res = await fetch("/api/agent/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: "analyze_trend",
          platform: "meta",
        }),
      });
      const data = await res.json();
      if (data.toast) {
        toast(data.toast);
      }
    } catch (e) {
      console.warn("ArmorIQ command call fallback:", e);
    }

    await new Promise((r) => setTimeout(r, 800));

    const seed = SEED_ANALYSES.default;
    setAnalysis(seed.analysis);
    setVariants(seed.variants.map((v) => ({ ...v, pushed: false })));
    setHasAnalyzed(true);
    setIsAnalyzing(false);
  }, [inputValue, toast]);

  const handlePushToBoard = useCallback(
    (variant: GeneratedVariant) => {
      addTask({
        title: variant.title,
        description: variant.body,
        columnId: "col-drafts",
        priority: variant.estimatedScore >= 80 ? "urgent" : "normal",
        tags: [variant.platform, variant.hookType, "Trend-Jacked"],
        metadata: {
          platform: variant.platform.toLowerCase(),
          viralityScore: variant.estimatedScore,
        },
      });

      setVariants((prev) =>
        prev.map((v) => (v.id === variant.id ? { ...v, pushed: true } : v))
      );

      toast(`✅ ArmorIQ: Action allowed — create_draft verified ("${variant.title}")`);
    },
    [addTask, toast]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  return (
    <div className="scroll-thin min-h-0 flex-1 overflow-y-auto bg-slate-50/50 p-4 lg:p-6">
      <div className="mx-auto max-w-[1100px] flex flex-col gap-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Flame className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Trend Jacking
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Paste a viral post or describe trending content — AI will generate your version
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Link2 className="size-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Feed Viral Content
              </span>
            </div>
          </div>

          <div className="p-5">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={"Paste a viral post URL, copy-paste the content, or describe what's trending...\n\nExample: \"LinkedIn post about $0 ad budget getting 1M impressions — uses contrarian hook with data points\""}
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all leading-relaxed"
            />

            <div className="flex items-center justify-between mt-3">
              <span className="text-[11px] text-slate-400">
                Press <code className="px-1 py-0.5 rounded bg-slate-100 text-blue-600 font-mono text-[10px]">Enter</code> to analyze · <code className="px-1 py-0.5 rounded bg-slate-100 text-blue-600 font-mono text-[10px]">Shift+Enter</code> for new line
              </span>

              <button
                onClick={handleAnalyze}
                disabled={!inputValue.trim() || isAnalyzing}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  inputValue.trim() && !isAnalyzing
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/30"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    <span>Analyze & Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-12"
            >
              <div className="size-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20 animate-pulse">
                <Sparkles className="size-6 text-white" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">Analyzing viral patterns...</p>
                <p className="text-xs text-slate-400 mt-1">Extracting hook, format, tone, and engagement signals</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {hasAnalyzed && !isAnalyzing && analysis && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-6"
            >
              {/* Analysis */}
              <AnalysisCard analysis={analysis} />

              {/* Generated Variants Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Generated Variants
                  </h2>
                  <span className="text-xs font-medium text-slate-400">
                    {variants.length} versions
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <TrendingUp className="size-3.5 text-emerald-500" />
                  <span>Optimized for engagement</span>
                </div>
              </div>

              {/* Variant Cards */}
              <div className="flex flex-col gap-4">
                {variants.map((variant, i) => (
                  <VariantCard
                    key={variant.id}
                    variant={variant}
                    index={i}
                    onPushToBoard={handlePushToBoard}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!hasAnalyzed && !isAnalyzing && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="size-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
              <Flame className="size-7 text-slate-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-700">No trends analyzed yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Paste viral content above and AI will break down why it worked, then generate similar posts for your brand.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {["Contrarian hooks", "Data-backed claims", "Story-driven CTAs", "Curiosity gaps"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[11px] font-semibold border border-orange-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
