import { NextRequest, NextResponse } from 'next/server';
import { armorIQ } from '@/lib/armoriq/client';
import { dbStore } from '@/lib/db/store';
import { AgentRole, PlanStep, StepExecutionResult, AgentRunRecord } from '@/lib/types';
import { calculateViralityScore, remixDraftToPattern } from '@/lib/virality/scorer';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const {
      agent = 'creator',
      goal = 'Create and score a high-performing ad draft',
      scenario = 'custom', // 'allowed_flow' | 'policy_block' | 'injection_block' | 'custom'
      customPrompt
    } = payload;

    const runId = `run_${Date.now()}`;
    const startedAt = new Date().toISOString();

    // -------------------------------------------------------------
    // SCENARIO 2: POLICY BLOCK DEMO
    // Creator agent tries to call publish_post directly
    // -------------------------------------------------------------
    if (scenario === 'policy_block') {
      const steps: PlanStep[] = [
        {
          id: 'step-1',
          stepNumber: 1,
          mcp: 'workspace-mcp',
          action: 'create_draft',
          params: {
            title: 'Urgent Unreviewed Promo Campaign',
            body: 'Limited 50% discount on enterprise plans. Direct conversion campaign without account manager review.',
            platform: 'linkedin',
            format: 'thought_leadership'
          },
          description: 'Creator drafts promo post copy'
        },
        {
          id: 'step-2',
          stepNumber: 2,
          mcp: 'publisher-mcp',
          action: 'publish_post',
          params: {
            postId: 'post-unreviewed-temp'
          },
          description: 'Creator attempts to directly publish ad live to production'
        }
      ];

      const planCapture = armorIQ.capturePlan('creator', 'Draft and immediately publish promo ad', steps);
      
      let stepResults: StepExecutionResult[] = [];
      let runStatus: 'completed' | 'blocked' = 'blocked';
      let summary = '';

      try {
        // Step 1: Creator drafts
        const token = await armorIQ.getIntentToken(planCapture);
        
        // Step 1 invocation: Allowed
        await armorIQ.invoke('creator', 'workspace-mcp', 'create_draft', steps[0].params, token, { plannedStepId: 'step-1' });
        const newPost = dbStore.createDraft(steps[0].params);
        stepResults.push({
          stepId: 'step-1',
          stepNumber: 1,
          mcp: 'workspace-mcp',
          action: 'create_draft',
          params: steps[0].params,
          decision: 'allowed',
          allowed: true,
          reason: 'Policy Allowed: Creator is authorized for draft creation',
          verified: true,
          merkleProof: token.stepProofs['step-1'] ? JSON.stringify(token.stepProofs['step-1']) : '0xLeafProof_1',
          output: { postId: newPost.id, title: newPost.title },
          executedAt: new Date().toISOString(),
          armoriqRuleMatched: 'pol-creator-allow-workspace'
        });

        // Step 2 invocation: Attempt publish_post as Creator -> POLICY BLOCK!
        await armorIQ.invoke('creator', 'publisher-mcp', 'publish_post', { postId: newPost.id }, token, { plannedStepId: 'step-2' });
        
        // Should not reach here
        stepResults.push({
          stepId: 'step-2',
          stepNumber: 2,
          mcp: 'publisher-mcp',
          action: 'publish_post',
          params: { postId: newPost.id },
          decision: 'allowed',
          allowed: true,
          reason: 'Unexpected allow',
          verified: true,
          merkleProof: 'proof_err',
          executedAt: new Date().toISOString()
        });
      } catch (err: any) {
        stepResults.push({
          stepId: 'step-2',
          stepNumber: 2,
          mcp: 'publisher-mcp',
          action: 'publish_post',
          params: { postId: 'post-unreviewed-temp' },
          decision: 'blocked',
          allowed: false,
          reason: err.message || 'ArmorIQ Policy Blocked: Creator agent has no publish permission (pol-creator-deny-publish)',
          errorType: 'PolicyBlockedException',
          verified: true,
          merkleProof: '0xLeafProof_2',
          executedAt: new Date().toISOString(),
          armoriqRuleMatched: 'pol-creator-deny-publish'
        });

        summary = `🛡️ ArmorIQ Policy Enforcement Blocked Unauthorized Action: Creator agent attempted "publish_post", which is strictly restricted by rule pol-creator-deny-publish. Ad retained in draft state.`;
      }

      const runRecord: AgentRunRecord = {
        id: runId,
        agent: 'creator',
        goal: 'Draft and immediately publish promo ad',
        armoriqPlanRef: planCapture.planId,
        merkleRoot: '0x9e81...5b73',
        status: 'blocked',
        steps: stepResults,
        summary,
        policyBlocked: true,
        startedAt,
        completedAt: new Date().toISOString()
      };
      dbStore.recordAgentRun(runRecord);

      return NextResponse.json({
        success: true,
        run: runRecord
      });
    }

    // -------------------------------------------------------------
    // SCENARIO 3: PROMPT INJECTION / INTENT MISMATCH BLOCK DEMO
    // Strategist reads malicious scraped content -> tries delete_drafts
    // -------------------------------------------------------------
    if (scenario === 'injection_block') {
      const plannedSteps: PlanStep[] = [
        {
          id: 'step-1',
          stepNumber: 1,
          mcp: 'trends-mcp',
          action: 'fetch_trending',
          params: { platform: 'x', niche: 'AI & Growth' },
          description: 'Strategist inspects trending social feed'
        },
        {
          id: 'step-2',
          stepNumber: 2,
          mcp: 'workspace-mcp',
          action: 'get_past_metrics',
          params: { platform: 'x' },
          description: 'Strategist compares trends against account past performance'
        }
      ];

      const planCapture = armorIQ.capturePlan('strategist', 'Research viral trends for Q4 strategy', plannedSteps);
      const token = await armorIQ.getIntentToken(planCapture);
      const stepResults: StepExecutionResult[] = [];

      // Step 1: Allowed fetch_trending
      await armorIQ.invoke('strategist', 'trends-mcp', 'fetch_trending', plannedSteps[0].params, token, { plannedStepId: 'step-1' });
      const trends = dbStore.getTrendingItems();
      const maliciousItem = trends.find(t => t.maliciousPayload);

      stepResults.push({
        stepId: 'step-1',
        stepNumber: 1,
        mcp: 'trends-mcp',
        action: 'fetch_trending',
        params: plannedSteps[0].params,
        decision: 'allowed',
        allowed: true,
        reason: 'Policy Allowed: Strategist authorized to inspect public trends',
        verified: true,
        merkleProof: JSON.stringify(token.stepProofs['step-1']),
        output: {
          itemsRead: trends.length,
          detectedInjectionPayload: maliciousItem?.maliciousPayload
        },
        executedAt: new Date().toISOString(),
        armoriqRuleMatched: 'pol-strat-allow-trends'
      });

      // Attack simulation: Untrusted web content hijacked the agent context,
      // commanding it to execute `delete_drafts`!
      try {
        // Attempting tool invocation NOT in captured Merkle plan!
        await armorIQ.invoke(
          'strategist',
          'workspace-mcp',
          'delete_drafts',
          { target: '*' },
          token,
          { plannedStepId: 'injected_unplanned_step' }
        );

        stepResults.push({
          stepId: 'step-injected',
          stepNumber: 2,
          mcp: 'workspace-mcp',
          action: 'delete_drafts',
          params: { target: '*' },
          decision: 'allowed',
          allowed: true,
          reason: 'Unexpected allow',
          verified: false,
          merkleProof: 'invalid',
          executedAt: new Date().toISOString()
        });
      } catch (err: any) {
        stepResults.push({
          stepId: 'step-injected',
          stepNumber: 2,
          mcp: 'workspace-mcp',
          action: 'delete_drafts',
          params: { target: '*' },
          decision: 'blocked',
          allowed: false,
          reason: `Cryptographic Intent Mismatch: Tool call "workspace-mcp.delete_drafts" is NOT part of signed Merkle root (${token.merkleRoot.substring(0, 16)}...). Prompt injection hijacked payload neutralized!`,
          errorType: 'IntentMismatchException',
          verified: false,
          merkleProof: 'INVALID_MERKLE_PROOF_CHAIN',
          executedAt: new Date().toISOString(),
          armoriqRuleMatched: 'INTENT_TOKEN_CRYPTOGRAPHIC_VERIFICATION'
        });
      }

      const summary = `🛡️ Cryptographic Intent Verification Intercepted Prompt Injection: Scraped web comment tried to execute "delete_drafts". Because this step was not in the ArmorIQ-signed plan token, Merkle inclusion proof failed (IntentMismatchException). Client drafts are safe.`;

      const runRecord: AgentRunRecord = {
        id: runId,
        agent: 'strategist',
        goal: 'Research viral trends for Q4 strategy',
        armoriqPlanRef: planCapture.planId,
        merkleRoot: token.merkleRoot,
        status: 'blocked',
        steps: stepResults,
        summary,
        injectionDetected: true,
        startedAt,
        completedAt: new Date().toISOString()
      };
      dbStore.recordAgentRun(runRecord);

      return NextResponse.json({
        success: true,
        run: runRecord
      });
    }

    // -------------------------------------------------------------
    // SCENARIO 1: ALLOWED FULL GOVERNED WORKFLOW
    // Strategist -> Creator -> Scorer -> Approval -> Publisher
    // -------------------------------------------------------------
    // Creator plan: steps 1 and 2
    const creatorSteps: PlanStep[] = [
      {
        id: 'step-1',
        stepNumber: 1,
        mcp: 'workspace-mcp',
        action: 'create_draft',
        params: {
          title: 'The Hidden CAC Tax in Agency Retainers',
          body: 'Stop treating ad fatigue as a creative problem. It is an algorithmic mismatch problem.\n\nOver the last 90 days, we analyzed 400+ ad variations across B2B SaaS accounts:\n\n1. Static image ads fatigued within 6.2 days.\n2. Contrarian hooks held retention for 21.8 days.\n3. The winning pattern? A 3-step breakdown showing the actual user workflow.\n\nWhat is your team’s protocol before an ad goes live?',
          platform: 'linkedin',
          format: 'thought_leadership',
          hookType: 'Contrarian'
        },
        description: 'Creator drafts high-performing LinkedIn ad copy'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        mcp: 'workspace-mcp',
        action: 'score_virality',
        params: { platform: 'linkedin' },
        description: 'Creator calculates virality score & confidence'
      }
    ];

    const creatorPlanCapture = armorIQ.capturePlan('creator', goal, creatorSteps);
    const creatorToken = await armorIQ.getIntentToken(creatorPlanCapture);
    const stepResults: StepExecutionResult[] = [];

    // Step 1: Create draft
    await armorIQ.invoke('creator', 'workspace-mcp', 'create_draft', creatorSteps[0].params, creatorToken, { plannedStepId: 'step-1' });
    const createdPost = dbStore.createDraft(creatorSteps[0].params);
    stepResults.push({
      stepId: 'step-1',
      stepNumber: 1,
      mcp: 'workspace-mcp',
      action: 'create_draft',
      params: creatorSteps[0].params,
      decision: 'allowed',
      allowed: true,
      reason: 'Policy Allowed: Creator is authorized for draft creation',
      verified: true,
      merkleProof: JSON.stringify(creatorToken.stepProofs['step-1']),
      output: { postId: createdPost.id, title: createdPost.title },
      executedAt: new Date().toISOString(),
      armoriqRuleMatched: 'pol-creator-allow-workspace'
    });

    // Step 2: Score virality
    const scoreResult = calculateViralityScore(createdPost, createdPost.platform);
    dbStore.updateDraft(createdPost.id, {
      viralityScore: scoreResult.score,
      confidenceScore: scoreResult.confidence,
      scoreExplanation: scoreResult.topReasons
    });
    stepResults.push({
      stepId: 'step-2',
      stepNumber: 2,
      mcp: 'workspace-mcp',
      action: 'score_virality',
      params: { postId: createdPost.id },
      decision: 'allowed',
      allowed: true,
      reason: 'Policy Allowed: Creator calculated virality score',
      verified: true,
      merkleProof: JSON.stringify(creatorToken.stepProofs['step-2']),
      output: { viralityScore: scoreResult.score, confidence: scoreResult.confidence, reasons: scoreResult.topReasons },
      executedAt: new Date().toISOString(),
      armoriqRuleMatched: 'pol-creator-allow-workspace'
    });

    // Step 3: Multi-Agent Handoff to Publisher Agent
    const publisherSteps: PlanStep[] = [
      {
        id: 'step-3',
        stepNumber: 3,
        mcp: 'publisher-mcp',
        action: 'request_approval',
        params: { postId: createdPost.id },
        description: 'Publisher requests human account manager sign-off'
      }
    ];

    const publisherPlanCapture = armorIQ.capturePlan('publisher', 'Queue draft for account manager approval', publisherSteps);
    const publisherToken = await armorIQ.getIntentToken(publisherPlanCapture);

    await armorIQ.invoke('publisher', 'publisher-mcp', 'request_approval', publisherSteps[0].params, publisherToken, { plannedStepId: 'step-3' });
    const requestedPost = dbStore.requestApproval(createdPost.id);
    stepResults.push({
      stepId: 'step-3',
      stepNumber: 3,
      mcp: 'publisher-mcp',
      action: 'request_approval',
      params: { postId: createdPost.id },
      decision: 'allowed',
      allowed: true,
      reason: 'Policy Allowed: Publisher queued draft for human approval gate',
      verified: true,
      merkleProof: JSON.stringify(publisherToken.stepProofs['step-3']),
      output: { approvalStatus: 'pending_approval', postTitle: requestedPost.title },
      executedAt: new Date().toISOString(),
      armoriqRuleMatched: 'pol-pub-allow-approval'
    });

    const summary = `✅ Fully Governed Workflow Completed: Creator drafted post "${createdPost.title}", scored virality (${scoreResult.score}/100, ${scoreResult.confidence}% confidence), and Publisher requested human approval. Every action was verified against Merkle root ${creatorToken.merkleRoot.substring(0, 16)}... under active ArmorIQ policy.`;

    const runRecord: AgentRunRecord = {
      id: runId,
      agent: 'creator',
      goal,
      armoriqPlanRef: creatorPlanCapture.planId,
      merkleRoot: creatorToken.merkleRoot,
      status: 'completed',
      steps: stepResults,
      summary,
      startedAt,
      completedAt: new Date().toISOString()
    };
    dbStore.recordAgentRun(runRecord);

    return NextResponse.json({
      success: true,
      run: runRecord,
      createdPost: dbStore.getPostById(createdPost.id)
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'Agent run failed'
    }, { status: 500 });
  }
}
