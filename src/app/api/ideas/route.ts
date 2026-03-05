import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ideaSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page     = parseInt(searchParams.get("page")     ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");
  const sort     = searchParams.get("sort") ?? "score";   // score | new | discussed
  const side     = searchParams.get("side");              // LONG | SHORT
  const ticker   = searchParams.get("ticker");

  const where = {
    status: "PUBLISHED" as const,
    ...(side   ? { side:   side   as "LONG" | "SHORT" } : {}),
    ...(ticker ? { ticker: ticker.toUpperCase() }        : {}),
  };

  const orderBy =
    sort === "new"       ? { createdAt: "desc" as const } :
    sort === "discussed" ? { comments:  { _count: "desc" as const } } :
                           { score:     "desc" as const };

  const [items, total] = await Promise.all([
    db.idea.findMany({
      where,
      orderBy,
      skip:  (page - 1) * pageSize,
      take:  pageSize,
      include: {
        author: { select: { id: true, username: true, name: true, avatarUrl: true, reputation: true } },
        _count: { select: { votes: true, comments: true } },
      },
    }),
    db.idea.count({ where }),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = ideaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const idea = await db.idea.create({
    data: { ...parsed.data, authorId: session.user.id },
    include: {
      author: { select: { id: true, username: true, name: true, avatarUrl: true, reputation: true } },
    },
  });

  return NextResponse.json({ data: idea }, { status: 201 });
}
