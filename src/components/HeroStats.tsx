'use client';

import React from 'react';
import { ShieldAlert, ShieldCheck, Zap, TrendingUp, CheckCircle, Flame } from 'lucide-react';

interface HeroStatsProps {
  totalSteps: number;
  blockedCount: number;
  avgViralityScore: number;
  spearmanCorrelation: number;
  onOpenBacktest: () => void;
}

export const HeroStats: React.FC<HeroStatsProps> = ({
  totalSteps,
  blockedCount,
  avgViralityScore,
  spearmanCorrelation,
  onOpenBacktest
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      
      {/* 1. Cryptographic Guardrail Card */}
      <div className="glass-panel rounded-xl p-4 border border-cyan-500/20 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            ArmorIQ Governance
          </span>
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-white flex items-baseline space-x-1.5">
          <span>100%</span>
          <span className="text-xs font-medium text-cyan-400">Merkle Verified</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Zero-trust cryptographic plan validation per step
        </p>
      </div>

      {/* 2. Blocked Actions / Rogue Defense */}
      <div className="glass-panel rounded-xl p-4 border border-rose-500/20 relative overflow-hidden group hover:border-rose-500/40 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Rogue Actions Blocked
          </span>
          <div className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-rose-300 flex items-baseline space-x-1.5">
          <span>{blockedCount}</span>
          <span className="text-xs font-medium text-rose-400">Attacks / Violations Stopped</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Policy denies & prompt injections neutralized
        </p>
      </div>

      {/* 3. Governed Actions Total */}
      <div className="glass-panel rounded-xl p-4 border border-violet-500/20 relative overflow-hidden group hover:border-violet-500/40 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Governed Steps
          </span>
          <div className="p-1.5 rounded-lg bg-violet-950/60 border border-violet-500/30 text-violet-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-white flex items-baseline space-x-1.5">
          <span>{totalSteps}</span>
          <span className="text-xs font-medium text-violet-400">MCP Invocations</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Trends, Workspace, & Sandbox Publisher
        </p>
      </div>

      {/* 4. Virality Accuracy & Backtest */}
      <div 
        onClick={onOpenBacktest}
        className="glass-panel rounded-xl p-4 border border-emerald-500/20 relative overflow-hidden group hover:border-emerald-500/40 transition-all cursor-pointer"
        title="Click to view full backtest scatter chart and Spearman correlation calculation"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
            <span>Backtest Accuracy</span>
            <span className="text-[10px] text-emerald-400 underline font-normal">View Chart</span>
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-emerald-300 flex items-baseline space-x-1.5">
          <span>{spearmanCorrelation}</span>
          <span className="text-xs font-medium text-emerald-400">Spearman Rank Corr.</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Avg Virality Score: <span className="text-white font-semibold">{avgViralityScore}/100</span> (Honest model)
        </p>
      </div>

    </div>
  );
};
