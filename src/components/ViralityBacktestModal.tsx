'use client';

import React from 'react';
import { BacktestReport } from '@/lib/virality/backtest';
import { X, TrendingUp, CheckCircle, BarChart3, Info } from 'lucide-react';
import { 
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, 
  Tooltip, CartesianGrid, Line, ComposedChart, Legend 
} from 'recharts';

interface ViralityBacktestModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: BacktestReport | null;
}

export const ViralityBacktestModal: React.FC<ViralityBacktestModalProps> = ({
  isOpen,
  onClose,
  report
}) => {
  if (!isOpen || !report) return null;

  const chartData = report.items.map(item => ({
    name: item.title.slice(0, 30) + '...',
    actualRank: item.actualRank,
    predictedRank: item.predictedRank,
    predictedScore: item.predictedScore,
    engagementRate: item.actualEngagementRate,
    delta: item.rankDelta
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel rounded-2xl border border-cyan-500/30 w-full max-w-4xl p-6 bg-[#0b0f19]/95 max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">
                Honest Virality Engine: Backtest Validation Report
              </h3>
              <p className="text-xs text-slate-400">
                Evaluating predicted virality percentiles against actual real-world post engagement ranks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Spearman Rank Correlation
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              ρ = {report.spearmanCorrelation}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Strong positive correlation (1.0 is perfect)
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Held-Out Sample Size
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {report.sampleCount} Posts
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Empirical agency historical posts
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Statistical Significance
            </span>
            <div className="text-sm font-bold text-cyan-300 mt-2">
              {report.confidencePValue}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Defensible model confidence
            </p>
          </div>
        </div>

        {/* Backtest Chart */}
        <div className="my-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Actual Rank vs. Predicted Rank (Held-Out Posts)</span>
            </h4>
            <span className="text-[11px] text-slate-500">
              Rank 1 = Top Performing Post
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis 
                  dataKey="actualRank" 
                  name="Actual Rank" 
                  stroke="#64748b" 
                  label={{ value: 'Actual Rank (1 = Best)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis 
                  dataKey="predictedRank" 
                  name="Predicted Rank" 
                  stroke="#64748b" 
                  label={{ value: 'Predicted Rank', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} 
                  itemStyle={{ color: '#f1f5f9' }}
                />
                <Scatter name="Posts" dataKey="predictedRank" fill="#06b6d4" />
                <Line type="monotone" dataKey="actualRank" stroke="#10b981" strokeDasharray="5 5" name="Ideal Correlation Line" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Backtest Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-56 overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase">
              <tr>
                <th className="py-2 px-3">Post Title</th>
                <th className="py-2 px-3">Actual Rank</th>
                <th className="py-2 px-3">Predicted Rank</th>
                <th className="py-2 px-3">Rank Delta</th>
                <th className="py-2 px-3">Predicted Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {report.items.map(item => (
                <tr key={item.id} className="hover:bg-slate-900/40">
                  <td className="py-2 px-3 font-sans max-w-xs truncate">{item.title}</td>
                  <td className="py-2 px-3 font-bold text-white">#{item.actualRank}</td>
                  <td className="py-2 px-3 font-bold text-cyan-400">#{item.predictedRank}</td>
                  <td className="py-2 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      item.rankDelta <= 1 ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      Δ {item.rankDelta}
                    </span>
                  </td>
                  <td className="py-2 px-3">{item.predictedScore}/100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
