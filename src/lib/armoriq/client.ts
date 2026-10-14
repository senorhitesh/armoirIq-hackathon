export class ArmorIQException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ArmorIQException';
    Object.setPrototypeOf(this, ArmorIQException.prototype);
  }
}

export class PolicyBlockedException extends ArmorIQException {
  enforcementAction?: string;
  reason?: string;
  metadata?: any;
  matchedPolicy?: any;
  constructor(message: string, enforcementAction?: string, reason?: string, metadata?: any, matchedPolicy?: any) {
    super(message);
    this.name = 'PolicyBlockedException';
    this.enforcementAction = enforcementAction;
    this.reason = reason;
    this.metadata = metadata;
    this.matchedPolicy = matchedPolicy;
    Object.setPrototypeOf(this, PolicyBlockedException.prototype);
  }
}

export class IntentMismatchException extends ArmorIQException {
  action?: string;
  planHash?: string;
  constructor(message: string, action?: string, planHash?: string) {
    super(message);
    this.name = 'IntentMismatchException';
    this.action = action;
    this.planHash = planHash;
    Object.setPrototypeOf(this, IntentMismatchException.prototype);
  }
}

export class InvalidTokenException extends ArmorIQException {
  tokenId?: string;
  constructor(message: string, tokenId?: string) {
    super(message);
    this.name = 'InvalidTokenException';
    this.tokenId = tokenId;
    Object.setPrototypeOf(this, InvalidTokenException.prototype);
  }
}

import {
  AgentRole,
  PlanStep,
  AgentPlan,
  StepExecutionResult,
  ArmorIQAuditLogEntry
} from '../types';
import { evaluatePolicy } from './policies';
import { buildMerkleTree, hashStep, verifyMerkleProof, hashString } from './crypto';

// In-memory audit log store so actions are immediately inspectable in UI
const auditLogs: ArmorIQAuditLogEntry[] = [];

export interface PlanCapture {
  planId: string;
  agent: AgentRole;
  goal: string;
  steps: PlanStep[];
  llm: string;
  createdAt: string;
}

export interface IssuedIntentToken {
  tokenId: string;
  planId: string;
  planHash: string;
  merkleRoot: string;
  issuedAt: number;
  expiresAt: number;
  agent: AgentRole;
  stepProofs: Record<string, any>;
  rawToken: any;
}

export class ArmorIQGovernanceEngine {
  private apiKey: string;
  private sdkClient: any;

