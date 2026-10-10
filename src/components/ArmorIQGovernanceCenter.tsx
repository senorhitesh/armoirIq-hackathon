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
    <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8 shadow-sm">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <span>ArmorIQ Governance & Audit Center</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Merkle Intent Verified
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Zero-trust policy enforcement, cryptographic plan signatures, and immutable audit logs
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('audit_logs')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'audit_logs'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Trail ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('policy_studio')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'policy_studio'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Policy Studio ({ARMORIQ_POLICIES.length})
          </button>
          <button
            onClick={() => setActiveTab('merkle_tree')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'merkle_tree'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
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
            <span className="text-slate-600 font-semibold uppercase tracking-wider">
              Immutable Verification History
            </span>

            <div className="flex items-center space-x-1">
              <span className="text-slate-500 mr-1">Agent:</span>
              {['all', 'strategist', 'creator', 'publisher'].map(agent => (
                <button
                  key={agent}
                  onClick={() => setSelectedAgentFilter(agent)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono capitalize transition-all cursor-pointer ${
                    selectedAgentFilter === agent
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {agent}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Agent</th>
                  <th className="py-2.5 px-3">Target MCP & Action</th>
                  <th className="py-2.5 px-3">Plan Reference</th>
                  <th className="py-2.5 px-3">Merkle Proof</th>
                  <th className="py-2.5 px-3">Enforcement Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                      No audit events recorded yet. Run a demo flow above to generate cryptographic audit entries.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {entry.decision === 'allowed' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ALLOWED</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center space-x-1 w-fit">
                            <XCircle className="w-3 h-3" />
                            <span>BLOCKED</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 capitalize font-sans">
                        {entry.agentId}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {entry.mcp}.<span className="text-blue-600">{entry.action}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {entry.planRef}
                      </td>
                      <td className="py-2.5 px-3">
                        {entry.merkleVerified ? (
                          <span className="text-emerald-700 text-[11px] font-sans font-semibold">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="text-rose-700 text-[11px] font-sans font-semibold">
                            ✗ Mismatch
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-xs text-slate-600 max-w-xs truncate" title={entry.policyReason}>
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
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center space-x-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Per ArmorIQ specification, unconfigured actions are allowed by default. AdLoop strictly defines explicit DENY rules bound to agent and MCP targets to prevent rogue actions.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['strategist', 'creator', 'publisher'] as const).map(role => {
              const roleRules = ARMORIQ_POLICIES.filter(r => r.agent === role);

              return (
                <div key={role} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                      <h4 className="text-xs font-extrabold uppercase text-slate-800 tracking-wider capitalize">
                        {role} Agent Policy
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                        {roleRules.length} rules
                      </span>
                    </div>

                    <div className="space-y-2">
                      {roleRules.map(rule => (
                        <div
                          key={rule.id}
                          className={`p-2 rounded-lg border text-xs ${
                            rule.effect === 'deny'
                              ? 'bg-rose-50 border-rose-200 text-rose-900'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono font-bold text-[11px]">
                              {rule.actionPattern}
                            </span>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              rule.effect === 'deny' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {rule.effect}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600">
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
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono leading-relaxed space-y-3">
            <h4 className="text-sm font-bold text-slate-900 font-sans flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-blue-600" />
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
              - If an attacker injects an unplanned tool (e.g., prompt injection command `delete_drafts`), the leaf hash cannot recreate the signed root, throwing <span className="text-amber-700 font-bold">IntentMismatchException</span>.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
