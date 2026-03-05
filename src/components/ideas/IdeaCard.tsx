"use client";

import Link from "next/link";
import { ArrowUp, ArrowDown, MessageSquare, BookMarked, TrendingUp, TrendingDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Idea } from "@/lib/types";

interface IdeaCardProps {
  idea: Idea;
  onVote?: (id: string, value: number) => void;
  onWatch?: (id: string) => void;
}

export function IdeaCard({ idea, onVote, onWatch }: IdeaCardProps) {
  const isLong  = idea.side === "LONG";
  const upvoted = idea.userVote === 1;
  const downvoted = idea.userVote === -1;

  return (
    <article className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all group">
      <div className="flex items-start gap-3">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-0.5 pt-0.5 shrink-0">
          <button
            onClick={() => onVote?.(idea.id, 1)}
            className={`p-1 rounded transition-colors ${upvoted ? "text-emerald-600" : "text-gray-400 hover:text-emerald-600"}`}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <span className={`text-sm font-bold tabular-nums ${idea.score > 0 ? "text-emerald-600" : idea.score < 0 ? "text-red-500" : "text-gray-500"}`}>
            {idea.score}
          </span>
          <button
            onClick={() => onVote?.(idea.id, -1)}
            className={`p-1 rounded transition-colors ${downvoted ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Ticker + side badge */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${isLong ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                {isLong ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {idea.ticker}
                <span className="font-normal opacity-75">{isLong ? "LONG" : "SHORT"}</span>
              </span>
              {idea.timeframe && (
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{idea.timeframe}</span>
              )}
            </div>
            <button
              onClick={() => onWatch?.(idea.id)}
              className={`shrink-0 p-1 rounded transition-colors ${idea.isWatched ? "text-amber-500" : "text-gray-300 hover:text-amber-500"}`}
              title={idea.isWatched ? "Remove from watchlist" : "Add to watchlist"}
            >
              <BookMarked className="w-4 h-4" />
            </button>
          </div>

          <Link href={`/ideas/${idea.id}`} className="block group-hover:text-emerald-700 transition-colors">
            <h3 className="font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">{idea.title}</h3>
          </Link>

          <p className="text-sm text-gray-500 line-clamp-2 mb-2">{idea.thesis}</p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-3">
              <Link href={`/members/${idea.author.username}`} className="hover:text-gray-600 font-medium">
                {idea.author.name ?? idea.author.username}
              </Link>
              <span>{formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}</span>
            </div>
            <Link href={`/ideas/${idea.id}#comments`} className="flex items-center gap-1 hover:text-gray-600">
              <MessageSquare className="w-3.5 h-3.5" />
              {idea._count?.comments ?? 0}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
