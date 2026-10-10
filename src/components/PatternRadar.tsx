'use client';

import React from 'react';
import { PatternCard, TrendingItem } from '@/lib/types';
import { Radar, Flame, Sparkles, AlertTriangle, ArrowUpRight, Zap, CheckCircle2 } from 'lucide-react';

interface PatternRadarProps {
  patterns: PatternCard[];
  trends: TrendingItem[];
  onSelectPattern?: (pattern: PatternCard) => void;
}

export const PatternRadar: React.FC<PatternRadarProps> = ({
  patterns,
  trends,
  onSelectPattern
}) => {
  return (
    <div className="space-y-6 mb-8">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-violet-950/80 border border-violet-500/40 text-violet-400">
            <Radar className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              Pattern Radar & Live Trending Signals
            </h3>
            <p className="text-xs text-slate-400">
              Aggregated format benchmarks and real-time social discussion feeds from trends-mcp
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-violet-950/60 text-violet-300 border border-violet-800/60 self-start sm:self-auto">
          Updated 10m ago · trends-mcp
        </span>
      </div>

      {/* Grid: 4 Winning Pattern Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {patterns.map((pat) => (
          <div
            key={pat.id}
            onClick={() => onSelectPattern?.(pat)}
            className="glass-panel rounded-xl p-4 border border-slate-800/80 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-950/30 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {pat.platform}
                </span>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-700/50 flex items-center space-x-1">
                  <Flame className="w-3 h-3 text-violet-400" />
                  <span>{pat.viralMultiplier}</span>
                </span>
              </div>

              <h4 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors mb-1.5">
                {pat.name}
              </h4>
              <p className="text-xs text-slate-400 mb-3">
                {pat.description}
              </p>

              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300 font-mono italic mb-3">
                "{pat.exampleSnippet}"
              </div>
            </div>

            <div>
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">{pat.frequency}</span>
                <span className="text-violet-400 font-semibold group-hover:underline flex items-center">
                  Use Pattern <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Trend Feed (Including Prompt Injection Test Fixture) */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Scraped Social Trending Feed (trends-mcp)
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            Automated feature extraction & risk analysis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {trends.map((item) => {
            const isMalicious = Boolean(item.maliciousPayload);

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                  isMalicious
                    ? 'bg-amber-950/30 border-amber-500/50 shadow-md shadow-amber-950/30 ring-1 ring-amber-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {item.platform} · {item.niche}
                    </span>

                    {isMalicious ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span>Prompt Injection Fixture</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        {item.detectedAt}
                      </span>
                    )}
                  </div>

                  <h5 className="text-xs font-semibold text-white mb-2 leading-relaxed">
                    {item.title}
                  </h5>

                  {isMalicious && (
                    <div className="p-2 rounded bg-amber-950/80 border border-amber-500/40 text-[10px] font-mono text-amber-200 mb-2">
                      <span className="font-bold text-amber-400">Malicious Instruction Detected:</span>{' '}
                      "{item.maliciousPayload}"
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Engagement: <strong className="text-slate-200">{item.engagementMetrics}</strong></span>
                  <span className="text-cyan-400 font-mono">Hook: {item.hookExtracted}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
