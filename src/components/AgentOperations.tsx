'use client';

import React, { useState } from 'react';
import { AgentRole, AgentRunRecord } from '@/lib/types';
import { Play, ShieldAlert, Terminal, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AgentOperationsProps {
  onRunScenario: (scenario: 'allowed_flow' | 'policy_block' | 'injection_block' | 'custom', prompt?: string, agent?: AgentRole) => Promise<void>;
  isRunning: boolean;
  latestRun: AgentRunRecord | null;
  onSelectPost?: (postId: string) => void;
}

export const AgentOperations: React.FC<AgentOperationsProps> = ({
  onRunScenario,
  isRunning,
  latestRun,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<AgentRole>('creator');
  const [customGoal, setCustomGoal] = useState<string>('Draft and score a viral contrarian post for LinkedIn');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoal.trim() || isRunning) return;
    onRunScenario('custom', customGoal, selectedAgent);
  };

  return (
    <div className="rounded-2xl p-5 border border-slate-200 bg-white mb-8 shadow-xs">
      
      {/* Header & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
              <Terminal className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-wide">
              Governed Multi-Agent Operations Console
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Every plan step is cryptographically signed by ArmorIQ before execution.
          </p>
        </div>

        {/* 1-Click Hackathon Demo Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Demo 1: Allowed Flow */}
          <button
            onClick={() => onRunScenario('allowed_flow')}
            disabled={isRunning}
            id="btn-demo-allowed"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-700 transition-all shadow-2xs disabled:opacity-50"
            title="Full Governed Flow: Draft -> Virality Score -> Approval Request"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>1. Run Allowed Flow</span>
          </button>

          {/* Demo 2: Policy Block */}
          <button
            onClick={() => onRunScenario('policy_block')}
            disabled={isRunning}
            id="btn-demo-policy-block"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-rose-700 transition-all shadow-2xs disabled:opacity-50"
            title="Creator attempts publish_post -> Denied by ArmorIQ Policy Matrix"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>2. Demo Policy Block</span>
          </button>

          {/* Demo 3: Prompt Injection Block */}
          <button
            onClick={() => onRunScenario('injection_block')}
            disabled={isRunning}
            id="btn-demo-injection-block"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-700 transition-all shadow-2xs disabled:opacity-50"
            title="Scraped prompt injection commands delete_drafts -> Blocked by Merkle Intent Mismatch"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>3. Demo Injection Block</span>
          </button>

        </div>
      </div>

      {/* Interactive Custom Prompt Bar */}
      <form onSubmit={handleCustomSubmit} className="mt-4 flex flex-col sm:flex-row items-center gap-3">
        
        {/* Agent Role Selector */}
        <div className="w-full sm:w-auto flex items-center space-x-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium">
          <button
            type="button"
            onClick={() => setSelectedAgent('strategist')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedAgent === 'strategist'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Strategist
          </button>
          <button
            type="button"
            onClick={() => setSelectedAgent('creator')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedAgent === 'creator'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Creator
          </button>
          <button
            type="button"
            onClick={() => setSelectedAgent('publisher')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedAgent === 'publisher'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Publisher
          </button>
        </div>

        {/* Prompt Input */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            id="agent-custom-goal-input"
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            placeholder="Instruct the agent (e.g., 'Draft contrarian LinkedIn ad with metrics score')..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono"
            disabled={isRunning}
          />
        </div>

        {/* Run Button */}
        <button
          type="submit"
          id="btn-execute-agent-goal"
          disabled={isRunning || !customGoal.trim()}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 transition-all cursor-pointer"
        >
          {isRunning ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Verifying & Executing...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Execute Plan</span>
            </>
          )}
        </button>

      </form>

      {/* Live Run Execution Trace */}
      {latestRun && (
        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          
          {/* Summary Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                Plan Ref: {latestRun.armoriqPlanRef}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Merkle Root: {latestRun.merkleRoot.substring(0, 14)}...
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {latestRun.status === 'completed' && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ALL STEPS MERKLE VERIFIED</span>
                </span>
              )}
              {latestRun.status === 'blocked' && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center space-x-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>ACTION BLOCKED BY ARMORIQ</span>
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-700 font-medium">
            {latestRun.summary}
          </p>

          {/* Steps List */}
          <div className="space-y-2 mt-2">
            {latestRun.steps.map((step) => (
              <div
                key={step.stepId}
                className={`p-3 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-2.5 transition-all ${
                  step.allowed
                    ? 'bg-white border-emerald-200 hover:border-emerald-300'
                    : 'bg-rose-50/50 border-rose-200 hover:border-rose-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    step.allowed ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-rose-50 border border-rose-200 text-rose-700'
                  }`}>
                    {step.stepNumber}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {step.mcp}.{step.action}
                      </span>
                      {step.armoriqRuleMatched && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {step.armoriqRuleMatched}
                        </span>
                      )}
                      {step.errorType && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          {step.errorType}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {step.reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    step.verified
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {step.verified ? 'Merkle Proof: Valid' : 'Merkle Proof: Mismatch'}
                  </span>

                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    step.allowed
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {step.allowed ? 'ALLOWED' : 'BLOCKED'}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
