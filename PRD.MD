# AdLoop PRD — Re-engineered for Flow State 2026

**One-liner:** A clean, powerful digital marketing task management workspace where agency teams manage ad campaigns, iterate on content with AI, and jack trending content — all governed under-the-hood by ArmorIQ.

**Hackathon:** Flow State 2026 (Oct 10-17). ArmorIQ is mandatory.

---

## 1. Product Vision

AdLoop is built for marketing agencies who need a fast, AI-powered workspace to:
- See how their ads are performing across accounts
- Create, edit, and iterate posts via an AI chat interface
- Spot viral trends and generate similar content instantly
- Manage campaigns on a simple Kanban board

ArmorIQ governance runs silently under the hood — the user sees a clean marketing tool, not a governance dashboard. When an action is allowed or blocked, a subtle toast notification appears.

---

## 2. Hackathon Compliance (Mandatory)

- [x] AI Agent (Vercel AI SDK + custom agent loop)
- [ ] At least one MCP server (workspace-mcp — real tool calling for post CRUD)
- [ ] ArmorIQ integration showing:
  - [ ] ✅ One action **allowed** (e.g., AI agent creates/edits a draft post)
  - [ ] ⛔ One action **blocked** (e.g., AI agent tries to publish without approval)
- [ ] Real working integration — not hardcoded/fake
- [ ] API key from platform.armoriq.ai
- [ ] Repo + README, 90s demo video, description, ArmorIQ proof screenshot

---

## 3. Core Features (4 + 1)

### Feature 1: Dashboard (Analytics)
> **Nav:** "Analytics" in sidebar

- [x] Ad account selector in header (meta-ads-account, linkedin-b2b-growth, youtube-shorts-scale)
- [x] KPI cards: CTR, Total Views, Conversion Rate, Money Spent (30d), Budget Remaining
- [x] Overview bar chart (monthly performance)
- [x] Recent Posts panel with platform, status, views, CTR, date
- [x] Upcoming deliveries/scheduled ads table
- [ ] **Polish:** Make metrics reactive to account selector (switch account → different seed data)

### Feature 2: AI Chat Bar
> **Nav:** "AI Chat" in sidebar

- [x] Chat interface with message bubbles, typing indicator, auto-scroll
- [x] Slash command system: `/create`, `/list`, `/view`, `/edit`, `/delete`, `/approve`, `/publish`, `/score`, `/help`
- [x] Autocomplete dropdown for slash commands
- [x] Post cards rendered inline in chat (post-card, post-list types)
- [x] CRUD operations on posts via chat → updates Kanban board
- [ ] **Wire to real AI:** Replace simulated responses with actual LLM calls via agent runtime
- [ ] **ArmorIQ enforcement on chat commands:** `/publish` on unapproved post → real ArmorIQ block (not just hardcoded check)
- [ ] **ArmorIQ enforcement on chat commands:** `/create` or `/edit` → real ArmorIQ allow

### Feature 3: Trend Jacking Section
> **Nav:** Replace current "Creative Space" section tabs with dedicated Trend Jacking

- [ ] **Build:** Input area to paste/feed a viral post URL or content
- [ ] **Build:** AI analyzes the viral content (hook, format, tone, structure)
- [ ] **Build:** Generates 1-3 similar posts adapted for user's brand/niche
- [ ] **Build:** Generated posts can be pushed to Kanban drafts with one click
- [ ] **Build:** Shows the "why it went viral" breakdown

### Feature 4: Creative Workspace
> **Nav:** "Creative Space" in sidebar (re-engineered from current version)

- [ ] **Build:** Post selector — pick any post from your workspace
- [ ] **Build:** AI operations panel: Improve Text, Rewrite Heading, Generate Variants
- [ ] **Build:** Linked to AI chat: `/post make three variations with description` from chat triggers workspace
- [ ] **Build:** Live preview of original vs AI-edited versions
- [ ] **Build:** Accept/reject individual changes

### Feature 5: Kanban Board (exists)
> **Nav:** "Workspace" in sidebar

- [x] Drag-and-drop columns: Ad Drafts → Pending Approval → Approved → Scheduled → Published
- [x] Task cards with priority, tags, assignees, due dates
- [x] Search, filter, display options
- [x] Quick-add new task composer
- [ ] **Polish:** Ensure chat/creative workspace CRUD syncs properly with board

---

## 4. ArmorIQ Integration (Under the Hood)

### Architecture
```
User → AI Chat / Creative Workspace → Agent Runtime (Vercel AI SDK)
                                          ↓
                              ArmorIQ SDK (capturePlan → getIntentToken → invoke)
                                          ↓
                              workspace-mcp (Next.js route handler)
                                          ↓
                              Post CRUD on seeded data store
```

### Single MCP Server: workspace-mcp
| Tool | Description |
|---|---|
| `create_draft` | Create a new draft post |
| `update_draft` | Edit an existing post |
| `list_drafts` | List all posts with optional filter |
| `score_virality` | Get AI-scored virality prediction |
| `publish_post` | Publish post (requires approval flag) |
| `delete_post` | Delete a post |
| `generate_variations` | Generate content variants for creative workspace |
| `analyze_trend` | Analyze viral content for trend jacking |

