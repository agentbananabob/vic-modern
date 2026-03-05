import { redirect } from "next/navigation";
import Link from "next/link";
import { BookMarked } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { IdeaCard } from "@/components/ideas/IdeaCard";

export default async function PortfolioPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const watchlist = await db.watchlist.findMany({
    where:   { userId: session.user.id },
    orderBy: { addedAt: "desc" },
    include: {
      idea: {
        include: {
          author: { select: { id: true, username: true, name: true, avatarUrl: true, reputation: true } },
          _count:  { select: { votes: true, comments: true } },
          votes:  { where: { userId: session.user.id }, select: { value: true } },
        },
      },
    },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <BookMarked className="w-5 h-5 text-amber-500" />
        <h1 className="text-xl font-bold text-gray-900">My Watchlist</h1>
        <span className="text-sm text-gray-400 font-normal ml-1">({watchlist.length})</span>
      </div>

      {watchlist.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <BookMarked className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium mb-1">Your watchlist is empty</p>
          <p className="text-sm mb-4">Save ideas you want to track.</p>
          <Link href="/ideas" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium">
            Browse Ideas
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {watchlist.map(entry => (
            <IdeaCard
              key={entry.id}
              idea={{ ...entry.idea, userVote: entry.idea.votes?.[0]?.value ?? null, isWatched: true } as never}
            />
          ))}
        </div>
      )}
    </div>
  );
}
