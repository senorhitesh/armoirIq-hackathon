"use client";


import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useChatStore, SLASH_COMMANDS, type ChatMessage } from "@/stores/chat-store";
import { cn } from "@/lib/utils";
import {
  Conversation,
  ConversationBubble,
  ConversationContent,
  ConversationReactions,
} from "@/components/_ui/conversation";
import StreamingText from "@/components/_ui/streaming-text";
import PromptBar from "@/components/_ui/prompt-bar";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Terminal,
  Trash2,
  HelpCircle,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  FileText,
  BarChart3,
  Eye,
  Pencil,
  ThumbsUp,
  Rocket,
  ShieldCheck,
  MessageSquare,
  Command,
  Zap,
  X,
  Brain,
} from "lucide-react";

/* ─── Markdown-light renderer ─── */
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Images
    const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      return (
        <div key={i} className="my-2.5 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-w-sm shadow-xs">
          <img src={imgMatch[2]} alt={imgMatch[1]} className="w-full h-44 object-cover" />
          {imgMatch[1] && (
            <div className="p-2 bg-slate-50 text-[10.5px] font-medium text-slate-500 border-t border-slate-150">
              🖼️ {imgMatch[1]}
            </div>
          )}
        </div>
      );
    }

    // Horizontal rule
    if (line.trim() === "---") {
      return <div key={i} className="my-3 border-t border-slate-200/80" />;
    }

    // Header 3
    if (line.trim().startsWith("### ")) {
      return (
        <h4 key={i} className="text-xs font-bold text-slate-900 mt-3 mb-1">
          {line.trim().replace(/^###\s+/, "")}
        </h4>
      );
    }

    // Blockquote
    if (line.trim().startsWith("> ")) {
      return (
        <div key={i} className="my-1 border-l-2 border-purple-400 bg-purple-50/50 pl-2.5 py-1 text-xs text-slate-800 rounded-r-md">
          <span dangerouslySetInnerHTML={{ __html: line.trim().replace(/^>\s*/, "").replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>') }} />
        </div>
      );
    }

    // Bold
    let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    // Italic
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Inline code
    processed = processed.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-blue-700 text-xs font-mono border border-slate-200">$1</code>');
    // Bullet points
    if (processed.trim().startsWith("•") || processed.trim().startsWith("- ") || processed.trim().startsWith("✓")) {
      return (
        <div key={i} className="flex items-start gap-2 ml-1">
          <span className="text-blue-500 shrink-0 mt-0.5">›</span>
          <span dangerouslySetInnerHTML={{ __html: processed.replace(/^[•\-✓]\s*/, "") }} />
        </div>
      );
    }

    if (!processed.trim()) return <div key={i} className="h-2" />;
    return <div key={i} dangerouslySetInnerHTML={{ __html: processed }} />;
  });
}

/* ─── Command icon helper ─── */
function getCommandIcon(cmd?: string) {
  switch (cmd) {
    case "/create": return <FileText className="w-3.5 h-3.5" />;
    case "/list": return <BarChart3 className="w-3.5 h-3.5" />;
    case "/view": return <Eye className="w-3.5 h-3.5" />;
    case "/edit": return <Pencil className="w-3.5 h-3.5" />;
    case "/delete": return <Trash2 className="w-3.5 h-3.5" />;
    case "/approve": return <ThumbsUp className="w-3.5 h-3.5" />;
    case "/publish": return <Rocket className="w-3.5 h-3.5" />;
    case "/score": return <Sparkles className="w-3.5 h-3.5" />;
    case "/insights": return <Sparkles className="w-3.5 h-3.5 text-blue-500" />;
    case "/stream": return <Sparkles className="w-3.5 h-3.5 text-blue-500" />;
    case "/memory": return <Brain className="w-3.5 h-3.5 text-purple-600" />;
    case "/help": return <HelpCircle className="w-3.5 h-3.5" />;
    default: return <Bot className="w-3.5 h-3.5" />;
  }
}

/* ─── Typing Indicator ─── */
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="flex items-start gap-3 px-4"
    >
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-400"
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Help Panel ─── */
function HelpPanel() {
  const categories = {
    crud: { label: "CRUD Operations", icon: <FileText className="w-3.5 h-3.5 text-blue-500" /> },
    action: { label: "Actions", icon: <Zap className="w-3.5 h-3.5 text-amber-500" /> },
    info: { label: "Info", icon: <HelpCircle className="w-3.5 h-3.5 text-emerald-500" /> },
  };

  return (
    <div className="space-y-4">
      {(Object.keys(categories) as Array<keyof typeof categories>).map((cat) => (
        <div key={cat}>
          <div className="flex items-center gap-2 mb-2">
            {categories[cat].icon}
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {categories[cat].label}
            </span>
          </div>
          <div className="space-y-1.5">
            {SLASH_COMMANDS.filter((c) => c.category === cat).map((c) => (
              <div
                key={c.command}
                className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60 hover:bg-slate-100/80 transition-colors"
              >
                <code className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 shrink-0 mt-0.5">
                  {c.command}
                </code>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800">{c.description}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{c.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Post Preview Card (inline) ─── */
function InlinePostCard({ post }: { post: NonNullable<ChatMessage["postDetail"]> }) {
  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700 border-slate-200",
    "Ad Drafts": "bg-slate-100 text-slate-700 border-slate-200",
    "Pending Approval": "bg-amber-50 text-amber-700 border-amber-200",
    "Approved by Lead": "bg-indigo-50 text-indigo-700 border-indigo-200",
    "Scheduled (Sandbox)": "bg-blue-50 text-blue-700 border-blue-200",
    "Live Published": "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <div className="mt-3 p-4 rounded-xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[post.status] || statusColors.draft}`}>
          {post.status}
        </span>
        {post.viralityScore && (
          <span className="flex items-center gap-1 text-xs font-bold text-blue-600">
            <Sparkles className="w-3 h-3" />
            {post.viralityScore}/100
          </span>
        )}
      </div>
      <h4 className="text-sm font-bold text-slate-900 mb-1">{post.title}</h4>
      {post.body && (
        <p className="text-xs text-slate-600 line-clamp-3 mb-2 whitespace-pre-wrap">{post.body}</p>
      )}
      <div className="flex items-center gap-3 text-[11px] text-slate-500">
        {post.platform && <span>📱 {post.platform}</span>}
        {post.format && <span>📐 {post.format}</span>}
        {post.hookType && <span>🪝 {post.hookType}</span>}
      </div>
    </div>
  );
}

/* ─── Post List ─── */
function PostList({ posts }: { posts: NonNullable<ChatMessage["posts"]> }) {
  if (!posts.length) return null;

  return (
    <div className="mt-3 space-y-2">
      {posts.map((post, i) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all cursor-default"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
            {i + 1}
          </div>
          <div className="min-w-0 flex-1">
            <h5 className="text-xs font-bold text-slate-900 truncate">{post.title}</h5>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-slate-500">{post.platform}</span>
              <span className="text-slate-300">·</span>
              <span className="text-[10px] text-slate-500">{post.status}</span>
            </div>
          </div>
          {post.viralityScore && (
            <span className="text-xs font-bold text-blue-600 shrink-0">{post.viralityScore}</span>
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Single Message Bubble ─── */
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  const isError = msg.type === "error";
  const [reaction, setReaction] = useState<string | null>(null);

  const timeString = new Date(msg.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`group/message flex items-start gap-3 px-4 w-full ${isUser ? "flex-row-reverse" : "flex-row"}`}
      data-align={isUser ? "end" : "start"}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
          isUser
            ? "bg-gradient-to-br from-slate-700 to-slate-900 shadow-slate-500/20"
            : isError
            ? "bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/20"
            : "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : isError ? (
          <AlertTriangle className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Bubble Component */}
      <ConversationBubble
        align={isUser ? "end" : "start"}
        variant={isUser ? "default" : isError ? "destructive" : "muted"}
        sentAt={timeString}
        defaultRevealed={true}
        className="max-w-[82%]"
      >
        <ConversationContent
          className={cn(
            "relative text-sm shadow-xs transition-all",
            isUser
              ? "shadow-blue-500/10 font-normal"
              : "border-slate-200/90 text-slate-800"
          )}
        >
          {/* Command badge */}
          {msg.commandUsed && !isUser && (
            <div className="flex items-center gap-1.5 mb-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  isError
                    ? "bg-rose-100 text-rose-700 border border-rose-200"
                    : "bg-blue-100 text-blue-700 border border-blue-200"
                }`}
              >
                {getCommandIcon(msg.commandUsed)}
                {msg.commandUsed}
              </span>
            </div>
          )}

          {/* Text or Streaming */}
          {msg.streaming || msg.type === "streaming" ? (
            <div className="py-1">
              <StreamingText
                fill={true}
                loop={false}
                onFollowUp={(text) => {
                  useChatStore.getState().processCommand(text);
                }}
              />
            </div>
          ) : (
            <div className={cn("leading-relaxed space-y-1.5", isUser ? "text-white selection:bg-white/30" : "text-slate-800")}>
              {msg.type === "help" ? <HelpPanel /> : renderMarkdown(msg.content)}
            </div>
          )}

          {/* Post detail card */}
          {msg.postDetail && <InlinePostCard post={msg.postDetail} />}

          {/* Post list */}
          {msg.posts && msg.posts.length > 0 && <PostList posts={msg.posts} />}
        </ConversationContent>

        {/* Reaction badge */}
        {reaction ? (
          <ConversationReactions
            side="bottom"
            align={isUser ? "end" : "start"}
            className="cursor-pointer hover:scale-110 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              setReaction(null);
            }}
          >
            <span>{reaction}</span>
          </ConversationReactions>
        ) : (
          <div className="absolute -bottom-2 right-2 opacity-0 group-hover/bubble:opacity-100 transition-opacity">
            <ConversationReactions side="bottom" align={isUser ? "end" : "start"} className="flex gap-1 py-0.5 px-1 bg-white/95 border border-slate-200 shadow-sm">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setReaction("👍");
                }}
                className="hover:scale-125 transition-transform text-xs p-0.5"
                title="Thumbs up"
              >
                👍
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setReaction("✨");
                }}
                className="hover:scale-125 transition-transform text-xs p-0.5"
                title="Sparkles"
              >
                ✨
              </button>
            </ConversationReactions>
          </div>
        )}
      </ConversationBubble>
    </motion.div>
  );
}

