import { AgentRole, ArmorIQPolicyRule } from '../types';

/**
 * AdLoop ArmorIQ Policy Matrix
 * 
 * Per PRD Section 5 & 10:
 * ArmorIQ uses default-allow if no rule matches, so we MUST write explicit DENY rules
 * bound to agent/MCP targets.
 */

export const ARMORIQ_POLICIES: ArmorIQPolicyRule[] = [
  // Strategist Agent Policies
  {
    id: 'pol-strat-allow-trends',
    agent: 'strategist',
    targetMcp: 'trends-mcp',
    actionPattern: 'fetch_trending|get_format_patterns',
    effect: 'allow',
    description: 'Strategist may inspect trending topics and format patterns'
  },
  {
    id: 'pol-strat-allow-scrape',
    agent: 'strategist',
    targetMcp: 'scraper-mcp',
    actionPattern: 'scrape_social_post|extract_viral_blueprint',
    effect: 'allow',
    description: 'Strategist may scrape public social posts and extract viral blueprints'
  },
  {
    id: 'pol-strat-allow-metrics',
    agent: 'strategist',
    targetMcp: 'workspace-mcp',
    actionPattern: 'get_past_metrics',
    effect: 'allow',
    description: 'Strategist may read historical post analytics for strategy'
  },
  {
    id: 'pol-strat-deny-publish',
    agent: 'strategist',
    targetMcp: 'publisher-mcp',
    actionPattern: 'publish_post|schedule_post|request_approval',
    effect: 'deny',
    description: 'Strategist is strictly forbidden from publishing or scheduling posts'
  },
  {
    id: 'pol-strat-deny-delete',
    agent: 'strategist',
    targetMcp: '*',
    actionPattern: 'delete_.*',
    effect: 'deny',
    description: 'Strategist cannot delete drafts, campaigns, or posts'
  },

  // Creator Agent Policies
  {
    id: 'pol-creator-allow-workspace',
    agent: 'creator',
    targetMcp: 'workspace-mcp',
    actionPattern: 'create_draft|update_draft|list_drafts|score_virality|remix_to_pattern|add_comment',
    effect: 'allow',
    description: 'Creator can create, update, score, and remix draft ad copy'
  },
  {
    id: 'pol-creator-deny-publish',
    agent: 'creator',
    targetMcp: 'publisher-mcp',
    actionPattern: 'publish_post|schedule_post',
    effect: 'deny',
    description: 'Creator has NO publish permissions; cannot go live directly without review'
  },
  {
    id: 'pol-creator-deny-delete',
    agent: 'creator',
    targetMcp: '*',
    actionPattern: 'delete_.*',
    effect: 'deny',
    description: 'Creator cannot execute destructive delete actions'
  },

  // Publisher Agent Policies
  {
    id: 'pol-pub-allow-approval',
    agent: 'publisher',
    targetMcp: 'publisher-mcp',
    actionPattern: 'request_approval|schedule_post',
    effect: 'allow',
    description: 'Publisher may request client approval and queue scheduled posts'
  },
  {
    id: 'pol-pub-allow-publish-conditional',
    agent: 'publisher',
    targetMcp: 'publisher-mcp',
    actionPattern: 'publish_post',
    effect: 'allow',
    condition: 'post.status === "approved"',
    description: 'Publisher may only publish posts that have been explicitly approved by a human'
  },
  {
    id: 'pol-pub-deny-delete',
    agent: 'publisher',
    targetMcp: '*',
    actionPattern: 'delete_.*',
    effect: 'deny',
    description: 'Publisher cannot delete historical data or posts'
  }
];

export function evaluatePolicy(
  agent: AgentRole,
  mcp: string,
  action: string,
  context: { postStatus?: string } = {}
): { allowed: boolean; ruleId?: string; reason: string } {
  // Check explicit DENY rules first
  for (const rule of ARMORIQ_POLICIES) {
    if (rule.effect === 'deny') {
      const agentMatch = rule.agent === agent;
      const mcpMatch = rule.targetMcp === '*' || rule.targetMcp === mcp;
      const actionRegex = new RegExp(`^(${rule.actionPattern})$`);
      const actionMatch = actionRegex.test(action);

      if (agentMatch && mcpMatch && actionMatch) {
        return {
          allowed: false,
          ruleId: rule.id,
          reason: `Policy Violation (${rule.id}): ${rule.description}`
        };
      }
    }
  }

  // Check conditional rules (e.g. Publisher publishing without approval)
  if (agent === 'publisher' && action === 'publish_post') {
    if (context.postStatus !== 'approved') {
      return {
        allowed: false,
        ruleId: 'pol-pub-allow-publish-conditional',
        reason: 'Policy Gate: Publisher cannot execute publish_post until human approval flag is "approved"'
      };
    }
  }

  // Check explicit ALLOW rules
  for (const rule of ARMORIQ_POLICIES) {
    if (rule.effect === 'allow') {
      const agentMatch = rule.agent === agent;
      const mcpMatch = rule.targetMcp === '*' || rule.targetMcp === mcp;
      const actionRegex = new RegExp(`^(${rule.actionPattern})$`);
      const actionMatch = actionRegex.test(action);

      if (agentMatch && mcpMatch && actionMatch) {
        return {
          allowed: true,
          ruleId: rule.id,
          reason: `Policy Allowed (${rule.id}): ${rule.description}`
        };
      }
    }
  }

  // Fallback: If not explicitly allowed for the agent role
  return {
    allowed: false,
    reason: `Strict Zero-Trust Policy: Action "${action}" on "${mcp}" is not in agent "${agent}" allowed capabilities`
  };
}
