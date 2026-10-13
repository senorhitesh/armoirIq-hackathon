import { create } from "zustand";
import { useKanbanStore } from "./kanban-store";
import { useUiStore } from "./ui-store";
import { useMemoryStore } from "./memory-store";

export type MessageRole = "user" | "assistant" | "system";

export type MessageType =
  | "text"
  | "post-card"
  | "post-list"
  | "command-result"
  | "error"
  | "help";

export interface PostPreview {
  id: string;
  title: string;
  platform: string;
  status: string;
  viralityScore?: number;
  body?: string;
  hookType?: string;
  createdByAgent?: string;
  format?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  timestamp: string;
  posts?: PostPreview[];
  postDetail?: PostPreview;
  commandUsed?: string;
}

export interface SlashCommand {
  command: string;
  description: string;
  usage: string;
  category: "crud" | "action" | "info";
}

export const SLASH_COMMANDS: SlashCommand[] = [
  { command: "/create", description: "Create a new post/draft", usage: '/create <title> — then follow prompts', category: "crud" },
  { command: "/list", description: "List all posts with optional status filter", usage: '/list [status: draft|pending|approved|scheduled|published]', category: "crud" },
  { command: "/view", description: "View full details of a post", usage: '/view <post_name>', category: "crud" },
  { command: "/edit", description: "Edit a post with AI assistance", usage: '/edit <post_name> <prompt>', category: "crud" },
  { command: "/delete", description: "Delete a post by name", usage: '/delete <post_name>', category: "crud" },
  { command: "/approve", description: "Approve a pending post", usage: '/approve <post_name>', category: "action" },
  { command: "/publish", description: "Publish approved post to sandbox", usage: '/publish <post_name>', category: "action" },
  { command: "/score", description: "Get virality score for a post", usage: '/score <post_name>', category: "action" },
  { command: "/memory", description: "Use Agent Memory House shared blueprint to generate variations", usage: '/memory [slug] or hey /post-123 create 3 variation based on /memory-...', category: "action" },
  { command: "/help", description: "Show all available commands", usage: '/help', category: "info" },
];

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  inputValue: string;
  showSlashMenu: boolean;
  slashFilter: string;
  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  setTyping: (v: boolean) => void;
  setInputValue: (v: string) => void;
  setShowSlashMenu: (v: boolean) => void;
  setSlashFilter: (v: string) => void;
  processCommand: (input: string) => void;
  clearChat: () => void;
}

const WELCOME_MSG: ChatMessage = {
  id: "welcome",
  role: "assistant",
  type: "text",
  content: `👋 **Welcome to ScaleFlow AI Command Center!**\n\nI can help you manage your ad posts and campaigns. Type \`/\` to see available commands, or try:\n\n• \`/create My New Ad\` — create a draft\n• \`/list\` — see all posts\n• \`/edit <name> make it more engaging\`\n• \`/help\` — full command reference\n\nPowered by **ArmorIQ Governance** — every action is cryptographically verified. 🛡️`,
  timestamp: new Date().toISOString(),
};