/* ─── Slash Command Autocomplete Menu ─── */
function SlashMenu({
  filter,
  onSelect,
  onClose,
}: {
  filter: string;
  onSelect: (cmd: string) => void;
  onClose: () => void;
}) {
  const filtered = SLASH_COMMANDS.filter(
    (c) =>
      c.command.toLowerCase().includes(filter.toLowerCase()) ||
      c.description.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-white rounded-xl border border-slate-200 shadow-popover overflow-hidden z-50"
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Command className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Commands</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer">
          <X className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
      <div className="max-h-[280px] overflow-y-auto p-2">
        {filtered.map((cmd) => (
          <button
            key={cmd.command}
            onClick={() => onSelect(cmd.command + " ")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50/60 transition-all text-left group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
              {getCommandIcon(cmd.command)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono font-bold text-blue-600">{cmd.command}</code>
                <span className="text-[10px] text-slate-400 font-mono truncate">{cmd.usage}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">{cmd.description}</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400 transition-colors shrink-0" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   MAIN CHAT PANEL
   ═══════════════════════════════════════ */
export default function ChatPanel() {
  const messages = useChatStore((s) => s.messages);
  const isTyping = useChatStore((s) => s.isTyping);
  const inputValue = useChatStore((s) => s.inputValue);
  const showSlashMenu = useChatStore((s) => s.showSlashMenu);
  const slashFilter = useChatStore((s) => s.slashFilter);
  const setInputValue = useChatStore((s) => s.setInputValue);
  const setShowSlashMenu = useChatStore((s) => s.setShowSlashMenu);
  const setSlashFilter = useChatStore((s) => s.setSlashFilter);
  const processCommand = useChatStore((s) => s.processCommand);
  const clearChat = useChatStore((s) => s.clearChat);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setInputValue(val);

      if (val.startsWith("/")) {
        setShowSlashMenu(true);
        setSlashFilter(val);
      } else {
        setShowSlashMenu(false);
        setSlashFilter("");
      }
    },
    [setInputValue, setShowSlashMenu, setSlashFilter]
  );

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || isTyping) return;
    processCommand(inputValue);
    setInputValue("");
    setShowSlashMenu(false);
    setSlashFilter("");
  }, [inputValue, isTyping, processCommand, setInputValue, setShowSlashMenu, setSlashFilter]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
      if (e.key === "Escape") {
        setShowSlashMenu(false);
      }
    },
    [handleSend, setShowSlashMenu]
  );

  const handleSlashSelect = useCallback(
    (cmd: string) => {
      setInputValue(cmd);
      setShowSlashMenu(false);
      inputRef.current?.focus();
    },
    [setInputValue, setShowSlashMenu]
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden min-h-0 bg-slate-50/50">
      {/* ─── Header ─── */}
      <div className="shrink-0 px-6 py-4 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                AI Command Center
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-slate-500">
                  ArmorIQ-governed · Slash commands enabled
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Governed
            </div>
          </div>
        </div>
      </div>

      {/* ─── Messages Area ─── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-6"
      >
        <Conversation className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
          </AnimatePresence>
          {isTyping && <TypingIndicator />}
        </Conversation>
      </div>

      {/* ─── Input Area ─── */}
      <div className="shrink-0 border-t border-slate-200 bg-white/95 backdrop-blur-sm relative px-4 py-3">
        {/* Quick Shared Memory Prompts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-[11px] mb-1">
          <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <Brain className="size-3 text-purple-600" />
            Shared Memory:
          </span>
          <button
            type="button"
            onClick={() => {
              setInputValue("hey /linkedpost-123 create 3 variation based on /memory-linked-launch-post");
            }}
            className="rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 px-2.5 py-0.5 font-medium shrink-0 transition-colors cursor-pointer"
          >
            hey /linkedpost-123 create 3 variation based on /memory-linked-launch-post
          </button>
          <button
            type="button"
            onClick={() => {
              setInputValue("create 3 variation based on /memory-x-viral-thread");
            }}
            className="rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 px-2.5 py-0.5 font-medium shrink-0 transition-colors cursor-pointer"
          >
            based on /memory-x-viral-thread
          </button>
          <button
            type="button"
            onClick={() => {
              setInputValue("/memory list");
            }}
            className="rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 px-2.5 py-0.5 font-mono shrink-0 transition-colors cursor-pointer"
          >
            /memory list
          </button>
        </div>

        {/* ── PromptBar with Model Picker, Glimm Rainbow Shader, Sources & Dictation ── */}
        <PromptBar
          variant="Rounded"
          demo={false}
          value={inputValue}
          onChange={setInputValue}
          placeholder="Type a message or / for commands, @ for sources..."
          onSend={(text) => {
            if (!text || isTyping) return;
            processCommand(text);
            setInputValue("");
          }}
        />

        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-[11px] text-slate-400">
            Type <code className="px-1 py-0.5 rounded bg-slate-100 text-blue-600 font-mono text-[10px]">/</code> for commands · <code className="px-1 py-0.5 rounded bg-slate-100 text-blue-600 font-mono text-[10px]">@</code> for data sources · <code className="px-1 py-0.5 rounded bg-slate-100 text-blue-600 font-mono text-[10px]">Enter</code> to send
          </span>
          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            ArmorIQ Policy Verified
          </span>
        </div>
      </div>
    </div>
  );
}
