import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDhikrsForUser, createDhikr } from "@/lib/supabase-queries";
import { z } from "zod";

const createDhikrSchema = z.object({
  name: z.string().min(1).max(100),
  targetCount: z.number().int().min(1).max(10000),
  arabic: z.string().optional(),
  transliteration: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dhikrs = await getDhikrsForUser(session.user.id);

    return NextResponse.json(dhikrs);
  } catch (error) {
    console.error("Error fetching dhikrs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, targetCount, arabic, transliteration } =
      createDhikrSchema.parse(body);

    const dhikr = await createDhikr({
      name,
      targetCount,
      arabicText: arabic,
      transliteration,
      userId: session.user.id,
    });

    return NextResponse.json(dhikr, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error creating dhikr:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
