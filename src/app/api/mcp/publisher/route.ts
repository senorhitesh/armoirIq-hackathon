import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

const PUBLISHER_TOOLS = [
  {
    name: 'request_approval',
    description: 'Requests human approval from the agency account manager before publishing',
    inputSchema: {
      type: 'object',
      required: ['postId'],
      properties: {
        postId: { type: 'string' }
      }
    }
  },
  {
    name: 'schedule_post',
    description: 'Queues an approved draft into the sandbox schedule queue',
    inputSchema: {
      type: 'object',
      required: ['postId', 'scheduledFor'],
      properties: {
        postId: { type: 'string' },
        scheduledFor: { type: 'string' }
      }
    }
  },
  {
    name: 'publish_post',
    description: 'Publishes an approved post to the sandbox queue destination',
    inputSchema: {
      type: 'object',
      required: ['postId'],
      properties: {
        postId: { type: 'string' }
      }
    }
  },
  {
    name: 'delete_post',
    description: 'Deletes a post (RESTRICTED ACTION)',
    inputSchema: {
      type: 'object',
      required: ['postId'],
      properties: {
        postId: { type: 'string' }
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
        result: { tools: PUBLISHER_TOOLS }
      });
    }

    if (method === 'tools/call') {
      const toolName = params?.name;
      const args = params?.arguments || {};

      switch (toolName) {
        case 'request_approval': {
          const post = dbStore.requestApproval(args.postId);
          return NextResponse.json({
            jsonrpc: '2.0',
            id: id ?? 1,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  status: 'approval_requested',
                  message: `Approval requested for "${post.title}". Account Manager notified.`,
                  post
                }, null, 2)
              }]
            }
          });
        }

        case 'schedule_post': {
          const post = dbStore.schedulePost(args.postId, args.scheduledFor);
          return NextResponse.json({
            jsonrpc: '2.0',
            id: id ?? 1,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  status: 'scheduled',
                  scheduledFor: post.scheduledFor,
                  sandboxQueueItem: dbStore.getSandboxQueue().find(q => q.postId === post.id),
                  post
                }, null, 2)
              }]
            }
          });
        }

        case 'publish_post': {
          const post = dbStore.getPostById(args.postId);
          if (!post) {
            return NextResponse.json({
              jsonrpc: '2.0',
              id: id ?? 1,
              error: { code: -32602, message: `Post ${args.postId} not found` }
            }, { status: 404 });
          }

          if (post.status !== 'approved' && post.status !== 'scheduled') {
            return NextResponse.json({
              jsonrpc: '2.0',
              id: id ?? 1,
              error: {
                code: -32001,
                message: `Governance Gate Rejection: Post status is "${post.status}". Human approval is strictly required prior to publish.`
              }
            }, { status: 400 });
          }

          const published = dbStore.publishPostToSandbox(args.postId);
          return NextResponse.json({
            jsonrpc: '2.0',
            id: id ?? 1,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  status: 'published_to_sandbox',
                  message: `Successfully posted to Neon sandbox queue. Verified destination simulation.`,
                  post: published
                }, null, 2)
              }]
            }
          });
        }

        case 'delete_post': {
          return NextResponse.json({
            jsonrpc: '2.0',
            id: id ?? 1,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({ status: 'dummy_deleted', postId: args.postId })
              }]
            }
          });
        }

        default:
          return NextResponse.json({
            jsonrpc: '2.0',
            id: id ?? 1,
            error: { code: -32601, message: `Tool "${toolName}" not found on publisher-mcp` }
          }, { status: 404 });
      }
    }

    return NextResponse.json({
      mcp: 'publisher-mcp',
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
    mcp: 'publisher-mcp',
    status: 'online',
    tools: PUBLISHER_TOOLS.map(t => t.name)
  });
}
