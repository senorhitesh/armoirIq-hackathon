import { NextRequest, NextResponse } from "next/server";
import { scrapeSocialPost, extractViralBlueprint } from "@/lib/scraper/social-scraper";

const SCRAPER_TOOLS = [
  {
    name: "scrape_social_post",
    description: "Scrapes a live public social media post from 𝕏 (Twitter), LinkedIn, YouTube, Instagram, or Web and extracts raw text copy, author handle, media photos, and engagement metrics",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Public URL of the post (e.g. x.com/..., linkedin.com/..., youtube.com/shorts/...)" },
        platform: { type: "string", description: "Optional platform hint: x | linkedin | instagram | youtube | meta" },
      },
      required: ["url"],
    },
  },
  {
    name: "extract_viral_blueprint",
    description: "Analyzes social post copy and extracts viral hook formulas, tone cadence, structural flow, and AI image ad prompts for Agent Memory House",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Post title" },
        content: { type: "string", description: "Full text content of the post" },
        platform: { type: "string", description: "Target social platform" },
      },
      required: ["content"],
    },
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { method, params, id } = body;

    // Handle tools/list
    if (method === "tools/list") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id: id ?? 1,
        result: { tools: SCRAPER_TOOLS },
      });
    }

    // Handle tools/call
    if (method === "tools/call") {
      const toolName = params?.name;
      const args = params?.arguments || {};

      if (toolName === "scrape_social_post") {
        const url = args.url;
        if (!url) {
          return NextResponse.json({
            jsonrpc: "2.0",
            id: id ?? 1,
            error: { code: -32602, message: "Missing required argument 'url'" },
          });
        }

        const scraped = await scrapeSocialPost(url, args.platform);
        const blueprint = extractViralBlueprint(scraped);

        return NextResponse.json({
          jsonrpc: "2.0",
          id: id ?? 1,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    scraped,
                    blueprint,
                  },
                  null,
                  2
                ),
              },
            ],
          },
        });
      }

      if (toolName === "extract_viral_blueprint") {
        const content = args.content || "";
        const title = args.title || "Social Post";
        const platform = args.platform || "x";

        const mockScraped = {
          platform,
          title,
          author: "Creator",
          content,
          photos: [],
          metrics: { views: "1M", likes: "20K", shares: "3K", ctr: "5.0%" },
          sourceUrl: "",
        };

        const blueprint = extractViralBlueprint(mockScraped as any);

        return NextResponse.json({
          jsonrpc: "2.0",
          id: id ?? 1,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    blueprint,
                  },
                  null,
                  2
                ),
              },
            ],
          },
        });
      }

      return NextResponse.json({
        jsonrpc: "2.0",
        id: id ?? 1,
        error: { code: -32601, message: `Tool "${toolName}" not found on scraper-mcp` },
      });
    }

    // Fallback info
    return NextResponse.json({
      mcp: "scraper-mcp",
      version: "1.0.0",
      description: "Live Social Scraper & Viral Blueprint Extraction MCP Server",
      tools: SCRAPER_TOOLS.map((t) => t.name),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: { code: -32603, message: err?.message || "Internal MCP error" },
      },
      { status: 500 }
    );
  }
}
