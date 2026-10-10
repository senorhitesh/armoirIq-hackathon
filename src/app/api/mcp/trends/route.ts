import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

const TRENDS_TOOLS = [
  {
    name: 'fetch_trending',
    description: 'Fetches currently viral posts and discussion topics across social platforms',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string', description: 'youtube | x | linkedin | all' },
        niche: { type: 'string', description: 'Industry or topic niche' }
      }
    }
  },
  {
    name: 'get_format_patterns',
    description: 'Retrieves top-performing content hook and structural formats extracted from recent viral posts',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string', description: 'youtube | x | linkedin' }
      }
    }
  }
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { method, params, id } = body;

    // Handle tools/list
    if (method === 'tools/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id: id ?? 1,
        result: { tools: TRENDS_TOOLS }
      });
    }

    // Handle tools/call
    if (method === 'tools/call') {
      const toolName = params?.name;
      const args = params?.arguments || {};

      if (toolName === 'fetch_trending') {
        const platform = args.platform || 'all';
        let items = dbStore.getTrendingItems();
        if (platform !== 'all') {
          items = items.filter(i => i.platform === platform);
        }

        return NextResponse.json({
          jsonrpc: '2.0',
          id: id ?? 1,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  status: 'success',
                  platform,
                  count: items.length,
                  trends: items
                }, null, 2)
              }
            ]
          }
        });
      }

      if (toolName === 'get_format_patterns') {
        const platform = args.platform || 'all';
        let patterns = dbStore.getPatternCards();
        if (platform !== 'all') {
          patterns = patterns.filter(p => p.platform === platform);
        }

        return NextResponse.json({
          jsonrpc: '2.0',
          id: id ?? 1,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  status: 'success',
                  platform,
                  patterns
                }, null, 2)
              }
            ]
          }
        });
      }

      return NextResponse.json({
        jsonrpc: '2.0',
        id: id ?? 1,
        error: { code: -32601, message: `Tool "${toolName}" not found on trends-mcp` }
      }, { status: 404 });
    }

    // Default metadata ping
    return NextResponse.json({
      mcp: 'trends-mcp',
      version: '1.0.0',
      status: 'active',
      endpoints: ['tools/list', 'tools/call']
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
    mcp: 'trends-mcp',
    status: 'online',
    tools: TRENDS_TOOLS.map(t => t.name)
  });
}
