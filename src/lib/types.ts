export type AgentRole = 'strategist' | 'creator' | 'publisher';

export type Platform = 'youtube' | 'x' | 'linkedin' | 'instagram';

export type PostFormat = 'short_script' | 'tweet' | 'thought_leadership' | 'carousel';

export type PostStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'approved' 
  | 'scheduled' 
  | 'published' 
  | 'rejected';

export type HookType = 
  | 'Question' 
  | 'Contrarian' 
  | 'Number/Data' 
  | 'Story/Vulnerability' 
  | 'How-To/Framework' 
  | 'Curiosity Gap';

export interface Post {
  id: string;
  campaignId: string;
  clientName: string;
  platform: Platform;
  format: PostFormat;
  title: string;
  body: string;
  hookType: HookType;
  status: PostStatus;
  viralityScore?: number;
  confidenceScore?: number;
  scoreExplanation?: string[];
  scheduledFor?: string;
  publishedAt?: string;
  armoriqPlanRef?: string;
  merkleProof?: string;
  createdByAgent?: AgentRole;
  approvalRequested?: boolean;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HistoricalPostMetric {
  id: string;
  platform: Platform;
  format: PostFormat;
  hookType: HookType;
  lengthWords: number;
  hasCta: boolean;
  postingHourUtc: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number; // percentage
  normalizedScore: number; // percentile vs account median
  actualRank?: number;
  predictedRank?: number;
  publishedAt: string;
  title: string;
}

export interface PatternCard {
  id: string;
  platform: Platform;
  name: string;
  hookPattern: string;
  format: PostFormat;
  viralMultiplier: string;
  description: string;
  exampleSnippet: string;
  keyElements: string[];
  frequency: string;
}

export interface TrendingItem {
  id: string;
  platform: Platform;
  niche: string;
  title: string;
  viewsOrUpvotes: number;
  engagementMetrics: string;
  hookExtracted: HookType;
  url?: string;
  detectedAt: string;
  maliciousPayload?: string; // used for demonstrating prompt injection mitigation!
}

export type DecisionType = 'allowed' | 'blocked' | 'hold';

export interface PlanStep {
  id: string;
  stepNumber: number;
  mcp: 'trends-mcp' | 'workspace-mcp' | 'publisher-mcp' | 'scraper-mcp';
  action: string;
  params: Record<string, any>;
  description: string;
}

export interface AgentPlan {
  planId: string;
  agent: AgentRole;
  goal: string;
  steps: PlanStep[];
  merkleRoot: string;
  intentToken: string;
  createdAt: string;
}

export interface StepExecutionResult {
  stepId: string;
  stepNumber: number;
  mcp: string;
  action: string;
  params: Record<string, any>;
  decision: DecisionType;
  allowed: boolean;
  reason: string;
  errorType?: 'PolicyBlockedException' | 'IntentMismatchException' | 'PolicyHoldException' | 'ExecutionError';
  verified: boolean;
  merkleProof: string;
  output?: any;
  executedAt: string;
  armoriqRuleMatched?: string;
}

export interface AgentRunRecord {
  id: string;
  agent: AgentRole;
  goal: string;
  armoriqPlanRef: string;
  merkleRoot: string;
  status: 'running' | 'completed' | 'blocked' | 'failed';
  steps: StepExecutionResult[];
  summary: string;
  injectionDetected?: boolean;
  policyBlocked?: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface ArmorIQPolicyRule {
  id: string;
  agent: AgentRole;
  targetMcp: string;
  actionPattern: string;
  effect: 'allow' | 'deny';
  description: string;
  condition?: string;
}

export interface ArmorIQAuditLogEntry {
  id: string;
  timestamp: string;
  agentId: AgentRole;
  mcp: string;
  action: string;
  planRef: string;
  merkleVerified: boolean;
  decision: DecisionType;
  ruleId?: string;
  policyReason: string;
  rawError?: string;
}
