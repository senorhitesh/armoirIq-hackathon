import { NextRequest, NextResponse } from "next/server";
import { scrapeSocialPost, extractViralBlueprint } from "@/lib/scraper/social-scraper";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, platform: platformHint } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid post URL" },
        { status: 400 }
      );
    }

    const trimmedUrl = url.trim();

    // Perform live scrape across X, YouTube, LinkedIn, Instagram, or Web
    const scrapedData = await scrapeSocialPost(trimmedUrl, platformHint);

    // Perform AI analysis and blueprint extraction
    const blueprint = extractViralBlueprint(scrapedData);

    return NextResponse.json({
      success: true,
      scraped: scrapedData,
      blueprint,
    });
  } catch (error: any) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to scrape post from target platform",
      },
      { status: 500 }
    );
  }
}
