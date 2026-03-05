import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { voteSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body   = await req.json();
  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid vote" }, { status: 400 });

  const { value } = parsed.data;

  // Upsert the vote (toggle off if same value)
  const existing = await db.vote.findUnique({
    where: { userId_ideaId: { userId: session.user.id, ideaId: id } },
  });

  let newValue = value;
  if (existing?.value === value) {
    // Same vote again = remove it
    await db.vote.delete({ where: { userId_ideaId: { userId: session.user.id, ideaId: id } } });
    newValue = 0;
  } else if (existing) {
    await db.vote.update({ where: { userId_ideaId: { userId: session.user.id, ideaId: id } }, data: { value } });
  } else {
    await db.vote.create({ data: { userId: session.user.id, ideaId: id, value } });
  }

  // Recalculate score (sum of votes)
  const agg = await db.vote.aggregate({ where: { ideaId: id }, _sum: { value: true } });
  const score = agg._sum.value ?? 0;
  await db.idea.update({ where: { id }, data: { score } });

  return NextResponse.json({ data: { score, userVote: newValue || null } });
}
