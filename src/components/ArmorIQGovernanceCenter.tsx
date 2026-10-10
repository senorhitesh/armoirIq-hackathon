'use client';

import React, { useState } from 'react';
import { ArmorIQAuditLogEntry, ArmorIQPolicyRule } from '@/lib/types';
import { ARMORIQ_POLICIES } from '@/lib/armoriq/policies';
import { 
  ShieldCheck, ShieldAlert, Lock, CheckCircle2, XCircle, 
  FileCode, Layers, GitBranch, ExternalLink, Hash, Info 
} from 'lucide-react';

interface ArmorIQGovernanceCenterProps {
  auditLogs: ArmorIQAuditLogEntry[];
}

export const ArmorIQGovernanceCenter: React.FC<ArmorIQGovernanceCenterProps> = ({
  auditLogs
}) => {
  const [activeTab, setActiveTab] = useState<'audit_logs' | 'policy_studio' | 'merkle_tree'>('audit_logs');
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('all');

  const filteredLogs = selectedAgentFilter === 'all'
    ? auditLogs
    : auditLogs.filter(l => l.agentId === selectedAgentFilter);

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 mb-8 shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
              <span>ArmorIQ Governance & Audit Center</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                Merkle Intent Verified
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Zero-trust policy enforcement, cryptographic plan signatures, and immutable audit logs
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('audit_logs')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'audit_logs'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Audit Trail ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('policy_studio')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'policy_studio'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Policy Studio ({ARMORIQ_POLICIES.length})
          </button>
          <button
            onClick={() => setActiveTab('merkle_tree')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'merkle_tree'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Merkle Architecture
          </button>
        </div>
      </div>

      {/* TAB 1: AUDIT LOGS */}
      {activeTab === 'audit_logs' && (
        <div className="mt-5 space-y-3">
          
          {/* Filter Bar */}
          <div className="flex items-center justify-between text-xs pb-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">
              Immutable Verification History
            </span>

            <div className="flex items-center space-x-1">
              <span className="text-slate-500 mr-1">Agent:</span>
              {['all', 'strategist', 'creator', 'publisher'].map(agent => (
                <button
                  key={agent}
                  onClick={() => setSelectedAgentFilter(agent)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono capitalize transition-all ${
                    selectedAgentFilter === agent
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {agent}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Agent</th>
                  <th className="py-2.5 px-3">Target MCP & Action</th>
                  <th className="py-2.5 px-3">Plan Reference</th>
                  <th className="py-2.5 px-3">Merkle Proof</th>
                  <th className="py-2.5 px-3">Enforcement Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No audit events recorded yet. Run a demo flow above to generate cryptographic audit entries.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {entry.decision === 'allowed' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center space-x-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ALLOWED</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-500/40 flex items-center space-x-1 w-fit">
                            <XCircle className="w-3 h-3" />
                            <span>BLOCKED</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-200 capitalize font-sans">
                        {entry.agentId}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white">
                        {entry.mcp}.<span className="text-cyan-400">{entry.action}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {entry.planRef}
                      </td>
                      <td className="py-2.5 px-3">
                        {entry.merkleVerified ? (
                          <span className="text-emerald-400 text-[11px] font-sans font-semibold">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="text-rose-400 text-[11px] font-sans font-semibold">
                            ✗ Mismatch
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-xs text-slate-300 max-w-xs truncate" title={entry.policyReason}>
                        {entry.policyReason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: POLICY STUDIO */}
      {activeTab === 'policy_studio' && (
        <div className="mt-5 space-y-4">
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-200 flex items-center space-x-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Per ArmorIQ specification, unconfigured actions are allowed by default. AdLoop strictly defines explicit DENY rules bound to agent and MCP targets to prevent rogue actions.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['strategist', 'creator', 'publisher'] as const).map(role => {
              const roleRules = ARMORIQ_POLICIES.filter(r => r.agent === role);

              return (
                <div key={role} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                      <h4 className="text-xs font-extrabold uppercase text-white tracking-wider capitalize">
                        {role} Agent Policy
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {roleRules.length} rules
                      </span>
                    </div>

                    <div className="space-y-2">
                      {roleRules.map(rule => (
                        <div
                          key={rule.id}
                          className={`p-2 rounded-lg border text-xs ${
                            rule.effect === 'deny'
                              ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                              : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono font-bold text-[11px]">
                              {rule.actionPattern}
                            </span>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              rule.effect === 'deny' ? 'bg-rose-950 text-rose-400' : 'bg-emerald-950 text-emerald-400'
                            }`}>
                              {rule.effect}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {rule.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MERKLE TREE ARCHITECTURE */}
      {activeTab === 'merkle_tree' && (
        <div className="mt-5 space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed space-y-3">
            <h4 className="text-sm font-bold text-white font-sans flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              <span>How ArmorIQ Intent Verification Works Under the Hood</span>
            </h4>
            <p>
              1. <strong>Deterministic Plan Capture:</strong> The agent runtime generates an explicit plan `{'{ goal, steps[{ mcp, action, params }] }'}`.
            </p>
            <p>
              2. <strong>Merkle Tree Construction:</strong> Each step is hashed using SHA-256 (`H(step) = SHA256(canonical_json)`). A binary Merkle tree is computed to calculate the Merkle Root.
            </p>
            <p>
              3. <strong>Intent Token Minting:</strong> ArmorIQ cryptographically signs the Merkle Root and issues an `IntentToken` with inclusion proofs for each step.
            </p>
            <p>
              4. <strong>Cryptographic Invocation Check:</strong> On `client.invoke(mcp, action, token, params)`:
              <br />
              - ArmorIQ reconstitutes the leaf hash from the active tool invocation.
              <br />
              - The sibling proof hashes are folded upwards to verify if it reaches the signed Merkle Root.
              <br />
              - If an attacker injects an unplanned tool (e.g., prompt injection command `delete_drafts`), the leaf hash cannot recreate the signed root, throwing <span className="text-amber-400 font-bold">IntentMismatchException</span>.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
