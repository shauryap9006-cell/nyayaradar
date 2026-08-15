import { NextRequest, NextResponse } from "next/server";
import { getCourts } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get("tier") || undefined;
    const state = searchParams.get("state") || undefined;

    const courts = await getCourts({ tier, state });

    return NextResponse.json(
      {
        count: courts.length,
        courts,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch courts" }, { status: 500 });
  }
}
