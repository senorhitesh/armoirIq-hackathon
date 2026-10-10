import crypto from 'crypto';
import { PlanStep } from '../types';

export function hashString(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function hashStep(step: { mcp: string; action: string; params: Record<string, any> }): string {
  // Canonical serialization for deterministic hashing
  const canonical = JSON.stringify({
    mcp: step.mcp,
    action: step.action,
    params: step.params || {}
  }, Object.keys(step.params || {}).sort());
  return hashString(canonical);
}

export interface MerkleProofItem {
  position: 'left' | 'right';
  hash: string;
}

export interface MerkleTreeResult {
  root: string;
  leafHashes: string[];
  proofs: Record<string, MerkleProofItem[]>;
}

/**
 * Builds a deterministic binary Merkle Tree from plan steps
 */
export function buildMerkleTree(steps: PlanStep[]): MerkleTreeResult {
  if (steps.length === 0) {
    const emptyRoot = hashString('empty_plan');
    return { root: emptyRoot, leafHashes: [], proofs: {} };
  }

  const leafHashes = steps.map(step => hashStep(step));
  const proofs: Record<string, MerkleProofItem[]> = {};

  steps.forEach((step, idx) => {
    proofs[step.id] = [];
  });

  let currentLevel = [...leafHashes];
  let levelIndices = steps.map((_, i) => i);

  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    const nextIndices: number[] = [];

    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;

      // Update proofs for leaves that map to these nodes
      for (let sIdx = 0; sIdx < steps.length; sIdx++) {
        const stepId = steps[sIdx].id;
        const currentPos = levelIndices[sIdx];
        if (currentPos === i) {
          proofs[stepId].push({ position: 'right', hash: right });
        } else if (currentPos === i + 1) {
          proofs[stepId].push({ position: 'left', hash: left });
        }
      }

      const combined = hashString(left + right);
      nextLevel.push(combined);
    }

    currentLevel = nextLevel;
    levelIndices = levelIndices.map(pos => Math.floor(pos / 2));
  }

  return {
    root: currentLevel[0],
    leafHashes,
    proofs
  };
}

/**
 * Verifies a step against a Merkle root and proof
 */
export function verifyMerkleProof(
  stepHash: string,
  proof: MerkleProofItem[],
  expectedRoot: string
): boolean {
  let currentHash = stepHash;
  for (const item of proof) {
    if (item.position === 'left') {
      currentHash = hashString(item.hash + currentHash);
    } else {
      currentHash = hashString(currentHash + item.hash);
    }
  }
  return currentHash === expectedRoot;
}
