'use client';

import React from 'react';
import { ShieldAlert, ShieldCheck, Zap, TrendingUp } from 'lucide-react';

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
      <div className="rounded-xl p-4 border border-blue-200 bg-white shadow-xs relative overflow-hidden group hover:border-blue-400 hover:shadow-sm transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            ArmorIQ Governance
          </span>
          <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 flex items-baseline space-x-1.5">
          <span>100%</span>
          <span className="text-xs font-semibold text-blue-600">Merkle Verified</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Zero-trust cryptographic plan validation per step
        </p>
      </div>

      {/* 2. Blocked Actions / Rogue Defense */}
      <div className="rounded-xl p-4 border border-rose-200 bg-white shadow-xs relative overflow-hidden group hover:border-rose-400 hover:shadow-sm transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Rogue Actions Blocked
          </span>
          <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-rose-600 flex items-baseline space-x-1.5">
          <span>{blockedCount}</span>
          <span className="text-xs font-semibold text-rose-500">Attacks Stopped</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Policy denies & prompt injections neutralized
        </p>
      </div>

      {/* 3. Governed Actions Total */}
      <div className="rounded-xl p-4 border border-indigo-200 bg-white shadow-xs relative overflow-hidden group hover:border-indigo-400 hover:shadow-sm transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Governed Steps
          </span>
          <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 flex items-baseline space-x-1.5">
          <span>{totalSteps}</span>
          <span className="text-xs font-semibold text-indigo-600">MCP Invocations</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Trends, Workspace, & Sandbox Publisher
        </p>
      </div>

      {/* 4. Virality Accuracy & Backtest */}
      <div 
        onClick={onOpenBacktest}
        className="rounded-xl p-4 border border-emerald-200 bg-white shadow-xs relative overflow-hidden group hover:border-emerald-400 hover:shadow-sm transition-all cursor-pointer"
        title="Click to view full backtest scatter chart and Spearman correlation calculation"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
            <span>Backtest Accuracy</span>
            <span className="text-[10px] text-emerald-600 underline font-normal">View Chart</span>
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-emerald-700 flex items-baseline space-x-1.5">
          <span>{spearmanCorrelation}</span>
          <span className="text-xs font-semibold text-emerald-600">Spearman Rank</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Avg Virality Score: <span className="text-slate-900 font-bold">{avgViralityScore}/100</span>
        </p>
      </div>

    </div>
  );
};
