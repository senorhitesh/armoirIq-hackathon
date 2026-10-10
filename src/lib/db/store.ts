import { Post, HistoricalPostMetric, PatternCard, TrendingItem, AgentRunRecord, StepExecutionResult, AgentRole } from '../types';
import { SEED_POSTS, SEED_HISTORICAL_METRICS, SEED_PATTERNS, SEED_TRENDS } from './seed';

class WorkspaceStore {
  private posts: Post[] = [...SEED_POSTS];
  private historicalMetrics: HistoricalPostMetric[] = [...SEED_HISTORICAL_METRICS];
  private patternCards: PatternCard[] = [...SEED_PATTERNS];
  private trendItems: TrendingItem[] = [...SEED_TRENDS];
  private agentRuns: AgentRunRecord[] = [];
  private sandboxQueue: Array<{ postId: string; scheduledFor: string; publishedAt?: string; status: string; clientName: string; platform: string; title: string }> = [];

  constructor() {
    // Seed initial scheduled post to sandbox queue
    const scheduled = this.posts.find(p => p.status === 'scheduled');
    if (scheduled) {
      this.sandboxQueue.push({
        postId: scheduled.id,
        scheduledFor: scheduled.scheduledFor || '2026-10-11T14:00:00Z',
        status: 'queued_in_sandbox',
        clientName: scheduled.clientName,
        platform: scheduled.platform,
        title: scheduled.title
      });
    }
  }

  // Posts
  public getPosts(): Post[] {
    return [...this.posts];
  }

  public getPostById(id: string): Post | undefined {
    return this.posts.find(p => p.id === id);
  }

  public createDraft(postData: Partial<Post>): Post {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      campaignId: postData.campaignId || 'camp-saas',
      clientName: postData.clientName || 'ScaleFlow AI',
      platform: postData.platform || 'linkedin',
      format: postData.format || 'thought_leadership',
      title: postData.title || 'Untitled Draft',
      body: postData.body || '',
      hookType: postData.hookType || 'Contrarian',
      status: 'draft',
      viralityScore: postData.viralityScore || 75,
      confidenceScore: postData.confidenceScore || 80,
      scoreExplanation: postData.scoreExplanation || ['Initial draft baseline score'],
      createdByAgent: postData.createdByAgent || 'creator',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.posts.unshift(newPost);
    return newPost;
  }

  public updateDraft(id: string, updates: Partial<Post>): Post {
    const index = this.posts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Post ${id} not found`);
    }
    this.posts[index] = {
      ...this.posts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.posts[index];
  }

  public requestApproval(id: string): Post {
    return this.updateDraft(id, {
      status: 'pending_approval',
      approvalRequested: true
    });
  }

  public approvePost(id: string, approverName: string = 'Alex (Account Manager)'): Post {
    return this.updateDraft(id, {
      status: 'approved',
      approvedBy: approverName
    });
  }

  public schedulePost(id: string, scheduledFor: string = '2026-10-12T14:00:00Z'): Post {
    const post = this.updateDraft(id, {
      status: 'scheduled',
      scheduledFor
    });

    this.sandboxQueue.push({
      postId: post.id,
      scheduledFor,
      status: 'queued_in_sandbox',
      clientName: post.clientName,
      platform: post.platform,
      title: post.title
    });

    return post;
  }

  public publishPostToSandbox(id: string): Post {
    const post = this.getPostById(id);
    if (!post) throw new Error(`Post ${id} not found`);
    if (post.status !== 'approved' && post.status !== 'scheduled') {
      throw new Error(`Cannot publish post with status "${post.status}". Approval is strictly required.`);
    }

    const updated = this.updateDraft(id, {
      status: 'published',
      publishedAt: new Date().toISOString()
    });

    this.sandboxQueue = this.sandboxQueue.map(item => 
      item.postId === id 
        ? { ...item, status: 'published_in_sandbox', publishedAt: new Date().toISOString() } 
        : item
    );

    return updated;
  }

  public deleteDraft(id: string): boolean {
    const initialLen = this.posts.length;
    this.posts = this.posts.filter(p => p.id !== id);
    return this.posts.length < initialLen;
  }

  // Sandbox Queue
  public getSandboxQueue() {
    return [...this.sandboxQueue];
  }

  // Historical Metrics
  public getHistoricalMetrics(): HistoricalPostMetric[] {
    return [...this.historicalMetrics];
  }

  // Pattern Cards
  public getPatternCards(): PatternCard[] {
    return [...this.patternCards];
  }

  // Trend Items
  public getTrendingItems(): TrendingItem[] {
    return [...this.trendItems];
  }

  // Agent Runs
  public recordAgentRun(run: AgentRunRecord) {
    this.agentRuns.unshift(run);
  }

  public getAgentRuns(): AgentRunRecord[] {
    return [...this.agentRuns];
  }

  // Reset demo state
  public resetDemoData() {
    this.posts = [...SEED_POSTS];
    this.historicalMetrics = [...SEED_HISTORICAL_METRICS];
    this.patternCards = [...SEED_PATTERNS];
    this.trendItems = [...SEED_TRENDS];
    this.agentRuns = [];
    this.sandboxQueue = [];
  }
}

export const dbStore = new WorkspaceStore();
