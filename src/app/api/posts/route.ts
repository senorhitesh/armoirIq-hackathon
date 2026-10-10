import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { remixDraftToPattern, calculateViralityScore } from '@/lib/virality/scorer';

export async function GET() {
  return NextResponse.json({
    posts: dbStore.getPosts(),
    sandboxQueue: dbStore.getSandboxQueue(),
    patterns: dbStore.getPatternCards(),
    trends: dbStore.getTrendingItems(),
    agentRuns: dbStore.getAgentRuns()
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, postId, postData, patternName, scheduledFor } = body;

    if (action === 'create') {
      const created = dbStore.createDraft(postData || {});
      return NextResponse.json({ success: true, post: created });
    }

    if (action === 'approve') {
      const approved = dbStore.approvePost(postId);
      return NextResponse.json({ success: true, post: approved });
    }

    if (action === 'schedule') {
      const scheduled = dbStore.schedulePost(postId, scheduledFor);
      return NextResponse.json({ success: true, post: scheduled });
    }

    if (action === 'publish_sandbox') {
      const published = dbStore.publishPostToSandbox(postId);
      return NextResponse.json({ success: true, post: published });
    }

    if (action === 'remix') {
      const post = dbStore.getPostById(postId);
      if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

      const remixed = remixDraftToPattern(post.body, patternName, post.platform);
      const score = calculateViralityScore({ body: remixed.newBody, hookType: remixed.newHookType }, post.platform);

      const updated = dbStore.updateDraft(post.id, {
        title: remixed.newTitle,
        body: remixed.newBody,
        hookType: remixed.newHookType,
        viralityScore: score.score,
        confidenceScore: score.confidence,
        scoreExplanation: score.topReasons
      });

      return NextResponse.json({ success: true, post: updated });
    }

    if (action === 'reset_demo') {
      dbStore.resetDemoData();
      return NextResponse.json({ success: true, message: 'Demo data reset successfully' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
