import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { commentSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const comments = await db.comment.findMany({
    where:   { ideaId: id, parentId: null },
    orderBy: { createdAt: "asc" },
    include: {
      user:    { select: { id: true, username: true, name: true, avatarUrl: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, username: true, name: true, avatarUrl: true } } },
      },
    },
  });

  return NextResponse.json({ data: comments });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body   = await req.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const comment = await db.comment.create({
    data:    { ...parsed.data, userId: session.user.id, ideaId: id },
    include: { user: { select: { id: true, username: true, name: true, avatarUrl: true } } },
  });

  return NextResponse.json({ data: comment }, { status: 201 });
}
