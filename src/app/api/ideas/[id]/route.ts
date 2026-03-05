import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ideaSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();

  const idea = await db.idea.findUnique({
    where: { id },
    include: {
      author:  { select: { id: true, username: true, name: true, avatarUrl: true, reputation: true } },
      _count:  { select: { votes: true, comments: true } },
      votes:   session?.user ? { where: { userId: session.user.id }, select: { value: true } } : false,
      watchlists: session?.user ? { where: { userId: session.user.id }, select: { id: true } } : false,
    },
  });

  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Increment view count (fire and forget)
  db.idea.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  return NextResponse.json({
    data: {
      ...idea,
      userVote:  idea.votes?.[0]?.value ?? null,
      isWatched: (idea.watchlists?.length ?? 0) > 0,
    },
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const idea = await db.idea.findUnique({ where: { id } });
  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (idea.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body   = await req.json();
  const parsed = ideaSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await db.idea.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const idea = await db.idea.findUnique({ where: { id } });
  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (idea.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.idea.delete({ where: { id } });
  return NextResponse.json({ data: { id } });
}
