"use client";

import { useState } from "react";
import {
  Brain,
  Sparkles,
  Plus,
  Search,
  Folder,
  FolderOpen,
  Zap,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  Layers,
} from "lucide-react";
import {
  PLATFORMS_CONFIG,
  PlatformKey,
  useMemoryStore,
  MemoryItem,
} from "@/stores/memory-store";
import MemoryCard from "./memory-card";
import ScrapeModal from "./scrape-modal";
import MemoryDetailModal from "./memory-detail-modal";
import { useUiStore } from "@/stores/ui-store";

export default function AgentMemoryHouseView() {
  const memories = useMemoryStore((state) => state.memories);
  const selectedPlatform = useMemoryStore((state) => state.selectedPlatform);
  const setSelectedPlatform = useMemoryStore((state) => state.setSelectedPlatform);
  const selectedFolderId = useMemoryStore((state) => state.selectedFolderId);
  const setSelectedFolderId = useMemoryStore((state) => state.setSelectedFolderId);
  const searchQuery = useMemoryStore((state) => state.searchQuery);
  const setSearchQuery = useMemoryStore((state) => state.setSearchQuery);
  const setNav = useUiStore((state) => state.setNav);

  const [scrapeModalOpen, setScrapeModalOpen] = useState(false);
  const [scrapeDefaultFolder, setScrapeDefaultFolder] = useState<string | undefined>(undefined);
  const [detailMemory, setDetailMemory] = useState<MemoryItem | null>(null);

  const currentPlatformInfo = PLATFORMS_CONFIG[selectedPlatform] || PLATFORMS_CONFIG.instagram;
  const folders = currentPlatformInfo.folders;

  // Active folder defaults to first folder if none selected
  const activeFolderId = selectedFolderId || folders[0]?.id || "viral-hooks";
  const activeFolder = folders.find((f) => f.id === activeFolderId) || folders[0];

  // Memories in active folder
  const folderMemories = memories.filter(
    (m) => m.platform === selectedPlatform && m.folder === activeFolderId
  );

  // Search filter
  const displayedMemories = folderMemories.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.slug.toLowerCase().includes(q) ||
      m.originalContent.toLowerCase().includes(q)
    );
  });

  const handleOpenScrapeForFolder = (folderId: string) => {
    setScrapeDefaultFolder(folderId);
    setScrapeModalOpen(true);
  };

  return (
    <div className="flex flex-1 overflow-hidden min-h-0 bg-slate-50/50">
      {/* ─────────────────────────────────────────────────────────────
          1. TALL LEFT PANEL (Matches the tall vertical box in sketch)
         ───────────────────────────────────────────────────────────── */}
      <aside className="w-72 shrink-0 border-r border-slate-200 bg-white p-5 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-2xs">
                <Brain className="size-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
                  MemoryHouse
                </h2>
                <span className="text-[11px] text-slate-500 font-medium">
                  Shared Agent Memory
                </span>
              </div>
            </div>

            {/* ArmorIQ Policy status */}
            <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-700">
              <ShieldCheck className="size-3.5 text-slate-600 shrink-0" />
              <span className="truncate font-mono text-[10px]">pol-strat-allow-scrape</span>
              <span className="ml-auto size-1.5 rounded-full bg-emerald-500"></span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="size-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference memories..."
              className="w-full rounded-lg border border-slate-200 bg-white pl-8.5 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-200 shadow-2xs"
            />
          </div>

          {/* Platform Directory & Counts */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Platforms Directory
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {memories.length} Total
              </span>
            </div>

            <div className="space-y-1">
              {(Object.keys(PLATFORMS_CONFIG) as PlatformKey[]).map((pKey) => {
                const p = PLATFORMS_CONFIG[pKey];
                const count = memories.filter((m) => m.platform === pKey).length;
                const isSelected = selectedPlatform === pKey;

                return (
                  <button
                    key={pKey}
                    onClick={() => {
                      setSelectedPlatform(pKey);
                      setSelectedFolderId(PLATFORMS_CONFIG[pKey].folders[0].id);
                    }}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 text-white font-semibold shadow-2xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <span className="capitalize">{p.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shared Memory Syntax Card */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-xs">
              <MessageSquare className="size-3.5 text-slate-600" />
              <span>Shared Memory Syntax</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              In AI Chat, reference any memory blueprint by typing:
            </p>
            <div className="rounded bg-white p-1.5 border border-slate-200 font-mono text-[10px] text-slate-800 break-all select-all">
              /memory-{selectedPlatform}-viral-hook
            </div>
            <button
              onClick={() => setNav("chat")}
              className="w-full flex items-center justify-center gap-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 py-1.5 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
            >
              <span>Test in AI Chat</span>
              <ArrowRight className="size-3 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Primary Scrape CTA */}
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={() => handleOpenScrapeForFolder(activeFolderId)}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-2xs hover:bg-slate-800 transition-all cursor-pointer"
          >
            <Zap className="size-3.5 text-slate-300" />
            <span>Scrape & Ingest Post</span>
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN AREA (To the right of the tall panel)
         ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-y-auto min-w-0 bg-white">
        <div className="p-8 max-w-6xl w-full mx-auto space-y-8">
          {/* Top Bar: Platform Pills (Matches sketch: [instagram] [x] [facebook] ...) */}
          <section>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {(Object.keys(PLATFORMS_CONFIG) as PlatformKey[]).map((pKey) => {
                const p = PLATFORMS_CONFIG[pKey];
                const isSelected = selectedPlatform === pKey;

                // Match sketch: Selected has light blue border accent
                return (
                  <button
                    key={pKey}
                    onClick={() => {
                      setSelectedPlatform(pKey);
                      setSelectedFolderId(PLATFORMS_CONFIG[pKey].folders[0].id);
                    }}
                    className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer capitalize border-2 shadow-2xs ${
                      isSelected
                        ? "border-sky-400 bg-sky-50 text-sky-950 ring-2 ring-sky-100"
                        : "border-slate-800 bg-white text-slate-800 hover:bg-slate-50 hover:border-black"
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Big Folder Cards (Matches sketch: [ viral hooks ] [ viral scripts ] ...) */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Post Type Memory Folders
              </span>
              <span className="text-xs text-slate-500">
                Click a folder card to open its reference memory vault
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {folders.map((folder) => {
                const count = memories.filter(
                  (m) => m.platform === selectedPlatform && m.folder === folder.id
                ).length;
                const isSelected = activeFolderId === folder.id;

                return (
                  <div
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`group relative rounded-2xl border-2 p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[170px] ${
                      isSelected
                        ? "border-slate-900 bg-white shadow-md ring-2 ring-slate-900"
                        : "border-slate-800 bg-slate-100/90 hover:bg-white hover:border-slate-900 hover:shadow-xs"
                    }`}
                  >
                    {/* Top status indicator */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`size-8 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-slate-900 text-white"
                            : "bg-white text-slate-700 border border-slate-300"
                        }`}
                      >
                        {isSelected ? (
                          <FolderOpen className="size-4" />
                        ) : (
                          <Folder className="size-4" />
                        )}
                      </div>

                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-900 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          Active Folder
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-300 px-2 py-0.5 rounded-full">
                          {count} {count === 1 ? "memory" : "memories"}
                        </span>
                      )}
                    </div>

                    {/* Big title in center (matches the sketch hand-drawn typography) */}
                    <div className="my-3">
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight lowercase">
                        {folder.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {folder.description}
                      </p>
                    </div>

                    {/* Bottom CTA hint */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                      <span className="text-slate-500 font-medium">
                        {count} reference {count === 1 ? "memory" : "memories"} ready
                      </span>
                      <span
                        className={`font-semibold transition-colors flex items-center gap-1 ${
                          isSelected
                            ? "text-slate-900"
                            : "text-slate-600 group-hover:text-slate-900"
                        }`}
                      >
                        {isSelected ? "Open Below ↓" : "Select →"}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Add Custom Folder Card */}
              <div
                onClick={() => handleOpenScrapeForFolder(activeFolderId)}
                className="rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 p-6 flex flex-col items-center justify-center text-center hover:border-slate-800 hover:bg-white transition-all cursor-pointer min-h-[170px]"
              >
                <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-2 border border-slate-200">
                  <Plus className="size-5" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">
                  + Scrape New Post
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 max-w-[200px]">
                  Extract viral blueprint into {activeFolder.name}
                </p>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              3. REFERENCE MEMORY VAULT CONTAINER
              (Matches the arrow in sketch: "this will contain all the reference memory can be used")
             ───────────────────────────────────────────────────────────── */}
          <section className="pt-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 capitalize">
                    {activeFolder.name} Reference Memories
                  </h3>
                  <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-xs font-semibold border border-slate-200">
                    {folderMemories.length} {folderMemories.length === 1 ? "Blueprint" : "Blueprints"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reference memories can be used by AI agents or copied via <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono text-[11px]">/memory-...</code> in chat.
                </p>
              </div>

              <button
                onClick={() => handleOpenScrapeForFolder(activeFolderId)}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white shadow-2xs hover:bg-slate-800 transition-all cursor-pointer shrink-0"
              >
                <Zap className="size-3.5 text-slate-300" />
                <span>+ Scrape & Add to {activeFolder.name}</span>
              </button>
            </div>

            {/* Grid of reference memories */}
            {displayedMemories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedMemories.map((mem) => (
                  <MemoryCard
                    key={mem.id}
                    memory={mem}
                    onSelect={(m) => setDetailMemory(m)}
                  />
                ))}

                {/* Quick Scrape / Add Card at end of grid */}
                <div
                  onClick={() => handleOpenScrapeForFolder(activeFolderId)}
                  className="rounded-xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center hover:border-slate-400 hover:bg-slate-50/50 transition-all cursor-pointer min-h-[220px]"
                >
                  <div className="size-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mb-2">
                    <Plus className="size-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Add Another Reference
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-[210px]">
                    Paste an {currentPlatformInfo.name} link or text to learn its viral structure.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
                <div className="size-12 rounded-xl bg-white text-slate-700 flex items-center justify-center mx-auto mb-3 border border-slate-200 shadow-2xs">
                  <Brain className="size-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">
                  No Reference Memories in {activeFolder.name} Yet
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Scrape any live post from {currentPlatformInfo.name} or paste viral copy to extract its hook formula and shared memory slug.
                </p>
                <button
                  onClick={() => handleOpenScrapeForFolder(activeFolderId)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-2xs hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <Zap className="size-3.5 text-slate-300" />
                  <span>Scrape Post for {activeFolder.name}</span>
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Modals */}
      <ScrapeModal
        isOpen={scrapeModalOpen}
        onClose={() => setScrapeModalOpen(false)}
        defaultPlatform={selectedPlatform}
        defaultFolder={scrapeDefaultFolder || activeFolderId}
      />

      <MemoryDetailModal
        memory={detailMemory}
        onClose={() => setDetailMemory(null)}
      />
    </div>
  );
}
