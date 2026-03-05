import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import { TrendingUp, Calendar, Award } from "lucide-react";

type Params = { params: Promise<{ username: string }> };

export default async function MemberPage({ params }: Params) {
  const { username } = await params;

  const user = await db.user.findUnique({
    where: { username },
    include: {
      ideas: {
        where:   { status: "PUBLISHED" },
        orderBy: { score: "desc" },
        take:    20,
        include: {
          author: { select: { id: true, username: true, name: true, avatarUrl: true, reputation: true } },
          _count:  { select: { votes: true, comments: true } },
        },
      },
      _count: { select: { ideas: true, comments: true } },
    },
  });

  if (!user) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold shrink-0">
            {(user.name ?? user.username)[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{user.name ?? user.username}</h1>
            <p className="text-sm text-gray-500 mb-1">@{user.username}</p>
            {user.bio && <p className="text-sm text-gray-700 mt-2">{user.bio}</p>}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" />{user._count.ideas} ideas</span>
              <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" />{user.reputation} rep</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Joined {format(new Date(user.createdAt), "MMM yyyy")}</span>
            </div>
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            user.role === "ADMIN"   ? "bg-purple-100 text-purple-700" :
            user.role === "ANALYST" ? "bg-blue-100 text-blue-700" :
                                       "bg-gray-100 text-gray-600"
          }`}>{user.role}</span>
        </div>
      </div>

      {/* Ideas */}
      <h2 className="font-semibold text-gray-900 mb-3">Published Ideas</h2>
      {user.ideas.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No published ideas yet.</div>
      ) : (
        <div className="space-y-3">
          {user.ideas.map(idea => (
            <IdeaCard key={idea.id} idea={idea as never} />
          ))}
        </div>
      )}
    </div>
  );
}