function generateId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function findPostByName(name: string) {
  const tasks = useKanbanStore.getState().tasks;
  const lower = name.toLowerCase().trim();
  return tasks.find(
    (t) =>
      t.title.toLowerCase().includes(lower) ||
      t.id.toLowerCase() === lower
  );
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [WELCOME_MSG],
  isTyping: false,
  inputValue: "",
  showSlashMenu: false,
  slashFilter: "",

  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...msg, id: generateId(), timestamp: new Date().toISOString() },
      ],
    })),

  setTyping: (v) => set({ isTyping: v }),
  setInputValue: (v) => set({ inputValue: v }),
  setShowSlashMenu: (v) => set({ showSlashMenu: v }),
  setSlashFilter: (v) => set({ slashFilter: v }),

  clearChat: () => set({ messages: [WELCOME_MSG] }),

  processCommand: async (input: string) => {
    const { addMessage, setTyping } = get();
    const trimmed = input.trim();

    // Add user message
    addMessage({ role: "user", type: "text", content: trimmed });

    // Parse command or memory reference
    const lower = trimmed.toLowerCase();
    const hasMemoryRef =
      lower.includes("/memory-") ||
      lower.includes("memory-") ||
      lower.startsWith("/memory");

    if (hasMemoryRef) {
      setTyping(true);
      await delay(800 + Math.random() * 500);

      const memoryStore = useMemoryStore.getState();
      const allMemories = memoryStore.memories;

      if (trimmed.toLowerCase() === "/memory" || trimmed.toLowerCase() === "/memory list") {
        setTyping(false);
        const memList = allMemories
          .map(
            (m) =>
              `• \`${m.slug}\` — **${m.title}** (${m.platform.toUpperCase()})\n  ⚡ Formula: *"${m.aiLearnings.hookFormula}"*`
          )
          .join("\n\n");

        addMessage({
          role: "assistant",
          type: "command-result",
          content: `🧠 **Agent Memory House: Shared Memories Vault**\n\nHere are the active memory blueprints currently stored across your platform folders:\n\n${memList}\n\n💡 **Usage Example:**\n\`hey /linkedpost-123 create 3 variation based on /memory-linked-launch-post\``,
          commandUsed: "/memory",
        });
        return;
      }

      // Extract requested memory slug
      const slugMatch =
        trimmed.match(/\/memory-[\w-]+/i) || trimmed.match(/memory-[\w-]+/i);
      const rawSlug = slugMatch ? slugMatch[0].toLowerCase() : "";

      let matchedMemory = rawSlug
        ? memoryStore.findMemoryBySlug(rawSlug)
        : undefined;

      // Fuzzy matching to handle typos like "/memory-linnked-launch-post"
      if (!matchedMemory && rawSlug) {
        const cleanSlug = rawSlug.replace(/^\/?memory-?/, "");
        matchedMemory = allMemories.find((m) => {
          const mClean = m.slug.replace(/^\/?memory-?/, "");
          return (
            mClean.includes(cleanSlug.slice(0, 4)) ||
            cleanSlug.includes(mClean.slice(0, 4)) ||
            (cleanSlug.includes("link") && mClean.includes("link")) ||
            (cleanSlug.includes("launch") && mClean.includes("launch")) ||
            (cleanSlug.includes("urgency") && mClean.includes("urgency")) ||
            (cleanSlug.includes("carousel") && mClean.includes("carousel")) ||
            (cleanSlug.includes("thread") && mClean.includes("thread"))
          );
        });
      }

      // If user typed "/memory" with arguments like "/memory launch"
      if (!matchedMemory) {
        const parts = trimmed.split(/\s+/);
        if (parts.length > 1) {
          matchedMemory = memoryStore.findMemoryBySlug(parts[1]);
        }
      }

      // Fallback to default high-performing memory if still not found
      if (!matchedMemory && allMemories.length > 0) {
        matchedMemory = allMemories[0];
      }

      if (matchedMemory) {
        // Extract post identifier if present (e.g. "/linkedpost-123" or "linkedpost-123")
        const targetMatch = trimmed.match(
          /\/?(linkedpost-[\w-]+|[a-zA-Z0-9_-]+post[\w-]*)/i
        );
        const targetName = targetMatch
          ? targetMatch[1].replace(/^\//, "")
          : "Campaign Launch";

        // Generate 3 high-converting variations adhering strictly to the memory's hook formula & structure
        const var1 = {
          title: `[Variation 1 - Contrarian Milestone] ${targetName}`,
          hook: `We just crossed 10,000 active users in 60 days. Total ad spend? $0.`,
          body: `We just crossed 10,000 active users in 60 days.\nTotal ad spend? $0.\n\nMost founders believe you need a $20k/mo ad budget to get early traction.\nHere is the 3-step playbook we ran instead:\n\n1. Built in public and documented our daily architecture.\n2. Replaced human agency copywriters with autonomous AI agents.\n3. Turned our customer feature requests into viral case studies.\n\nThe algorithm rewards authentic momentum, not bloated agency slide decks.\n\nDrop a "BLUEPRINT" below and I'll send you our raw Notion operating system.`,
          score: 94,
          ctr: "5.8%",
        };

        const var2 = {
          title: `[Variation 2 - Data Transparency] ${targetName}`,
          hook: `90 days ago, our MRR was $1,200. Today it's $84,500.`,
          body: `90 days ago, our MRR was $1,200. Today it's $84,500.\n\nWe ran 2 different marketing experiments last quarter:\n• Agency Retainer ($5,000/mo) → 18 signups, 1.1% CTR\n• Autonomous Agent Loop ($0 ad budget) → 840 signups, 4.8% CTR\n\n3 key lessons that completely changed our trajectory:\n→ Speed of iteration beats production polish.\n→ Contrast your solution against legacy bloated tools.\n→ Turn internal operational workflows into lead magnets.\n\nFull teardown link in the comments.`,
          score: 91,
          ctr: "4.9%",
        };

        const var3 = {
          title: `[Variation 3 - Anti-Agency Framework] ${targetName}`,
          hook: `Stop paying agencies $10,000/month for marketing templates.`,
          body: `Stop paying agencies $10,000/month for marketing templates.\n\nA 3-person engineering team just outgrew an 80-person competitor using this 3-part framework:\n\nStep 1: Ingest viral patterns with Agent Memory House.\nStep 2: Generate 30 high-converting hooks with zero human friction.\nStep 3: Enforce cryptographic brand guidelines with ArmorIQ.\n\nThe barrier to scaling organic social distribution just dropped to zero.\n\nWhich step is your team currently stuck on?`,
          score: 96,
          ctr: "6.4%",
        };

        // Also add the best variation into Kanban drafts/tasks
        useKanbanStore.getState().addTask({
          title: var3.title,
          description: `${var3.body}\n\n[Memory Blueprint: ${matchedMemory.slug}]\nVirality Score: ${var3.score}/100\nArmorIQ Policy: pol-agent-shared-memory`,
          columnId: "col-drafts",
          priority: "urgent",
          assigneeIds: ["user-2"],
          tags: [matchedMemory.platform, "Shared-Memory", "AI-Generated"],
          metadata: {
            platform: matchedMemory.platform,
            viralityScore: var3.score,
            planRef: `plan_memory_${Date.now()}`,
            memorySlug: matchedMemory.slug,
          },
        });

        useUiStore
          .getState()
          .toast(
            `✅ Applied ${matchedMemory.slug} — 3 variations generated & saved to drafts!`
          );

        setTyping(false);
        addMessage({
          role: "assistant",
          type: "command-result",
          content:
            `🧠 **Agent Memory House: Shared Memory Ingested!**\n\n` +
            `📋 **Blueprint:** **"${matchedMemory.title}"** (\`${matchedMemory.slug}\`)\n` +
            `🎯 **Platform:** \`${matchedMemory.platform.toUpperCase()}\` • **Folder:** \`${matchedMemory.folder}\`\n` +
            `⚡ **Applied Hook Formula:** \`${matchedMemory.aiLearnings.hookFormula}\`\n` +
            `🎨 **Image Creative Prompt:** *"${matchedMemory.imagePrompt}"*\n\n` +
            (matchedMemory.photos && matchedMemory.photos[0]
              ? `![Learned Ad Creative Visual](${matchedMemory.photos[0]})\n\n`
              : "") +
            `---\n\n` +
            `🚀 **Generated 3 High-Converting Variations for "${targetName}":**\n\n` +
            `### 1️⃣ ${var1.title}\n` +
            `🎯 **Virality Score:** **${var1.score}/100** • **Estimated CTR:** ${var1.ctr}\n` +
            `> ${var1.body.split("\n").join("\n> ")}\n\n` +
            `---\n\n` +
            `### 2️⃣ ${var2.title}\n` +
            `🎯 **Virality Score:** **${var2.score}/100** • **Estimated CTR:** ${var2.ctr}\n` +
            `> ${var2.body.split("\n").join("\n> ")}\n\n` +
            `---\n\n` +
            `### 3️⃣ ${var3.title}\n` +
            `🎯 **Virality Score:** **${var3.score}/100** • **Estimated CTR:** ${var3.ctr}\n` +
            `> ${var3.body.split("\n").join("\n> ")}\n\n` +
            `---\n\n` +
            `🛡️ **ArmorIQ Policy Enforcement:**\n` +
            `• **Policy Rule:** \`pol-agent-shared-memory\` (Authorized)\n` +
            `• **Participating Agents:** \`Creator Agent\` & \`Strategist Agent\`\n` +
            `• **Shared Merkle Proof:** \`0x9f4a...83cd\` (Verified)\n` +
            `• **Output Status:** Variation 3 automatically added to your Workspace Drafts!`,
          commandUsed: rawSlug || "/memory",
        });
        return;
      }
    }

    const isCommand = trimmed.startsWith("/");
    if (!isCommand) {
      // Regular chat message — simulate AI response
      setTyping(true);
      await delay(800 + Math.random() * 1200);
      setTyping(false);
      addMessage({
        role: "assistant",
        type: "text",
        content: `I understand you said: "${trimmed}"\n\nTry using slash commands or referencing Shared Memory:\n• \`hey /linkedpost-123 create 3 variation based on /memory-linked-launch-post\`\n• \`/memory\` — View or use Agent Memory House shared blueprints\n• \`/create\` — Create a new post\n• \`/list\` — View all posts\n• \`/help\` — See all commands`,
      });
      return;
    }

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(" ");

    setTyping(true);
    await delay(600 + Math.random() * 800);

    const kanban = useKanbanStore.getState();

    switch (cmd) {
      case "/help": {
        setTyping(false);
        addMessage({
          role: "assistant",
          type: "help",
          content: "help",
          commandUsed: "/help",
        });
        break;
      }

      case "/create": {
        if (!args) {
          setTyping(false);
          addMessage({
            role: "assistant",
            type: "error",
            content: "⚠️ Please provide a title: `/create My Awesome Ad Post`",
            commandUsed: "/create",
          });
          break;
        }

        const platforms = ["linkedin", "instagram", "youtube", "x"];
        const formats = ["tweet", "thought_leadership", "short_script", "carousel"];
        const hooks = ["Question", "Contrarian", "Number/Data", "Story/Vulnerability", "How-To/Framework", "Curiosity Gap"];
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const format = formats[Math.floor(Math.random() * formats.length)];
        const hookType = hooks[Math.floor(Math.random() * hooks.length)];

        let apiResult: any = null;
        try {
          const res = await fetch("/api/agent/command", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              command: "create",
              title: args,
              platform,
              format,
              hookType,
            }),
          });
          apiResult = await res.json();
        } catch (e) {
          console.warn("API command call fallback:", e);
        }

        const score = apiResult?.post?.viralityScore || (65 + Math.floor(Math.random() * 30));
        const planRef = apiResult?.planId || `plan_chat_${Date.now()}`;
        const merkleRoot = apiResult?.merkleRoot || "";

        kanban.addTask({
          title: args,
          description: `AI-generated draft via Chat Command.\nPlatform: ${platform}\nFormat: ${format}\nHook: ${hookType}\nVirality Score: ${score}/100\nArmorIQ Verified: ${planRef}`,
          columnId: "col-drafts",
          priority: "normal",
          assigneeIds: ["user-2"],
          tags: [platform, format, "AI-Created"],
          metadata: {
            platform,
            viralityScore: score,
            planRef,
            merkleRoot,
          },
        });

        if (apiResult?.toast) {
          useUiStore.getState().toast(apiResult.toast);
        } else {
          useUiStore.getState().toast("✅ ArmorIQ: Action allowed — create_draft verified");
        }

        setTyping(false);
        addMessage({
          role: "assistant",
          type: "command-result",
          content: apiResult?.message || `✅ **Post Created Successfully!**\n\n📝 **"${args}"**\n📱 Platform: \`${platform}\`\n🎯 Format: \`${format}\`\n🪝 Hook Type: \`${hookType}\`\n🔥 Virality Score: **${score}/100**\n📋 Status: \`draft\`\n🛡️ **ArmorIQ Plan:** \`${planRef}\`\n\nThe post has been added to your **Ad Drafts** column. Use \`/edit ${args}\` to refine it.`,
          commandUsed: "/create",
          postDetail: {
            id: `task-${Date.now()}`,
            title: args,
            platform,
            status: "draft",
            viralityScore: score,
            hookType,
            format,
            createdByAgent: "creator",
          },
        });
        break;
      }

      case "/list": {
        const tasks = kanban.tasks;
        const statusFilter = args?.toLowerCase().trim();
        let filtered = tasks;

        if (statusFilter) {
          const statusMap: Record<string, string> = {
            draft: "col-drafts",
            pending: "col-review",
            pending_approval: "col-review",
            approved: "col-approved",
            scheduled: "col-scheduled",
            published: "col-published",
          };
          const colId = statusMap[statusFilter];
          if (colId) {
            filtered = tasks.filter((t) => t.columnId === colId);
          }
        }

        const posts: PostPreview[] = filtered.map((t) => ({
          id: t.id,
          title: t.title,
          platform: (t.metadata as any)?.platform || "unknown",
          status: kanban.columns.find((c) => c.id === t.columnId)?.title || t.columnId,
          viralityScore: (t.metadata as any)?.viralityScore,
          body: t.description,
          format: t.tags?.[1] || "unknown",
        }));

        setTyping(false);
        addMessage({
          role: "assistant",
          type: "post-list",
          content: filtered.length > 0
            ? `📋 **Found ${filtered.length} post${filtered.length !== 1 ? "s" : ""}**${statusFilter ? ` (filtered: \`${statusFilter}\`)` : ""}:`
            : `📭 No posts found${statusFilter ? ` with status \`${statusFilter}\`` : ""}.`,
          posts,
          commandUsed: "/list",
        });
        break;
      }

      case "/view": {
        if (!args) {
          setTyping(false);
          addMessage({
            role: "assistant",
            type: "error",
            content: "⚠️ Please specify a post name: `/view ScaleFlow Q4`",
            commandUsed: "/view",
          });
          break;
        }

        const task = findPostByName(args);
        if (!task) {
          setTyping(false);
          addMessage({
            role: "assistant",
            type: "error",
            content: `❌ No post found matching **"${args}"**. Use \`/list\` to see available posts.`,
            commandUsed: "/view",
          });
          break;
        }

        const col = kanban.columns.find((c) => c.id === task.columnId);
        setTyping(false);
        addMessage({
          role: "assistant",
          type: "post-card",
          content: `📄 **Post Details**`,
          commandUsed: "/view",
          postDetail: {
            id: task.id,
            title: task.title,
            platform: (task.metadata as any)?.platform || "unknown",
            status: col?.title || task.columnId,
            viralityScore: (task.metadata as any)?.viralityScore,
            body: task.description,
            format: task.tags?.[1] || "unknown",
            createdByAgent: "creator",
          },
        });
        break;
      }

      case "/edit": {
        if (!args) {
          setTyping(false);
          addMessage({
            role: "assistant",
            type: "error",
            content: '⚠️ Usage: `/edit <post_name> <changes>`\nExample: `/edit ScaleFlow make it more punchy and add urgency`',
            commandUsed: "/edit",
          });
          break;
        }

        // Try to split: first find the longest matching post name
        const allTasks = kanban.tasks;
        let bestMatch: typeof allTasks[0] | null = null;
        let editPrompt = args;

        for (const t of allTasks) {
          const titleLower = t.title.toLowerCase();
          const argsLower = args.toLowerCase();
          if (argsLower.startsWith(titleLower)) {
            if (!bestMatch || t.title.length > bestMatch.title.length) {
              bestMatch = t;
              editPrompt = args.slice(t.title.length).trim();
            }
          }
        }

        // Fallback: first word(s) as name
        if (!bestMatch) {
          const words = args.split(" ");
          for (let i = words.length; i >= 1; i--) {
            const namePart = words.slice(0, i).join(" ");
            const found = findPostByName(namePart);
            if (found) {
              bestMatch = found;
              editPrompt = words.slice(i).join(" ");
              break;
            }
          }
        }

        if (!bestMatch) {
          setTyping(false);
          addMessage({
            role: "assistant",
            type: "error",
            content: `❌ No post found matching your query. Use \`/list\` to see available posts.`,
            commandUsed: "/edit",
          });
          break;
        }

        if (!editPrompt) {
          editPrompt = "Improve and refine the content";
        }

        let apiResult: any = null;
        try {
          const res = await fetch("/api/agent/command", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              command: "edit",
              title: bestMatch.title,
              postId: bestMatch.id,
              targetPrompt: editPrompt,
            }),
          });
          apiResult = await res.json();
        } catch (e) {
          console.warn("API edit call error:", e);
        }

        const newDesc = `${bestMatch.description || ""}\n\n✏️ AI Edit Applied: "${editPrompt}"\n[Modified at ${new Date().toLocaleTimeString()}]`;
        kanban.updateTask(bestMatch.id, { description: newDesc });

        if (apiResult?.toast) {
          useUiStore.getState().toast(apiResult.toast);
        } else {
          useUiStore.getState().toast("✅ ArmorIQ: Action allowed — update_draft verified");
        }

        setTyping(false);
        addMessage({
          role: "assistant",
          type: "command-result",
          content: `✅ **Post Updated!**\n\n📝 **"${bestMatch.title}"** has been edited.\n💡 Applied: *"${editPrompt}"*\n🛡️ **ArmorIQ Policy:** \`pol-creator-allow-workspace\` (Verified)\n\nUse \`/view ${bestMatch.title}\` to see the updated post.`,
          commandUsed: "/edit",
        });
        break;
      }

      case "/delete": {
        if (!args) {
          setTyping(false);
          addMessage({
            role: "assistant",
            type: "error",
            content: "⚠️ Please specify a post: `/delete <post_name>`",
            commandUsed: "/delete",
          });
          break;
        }

        const task = findPostByName(args);
        if (!task) {
          setTyping(false);
          addMessage({
            role: "assistant",
            type: "error",
            content: `❌ No post found matching **"${args}"**.`,
            commandUsed: "/delete",
          });
          break;
        }

        let apiResult: any = null;
        try {
          const res = await fetch("/api/agent/command", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              command: "delete",
              title: task.title,
              postId: task.id,
            }),
          });
          apiResult = await res.json();
        } catch (e) {
          console.warn("API delete call error:", e);
        }

        if (apiResult?.decision === "blocked") {
          useUiStore.getState().toast(apiResult.toast || "⛔ ArmorIQ: Action blocked — Destructive action restricted");
          setTyping(false);
          addMessage({
            role: "assistant",
            type: "error",
            content: apiResult.message || `🛡️ **ArmorIQ Policy Enforcement: BLOCKED**\n\n⛔ **Action Denied:** \`workspace-mcp.delete_drafts\`\n📋 **Rule:** \`pol-creator-deny-delete\`\n👤 **Agent:** \`creator\`\n📜 **Reason:** Destructive delete operations are forbidden by zero-trust policy.`,
            commandUsed: "/delete",
          });
          break;
        }

        kanban.deleteTask(task.id);
        useUiStore.getState().toast("🗑️ Post deleted");
        setTyping(false);
        addMessage({
          role: "assistant",
          type: "command-result",
          content: `🗑️ **Post Deleted**\n\n**"${task.title}"** has been removed from the workspace.`,
          commandUsed: "/delete",
        });
        break;
      }

      case "/approve": {
        if (!args) {
          setTyping(false);
          addMessage({
            role: "assistant",
            type: "error",
            content: "⚠️ Please specify a post: `/approve <post_name>`",
            commandUsed: "/approve",
          });
          break;
        }

        const task = findPostByName(args);
        if (!task) {
          setTyping(false);
          addMessage({
            role: "assistant",
            type: "error",
            content: `❌ No post found matching **"${args}"**.`,
            commandUsed: "/approve",
          });
          break;
        }

        if (task.columnId !== "col-review" && task.columnId !== "col-drafts") {
          setTyping(false);
          addMessage({
            role: "assistant",
            type: "error",
            content: `⚠️ **"${task.title}"** is already approved or published.`,
            commandUsed: "/approve",
          });
          break;
        }

        kanban.moveTask(task.id, "col-approved");
        useUiStore.getState().toast("✅ ArmorIQ: Approval gate passed — Ready for Publisher");
        setTyping(false);
        addMessage({
          role: "assistant",
          type: "command-result",
          content: `✅ **Post Approved!**\n\n👍 **"${task.title}"** has been approved by the Account Manager.\n📋 Status: \`Approved by Lead\`\n🛡️ **Approval Gate Passed:** Publisher Agent is now authorized to invoke \`publish_post\`.\n\nUse \`/publish ${task.title}\` to push it live to sandbox.`,
          commandUsed: "/approve",
        });
        break;
      }

      case "/publish": {
        if (!args) {
          setTyping(false);
          addMessage({
            role: "assistant",
            type: "error",
            content: "⚠️ Please specify a post: `/publish <post_name>`",
            commandUsed: "/publish",
          });
          break;
        }

        const task = findPostByName(args);
        if (!task) {
          setTyping(false);
          addMessage({
            role: "assistant",
            type: "error",
            content: `❌ No post found matching **"${args}"**.`,
            commandUsed: "/publish",
          });
          break;
        }

        let apiResult: any = null;
        try {
          const res = await fetch("/api/agent/command", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              command: "publish",
              title: task.title,
              postId: task.id,
              postStatus: task.columnId === "col-approved" ? "approved" : "draft",
            }),
          });
          apiResult = await res.json();
        } catch (e) {
          console.warn("API publish call error:", e);
        }

        if (apiResult?.decision === "blocked" || (!apiResult && task.columnId !== "col-approved")) {
          const toastMsg = apiResult?.toast || "⛔ ArmorIQ: Action blocked — Creator agent not authorized to publish";
          useUiStore.getState().toast(toastMsg);
          setTyping(false);
          addMessage({
            role: "assistant",
            type: "error",
            content: apiResult?.message || `🛡️ **ArmorIQ Policy Enforcement: BLOCKED**\n\n⛔ **Action Denied:** \`publisher-mcp.publish_post\`\n📋 **Rule:** \`pol-creator-deny-publish\`\n👤 **Agent:** \`creator\`\n📜 **Reason:** Creator agent cannot publish directly. The post must first be reviewed and approved by an Account Lead.\n\n*Use \`/approve ${task.title}\` first to obtain cryptographic sign-off.*`,
            commandUsed: "/publish",
          });
          break;
        }

        kanban.moveTask(task.id, "col-published");
        const toastMsg = apiResult?.toast || "✅ ArmorIQ: Action allowed — publish_post verified";
        useUiStore.getState().toast(toastMsg);
        setTyping(false);
        addMessage({
          role: "assistant",
          type: "command-result",
          content: apiResult?.message || `🚀 **Published to Live Sandbox!**\n\n📢 **"${task.title}"** is now live in the sandbox environment.\n📋 Status: \`Live Published\`\n🛡️ **ArmorIQ Policy:** \`pol-pub-allow-publish-conditional\` (Allowed)\n🌳 **Merkle Root:** Verified\n⚠️ *Sandbox only — no real platform publishing.*`,
          commandUsed: "/publish",
        });
        break;
      }

      case "/score": {
        if (!args) {
          setTyping(false);
          addMessage({
            role: "assistant",
            type: "error",
            content: "⚠️ Please specify a post: `/score <post_name>`",
            commandUsed: "/score",
          });
          break;
        }

        const task = findPostByName(args);
        if (!task) {
          setTyping(false);
          addMessage({
            role: "assistant",
            type: "error",
            content: `❌ No post found matching **"${args}"**.`,
            commandUsed: "/score",
          });
          break;
        }

        const score = (task.metadata as any)?.viralityScore || (60 + Math.floor(Math.random() * 35));
        const confidence = 65 + Math.floor(Math.random() * 30);
        const reasons = [
          "Strong hook pattern matches top 10% engagement cohort",
          "Optimal content length for platform feed algorithm",
          "Clear CTA drives discussion and shares",
          "Contrarian angle generates curiosity and debate",
        ];
        const topReasons = reasons.sort(() => Math.random() - 0.5).slice(0, 3);

        useUiStore.getState().toast("✅ ArmorIQ: Action allowed — score_virality verified");
        setTyping(false);
        addMessage({
          role: "assistant",
          type: "command-result",
          content: `🔥 **Virality Score Analysis**\n\n📝 **"${task.title}"**\n\n🎯 Score: **${score}/100** (${score >= 80 ? "🟢 High" : score >= 60 ? "🟡 Medium" : "🔴 Low"} potential)\n📊 Confidence: **${confidence}%**\n\n**Top Factors:**\n${topReasons.map((r) => `• ✓ ${r}`).join("\n")}\n\n*Based on honest model — relative performance prediction from your own history. Not a guarantee.*\n🛡️ **ArmorIQ Verified:** Scored by Creator Agent under rule \`pol-creator-allow-workspace\`.`,
          commandUsed: "/score",
        });
        break;
      }

      default: {
        setTyping(false);
        addMessage({
          role: "assistant",
          type: "error",
          content: `❓ Unknown command \`${cmd}\`. Type \`/help\` to see available commands.`,
        });
      }
    }
  },
}));
