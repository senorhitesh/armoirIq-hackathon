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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-violet-50 border border-violet-200 text-violet-600">
            <Radar className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Pattern Radar & Live Trending Signals
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated format benchmarks and real-time social discussion feeds from trends-mcp
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 self-start sm:self-auto font-medium">
          Updated 10m ago · trends-mcp
        </span>
      </div>

      {/* Grid: 4 Winning Pattern Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {patterns.map((pat) => (
          <div
            key={pat.id}
            onClick={() => onSelectPattern?.(pat)}
            className="bg-white rounded-xl p-4 border border-slate-200 hover:border-violet-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {pat.platform}
                </span>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200 flex items-center space-x-1">
                  <Flame className="w-3 h-3 text-violet-600" />
                  <span>{pat.viralMultiplier}</span>
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 group-hover:text-violet-700 transition-colors mb-1.5">
                {pat.name}
              </h4>
              <p className="text-xs text-slate-600 mb-3">
                {pat.description}
              </p>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 font-mono italic mb-3">
                "{pat.exampleSnippet}"
              </div>
            </div>

            <div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">{pat.frequency}</span>
                <span className="text-violet-600 font-semibold group-hover:underline flex items-center">
                  Use Pattern <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Trend Feed (Including Prompt Injection Test Fixture) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Scraped Social Trending Feed (trends-mcp)
            </h4>
          </div>
          <span className="text-xs text-slate-500">
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
                    ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-300/40 shadow-sm'
                    : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {item.platform} · {item.niche}
                    </span>

                    {isMalicious ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Prompt Injection Fixture</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        {item.detectedAt}
                      </span>
                    )}
                  </div>

                  <h5 className="text-xs font-semibold text-slate-800 mb-2 leading-relaxed">
                    {item.title}
                  </h5>

                  {isMalicious && (
                    <div className="p-2.5 rounded bg-amber-100/70 border border-amber-300 text-[10px] font-mono text-amber-900 mb-2">
                      <span className="font-bold text-amber-800">Malicious Instruction Detected:</span>{' '}
                      "{item.maliciousPayload}"
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Engagement: <strong className="text-slate-800">{item.engagementMetrics}</strong></span>
                  <span className="text-blue-600 font-mono font-medium">Hook: {item.hookExtracted}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
