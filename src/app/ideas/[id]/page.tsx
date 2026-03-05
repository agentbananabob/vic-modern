import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUp, ArrowDown, MessageSquare, TrendingUp, TrendingDown, Eye, Calendar } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export default async function IdeaPage({ params }: Params) {
  const { id } = await params;
  const session = await auth();

  const idea = await db.idea.findUnique({
    where: { id, status: "PUBLISHED" },
    include: {
      author:    { select: { id: true, username: true, name: true, avatarUrl: true, reputation: true } },
      _count:    { select: { votes: true, comments: true } },
      votes:     session?.user ? { where: { userId: session.user.id }, select: { value: true } } : false,
      watchlists: session?.user ? { where: { userId: session.user.id }, select: { id: true } } : false,
      comments: {
        where:   { parentId: null },
        orderBy: { createdAt: "asc" },
        include: {
          user:    { select: { id: true, username: true, name: true, avatarUrl: true } },
          replies: { include: { user: { select: { id: true, username: true, name: true, avatarUrl: true } } }, orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  if (!idea) notFound();

  const userVote  = (idea as { votes?: { value: number }[] }).votes?.[0]?.value ?? null;
  const isWatched = ((idea as { watchlists?: unknown[] }).watchlists?.length ?? 0) > 0;
  const isLong    = idea.side === "LONG";
  const upside    = idea.targetPrice && idea.entryPrice
    ? (((idea.targetPrice - idea.entryPrice) / idea.entryPrice) * 100).toFixed(0)
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-4">
        <Link href="/ideas" className="hover:text-gray-600">Ideas</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-600">{idea.ticker}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
        <div className="flex items-start gap-4">
          {/* Vote */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button className={`p-1.5 rounded-lg transition-colors ${userVote === 1 ? "bg-emerald-50 text-emerald-600" : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"}`}>
              <ArrowUp className="w-5 h-5" />
            </button>
            <span className={`text-base font-bold tabular-nums ${idea.score > 0 ? "text-emerald-600" : idea.score < 0 ? "text-red-500" : "text-gray-500"}`}>
              {idea.score}
            </span>
            <button className={`p-1.5 rounded-lg transition-colors ${userVote === -1 ? "bg-red-50 text-red-500" : "text-gray-400 hover:text-red-500 hover:bg-red-50"}`}>
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold ${isLong ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                {isLong ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {idea.ticker}
                {idea.exchange && <span className="text-xs font-normal opacity-60">{idea.exchange}</span>}
                <span className="text-xs font-normal ml-1">{isLong ? "LONG" : "SHORT"}</span>
              </span>
              {idea.timeframe && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{idea.timeframe}</span>}
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-3 leading-snug">{idea.title}</h1>

            {/* Price targets */}
            {(idea.entryPrice || idea.targetPrice) && (
              <div className="flex flex-wrap gap-4 text-sm mb-4">
                {idea.entryPrice  && <div><span className="text-gray-400">Entry </span><span className="font-semibold">${idea.entryPrice.toFixed(2)}</span></div>}
                {idea.targetPrice && <div><span className="text-gray-400">Target </span><span className="font-semibold">${idea.targetPrice.toFixed(2)}</span></div>}
                {upside && <div><span className="text-gray-400">Upside </span><span className={`font-semibold ${Number(upside) >= 0 ? "text-emerald-600" : "text-red-500"}`}>{Number(upside) >= 0 ? "+" : ""}{upside}%</span></div>}
              </div>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
              <Link href={`/members/${idea.author.username}`} className="font-medium text-gray-600 hover:text-emerald-600">
                {idea.author.name ?? idea.author.username}
              </Link>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(idea.createdAt), "MMM d, yyyy")}</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{idea.viewCount} views</span>
              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{idea._count.comments} comments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Thesis sections */}
      <div className="space-y-4 mb-6">
        {[
          { label: "Investment Thesis", body: idea.thesis },
          { label: "Key Catalysts", body: idea.catalysts },
          { label: "Key Risks",     body: idea.risks },
        ].filter(s => s.body).map(section => (
          <div key={section.label} className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{section.label}</h2>
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm">{section.body}</p>
          </div>
        ))}
      </div>

      {/* Comments */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6" id="comments">
        <h2 className="font-semibold text-gray-900 mb-4">Discussion <span className="text-gray-400 font-normal text-sm">({idea._count.comments})</span></h2>

        {session ? (
          <form action={async (formData: FormData) => {
            "use server";
            const body = formData.get("body") as string;
            if (!body?.trim()) return;
            await db.comment.create({ data: { body, userId: session.user.id, ideaId: id } });
          }} className="mb-6">
            <textarea name="body" rows={3} placeholder="Share your thoughts…" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y mb-2" />
            <button type="submit" className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium">
              Comment
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-500 mb-4"><Link href="/login" className="text-emerald-600 hover:underline">Sign in</Link> to join the discussion.</p>
        )}

        {idea.comments.length === 0 ? (
          <p className="text-sm text-gray-400">No comments yet.</p>
        ) : (
          <div className="space-y-4">
            {idea.comments.map(comment => (
              <div key={comment.id}>
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {(comment.user.name ?? comment.user.username)[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <Link href={`/members/${comment.user.username}`} className="text-sm font-semibold text-gray-800 hover:text-emerald-600">
                        {comment.user.name ?? comment.user.username}
                      </Link>
                      <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{comment.body}</p>
                  </div>
                </div>
                {comment.replies?.map(reply => (
                  <div key={reply.id} className="flex gap-3 ml-10 mt-3">
                    <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {(reply.user.name ?? reply.user.username)[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <Link href={`/members/${reply.user.username}`} className="text-sm font-semibold text-gray-800 hover:text-emerald-600">
                          {reply.user.name ?? reply.user.username}
                        </Link>
                        <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}</span>
                      </div>
                      <p className="text-sm text-gray-700">{reply.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