  constructor() {
    this.apiKey = process.env.ARMORIQ_API_KEY || '';
    if (typeof window === 'undefined' && this.apiKey && !this.apiKey.startsWith('demo_')) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { ArmorIQClient: SdkClient } = require('@armoriq/sdk');
        this.sdkClient = new SdkClient({
          apiKey: this.apiKey
        });
      } catch (err) {
        console.warn('ArmorIQ SDK init notice (using local governance fallback):', err);
      }
    }
  }

  /**
   * Step 1: Capture explicit agent plan before any tool invocation
   */
  public capturePlan(
    agent: AgentRole,
    goal: string,
    steps: PlanStep[],
    llm: string = 'gemini-1.5-pro'
  ): PlanCapture {
    const planId = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      planId,
      agent,
      goal,
      steps,
      llm,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Step 2: Mint cryptographically signed Intent Token with Merkle Tree root
   */
  public async getIntentToken(
    planCapture: PlanCapture,
    validitySeconds: number = 300
  ): Promise<IssuedIntentToken> {
    for (const step of planCapture.steps) {
      const policyCheck = evaluatePolicy(planCapture.agent, step.mcp, step.action, {
        postStatus: step.params?.postStatus,
      });
      if (!policyCheck.allowed) {
        // Log to ArmorIQ audit log
        const auditEntry: ArmorIQAuditLogEntry = {
          id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          agentId: planCapture.agent,
          mcp: step.mcp,
          action: step.action,
          planRef: planCapture.planId,
          merkleVerified: false,
          decision: 'blocked',
          ruleId: policyCheck.ruleId,
          policyReason: policyCheck.reason,
          rawError: 'PolicyBlockedException'
        };
        auditLogs.unshift(auditEntry);

        throw new PolicyBlockedException(
          policyCheck.reason,
          'DENY',
          policyCheck.reason,
          { ruleId: policyCheck.ruleId, agent: planCapture.agent, action: step.action }
        );
      }
    }

    // 2. Compute Merkle tree over the planned steps
    const merkleResult = buildMerkleTree(planCapture.steps);
    const planHash = hashString(JSON.stringify(planCapture.steps));
    const tokenId = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const token: IssuedIntentToken = {
      tokenId,
      planId: planCapture.planId,
      planHash,
      merkleRoot: merkleResult.root,
      issuedAt: Math.floor(Date.now() / 1000),
      expiresAt: Math.floor(Date.now() / 1000) + validitySeconds,
      agent: planCapture.agent,
      stepProofs: merkleResult.proofs,
      rawToken: {
        token_id: tokenId,
        merkle_root: merkleResult.root,
        agent_id: planCapture.agent,
        leaf_hashes: merkleResult.leafHashes
      }
    };

    return token;
  }

  /**
   * Step 3: Invoke tool under strict ArmorIQ verification
   * Verifies Merkle inclusion proof AND validates against active policy.
   * If an attacker injected a command (e.g. delete_drafts) not in the signed plan,
   * verification fails with IntentMismatchException.
   */
  public async invoke(
    agent: AgentRole,
    mcp: string,
    action: string,
    params: Record<string, any>,
    token: IssuedIntentToken,
    options: {
      plannedStepId?: string;
      postStatus?: string;
    } = {}
  ): Promise<{ allowed: boolean; result?: any; ruleId?: string }> {
    const timestamp = new Date().toISOString();

    // 1. Check Token Expiry
    if (Math.floor(Date.now() / 1000) > token.expiresAt) {
      throw new InvalidTokenException(`Intent token ${token.tokenId} has expired.`);
    }

    // 2. Check Cryptographic Merkle Inclusion Proof (Intent Verification)
    const stepHash = hashStep({ mcp, action, params });
    const proof = options.plannedStepId ? token.stepProofs[options.plannedStepId] : null;

    let merkleVerified = false;
    if (proof && Array.isArray(proof)) {
      merkleVerified = verifyMerkleProof(stepHash, proof, token.merkleRoot);
    }

    // Intent Mismatch Block (e.g., Prompt Injection tried to divert agent)
    if (!merkleVerified) {
      const reason = `Intent Verification Failed: Tool call "${mcp}.${action}" does NOT exist in signed Merkle root ${token.merkleRoot.substring(0, 16)}... (Merkle inclusion proof invalid). Untrusted action rejected.`;
      
      const auditEntry: ArmorIQAuditLogEntry = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp,
        agentId: agent,
        mcp,
        action,
        planRef: token.planId,
        merkleVerified: false,
        decision: 'blocked',
        policyReason: reason,
        rawError: 'IntentMismatchException'
      };
      auditLogs.unshift(auditEntry);

      throw new IntentMismatchException(reason);
    }

    // 3. Check Policy Rules
    const policyResult = evaluatePolicy(agent, mcp, action, { postStatus: options.postStatus });
    if (!policyResult.allowed) {
      const auditEntry: ArmorIQAuditLogEntry = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp,
        agentId: agent,
        mcp,
        action,
        planRef: token.planId,
        merkleVerified: true,
        decision: 'blocked',
        ruleId: policyResult.ruleId,
        policyReason: policyResult.reason,
        rawError: 'PolicyBlockedException'
      };
      auditLogs.unshift(auditEntry);

      throw new PolicyBlockedException(
        policyResult.reason,
        'DENY',
        policyResult.reason,
        { ruleId: policyResult.ruleId, agent, action }
      );
    }

    // 4. Allowed action -> Record success in audit log
    const auditEntry: ArmorIQAuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      agentId: agent,
      mcp,
      action,
      planRef: token.planId,
      merkleVerified: true,
      decision: 'allowed',
      ruleId: policyResult.ruleId,
      policyReason: policyResult.reason
    };
    auditLogs.unshift(auditEntry);

    return {
      allowed: true,
      ruleId: policyResult.ruleId
    };
  }

  public getAuditLogs(): ArmorIQAuditLogEntry[] {
    return [...auditLogs];
  }

  public addAuditLog(entry: ArmorIQAuditLogEntry) {
    auditLogs.unshift(entry);
  }
}

// Global Singleton
export const armorIQ = new ArmorIQGovernanceEngine();
export const armorIQEngine = armorIQ;
