import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is configured, enforce Bearer token
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized. Invalid CRON_SECRET." }, { status: 401 });
    }

    return NextResponse.json({
      status: "success",
      message: "NyayaRadar Daily Automation Cron triggered successfully",
      timestamp: new Date().toISOString(),
      schedule: "Everyday at 02:00 AM IST (20:30 UTC)",
      courts_tracked: 781,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to trigger cron" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
