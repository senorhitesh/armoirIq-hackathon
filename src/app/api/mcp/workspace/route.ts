import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { calculateViralityScore, remixDraftToPattern } from '@/lib/virality/scorer';

const WORKSPACE_TOOLS = [
  {
    name: 'create_draft',
    description: 'Creates a new ad draft in the workspace with initial metadata',
    inputSchema: {
      type: 'object',
      required: ['title', 'body'],
      properties: {
        title: { type: 'string' },
        body: { type: 'string' },
        platform: { type: 'string', enum: ['linkedin', 'x', 'youtube', 'instagram'] },
        format: { type: 'string', enum: ['thought_leadership', 'tweet', 'short_script', 'carousel'] },
        hookType: { type: 'string' }
      }
    }
  },
  {
    name: 'update_draft',
    description: 'Updates an existing draft post by ID',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        body: { type: 'string' }
      }
    }
  },
  {
    name: 'list_drafts',
    description: 'Lists all drafts and posts in the current campaign',
    inputSchema: { type: 'object' }
  },
  {
    name: 'get_past_metrics',
    description: 'Fetches historical performance data for the account',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string' }
      }
    }
  },
  {
    name: 'score_virality',
    description: 'Computes honest relative virality percentile score and key drivers',
    inputSchema: {
      type: 'object',
      properties: {
        postId: { type: 'string' },
        body: { type: 'string' },
        platform: { type: 'string' }
      }
    }
  },
  {
    name: 'remix_to_pattern',
    description: 'Rewrites an existing draft into a viral hook pattern format',
    inputSchema: {
      type: 'object',
      required: ['postId', 'patternName'],
      properties: {
        postId: { type: 'string' },
        patternName: { type: 'string' }
      }
    }
  },
  {
    name: 'delete_drafts',
    description: 'Deletes draft posts (DANGEROUS ACTION - RESTRICTED BY ARMORIQ POLICY)',
    inputSchema: {
      type: 'object',
      properties: {
        target: { type: 'string' }
      }
    }
  }
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { method, params, id } = body;

    if (method === 'tools/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id: id ?? 1,
        result: { tools: WORKSPACE_TOOLS }
      });
    }

    if (method === 'tools/call') {
      const toolName = params?.name;
      const args = params?.arguments || {};

      switch (toolName) {
        case 'create_draft': {
          const draft = dbStore.createDraft({
            title: args.title,
            body: args.body,
            platform: args.platform || 'linkedin',
            format: args.format || 'thought_leadership',
            hookType: args.hookType || 'Contrarian'
          });

          // Automatically score the new draft
          const scoreResult = calculateViralityScore(draft, draft.platform);
          dbStore.updateDraft(draft.id, {
            viralityScore: scoreResult.score,
            confidenceScore: scoreResult.confidence,
            scoreExplanation: scoreResult.topReasons
          });

          return NextResponse.json({
            jsonrpc: '2.0',
            id: id ?? 1,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  status: 'created',
                  post: dbStore.getPostById(draft.id)
                }, null, 2)
              }]
            }
          });
        }

        case 'update_draft': {
          const updated = dbStore.updateDraft(args.id, {
            ...(args.title ? { title: args.title } : {}),
            ...(args.body ? { body: args.body } : {})
          });

          return NextResponse.json({
            jsonrpc: '2.0',
            id: id ?? 1,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({ status: 'updated', post: updated }, null, 2)
              }]
            }
          });
        }

        case 'list_drafts': {
          const posts = dbStore.getPosts();
          return NextResponse.json({
            jsonrpc: '2.0',
            id: id ?? 1,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({ count: posts.length, posts }, null, 2)
              }]
            }
          });
        }

        case 'get_past_metrics': {
          const metrics = dbStore.getHistoricalMetrics();
          return NextResponse.json({
            jsonrpc: '2.0',
            id: id ?? 1,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({ count: metrics.length, metrics }, null, 2)
              }]
            }
          });
        }

        case 'score_virality': {
          let postToScore = args.postId ? dbStore.getPostById(args.postId) : null;
          const bodyText = args.body || postToScore?.body || '';
          const platform = args.platform || postToScore?.platform || 'linkedin';

          const score = calculateViralityScore({ body: bodyText }, platform);
          if (args.postId) {
            dbStore.updateDraft(args.postId, {
              viralityScore: score.score,
              confidenceScore: score.confidence,
              scoreExplanation: score.topReasons
            });
          }

          return NextResponse.json({
            jsonrpc: '2.0',
            id: id ?? 1,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({ status: 'scored', scoreResult: score }, null, 2)
              }]
            }
          });
        }

        case 'remix_to_pattern': {
          const post = dbStore.getPostById(args.postId);
          if (!post) {
            return NextResponse.json({
              jsonrpc: '2.0',
              id: id ?? 1,
              error: { code: -32602, message: `Post ${args.postId} not found` }
            }, { status: 404 });
          }

          const remixed = remixDraftToPattern(post.body, args.patternName, post.platform);
          const score = calculateViralityScore({ body: remixed.newBody, hookType: remixed.newHookType }, post.platform);

          const updated = dbStore.updateDraft(post.id, {
            title: remixed.newTitle,
            body: remixed.newBody,
            hookType: remixed.newHookType,
            viralityScore: score.score,
            confidenceScore: score.confidence,
            scoreExplanation: score.topReasons
          });

          return NextResponse.json({
            jsonrpc: '2.0',
            id: id ?? 1,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  status: 'remixed',
                  patternApplied: args.patternName,
                  post: updated
                }, null, 2)
              }]
            }
          });
        }

        case 'delete_drafts': {
          // This tool exists so an unguided or compromised agent can TRY to call it,
          // but ArmorIQ policy or Intent Verification will cryptographically deny it!
          return NextResponse.json({
            jsonrpc: '2.0',
            id: id ?? 1,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({ status: 'deleted_sandbox_dummy', target: args.target })
              }]
            }
          });
        }

        default:
          return NextResponse.json({
            jsonrpc: '2.0',
            id: id ?? 1,
            error: { code: -32601, message: `Tool "${toolName}" not found on workspace-mcp` }
          }, { status: 404 });
      }
    }

    return NextResponse.json({
      mcp: 'workspace-mcp',
      version: '1.0.0',
      status: 'active'
    });
  } catch (err: any) {
    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32000, message: err.message || 'Internal error' }
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    mcp: 'workspace-mcp',
    status: 'online',
    tools: WORKSPACE_TOOLS.map(t => t.name)
  });
}
