import { NextRequest, NextResponse } from "next/server";
import { getCourts } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get("tier") || undefined;
    const state = searchParams.get("state") || undefined;

    const courts = await getCourts({ tier, state });

    const records = courts.map((court: any) => {
      const total = court.total || 45000;
      const civil = court.civil || Math.round(total * 0.56);
      const criminal = court.criminal || total - civil;

      return {
        court_id: court.id,
        court,
        total,
        civil,
        criminal,
        judge_strength: court.judge_strength || {
          sanctioned: 12,
          working: 9,
          vacancy: 3,
          vacancy_rate: 25.0,
        },
        case_clearance_rate: court.case_clearance_rate || 98.5,
        disposal_velocity: court.disposal_velocity || {
          avg_trial_months: 24.5,
          bail_turnaround_days: 14,
        },
        police_intelligence: court.police_intelligence || {
          pending_warrants: 1250,
          chargesheet_to_trial_days: 120,
          undertrial_prisoners: 850,
        },
        special_courts: court.special_courts || {
          pocso: 420,
          ndps: 280,
          mact: 650,
          sec_138: 2400,
          commercial: 380,
        },
        citizen_aid: court.citizen_aid || {
          dlsa_contact: "District Legal Services Authority (DLSA) - Helpline: 15100",
          ecourts_cause_list_url: "https://services.ecourts.gov.in/ecourtindia_v6/",
          free_legal_aid: true,
        },
        historical_trends: court.historical_trends || [
          { year: 2022, instituted: 14000, disposed: 13500, pending: 41000 },
          { year: 2023, instituted: 15200, disposed: 14800, pending: 42400 },
          { year: 2024, instituted: 16100, disposed: 15900, pending: 43600 },
          { year: 2025, instituted: 16800, disposed: 16500, pending: 44900 },
          { year: 2026, instituted: 17200, disposed: 17100, pending: total },
        ],
        age_bucket: {
          "<1y": Math.round(total * 0.22),
          "1-3y": Math.round(total * 0.31),
          "3-5y": Math.round(total * 0.24),
          "5-10y": Math.round(total * 0.15),
          ">10y": Math.round(total * 0.08),
        },
      };
    });

    return NextResponse.json(
      {
        as_of: "M0 Justice Intelligence Baseline",
        is_sample: true,
        count: records.length,
        data: records,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=3600",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch pendency data" }, { status: 500 });
  }
}
