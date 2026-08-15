import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      project: "NyayaRadar",
      version: "0.1.0 (Phase A / M0 Foundation)",
      as_of: "Sample / Seed Registry",
      data_mode: "seed_baseline",
      total_courts_tracked: 26,
      tiers_supported: ["SC", "HC", "DISTRICT"],
      sources: [
        {
          name: "Supreme Court Data Grid (SCDG)",
          url: "https://scdg.sci.gov.in",
          frequency: "Monthly",
        },
        {
          name: "National Judicial Data Grid (NJDG HC)",
          url: "https://njdg.ecourts.gov.in/hcnjdg_v2",
          frequency: "Monthly",
        },
        {
          name: "Census of India 2011",
          description: "State & District Population Reference",
        },
      ],
      disclaimer:
        "Unofficial public interest visualization. Official figures copyright NJDG / e-Committee Supreme Court of India.",
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
