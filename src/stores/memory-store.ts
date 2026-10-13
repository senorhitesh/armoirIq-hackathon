import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PlatformKey = "x" | "linkedin" | "instagram" | "meta" | "youtube";

export interface MemoryLearning {
  hookFormula: string;
  tone: string;
  structure: string;
  whyItWorked: string[];
  imageStyle: string;
  recommendedPrompt: string;
}

export interface MemoryMetrics {
  views: string;
  likes: string;
  shares: string;
  ctr: string;
}

export interface MemoryItem {
  id: string;
  slug: string; // e.g. "/memory-linked-launch-post", "/memory-x-viral-thread"
  platform: PlatformKey;
  folder: string; // e.g. "Launch Posts", "Contrarian Hot Takes"
  title: string;
  originalContent: string;
  sourceUrl?: string;
  photos: string[]; // URLs or visual references
  imagePrompt: string; // The formula AI uses to generate ad creatives
  metrics: MemoryMetrics;
  aiLearnings: MemoryLearning;
  createdAt: string;
}

export interface PlatformFolder {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export const PLATFORMS_CONFIG: Record<
  PlatformKey,
  {
    name: string;
    label: string;
    badgeColor: string;
    folders: PlatformFolder[];
  }
> = {
  instagram: {
    name: "instagram",
    label: "Instagram Growth",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    folders: [
      { id: "viral-hooks", name: "viral hooks", description: "3-second high retention visual & copy hooks" },
      { id: "viral-scripts", name: "viral scripts", description: "Viral Reels, video scripts & story arcs" },
      { id: "viral-carousels", name: "viral carousels", description: "High-save slide breakdowns & swipe decks" },
    ],
  },
  x: {
    name: "x",
    label: "X / Twitter",
    badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
    folders: [
      { id: "viral-hooks", name: "viral hooks", description: "Contrarian 1-liners and pattern interrupt hooks" },
      { id: "viral-scripts", name: "viral scripts", description: "High-retention multi-tweet viral threads" },
      { id: "product-launches", name: "launch posts", description: "Ship announcements and demo drops" },
    ],
  },
  meta: {
    name: "facebook",
    label: "Facebook & Meta Ads",
    badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
    folders: [
      { id: "viral-hooks", name: "viral hooks", description: "Direct response pattern interrupts & stop-scroll hooks" },
      { id: "viral-scripts", name: "viral scripts", description: "Creator UGC problem-agitate-solve ad scripts" },
      { id: "static-creatives", name: "static ads", description: "High-CTR single image creatives" },
    ],
  },
  youtube: {
    name: "youtube",
    label: "YouTube / Shorts",
    badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
    folders: [
      { id: "viral-hooks", name: "viral hooks", description: "First 3-second Shorts & Video opening hooks" },
      { id: "viral-scripts", name: "viral scripts", description: "60-second retention video blueprints" },
      { id: "title-thumbnails", name: "thumbnails & titles", description: "High-CTR title and thumbnail pairings" },
    ],
  },
  linkedin: {
    name: "linkedin",
    label: "LinkedIn B2B",
    badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
    folders: [
      { id: "viral-hooks", name: "viral hooks", description: "B2B first line pattern interrupts and milestone hooks" },
      { id: "viral-scripts", name: "viral scripts", description: "Actionable frameworks and teardown playbooks" },
      { id: "launch-posts", name: "launch posts", description: "Founder ARR milestones and product announcements" },
    ],
  },
};

const INITIAL_MEMORIES: MemoryItem[] = [
  // ─── Instagram Memories ───
  {
    id: "mem-ig-hooks-1",
    slug: "/memory-insta-viral-hook",
    platform: "instagram",
    folder: "viral-hooks",
    title: "The 3-Second Scroll Stopper Formula",
    sourceUrl: "https://instagram.com/reel/viral-hook-blueprint",
    originalContent: `Stop editing your videos for 4 hours.\n\nIf your first 3 seconds don't give an undeniable reason to stay, 90% of people swipe away.\n\nHere are 3 visual pattern interrupts that tripled our retention:\n1. Hold a controversial handwritten note to the camera.\n2. Start with an aggressive counter-intuitive statement.\n3. Show the final transformation in frame 0.0s before explaining how.`,
    photos: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    ],
    imagePrompt: "Close-up cinematic shot of modern creator holding handwritten notepad with bold black marker 'DO NOT SWIPE', high contrast studio rim lighting, clean minimalist aesthetic.",
    metrics: {
      views: "1.24M",
      likes: "48.2K",
      shares: "14.6K",
      ctr: "8.40%",
    },
    aiLearnings: {
      hookFormula: "[Harsh Effort Challenge] + [90% Dropoff Warning] + [3-Part Pattern Interrupt]",
      tone: "Direct, urgent, high authority, mobile-native.",
      structure: "Friction callout → Quantified retention penalty → Actionable 3-point visual triggers.",
      whyItWorked: [
        "Interrupts automatic thumb scrolling within the first 0.8 seconds.",
        "Delivers instant tactical utility with zero corporate fluff.",
      ],
      imageStyle: "Modern minimalist creator studio with high contrast lighting.",
      recommendedPrompt: "Generate 3 variations based on /memory-insta-viral-hook for our video campaign.",
    },
    createdAt: "2026-09-20T10:00:00Z",
  },
  {
    id: "mem-ig-scripts-1",
    slug: "/memory-insta-viral-script",
    platform: "instagram",
    folder: "viral-scripts",
    title: "60-Second Viral Video Story Arc",
    sourceUrl: "https://instagram.com/reel/viral-script-breakdown",
    originalContent: `[Frame 0-3s]: Bold contrarian question: 'Why does every SaaS founder make this $50k ad mistake?'\n[Frame 3-15s]: Aggressive pain point agitation: Show the burning ad spend dashboard.\n[Frame 15-45s]: 3-step proof breakdown: Introduce the autonomous agent workflow.\n[Frame 45-60s]: Call-to-action comment trigger: 'Comment BLUEPRINT and I'll send you our workflow.'`,
    photos: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
    ],
    imagePrompt: "Storyboard breakdown of high-performing video ad: 4 clean panels illustrating hook frame, problem agitation, agent workflow, and comment trigger. Sleek dark mode graphic.",
    metrics: {
      views: "940K",
      likes: "34.1K",
      shares: "12.8K",
      ctr: "7.80%",
    },
    aiLearnings: {
      hookFormula: "[Provocative Question] + [Visual Evidence] + [Step-by-Step Resolution] + [Lead Magnet Trigger]",
      tone: "Fast-paced, magnetic, value-packed.",
      structure: "Hook → Agitation → Workflow Proof → Comment Trigger.",
      whyItWorked: [
        "Pacing cut every 2.2 seconds maintains high dopamine cadence.",
        "Comment-gated CTA drove 3,200+ qualified leads.",
      ],
      imageStyle: "Clean multi-panel storyboard layout with neon timeline markers.",
      recommendedPrompt: "Generate 3 variations based on /memory-insta-viral-script for our demo launch.",
    },
    createdAt: "2026-09-22T14:00:00Z",
  },
  {
    id: "mem-ig-1",
    slug: "/memory-ig-carousel-ad",
    platform: "instagram",
    folder: "viral-carousels",
    title: "5 Copywriting Formulas That Print $10k Days",
    sourceUrl: "https://instagram.com/p/viral-carousel-swipe",
    originalContent: `Slide 1: The 5 Copywriting Blueprints that generated $1.2M last quarter (Swipe →)\nSlide 2: Blueprint 1 - The Before-After-Bridge (The classic that never fails)\nSlide 3: Blueprint 2 - Problem-Agitate-Solve (Double down on the pain)\nSlide 4: Blueprint 3 - The Asymmetric Arbitrage (Why doing nothing is risky)\nSlide 5: Blueprint 4 - The Social Proof Stacking (Let numbers do the talking)\nSlide 6: Blueprint 5 - The Zero-Trust Guarantee (Remove all buyer fear)\nSlide 7: Save this post before your next campaign launch.`,
    photos: [
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
    ],
    imagePrompt: "Multi-slide pastel aesthetic carousel cover, clean cream paper texture with modern serif typography, elegant coral and lavender badges, arrow pointing right 'SWIPE FOR BLUEPRINTS'. High resolution UI layout.",
    metrics: {
      views: "640K",
      likes: "31.2K",
      shares: "18.9K",
      ctr: "7.10%",
    },
    aiLearnings: {
      hookFormula: "[Numbered Asset Promise] + [Financial Outcome] + [Clear Swipe Indicator]",
      tone: "Educational, elite curator, highly visual.",
      structure: "Cover promise → 5 bite-sized slides → Save for later CTA.",
      whyItWorked: [
        "Saves-optimized format: users bookmark for reference.",
        "Visual aesthetic matches modern design standards.",
      ],
      imageStyle: "Cream background with elegant typography and coral accents.",
      recommendedPrompt: "Create 3 variations based on /memory-ig-carousel-ad for our feature highlights.",
    },
    createdAt: "2026-09-24T16:20:00Z",
  },

  // ─── X (Twitter) Memories ───
  {
    id: "mem-x-2",
    slug: "/memory-x-urgency-hook",
    platform: "x",
    folder: "viral-hooks",
    title: "The 3-Second Rule For Modern Founders",
    sourceUrl: "https://x.com/ad_genius/status/189192837",
    originalContent: `If your ad hook doesn't create emotional friction in the first 3 seconds, you are literally donating money to Mark Zuckerberg.\n\nHere is the 3-part formula for zero-cost ad hooks:\n\n• Name the enemy\n• Destroy a false belief\n• Offer the asymmetric upside\n\nStop paying for impressions people don't remember.`,
    photos: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
    ],
    imagePrompt: "Minimalist bold typography card on matte black background with glowing amber digital timer reading '00:03.00', bold serif statement 'Stop Donating to Ad Platforms'. Clean Swiss graphic design.",
    metrics: {
      views: "890K",
      likes: "18.3K",
      shares: "4,200",
      ctr: "4.90%",
    },
    aiLearnings: {
      hookFormula: "[Emotional Friction Warning] + [Financial Loss Threat] + [3-Bullet Rule]",
      tone: "Direct, provocative, protective advisory.",
      structure: "Harsh truth → Practical 3-point rule → Memorable parting punchline.",
      whyItWorked: [
        "Triggers loss aversion immediately ('donating money to Mark Zuckerberg').",
        "Easy to skim in under 5 seconds.",
      ],
      imageStyle: "Swiss graphic design, deep black, bright amber typography.",
      recommendedPrompt: "Create 3 variations of high-urgency hook for an ad campaign.",
    },
    createdAt: "2026-09-22T09:00:00Z",
  },
  {
    id: "mem-x-1",
    slug: "/memory-x-viral-thread",
    platform: "x",
    folder: "viral-scripts",
    title: "Traditional Agencies Are Dead In 2026",
    sourceUrl: "https://x.com/growth_architect/status/1892837482",
    originalContent: `Traditional ad agencies are completely obsolete.\n\nA 4-person startup just outperformed an 80-person agency using 3 autonomous AI agents.\n\nHere is how they replaced a $30,000/month retainer with zero-trust AI agents (bookmark this): 🧵👇\n\n1/ The Strategist Agent crawls live trend APIs in real-time.\n2/ The Creator Agent writes 50 hook variations in 30 seconds.\n3/ The ArmorIQ Guardrail intercepts prompt injections and budget leakage.\n\nThe future belongs to founders running autonomous loops, not bloated agency slide decks.`,
    photos: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    ],
    imagePrompt: "Split screen comparison visual: On left, dusty retro corporate boardroom with slow clocks labeled 'Traditional Agency ($30k/mo)'. On right, ultra-sleek futuristic glowing holographic AI command deck labeled 'Autonomous Agentic Loop ($0)'. High aesthetic octane render.",
    metrics: {
      views: "3.85M",
      likes: "42.1K",
      shares: "11.4K",
      ctr: "6.40%",
    },
    aiLearnings: {
      hookFormula: "[Industry Obituary Claim] + [Unfair David vs Goliath Comparison] + [Bookmark Callout]",
      tone: "Urgent, forward-looking, high energy, sharp brevity.",
      structure: "Shock opening → Proof comparison → Step-by-step thread teaser → Synthesis conclusion.",
      whyItWorked: [
        "Extreme polemic hook instantly stops marketing professionals mid-scroll.",
        "Specific contrast between 4-person team vs 80-person agency creates immense curiosity.",
        "Threads that explain architecture drive massive bookmark rates.",
      ],
      imageStyle: "High contrast visual contrast infographic with neon cyan and deep obsidian tones.",
      recommendedPrompt: "Generate 3 variations based on /memory-x-viral-thread exposing legacy marketing myths.",
    },
    createdAt: "2026-09-20T14:15:00Z",
  },

  // ─── Facebook & Meta Memories ───
  {
    id: "mem-meta-hooks-1",
    slug: "/memory-fb-stop-donating",
    platform: "meta",
    folder: "viral-hooks",
    title: "Stop Donating Money To Ad Networks",
    sourceUrl: "https://meta.com/ads/archive/stop-donating",
    originalContent: `Stop spending $100/day on Facebook ads until you fix this 1 sentence in your creative.\n\nMost ads fail because they describe the product instead of the emotional transformation.\n\nHere's the before/after hook switch that cut our customer acquisition cost by 54% overnight.`,
    photos: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    ],
    imagePrompt: "Bold contrasting graphic showing crossed-out generic ad headline next to green highlighted high-converting emotional hook, clean Swiss typography on matte slate background.",
    metrics: {
      views: "1.15M",
      likes: "19.8K",
      shares: "3,600",
      ctr: "5.40%",
    },
    aiLearnings: {
      hookFormula: "[Immediate Stop Directive] + [Financial Threshold] + [Single Sentence Fix]",
      tone: "Authoritative, cautionary, high-leverage.",
      structure: "Directive → Common error diagnosis → Solution proof.",
      whyItWorked: [
        "Financial consequence framing stops budget managers.",
        "Single-sentence promise implies low effort, high reward.",
      ],
      imageStyle: "Crisp Swiss comparison typography with vibrant green highlights.",
      recommendedPrompt: "Generate 3 variations based on /memory-fb-stop-donating for our retargeting campaign.",
    },
    createdAt: "2026-09-25T11:00:00Z",
  },
  {
    id: "mem-meta-1",
    slug: "/memory-meta-ugc-hook",
    platform: "meta",
    folder: "viral-scripts",
    title: "Why I Fired My Agency And Switched To AdLoop",
    sourceUrl: "https://meta.com/ads/archive/ugc-high-ctr",
    originalContent: `Stop scrolling if you spend more than $5,000 on ads every month.\n\n3 months ago I was paying an agency $4,500/mo and getting 1.2% CTR.\n\nI swapped them for an autonomous creator agent running zero-trust guardrails.\nOur CTR went from 1.2% to 4.8% in 14 days.\nOur cost per acquisition dropped 62%.\n\nHere's the link to test the same autonomous agent for free for your brand.`,
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
    ],
    imagePrompt: "Authentic founder selfie-style photo holding phone showing live ad dashboard analytics with verified 4.8% CTR, natural warm office lighting, realistic UGC testimonial aesthetic with subtle verified green badge overlay.",
    metrics: {
      views: "2.1M",
      likes: "15.4K",
      shares: "2,800",
      ctr: "4.82%",
    },
    aiLearnings: {
      hookFormula: "[Audience Filter: If you spend >$5k] + [Specific Before/After Metrics] + [Cost Reduction Proof]",
      tone: "Authentic, raw founder testimonial, zero fluff.",
      structure: "Callout filter → Personal pain story → Quantified improvement → Direct action link.",
      whyItWorked: [
        "Calls out the exact qualifying target audience in first 5 words.",
        "Specific non-round numbers (1.2% to 4.8%, 62% drop) establish high credibility.",
      ],
      imageStyle: "Casual authentic founder selfie UGC with green verified metric sticker.",
      recommendedPrompt: "Create 3 variations based on /memory-meta-ugc-hook for our product launch.",
    },
    createdAt: "2026-09-26T11:45:00Z",
  },

  // ─── LinkedIn Memories ───
  {
    id: "mem-linked-hooks-1",
    slug: "/memory-linked-cold-outbound",
    platform: "linkedin",
    folder: "viral-hooks",
    title: "The Death of Cold Outbound in 2026",
    sourceUrl: "https://linkedin.com/posts/outbound-death-playbook",
    originalContent: `Cold outbound email is officially dead.\n\nOur SDR team went from 0.8% reply rates to 14.2% qualified meetings in 30 days.\n\nHow? We completely eliminated cold emails and switched to autonomous AI social hooks.\n\nHere's the exact blueprint you can steal (bookmark for Monday morning) 🧵👇`,
    photos: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    ],
    imagePrompt: "Executive boardroom presentation slide showing dramatic graph rising from 0.8% to 14.2%, elegant typography, verified data badges, high-trust corporate aesthetic.",
    metrics: {
      views: "890K",
      likes: "16.4K",
      shares: "2,400",
      ctr: "5.60%",
    },
    aiLearnings: {
      hookFormula: "[Obituary Claim] + [Before/After Metric Leap] + [Curiosity Mechanism] + [Bookmark Callout]",
      tone: "Authoritative, transformative, executive brevity.",
      structure: "Death of tactic → 17x metric leap → How question → Bookmark CTA.",
      whyItWorked: [
        "Directly challenges standard B2B sales development practice.",
        "Specific metric proof (0.8% to 14.2%) validates claim.",
      ],
      imageStyle: "High-trust executive chart with bold contrast metric badges.",
      recommendedPrompt: "Generate 3 variations based on /memory-linked-cold-outbound for our B2B pipeline.",
    },
    createdAt: "2026-09-21T08:30:00Z",
  },
  {
    id: "mem-linked-1",
    slug: "/memory-linked-launch-post",
    platform: "linkedin",
    folder: "viral-scripts",
    title: "SaaS $1M ARR Milestone Launch Post",
    sourceUrl: "https://linkedin.com/posts/saas-growth-case-study",
    originalContent: `We just crossed $1,000,000 ARR in 90 days.\nTotal marketing ad spend? $0.\n\nMost founders believe you need a $50k/mo ad budget to scale.\nHere is the exact 3-step playbook we used instead:\n\n1. Stop building in stealth. We documented every engineering commit.\n2. Built in public with automated AI agent loops.\n3. Turned our customer bug reports into public product improvements.\n\nThe algorithm doesn't reward ad spend. It rewards momentum.\n\nDrop a "PLAYBOOK" below and I'll send you our raw Notion operating system.`,
    photos: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    ],
    imagePrompt: "Clean modern SaaS analytics dashboard showing hockey stick revenue curve crossing $1M, minimalist dark slate UI with vibrant emerald green metrics badges, subtle glowing gradient blur.",
    metrics: {
      views: "1.42M",
      likes: "24.8K",
      shares: "3,120",
      ctr: "5.80%",
    },
    aiLearnings: {
      hookFormula: "[Specific Dollar Milestone] + [Contrarian Truth: $0 Ad Spend] + [Numbered Framework]",
      tone: "Authoritative, humble yet unapologetic, crisp line breaks.",
      structure: "Bold claim → Challenge conventional wisdom → 3-bullet playbook → Value exchange CTA.",
      whyItWorked: [
        "Opens with an undeniable tangible financial proof point.",
        "Challenged the sacred cow of needing large ad budgets.",
      ],
      imageStyle: "Sleek verified dashboard screenshot with high-contrast metric callouts.",
      recommendedPrompt: "Create 3 variations of an ARR milestone launch post for an AI marketing tool.",
    },
    createdAt: "2026-09-18T10:30:00Z",
  },
];

