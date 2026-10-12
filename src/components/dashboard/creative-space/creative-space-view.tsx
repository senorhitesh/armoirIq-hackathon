"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";
import {
  Sparkles,
  Layers,
  Pencil,
  Type,
  Copy,
  CheckCircle2,
  Loader2,
  ChevronDown,
  FileText,
  Wand2,
  RotateCcw,
  ArrowRight,
  Lightbulb,
  Plus,
  Eye,
  X,
} from "lucide-react";

/* ─── Types ─── */
interface PostVariant {
  id: string;
  title: string;
  body: string;
  operation: string;
  accepted: boolean;
}

/* ─── AI Operations available ─── */
const AI_OPERATIONS = [
  {
    id: "improve-text",
    label: "Improve Text",
    description: "Enhance clarity, impact, and flow",
    icon: Wand2,
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    id: "rewrite-heading",
    label: "Rewrite Heading",
    description: "Generate stronger, more engaging titles",
    icon: Type,
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  {
    id: "generate-variants",
    label: "Generate Variants",
    description: "Create 3 different versions of this post",
    icon: Copy,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    id: "shorten",
    label: "Shorten & Punch",
    description: "Make it concise and hard-hitting",
    icon: Sparkles,
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    id: "add-hook",
    label: "Add Viral Hook",
    description: "Prepend a scroll-stopping opening line",
    icon: Lightbulb,
    color: "text-rose-600 bg-rose-50 border-rose-200",
  },
];

/* ─── Seed improved content for demo ─── */
function generateSeedVariants(title: string, body: string, operation: string): PostVariant[] {
  const ops: Record<string, PostVariant[]> = {
    "improve-text": [
      {
        id: `var-${Date.now()}-1`,
        title,
        body: `${body}\n\n✨ [AI Improved: Enhanced clarity and engagement hooks. Added data-backed proof points and stronger CTA.]`,
        operation: "Improved Text",
        accepted: false,
      },
    ],
    "rewrite-heading": [
      {
        id: `var-${Date.now()}-1`,
        title: `🔥 ${title} — The Untold Truth`,
        body,
        operation: "Heading Rewrite #1",
        accepted: false,
      },
      {
        id: `var-${Date.now()}-2`,
        title: `Stop Scrolling. ${title.split(" ").slice(0, 4).join(" ")}...`,
        body,
        operation: "Heading Rewrite #2",
        accepted: false,
      },
      {
        id: `var-${Date.now()}-3`,
        title: `Why ${title.split(" ").slice(0, 3).join(" ")} Changes Everything`,
        body,
        operation: "Heading Rewrite #3",
        accepted: false,
      },
    ],
    "generate-variants": [
      {
        id: `var-${Date.now()}-1`,
        title: `${title} (Version A — Contrarian)`,
        body: `Everyone's saying the opposite. Here's why they're wrong.\n\n${body}\n\nSometimes the best strategy is the one nobody's talking about.`,
        operation: "Variant A — Contrarian",
        accepted: false,
      },
      {
        id: `var-${Date.now()}-2`,
        title: `${title} (Version B — Data-Led)`,
        body: `The numbers don't lie:\n\n${body}\n\n📊 Based on analysis of 1,000+ campaigns.`,
        operation: "Variant B — Data-Led",
        accepted: false,
      },
      {
        id: `var-${Date.now()}-3`,
        title: `${title} (Version C — Story)`,
        body: `Last Tuesday, something unexpected happened.\n\n${body}\n\nThis changed how I think about everything.`,
        operation: "Variant C — Story-Driven",
        accepted: false,
      },
    ],
    "shorten": [
      {
        id: `var-${Date.now()}-1`,
        title: title.split(" ").slice(0, 5).join(" "),
        body: body.split("\n").slice(0, 3).join("\n") + "\n\n💥 Drop a 🔥 if this hits different.",
        operation: "Shortened & Punched",
        accepted: false,
      },
    ],
    "add-hook": [
      {
        id: `var-${Date.now()}-1`,
        title,
        body: `This will change how you think about marketing forever.\n\n${body}`,
        operation: "Added Viral Hook #1",
        accepted: false,
      },
      {
        id: `var-${Date.now()}-2`,
        title,
        body: `97% of marketers get this wrong.\n\n${body}`,
        operation: "Added Viral Hook #2",
        accepted: false,
      },
    ],
  };

  return ops[operation] || ops["improve-text"];
}

/* ═══════════════════════════════════════
   MAIN CREATIVE SPACE VIEW
   ═══════════════════════════════════════ */
export default function CreativeSpaceView() {
  const tasks = useKanbanStore((state) => state.tasks);
  const updateTask = useKanbanStore((state) => state.updateTask);
  const addTask = useKanbanStore((state) => state.addTask);
  const columns = useKanbanStore((state) => state.columns);
  const toast = useUiStore((state) => state.toast);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [variants, setVariants] = useState<PostVariant[]>([]);
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  const handleSelectTask = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
    setVariants([]);
    setActiveOperation(null);
    setDropdownOpen(false);
  }, []);

  const handleRunOperation = useCallback(
    async (operationId: string) => {
      if (!selectedTask) return;

      setIsProcessing(true);
      setActiveOperation(operationId);
      setVariants([]);

      // Simulate AI processing (will be replaced with real LLM call)
      await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

      const generated = generateSeedVariants(
        selectedTask.title,
        selectedTask.description || "",
        operationId
      );
      setVariants(generated);
      setIsProcessing(false);
    },
    [selectedTask]
  );

  const handleAcceptVariant = useCallback(
    (variant: PostVariant) => {
      if (!selectedTask) return;

      // Update the original task with the accepted variant
      updateTask(selectedTask.id, {
        title: variant.title,
        description: variant.body,
      });

      setVariants((prev) =>
        prev.map((v) => (v.id === variant.id ? { ...v, accepted: true } : v))
      );

      toast(`Applied "${variant.operation}" to "${selectedTask.title}"`);
    },
    [selectedTask, updateTask, toast]
  );

  const handleSaveAsNew = useCallback(
    (variant: PostVariant) => {
      addTask({
        title: variant.title,
        description: variant.body,
        columnId: "col-drafts",
        priority: "normal",
        tags: ["AI-Variant", variant.operation],
        metadata: {
          platform: (selectedTask?.metadata as any)?.platform || "unknown",
          viralityScore: (selectedTask?.metadata as any)?.viralityScore || 70,
        },
      });

      toast(`Saved "${variant.title}" as a new draft`);
    },
    [addTask, toast, selectedTask]
  );

  return (
    <div className="scroll-thin min-h-0 flex-1 overflow-y-auto bg-slate-50/50 p-4 lg:p-6">
      <div className="mx-auto max-w-[1200px] flex flex-col gap-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Creative Workspace
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Select a post → run AI operations → accept or save as new variant
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Post Selector & AI Operations */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Post Selector Dropdown */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Post
                </span>
              </div>

              <div className="p-3">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-sm text-slate-700 transition-all cursor-pointer"
                >
                  <span className={selectedTask ? "font-semibold text-slate-900" : "text-slate-400"}>
                    {selectedTask ? selectedTask.title : "Choose a post to edit..."}
                  </span>
                  <ChevronDown className={`size-4 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 overflow-hidden"
                    >
                      <div className="max-h-[300px] overflow-y-auto space-y-1 rounded-xl border border-slate-200 bg-white p-1.5">
                        {tasks.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-4">
                            No posts yet. Create one via AI Chat.
                          </p>
                        ) : (
                          tasks.map((task) => {
                            const col = columns.find((c) => c.id === task.columnId);
                            return (
                              <button
                                key={task.id}
                                onClick={() => handleSelectTask(task.id)}
                                className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
                                  selectedTaskId === task.id
                                    ? "bg-blue-50 border border-blue-200"
                                    : "hover:bg-slate-50 border border-transparent"
                                }`}
                              >
                                <FileText className="size-4 text-slate-400 shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <span className="text-xs font-semibold text-slate-900 block truncate">
                                    {task.title}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {col?.title || "Draft"}
                                  </span>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* AI Operations */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
                <Wand2 className="size-3.5 text-blue-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  AI Operations
                </span>
              </div>

              <div className="p-3 space-y-1.5">
                {AI_OPERATIONS.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => handleRunOperation(op.id)}
                    disabled={!selectedTask || isProcessing}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all text-left cursor-pointer ${
                      !selectedTask
                        ? "opacity-40 cursor-not-allowed border-slate-100 bg-slate-50"
                        : activeOperation === op.id && isProcessing
                        ? "border-blue-300 bg-blue-50 shadow-sm"
                        : `border-slate-200 hover:border-slate-300 hover:bg-slate-50 ${op.color.split(" ")[0]}`
                    }`}
                  >
                    <div className={`size-8 rounded-lg flex items-center justify-center border ${op.color}`}>
                      {activeOperation === op.id && isProcessing ? (
                        <Loader2 className="size-3.5 animate-spin text-blue-600" />
                      ) : (
                        <op.icon className="size-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 block">{op.label}</span>
                      <span className="text-[10px] text-slate-500">{op.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tip */}
            <div className="rounded-xl bg-violet-50/80 border border-violet-200 p-3.5">
              <div className="flex items-start gap-2.5">
                <Lightbulb className="size-4 text-violet-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-violet-800">Chat Integration</p>
                  <p className="text-[11px] text-violet-600 mt-0.5 leading-relaxed">
                    You can also use <code className="px-1 py-0.5 rounded bg-violet-100 text-violet-700 font-mono text-[10px]">/post make three variations</code> in the AI Chat to trigger operations from there.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Preview & Variants */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Original Post Preview */}
            {selectedTask ? (
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="size-3.5 text-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Original Post
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedTask.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-slate-900 mb-2">{selectedTask.title}</h3>
                  <pre className="text-sm text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
                    {selectedTask.description || "No content yet. Use AI operations to generate content."}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20">
                <div className="size-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
                  <Layers className="size-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-700">Select a post to start</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Choose a post from the left panel, then run AI operations on it.
                </p>
              </div>
            )}

            {/* Loading */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-blue-50 border border-blue-200"
                >
                  <Loader2 className="size-5 animate-spin text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800">
                      Running AI operation...
                    </p>
                    <p className="text-xs text-blue-600">Generating content variants</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generated Variants */}
            <AnimatePresence>
              {variants.length > 0 && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-blue-600" />
                    <h2 className="text-sm font-bold text-slate-900">
                      AI Results ({variants.length})
                    </h2>
                  </div>

                  {variants.map((variant, i) => (
                    <motion.div
                      key={variant.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`rounded-2xl bg-white border shadow-sm overflow-hidden transition-all ${
                        variant.accepted
                          ? "border-emerald-300 bg-emerald-50/30"
                          : "border-slate-200 hover:shadow-md"
                      }`}
                    >
                      {/* Variant header */}
                      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="size-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                            {i + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-700">{variant.operation}</span>
                          {variant.accepted && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              <CheckCircle2 className="size-3" />
                              Applied
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h4 className="text-sm font-bold text-slate-900 mb-2">{variant.title}</h4>
                        <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
                          {variant.body}
                        </pre>
                      </div>

                      {/* Actions */}
                      {!variant.accepted && (
                        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2">
                          <button
                            onClick={() => handleAcceptVariant(variant)}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="size-3.5" />
                            Apply to Original
                          </button>
                          <button
                            onClick={() => handleSaveAsNew(variant)}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 transition-all cursor-pointer"
                          >
                            <Plus className="size-3.5" />
                            Save as New Draft
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
