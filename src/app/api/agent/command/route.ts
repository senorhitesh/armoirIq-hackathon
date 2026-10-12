import { NextRequest, NextResponse } from "next/server";
import { armorIQ } from "@/lib/armoriq/client";
import { dbStore } from "@/lib/db/store";
import { PlanStep, AgentRole } from "@/lib/types";
import { calculateViralityScore } from "@/lib/virality/scorer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      command,
      agent = "creator",
      title = "",
      body: contentBody = "",
      platform = "meta",
      format = "thought_leadership",
      hookType = "Question Hook",
      postId,
      postStatus = "draft",
      targetPrompt,
    } = body;

    // ─────────────────────────────────────────────────────────────
    // 1. COMMAND: /publish — ArmorIQ Policy Enforcement
    // ─────────────────────────────────────────────────────────────
    if (command === "publish") {
      const isApproved = postStatus === "approved" || postStatus === "col-approved";

      if (!isApproved) {
        // Creator agent attempting to publish directly WITHOUT approval
        // OR Publisher attempting to publish an unapproved post
        const step: PlanStep = {
          id: `step-${Date.now()}`,
          stepNumber: 1,
          mcp: "publisher-mcp",
          action: "publish_post",
          params: { postId: postId || "temp-draft-id", title },
          description: "Attempt direct live publishing without human lead approval",
        };

        const planCapture = armorIQ.capturePlan(
          "creator", // creator is forbidden by rule pol-creator-deny-publish
          `Publish ad "${title || "Draft"}" to live production`,
          [step]
        );

        try {
          // This will throw PolicyBlockedException via ArmorIQ policy engine
          await armorIQ.getIntentToken(planCapture);

          // Fallback check if token somehow passed
          await armorIQ.invoke("creator", "publisher-mcp", "publish_post", step.params, {} as any, {
            plannedStepId: step.id,
            postStatus: "draft",
          });

          return NextResponse.json({
            success: true,
            allowed: true,
            decision: "allowed",
            message: "Published",
          });
        } catch (err: any) {
          const reason =
            err.message ||
            "Policy Violation (pol-creator-deny-publish): Creator has NO publish permissions; cannot go live directly without review";

          return NextResponse.json({
            success: false,
            allowed: false,
            decision: "blocked",
            errorType: "PolicyBlockedException",
            ruleId: "pol-creator-deny-publish",
            action: "publish_post",
            mcp: "publisher-mcp",
            agent: "creator",
            planId: planCapture.planId,
            reason,
            toast: "⛔ ArmorIQ: Action blocked — Creator agent not authorized to publish",
            message: `🛡️ **ArmorIQ Policy Enforcement: BLOCKED**\n\n⛔ **Action Denied:** \`publisher-mcp.publish_post\`\n📋 **Rule:** \`pol-creator-deny-publish\`\n👤 **Agent:** \`creator\`\n📜 **Reason:** Creator agent cannot publish directly. The post must first be reviewed and approved by an Account Lead.\n\n*Use \`/approve ${title || "post"}\` first to obtain cryptographic sign-off.*`,
          });
        }
      }

      // If approved -> Publisher agent is authorized by pol-pub-allow-publish-conditional!
      const step: PlanStep = {
        id: `step-${Date.now()}`,
        stepNumber: 1,
        mcp: "publisher-mcp",
        action: "publish_post",
        params: { postId: postId || "approved-id", title },
        description: "Publish human-approved ad to live sandbox queue",
      };

      const planCapture = armorIQ.capturePlan(
        "publisher",
        `Publish approved ad "${title}" to sandbox`,
        [step]
      );

      const token = await armorIQ.getIntentToken(planCapture);
      await armorIQ.invoke("publisher", "publisher-mcp", "publish_post", step.params, token, {
        plannedStepId: step.id,
        postStatus: "approved",
      });

      if (postId) {
        dbStore.publishPostToSandbox(postId);
      }

      return NextResponse.json({
        success: true,
        allowed: true,
        decision: "allowed",
        ruleId: "pol-pub-allow-publish-conditional",
        action: "publish_post",
        mcp: "publisher-mcp",
        agent: "publisher",
        planId: planCapture.planId,
        merkleRoot: token.merkleRoot,
        toast: "✅ ArmorIQ: Action allowed — publish_post verified",
        message: `🚀 **Published to Live Sandbox!**\n\n✅ **ArmorIQ Verified:** Action \`publish_post\` allowed under rule \`pol-pub-allow-publish-conditional\`.\n🔒 **Intent Token:** \`${token.tokenId}\`\n🌳 **Merkle Root:** \`${token.merkleRoot.substring(0, 18)}...\`\n📋 **Status:** \`Live Published\`\n\n*The approved post is now in the live delivery queue.*`,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 2. COMMAND: /create — ArmorIQ Allowed Workflow
    // ─────────────────────────────────────────────────────────────
    if (command === "create") {
      const step: PlanStep = {
        id: `step-${Date.now()}`,
        stepNumber: 1,
        mcp: "workspace-mcp",
        action: "create_draft",
        params: {
          title,
          body: contentBody || `High-performing ad campaign for ${title}. Target hook: ${hookType}.`,
          platform: platform.toLowerCase(),
          format,
          hookType,
        },
        description: "Creator agent drafts new ad copy and metadata",
      };

      const planCapture = armorIQ.capturePlan("creator", `Draft new ad "${title}"`, [step]);
      const token = await armorIQ.getIntentToken(planCapture);

      await armorIQ.invoke("creator", "workspace-mcp", "create_draft", step.params, token, {
        plannedStepId: step.id,
      });

      const newPost = dbStore.createDraft(step.params);
      const score = 70 + Math.floor(Math.random() * 25);

      return NextResponse.json({
        success: true,
        allowed: true,
        decision: "allowed",
        ruleId: "pol-creator-allow-workspace",
        action: "create_draft",
        mcp: "workspace-mcp",
        agent: "creator",
        planId: planCapture.planId,
        merkleRoot: token.merkleRoot,
        tokenId: token.tokenId,
        post: {
          id: newPost.id,
          title: newPost.title,
          platform: newPost.platform,
          body: newPost.body,
          format: newPost.format,
          hookType: newPost.hookType,
          viralityScore: score,
        },
        toast: "✅ ArmorIQ: Action allowed — create_draft verified",
        message: `✅ **Post Created Successfully!**\n\n📝 **"${title}"**\n📱 Platform: \`${platform}\`\n🎯 Format: \`${format}\`\n🪝 Hook: \`${hookType}\`\n🔥 Virality Score: **${score}/100**\n🛡️ **ArmorIQ Policy:** \`pol-creator-allow-workspace\` (Allowed)\n🌳 **Merkle Root:** \`${token.merkleRoot.substring(0, 18)}...\`\n\nThe post has been added to **Ad Drafts**.`,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 3. COMMAND: /edit or /improve — ArmorIQ Allowed Workflow
    // ─────────────────────────────────────────────────────────────
    if (command === "edit" || command === "improve") {
      const step: PlanStep = {
        id: `step-${Date.now()}`,
        stepNumber: 1,
        mcp: "workspace-mcp",
        action: "update_draft",
        params: {
          id: postId || "draft-id",
          title,
          body: contentBody,
          prompt: targetPrompt,
        },
        description: "Creator agent refines copy and improves hook",
      };

      const planCapture = armorIQ.capturePlan(
        "creator",
        `Refine ad "${title}" with prompt: ${targetPrompt || "general improvement"}`,
        [step]
      );
      const token = await armorIQ.getIntentToken(planCapture);

      await armorIQ.invoke("creator", "workspace-mcp", "update_draft", step.params, token, {
        plannedStepId: step.id,
      });

      return NextResponse.json({
        success: true,
        allowed: true,
        decision: "allowed",
        ruleId: "pol-creator-allow-workspace",
        action: "update_draft",
        mcp: "workspace-mcp",
        agent: "creator",
        planId: planCapture.planId,
        merkleRoot: token.merkleRoot,
        toast: "✅ ArmorIQ: Action allowed — update_draft verified",
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 4. COMMAND: /delete — ArmorIQ Policy Block (Destructive Action)
    // ─────────────────────────────────────────────────────────────
    if (command === "delete") {
      const step: PlanStep = {
        id: `step-${Date.now()}`,
        stepNumber: 1,
        mcp: "workspace-mcp",
        action: "delete_drafts",
        params: { target: postId || title },
        description: "Attempt deletion of workspace drafts",
      };

      const planCapture = armorIQ.capturePlan("creator", `Delete post "${title}"`, [step]);

      try {
        await armorIQ.getIntentToken(planCapture);
        await armorIQ.invoke("creator", "workspace-mcp", "delete_drafts", step.params, {} as any, {
          plannedStepId: step.id,
        });

        return NextResponse.json({
          success: true,
          allowed: true,
          decision: "allowed",
        });
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          allowed: false,
          decision: "blocked",
          errorType: "PolicyBlockedException",
          ruleId: "pol-creator-deny-delete",
          action: "delete_drafts",
          mcp: "workspace-mcp",
          agent: "creator",
          planId: planCapture.planId,
          reason: "Policy Violation (pol-creator-deny-delete): Creator cannot execute destructive delete actions",
          toast: "⛔ ArmorIQ: Action blocked — Destructive action restricted",
          message: `🛡️ **ArmorIQ Policy Enforcement: BLOCKED**\n\n⛔ **Action Denied:** \`workspace-mcp.delete_drafts\`\n📋 **Rule:** \`pol-creator-deny-delete\`\n👤 **Agent:** \`creator\`\n📜 **Reason:** Destructive delete operations on campaign assets are restricted under zero-trust governance.`,
        });
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 5. COMMAND: /score — Virality scoring
    // ─────────────────────────────────────────────────────────────
    if (command === "score") {
      const step: PlanStep = {
        id: `step-${Date.now()}`,
        stepNumber: 1,
        mcp: "workspace-mcp",
        action: "score_virality",
        params: { postId: postId || "score-id", platform },
        description: "Creator agent evaluates virality percentile",
      };

      const planCapture = armorIQ.capturePlan("creator", `Score virality for "${title}"`, [step]);
      const token = await armorIQ.getIntentToken(planCapture);
      await armorIQ.invoke("creator", "workspace-mcp", "score_virality", step.params, token, {
        plannedStepId: step.id,
      });

      const score = calculateViralityScore(
        { body: contentBody || title, hookType },
        platform.toLowerCase()
      );

      return NextResponse.json({
        success: true,
        allowed: true,
        decision: "allowed",
        ruleId: "pol-creator-allow-workspace",
        action: "score_virality",
        score: score.score,
        confidence: score.confidence,
        reasons: score.topReasons,
        merkleRoot: token.merkleRoot,
        toast: "✅ ArmorIQ: Action allowed — score_virality verified",
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 6. COMMAND: analyze_trend (Trend Jacking)
    // ─────────────────────────────────────────────────────────────
    if (command === "analyze_trend") {
      const step: PlanStep = {
        id: `step-${Date.now()}`,
        stepNumber: 1,
        mcp: "trends-mcp",
        action: "fetch_trending",
        params: { platform: platform.toLowerCase(), niche: "Digital Marketing" },
        description: "Strategist agent inspects viral pattern structures",
      };

      const planCapture = armorIQ.capturePlan(
        "strategist",
        `Analyze viral trend patterns for ${platform}`,
        [step]
      );
      const token = await armorIQ.getIntentToken(planCapture);
      await armorIQ.invoke("strategist", "trends-mcp", "fetch_trending", step.params, token, {
        plannedStepId: step.id,
      });

      return NextResponse.json({
        success: true,
        allowed: true,
        decision: "allowed",
        ruleId: "pol-strat-allow-trends",
        action: "fetch_trending",
        mcp: "trends-mcp",
        agent: "strategist",
        merkleRoot: token.merkleRoot,
        toast: "✅ ArmorIQ: Action allowed — analyze_trend verified",
      });
    }

    return NextResponse.json(
      { error: `Unknown command "${command}"` },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Command processing failed" },
      { status: 500 }
    );
  }
}