### Policy Matrix
| Action | Creator Agent | Publisher Agent |
|---|---|---|
| `create_draft` | ✅ Allowed | ❌ Denied |
| `update_draft` | ✅ Allowed | ❌ Denied |
| `score_virality` | ✅ Allowed | ❌ Denied |
| `generate_variations` | ✅ Allowed | ❌ Denied |
| `analyze_trend` | ✅ Allowed | ❌ Denied |
| `publish_post` | ❌ **BLOCKED** | ✅ Only after approval |
| `delete_post` | ❌ **BLOCKED** | ❌ **BLOCKED** |

### Demo Moments
1. **✅ Allowed:** User types `/create My New Ad` in chat → Creator agent invokes `create_draft` via workspace-mcp → ArmorIQ allows → subtle green toast: "✅ ArmorIQ: Action allowed — create_draft verified"
2. **⛔ Blocked:** User types `/publish My Draft` on unapproved post → Creator agent tries `publish_post` → ArmorIQ blocks → subtle red toast: "⛔ ArmorIQ: Action blocked — Creator agent not authorized to publish"

### UI Surfacing
- Subtle inline toast/notification when action is allowed or blocked
- No dedicated governance dashboard, no provenance panels, no audit logs in UI
- ArmorIQ is invisible until it matters

---

## 5. What to Remove from Current Codebase

### Components to Remove/Replace
- [ ] `ArmorIQGovernanceCenter.tsx` — full governance dashboard (remove)
- [ ] `ArmorIQOnboardingModal.tsx` — ArmorIQ setup wizard (remove)
- [ ] `AgentOperations.tsx` — agent scenario runner (remove)
- [ ] `HeroStats.tsx` — governance KPI stats (remove)
- [ ] `PatternRadar.tsx` — old pattern radar (replace with Trend Jacking)
- [ ] `PostProvenanceModal.tsx` — provenance chain modal (remove)
- [ ] `ViralityBacktestModal.tsx` — backtest charts (remove)
- [ ] `WorkspaceDrafts.tsx` — old draft management (replace with Creative Workspace)

### Sidebar Navigation Cleanup
- [ ] Remove: "Approvals Queue", "Campaign Views", "Agent Teams", "Integrations"
- [ ] Keep: Analytics, AI Chat, Creative Space, Workspace (Kanban)
- [ ] Add: Trend Jacking (new section)

### API Routes Cleanup
- [ ] Simplify API routes to only what's needed
- [ ] Remove: `/api/armoriq/audit`, `/api/virality/backtest`, `/api/voice/tts`
- [ ] Keep/Refactor: `/api/agent/run`, `/api/posts`, `/api/mcp`

---

## 6. Data Strategy

- **Seed data** for dashboard metrics, recent posts, and bar charts
- **Seeded AI responses** for testing (will be replaced with real LLM calls when API credits available)
- **Real MCP tool calling** — actual function execution, not mocked
- **Real ArmorIQ SDK calls** — actual `capturePlan`, `getIntentToken`, `invoke`

---

## 7. Tech Stack

| Layer | Choice |
|---|---|
| App | Next.js 16 (App Router), TypeScript, Tailwind 4, shadcn-style |
| State | Zustand (client stores) |
| Agent | Vercel AI SDK (`ai`) with structured output (zod) |
| Governance | `@armoriq/sdk` (real integration) |
| MCP | `@modelcontextprotocol/sdk` + `mcp-handler` |
| Charts | Custom CSS bar charts (current), Recharts if needed |
| Animations | Motion (framer-motion v14) |
| Icons | Lucide React |

---

## 8. Build Progress Tracker

### Phase 1: Cleanup & Restructure ✅
- [x] Strip sidebar to 5 nav items only
- [x] Remove governance-heavy components from Creative Space
- [x] Remove unused sidebar sections (Approvals Queue, Campaign Views, Agent Teams, Integrations)
- [x] Clean up unused NavId types

### Phase 2: Trend Jacking Section ✅
- [x] Build Trend Jacking view component
- [x] Input field for viral content URL/paste
- [x] AI analysis display
- [x] Generated content cards
- [x] Push to Kanban integration

### Phase 3: Creative Workspace Re-engineer ✅
- [x] Build post selector
- [x] AI operations panel
- [x] Variant generation UI
- [x] Chat command integration (`/post` commands)
- [x] Accept/reject UI

### Phase 4: ArmorIQ Real Integration ✅
- [x] Wire MCP server (`workspace-mcp`, `publisher-mcp`, `trends-mcp`)
- [x] Agent runtime with plan generation
- [x] ArmorIQ SDK: capturePlan → getIntentToken → invoke
- [x] Demo: ✅ allowed action working (`/create`, `/edit`, `/score`, variant generation)
- [x] Demo: ⛔ blocked action working (`/publish` unapproved post, `/delete` destructive action)
- [x] Subtle toast notifications for allow/block (emerald / rose variants)

### Phase 5: Polish & Demo 🔄
- [x] Account selector switches seed data (Meta, LinkedIn, YouTube)
- [ ] Real LLM calls (when API credits available)
- [ ] README update
- [ ] Demo video script
- [ ] ArmorIQ proof screenshots
