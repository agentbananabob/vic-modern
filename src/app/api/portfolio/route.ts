import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const watchlist = await db.watchlist.findMany({
    where:   { userId: session.user.id },
    orderBy: { addedAt: "desc" },
    include: {
      idea: {
        include: {
          author: { select: { id: true, username: true, name: true, avatarUrl: true, reputation: true } },
          _count: { select: { votes: true, comments: true } },
        },
      },
    },
  });

  return NextResponse.json({ data: watchlist });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ideaId, note } = await req.json();
  if (!ideaId) return NextResponse.json({ error: "ideaId required" }, { status: 400 });

  const entry = await db.watchlist.upsert({
    where:  { userId_ideaId: { userId: session.user.id, ideaId } },
    update: { note },
    create: { userId: session.user.id, ideaId, note },
  });

  return NextResponse.json({ data: entry }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ideaId } = await req.json();
  await db.watchlist.delete({
    where: { userId_ideaId: { userId: session.user.id, ideaId } },
  });

  return NextResponse.json({ data: { ideaId } });
}
