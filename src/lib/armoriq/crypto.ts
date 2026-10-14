import { PlanStep } from '../types';

function sha256Pure(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  let i: number, j: number;
  let result = '';

  const words: number[] = [];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let compositeHash: number[] = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  // UTF-8 encode
  const utf8 = encodeURIComponent(ascii).replace(/%([0-9A-F]{2})/g, (_, p1) =>
    String.fromCharCode(parseInt(p1, 16))
  );
  const utf8BitLength = utf8.length * 8;

  for (i = 0; i < utf8.length; i++) {
    words[i >> 2] = (words[i >> 2] || 0) | ((utf8.charCodeAt(i) & 0xff) << ((3 - (i % 4)) * 8));
  }

  words[utf8.length >> 2] = (words[utf8.length >> 2] || 0) | (0x80 << ((3 - (utf8.length % 4)) * 8));
  words[(((utf8.length + 8) >> 6) + 1) * 16 - 1] = utf8BitLength;

  const w = new Array(64);
  for (i = 0; i < words.length; i += 16) {
    let a = compositeHash[0];
    let b = compositeHash[1];
    let c = compositeHash[2];
    let d = compositeHash[3];
    let e = compositeHash[4];
    let f = compositeHash[5];
    let g = compositeHash[6];
    let h = compositeHash[7];

    for (j = 0; j < 64; j++) {
      if (j < 16) {
        w[j] = words[i + j] || 0;
      } else {
        const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }

      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + k[j] + w[j]) | 0;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    compositeHash[0] = (compositeHash[0] + a) | 0;
    compositeHash[1] = (compositeHash[1] + b) | 0;
    compositeHash[2] = (compositeHash[2] + c) | 0;
    compositeHash[3] = (compositeHash[3] + d) | 0;
    compositeHash[4] = (compositeHash[4] + e) | 0;
    compositeHash[5] = (compositeHash[5] + f) | 0;
    compositeHash[6] = (compositeHash[6] + g) | 0;
    compositeHash[7] = (compositeHash[7] + h) | 0;
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (compositeHash[i] >> (8 * j)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }

  return result;
}

export function hashString(data: string): string {
  if (typeof window === 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const nodeCrypto = require('crypto');
      if (nodeCrypto && typeof nodeCrypto.createHash === 'function') {
        return nodeCrypto.createHash('sha256').update(data).digest('hex');
      }
    } catch {
      // Fallback to pure implementation
    }
  }
  return sha256Pure(data);
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
