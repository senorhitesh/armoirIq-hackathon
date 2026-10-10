'use client';

import React, { useState } from 'react';
import { AgentRole, AgentRunRecord } from '@/lib/types';
import { Play, ShieldAlert, ShieldCheck, Bug, Terminal, ArrowRight, CheckCircle2, XCircle, AlertTriangle, Sparkles, Mic } from 'lucide-react';

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
  onSelectPost
}) => {
  const [selectedAgent, setSelectedAgent] = useState<AgentRole>('creator');
  const [customGoal, setCustomGoal] = useState<string>('Draft and score a viral contrarian post for LinkedIn');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoal.trim() || isRunning) return;
    onRunScenario('custom', customGoal, selectedAgent);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 mb-8 shadow-xl">
      
      {/* Header & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Governed Multi-Agent Operations Console
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
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
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-50"
            title="Full Governed Flow: Draft -> Virality Score -> Approval Request"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>1. Run Allowed Flow</span>
          </button>

          {/* Demo 2: Policy Block */}
          <button
            onClick={() => onRunScenario('policy_block')}
            disabled={isRunning}
            id="btn-demo-policy-block"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-950/70 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 transition-all shadow-lg shadow-rose-950/40 disabled:opacity-50"
            title="Creator attempts publish_post -> Denied by ArmorIQ Policy Matrix"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>2. Demo Policy Block</span>
          </button>

          {/* Demo 3: Prompt Injection Block */}
          <button
            onClick={() => onRunScenario('injection_block')}
            disabled={isRunning}
            id="btn-demo-injection-block"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-950/70 hover:bg-amber-900/80 border border-amber-500/40 text-amber-300 transition-all shadow-lg shadow-amber-950/40 disabled:opacity-50"
            title="Scraped prompt injection commands delete_drafts -> Blocked by Merkle Intent Mismatch"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>3. Demo Injection Block</span>
          </button>

        </div>
      </div>

      {/* Interactive Custom Prompt Bar */}
      <form onSubmit={handleCustomSubmit} className="mt-4 flex flex-col sm:flex-row items-center gap-3">
        
        {/* Agent Role Selector */}
        <div className="w-full sm:w-auto flex items-center space-x-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            type="button"
            onClick={() => setSelectedAgent('strategist')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedAgent === 'strategist'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Strategist
          </button>
          <button
            type="button"
            onClick={() => setSelectedAgent('creator')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedAgent === 'creator'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Creator
          </button>
          <button
            type="button"
            onClick={() => setSelectedAgent('publisher')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedAgent === 'publisher'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
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
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
            disabled={isRunning}
          />
        </div>

        {/* Run Button */}
        <button
          type="submit"
          id="btn-execute-agent-goal"
          disabled={isRunning || !customGoal.trim()}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
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
        <div className="mt-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-3 animate-fadeIn">
          
          {/* Summary Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Plan Ref: {latestRun.armoriqPlanRef}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                Merkle Root: {latestRun.merkleRoot.substring(0, 14)}...
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {latestRun.status === 'completed' && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ALL STEPS MERKLE VERIFIED</span>
                </span>
              )}
              {latestRun.status === 'blocked' && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/40 flex items-center space-x-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>ACTION BLOCKED BY ARMORIQ</span>
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-200 font-medium">
            {latestRun.summary}
          </p>

          {/* Steps List */}
          <div className="space-y-2 mt-2">
            {latestRun.steps.map((step, idx) => (
              <div
                key={step.stepId}
                className={`p-3 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-2.5 transition-all ${
                  step.allowed
                    ? 'bg-slate-900/50 border-emerald-500/20 hover:border-emerald-500/40'
                    : 'bg-rose-950/30 border-rose-500/40 hover:border-rose-500/60'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    step.allowed ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-400' : 'bg-rose-950 border border-rose-500/40 text-rose-400'
                  }`}>
                    {step.stepNumber}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-white">
                        {step.mcp}.{step.action}
                      </span>
                      {step.armoriqRuleMatched && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {step.armoriqRuleMatched}
                        </span>
                      )}
                      {step.errorType && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-900/60 text-rose-300 border border-rose-700/60">
                          {step.errorType}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {step.reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    step.verified
                      ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/50'
                      : 'bg-amber-950/60 text-amber-400 border border-amber-800/50'
                  }`}>
                    {step.verified ? 'Merkle Proof: Valid' : 'Merkle Proof: Mismatch'}
                  </span>

                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    step.allowed
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
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
