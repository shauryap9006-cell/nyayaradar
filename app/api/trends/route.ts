import { NextRequest, NextResponse } from "next/server";
import { getCourtById } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courtIdParam = searchParams.get("court_id");
    const courtId = courtIdParam ? parseInt(courtIdParam, 10) : 1;

    const court = await getCourtById(courtId);
    if (!court) {
      return NextResponse.json({ error: "Court not found" }, { status: 404 });
    }

    // Baseline historical months for M0 demonstration (sample data)
    const months = [
      { month: "2026-03", total: 91500, civil: 70000, criminal: 21500 },
      { month: "2026-04", total: 91900, civil: 70400, criminal: 21500 },
      { month: "2026-05", total: 92200, civil: 70800, criminal: 21400 },
      { month: "2026-06", total: 92500, civil: 71000, criminal: 21500 },
      { month: "2026-07", total: 92700, civil: 71100, criminal: 21600 },
      { month: "2026-08", total: 92828, civil: 71200, criminal: 21628 },
    ];

    return NextResponse.json({
      court,
      is_sample: true,
      series: months,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch trends" }, { status: 500 });
  }
}
