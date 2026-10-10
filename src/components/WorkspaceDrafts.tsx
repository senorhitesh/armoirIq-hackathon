'use client';

import React, { useState } from 'react';
import { Post, PatternCard } from '@/lib/types';
import { 
  Sparkles, CheckCircle2, Clock, Send, ShieldCheck, 
  Share2, ChevronRight, RefreshCw, Eye, ThumbsUp, AlertCircle, FileText
} from 'lucide-react';

interface WorkspaceDraftsProps {
  posts: Post[];
  patterns: PatternCard[];
  onApprovePost: (postId: string) => Promise<void>;
  onPublishToSandbox: (postId: string) => Promise<void>;
  onRemixPost: (postId: string, patternName: string) => Promise<void>;
  onInspectProvenance: (post: Post) => void;
  isLoading: boolean;
}

export const WorkspaceDrafts: React.FC<WorkspaceDraftsProps> = ({
  posts,
  patterns,
  onApprovePost,
  onPublishToSandbox,
  onRemixPost,
  onInspectProvenance,
  isLoading
}) => {
  const [selectedPostId, setSelectedPostId] = useState<string>(posts[0]?.id || '');

  const activePost = posts.find(p => p.id === selectedPostId) || posts[0];

  const getStatusBadge = (status: Post['status']) => {
    switch (status) {
      case 'published':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Published (Sandbox)</span>
          </span>
        );
      case 'scheduled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Scheduled</span>
          </span>
        );
      case 'approved':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center space-x-1">
            <ThumbsUp className="w-3 h-3" />
            <span>Approved by Human</span>
          </span>
        );
      case 'pending_approval':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>Pending Approval Gate</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center space-x-1">
            <FileText className="w-3 h-3" />
            <span>Draft</span>
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
      
      {/* Left Column: Drafts & Campaigns List */}
      <div className="lg:col-span-5 space-y-3">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Campaign Drafts & Queue
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-medium border border-slate-200">
              {posts.length} posts
            </span>
          </div>
        </div>

        <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
          {posts.map((post) => {
            const isSelected = post.id === (activePost?.id);
            return (
              <div
                key={post.id}
                onClick={() => setSelectedPostId(post.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {post.platform} · {post.format}
                  </span>
                  {getStatusBadge(post.status)}
                </div>

                <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">
                  {post.title}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                  {post.body}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center space-x-1.5 text-blue-600 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Score: {post.viralityScore || 75}/100</span>
                    <span className="text-[10px] text-slate-500">({post.confidenceScore || 80}% conf)</span>
                  </div>

                  <span className="text-[11px] text-slate-500">
                    Agent: <span className="text-slate-800 font-mono font-medium">{post.createdByAgent || 'creator'}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Detailed Post Editor, Virality Engine & Human Approval Gate */}
      {activePost ? (
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs uppercase font-bold text-blue-600 tracking-wider">
                    Client: {activePost.clientName}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500">
                    Hook Pattern: <span className="text-slate-800 font-semibold">{activePost.hookType}</span>
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  {activePost.title}
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onInspectProvenance(activePost)}
                  id="btn-inspect-post-provenance"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                  title="Inspect ArmorIQ Plan Reference and Cryptographic Proof"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Audit Provenance</span>
                </button>
              </div>
            </div>

            {/* Virality Engine Meter & Breakdown */}
            <div className="my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded bg-blue-100 text-blue-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Virality Engine Analysis (Honest Model)
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-base font-black text-blue-600">{activePost.viralityScore || 75}</span>
                  <span className="text-xs text-slate-500">/ 100 percentile</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 ml-2">
                    {activePost.confidenceScore || 80}% Confidence
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${activePost.viralityScore || 75}%` }}
                />
              </div>

              {/* Top Reasons */}
              <div className="space-y-1">
                {(activePost.scoreExplanation || [
                  'Contrarian angle matches top 5% engagement cohort',
                  'Optimal word count for platform feed scanning',
                  'Clear conversational discussion trigger CTA'
                ]).map((reason, i) => (
                  <div key={i} className="flex items-start space-x-2 text-xs text-slate-700">
                    <span className="text-blue-600 font-bold shrink-0">✓</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ad Body Content Preview */}
            <div className="space-y-2 mb-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ad Copy & Creative Script
              </label>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap font-mono leading-relaxed max-h-[220px] overflow-y-auto">
                {activePost.body}
              </div>
            </div>

            {/* One-Click Remix to Winning Pattern */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
                  <RefreshCw className="w-3.5 h-3.5 text-violet-600" />
                  <span>Remix into Trending Pattern</span>
                </span>
                <span className="text-[11px] text-slate-500">Pattern Radar Integration</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {patterns.slice(0, 3).map((pat) => (
                  <button
                    key={pat.id}
                    onClick={() => onRemixPost(activePost.id, pat.name)}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl text-left bg-slate-50 hover:bg-violet-50/70 border border-slate-200 hover:border-violet-300 text-xs transition-all group disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 text-[11px] group-hover:text-violet-700 line-clamp-1">
                        {pat.name}
                      </span>
                      <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded border border-violet-200">
                        {pat.viralMultiplier}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">
                      {pat.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Action Footer & Human Approval Gate */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 -mx-5 -mb-5 p-5 rounded-b-2xl">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Status:</span>
              {getStatusBadge(activePost.status)}
            </div>

            <div className="flex items-center space-x-2.5">
              {/* Approval Gate: Account Manager Sign-off */}
              {activePost.status === 'pending_approval' && (
                <button
                  onClick={() => onApprovePost(activePost.id)}
                  disabled={isLoading}
                  id="btn-human-approve-post"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Account Manager Approve</span>
                </button>
              )}

              {/* Publisher Schedule / Publish to Sandbox */}
              {(activePost.status === 'approved' || activePost.status === 'scheduled') && (
                <button
                  onClick={() => onPublishToSandbox(activePost.id)}
                  disabled={isLoading}
                  id="btn-publish-sandbox"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publisher Agent: Publish (Sandbox)</span>
                </button>
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="lg:col-span-7 bg-white rounded-2xl p-8 border border-slate-200 flex items-center justify-center text-slate-500 text-sm">
          Select a draft post to view virality analysis and governance gates.
        </div>
      )}

    </div>
  );
};
