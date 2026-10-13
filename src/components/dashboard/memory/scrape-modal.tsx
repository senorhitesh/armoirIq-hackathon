"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  Link2,
  FileText,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  Zap,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import {
  PLATFORMS_CONFIG,
  PlatformKey,
  useMemoryStore,
} from "@/stores/memory-store";

interface ScrapeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlatform?: PlatformKey;
  defaultFolder?: string;
}

export default function ScrapeModal({
  isOpen,
  onClose,
  defaultPlatform = "x",
  defaultFolder,
}: ScrapeModalProps) {
  const scrapeAndLearn = useMemoryStore((state) => state.scrapeAndLearn);
  const isScraping = useMemoryStore((state) => state.isScraping);
  const scrapeStatus = useMemoryStore((state) => state.scrapeStatusMessage);

  const [platform, setPlatform] = useState<PlatformKey>(defaultPlatform);
  const [folder, setFolder] = useState<string>(
    defaultFolder || PLATFORMS_CONFIG[defaultPlatform].folders[0].id
  );
  const [url, setUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [title, setTitle] = useState("");

  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [fetchSuccess, setFetchSuccess] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentFolders = PLATFORMS_CONFIG[platform].folders;

  // Auto-detect platform from URL
  const detectPlatform = (targetUrl: string): PlatformKey | null => {
    const lower = targetUrl.toLowerCase();
    if (lower.includes("x.com") || lower.includes("twitter.com")) return "x";
    if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";
    if (lower.includes("linkedin.com")) return "linkedin";
    if (lower.includes("instagram.com")) return "instagram";
    return null;
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    setFetchSuccess(false);
    setFetchError(null);
    const detected = detectPlatform(newUrl);
    if (detected && detected !== platform) {
      setPlatform(detected);
      setFolder(PLATFORMS_CONFIG[detected].folders[0].id);
    }
  };

  // Live direct fetch from URL
  const handleFetchLivePost = async () => {
    if (!url.trim()) return;
    setIsFetchingUrl(true);
    setFetchError(null);
    setFetchSuccess(false);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), platform }),
      });

      if (!res.ok) {
        throw new Error(`Scraper returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.scraped) {
        if (data.scraped.title) setTitle(data.scraped.title);
        if (data.scraped.content) setRawText(data.scraped.content);
        if (data.scraped.photos && data.scraped.photos.length > 0) {
          setPhotoUrl(data.scraped.photos[0]);
        }
        setFetchSuccess(true);
      } else {
        throw new Error(data.error || "Could not parse post data");
      }
    } catch (err: any) {
      console.error("Live scraper fetch error:", err);
      setFetchError(err.message || "Failed to scrape post");
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rawText.trim() && !url.trim()) return;

    await scrapeAndLearn({
      url: url.trim(),
      rawText: rawText.trim(),
      platform,
      folder,
      photoUrl: photoUrl.trim() || undefined,
      title: title.trim() || undefined,
    });

    onClose();
  };

  const handleQuickFill = (
    sampleUrl: string,
    sampleTitle: string,
    sampleText: string,
    samplePlatform: PlatformKey,
    sampleFolder: string,
    samplePhoto: string
  ) => {
    setUrl(sampleUrl);
    setTitle(sampleTitle);
    setRawText(sampleText);
    setPlatform(samplePlatform);
    setFolder(sampleFolder);
    setPhotoUrl(samplePhoto);
    setFetchSuccess(true);
    setFetchError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl border border-slate-200 transition-all max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-2xs">
              <Zap className="size-4.5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Scrape & Learn Viral Post
              </h3>
              <p className="text-xs text-slate-500">
                Real-time scraping across 𝕏, LinkedIn, YouTube, Instagram, and web links
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleScrape} className="mt-4 space-y-4">
          {/* Quick 1-click Test Presets */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Test with Live Verified URLs:</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Instant Ingestion</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setUrl("https://x.com/Twitter/status/20");
                  setPlatform("x");
                  setFolder("viral-threads");
                  handleUrlChange("https://x.com/Twitter/status/20");
                }}
                className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                𝕏 Live Post (Jack #20)
              </button>
              <button
                type="button"
                onClick={() => {
                  setUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
                  setPlatform("youtube");
                  setFolder("hook-openers");
                  handleUrlChange("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
                }}
                className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                ▶ YouTube Video
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickFill(
                    "https://www.linkedin.com/pulse/growth-playbook-2026",
                    "The $0 Ad Spend Scale Playbook",
                    "We just crossed $1,000,000 ARR in 90 days.\nTotal ad spend? $0.\n\nMost founders believe you need a $50k/mo ad budget to scale.\nHere is the exact 3-step playbook we used instead:\n\n1. Stop building in stealth. We documented every engineering commit.\n2. Built in public with automated AI agent loops.\n3. Turned customer bug reports into public product improvements.\n\nThe algorithm doesn't reward ad spend. It rewards momentum.\n\nDrop a comment and I'll send you our raw Notion operating system.",
                    "linkedin",
                    "case-studies",
                    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80"
                  )
                }
                className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                💼 LinkedIn Playbook
              </button>
            </div>
          </div>

          {/* Platform & Folder Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Platform
              </label>
              <select
                value={platform}
                onChange={(e) => {
                  const p = e.target.value as PlatformKey;
                  setPlatform(p);
                  setFolder(PLATFORMS_CONFIG[p].folders[0].id);
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-200"
              >
                {(Object.keys(PLATFORMS_CONFIG) as PlatformKey[]).map((key) => (
                  <option key={key} value={key}>
                    {PLATFORMS_CONFIG[key].name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Memory Folder
              </label>
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-200"
              >
                {currentFolders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Post URL Input with Live Fetch Action */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Link2 className="size-3.5 text-slate-400" />
                Live Post URL
              </label>
              {fetchSuccess && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                  <CheckCircle2 className="size-3.5" />
                  Live data fetched
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://x.com/username/status/... or YouTube / LinkedIn URL"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-200 font-mono"
              />
              <button
                type="button"
                onClick={handleFetchLivePost}
                disabled={!url.trim() || isFetchingUrl || isScraping}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-40 transition-all shrink-0 cursor-pointer shadow-2xs"
              >
                {isFetchingUrl ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Scraping...</span>
                  </>
                ) : (
                  <>
                    <Zap className="size-3.5" />
                    <span>Fetch Live</span>
                  </>
                )}
              </button>
            </div>
            {fetchError && (
              <p className="mt-1 text-[11px] text-rose-500 font-medium">
                {fetchError} (You can still enter text manually below or click Learn to retry)
              </p>
            )}
          </div>

          {/* Memory Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Memory Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The $0 Ad Spend Scale Playbook"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-200"
            />
          </div>

          {/* Raw Text / Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="size-3.5 text-slate-400" />
              Post Content & Copy
            </label>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste content here or click 'Fetch Live' above to auto-extract from URL..."
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-200 leading-relaxed font-sans"
            />
          </div>

          {/* Photo / Asset URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <ImageIcon className="size-3.5 text-slate-400" />
              Attached Photo / Screenshot Asset URL (AI learns visual style)
            </label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or scraped image asset URL"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-200 font-mono"
            />
            {photoUrl && (
              <div className="mt-2 h-20 w-32 rounded-lg overflow-hidden border border-slate-200 relative group bg-slate-100">
                <img
                  src={photoUrl}
                  alt="Asset Preview"
                  className="h-full w-full object-cover"
                  onError={() => setPhotoUrl("")}
                />
              </div>
            )}
          </div>

          {/* Progress state */}
          {isScraping && (
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 flex items-center gap-3 animate-pulse">
              <Loader2 className="size-4 animate-spin text-slate-700 shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-slate-900">AI Ingestion in Progress...</p>
                <p className="text-slate-600">{scrapeStatus}</p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isScraping || isFetchingUrl}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isScraping || isFetchingUrl || (!rawText.trim() && !url.trim())}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-medium text-white shadow-2xs hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Sparkles className="size-3.5 text-slate-300" />
              <span>Learn & Ingest to Memory</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
