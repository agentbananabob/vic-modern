import { Suspense } from "react";
import Link from "next/link";
import { PlusCircle, TrendingUp, TrendingDown, Flame, Clock, MessageSquare } from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { IdeaCard } from "@/components/ideas/IdeaCard";

interface PageProps {
  searchParams: Promise<{ sort?: string; side?: string; page?: string }>;
}

export default async function IdeasPage({ searchParams }: PageProps) {
  const { sort = "score", side, page = "1" } = await searchParams;
  const session  = await auth();
  const pageNum  = parseInt(page);
  const pageSize = 20;

  const where = {
    status: "PUBLISHED" as const,
    ...(side ? { side: side as "LONG" | "SHORT" } : {}),
  };

  const orderBy =
    sort === "new"       ? { createdAt: "desc" as const } :
    sort === "discussed" ? { comments: { _count: "desc" as const } } :
                           { score: "desc" as const };

  const [ideas, total] = await Promise.all([
    db.idea.findMany({
      where,
      orderBy,
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      include: {
        author: { select: { id: true, username: true, name: true, avatarUrl: true, reputation: true } },
        _count:  { select: { votes: true, comments: true } },
        ...(session?.user ? {
          votes:      { where: { userId: session.user.id }, select: { value: true } },
          watchlists: { where: { userId: session.user.id }, select: { id: true } },
        } : {}),
      },
    }),
    db.idea.count({ where }),
  ]);

  const enriched = ideas.map(i => ({
    ...i,
    userVote:  (i as { votes?: { value: number }[] }).votes?.[0]?.value ?? null,
    isWatched: ((i as { watchlists?: unknown[] }).watchlists?.length ?? 0) > 0,
  }));

  const sortLinks = [
    { label: "Top",       value: "score",     icon: <Flame className="w-3.5 h-3.5" /> },
    { label: "New",       value: "new",        icon: <Clock className="w-3.5 h-3.5" /> },
    { label: "Discussed", value: "discussed",  icon: <MessageSquare className="w-3.5 h-3.5" /> },
  ];

  const sideLinks = [
    { label: "All",   value: undefined },
    { label: "Long",  value: "LONG",  icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> },
    { label: "Short", value: "SHORT", icon: <TrendingDown className="w-3.5 h-3.5 text-red-500" /> },
  ];

  function buildHref(params: Record<string, string | undefined>) {
    const q = new URLSearchParams({ sort, ...(side ? { side } : {}), ...(page !== "1" ? { page } : {}) });
    Object.entries(params).forEach(([k, v]) => v ? q.set(k, v) : q.delete(k));
    return `/ideas?${q}`;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Investment Ideas</h1>
        {session && (
          <Link href="/ideas/new" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors">
            <PlusCircle className="w-4 h-4" />
            Submit
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
          {sortLinks.map(s => (
            <Link key={s.value} href={buildHref({ sort: s.value, page: "1" })}
              className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${sort === s.value ? "bg-gray-100 font-medium text-gray-900" : "text-gray-500 hover:bg-gray-50"}`}>
              {s.icon}{s.label}
            </Link>
          ))}
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
          {sideLinks.map(s => (
            <Link key={s.label} href={buildHref({ side: s.value, page: "1" })}
              className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${side === s.value || (!side && !s.value) ? "bg-gray-100 font-medium text-gray-900" : "text-gray-500 hover:bg-gray-50"}`}>
              {s.icon}{s.label}
            </Link>
          ))}
        </div>
      </div>

      {/* List */}
      <Suspense fallback={<div className="text-sm text-gray-400">Loading…</div>}>
        {enriched.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium mb-1">No ideas yet</p>
            <p className="text-sm">Be the first to submit one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {enriched.map(idea => (
              <IdeaCard key={idea.id} idea={idea as never} />
            ))}
          </div>
        )}
      </Suspense>

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex justify-center gap-2 mt-8">
          {pageNum > 1 && (
            <Link href={buildHref({ page: String(pageNum - 1) })} className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">
              Previous
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-gray-500">
            Page {pageNum} of {Math.ceil(total / pageSize)}
          </span>
          {pageNum * pageSize < total && (
            <Link href={buildHref({ page: String(pageNum + 1) })} className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