interface MemoryState {
  memories: MemoryItem[];
  selectedPlatform: PlatformKey;
  selectedFolderId: string | null;
  selectedMemoryId: string | null;
  searchQuery: string;
  isScraping: boolean;
  scrapeStatusMessage: string | null;

  // Actions
  setSelectedPlatform: (p: PlatformKey) => void;
  setSelectedFolderId: (f: string | null) => void;
  setSelectedMemoryId: (id: string | null) => void;
  setSearchQuery: (q: string) => void;

  addMemory: (memory: Omit<MemoryItem, "id" | "createdAt">) => MemoryItem;
  updateMemory: (id: string, updates: Partial<MemoryItem>) => void;
  deleteMemory: (id: string) => void;

  // Scrape & AI Learning
  scrapeAndLearn: (params: {
    url?: string;
    rawText: string;
    platform: PlatformKey;
    folder: string;
    photoUrl?: string;
    title?: string;
  }) => Promise<MemoryItem>;

  // Lookup by slug or query (used by AI Chat!)
  findMemoryBySlug: (slugOrName: string) => MemoryItem | undefined;
  getMemoriesByPlatform: (platform: PlatformKey) => MemoryItem[];
  getAllMemories: () => MemoryItem[];
}

export const useMemoryStore = create<MemoryState>()(
  persist(
    (set, get) => ({
      memories: INITIAL_MEMORIES,
      selectedPlatform: "instagram",
      selectedFolderId: "viral-hooks",
      selectedMemoryId: "mem-ig-hooks-1",
      searchQuery: "",
      isScraping: false,
      scrapeStatusMessage: null,

      setSelectedPlatform: (selectedPlatform) =>
        set({
          selectedPlatform,
          selectedFolderId: PLATFORMS_CONFIG[selectedPlatform].folders[0].id,
        }),

      setSelectedFolderId: (selectedFolderId) => set({ selectedFolderId }),

      setSelectedMemoryId: (selectedMemoryId) => set({ selectedMemoryId }),

      setSearchQuery: (searchQuery) => set({ searchQuery }),

      addMemory: (item) => {
        const newMemory: MemoryItem = {
          ...item,
          id: `mem-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          memories: [newMemory, ...state.memories],
          selectedMemoryId: newMemory.id,
        }));
        return newMemory;
      },

      updateMemory: (id, updates) =>
        set((state) => ({
          memories: state.memories.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      deleteMemory: (id) =>
        set((state) => ({
          memories: state.memories.filter((m) => m.id !== id),
          selectedMemoryId:
            state.selectedMemoryId === id ? null : state.selectedMemoryId,
        })),

      scrapeAndLearn: async ({
        url,
        rawText,
        platform,
        folder,
        photoUrl,
        title,
      }) => {
        set({ isScraping: true, scrapeStatusMessage: `Connecting to ${platform.toUpperCase()} scraper...` });

        let scrapedContent = rawText;
        let scrapedTitle = title;
        let scrapedPhotos: string[] = photoUrl ? [photoUrl] : [];
        let scrapedMetrics = {
          views: `${(Math.random() * 2 + 0.5).toFixed(1)}M`,
          likes: `${(Math.random() * 30 + 10).toFixed(1)}K`,
          shares: `${Math.floor(Math.random() * 4000 + 1000).toLocaleString()}`,
          ctr: `${(Math.random() * 3 + 3.5).toFixed(2)}%`,
        };
        let scrapedBlueprint: any = null;

        // If a URL is provided, call live scraping API!
        if (url && url.trim().length > 0) {
          try {
            set({ scrapeStatusMessage: `Scraping live post from ${url.slice(0, 40)}...` });
            const res = await fetch("/api/scrape", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: url.trim(), platform }),
            });

            if (res.ok) {
              const data = await res.json();
              if (data.success && data.scraped) {
                set({ scrapeStatusMessage: "Extracting hook patterns & visual assets..." });
                if (data.scraped.content) {
                  if (!rawText || rawText.trim().length === 0 || rawText.startsWith("[Scraped from")) {
                    scrapedContent = data.scraped.content;
                  }
                }
                if (data.scraped.title && (!title || title.trim().length === 0)) {
                  scrapedTitle = data.scraped.title;
                }
                if (data.scraped.photos && data.scraped.photos.length > 0) {
                  scrapedPhotos = data.scraped.photos;
                }
                if (data.scraped.metrics) {
                  scrapedMetrics = data.scraped.metrics;
                }
                if (data.blueprint) {
                  scrapedBlueprint = data.blueprint;
                }
              }
            }
          } catch (err) {
            console.warn("Live scraping fetch fallback:", err);
          }
        }

        set({ scrapeStatusMessage: "Synthesizing AI viral blueprint & shared memory..." });
        await new Promise((r) => setTimeout(r, 400));

        const derivedTitle =
          scrapedTitle ||
          (scrapedContent.split("\n")[0]?.slice(0, 45) || `Viral ${platform.toUpperCase()} Post`);

        const slugKey =
          scrapedBlueprint?.slug ||
          `/memory-${platform}-${derivedTitle
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-")
            .slice(0, 24)
            .replace(/-$/, "")}`;

        const isContrarian =
          scrapedContent.toLowerCase().includes("stop") ||
          scrapedContent.toLowerCase().includes("dead") ||
          scrapedContent.toLowerCase().includes("myth") ||
          scrapedContent.toLowerCase().includes("wrong");

        const hasNumbers = /\d+/.test(scrapedContent);

        const newMemory: MemoryItem = {
          id: `mem-${Date.now()}`,
          slug: slugKey,
          platform,
          folder: folder || "viral-threads",
          title: derivedTitle,
          sourceUrl: url || "https://x.com/post/scraped",
          originalContent: scrapedContent,
          photos:
            scrapedPhotos.length > 0
              ? scrapedPhotos
              : [
                  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
                ],
          imagePrompt:
            scrapedBlueprint?.imagePrompt ||
            `High-converting ad creative for ${derivedTitle}: Bold modern minimalist aesthetic, cinematic contrast lighting, clean data badges, sharp typography highlighting key value proposition.`,
          metrics: scrapedMetrics,
          aiLearnings: {
            hookFormula:
              scrapedBlueprint?.hookFormula ||
              (isContrarian
                ? "[Contrarian Industry Claim] + [Unfair Competitor Contrast] + [Actionable Formula]"
                : hasNumbers
                ? "[Specific Quantified Proof] + [Step-by-Step Breakdown] + [Viral Share CTA]"
                : "[Emotional Open Loop] + [Direct Value Delivery] + [High Velocity Engagement]"),
            tone:
              scrapedBlueprint?.tone ||
              (isContrarian
                ? "Challenging, authoritative, momentum-driven."
                : "Inspiring, data-backed, actionable clarity."),
            structure:
              scrapedBlueprint?.structure ||
              "Hook Line → Pain Point Agitation → Blueprint Solution → Engagement Trigger.",
            whyItWorked: scrapedBlueprint?.whyItWorked || [
              "Immediate pattern interruption within first 1.5 lines of text.",
              "High reading cadence due to short paragraph structuring.",
              "Clear value proposition designed for bookmarking and sharing.",
              "Attached visual creative reinforced the written hook with high-contrast proof.",
            ],
            imageStyle:
              scrapedBlueprint?.imageStyle ||
              "Crisp verified UI element with glowing accent markers and professional typography.",
            recommendedPrompt: `Generate 3 variations based on ${slugKey} tailored for our campaign.`,
          },
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          memories: [newMemory, ...state.memories],
          selectedMemoryId: newMemory.id,
          isScraping: false,
          scrapeStatusMessage: null,
        }));

        return newMemory;
      },

      findMemoryBySlug: (slugOrName: string) => {
        const memories = get().memories;
        const normalized = slugOrName.toLowerCase().trim();

        // Exact slug match (e.g. "/memory-linked-launch-post")
        const exact = memories.find(
          (m) => m.slug.toLowerCase() === normalized
        );
        if (exact) return exact;

        // Partial slug match (e.g. "linked-launch-post" or "launch-post")
        const partialSlug = memories.find((m) =>
          m.slug.toLowerCase().includes(normalized.replace(/^\/?memory-?/, ""))
        );
        if (partialSlug) return partialSlug;

        // Title or content match
        return memories.find(
          (m) =>
            m.title.toLowerCase().includes(normalized) ||
            normalized.includes(m.slug.toLowerCase())
        );
      },

      getMemoriesByPlatform: (platform) => {
        return get().memories.filter((m) => m.platform === platform);
      },

      getAllMemories: () => {
        return get().memories;
      },
    }),
    {
      name: "adloop-memory-house-store",
    }
  )
);
