import courtsSeed from "@/data/seeds/courts.json";
import districtCourtsSeed from "@/data/seeds/district_courts.json";
import populationsSeed from "@/data/seeds/populations.json";
import { supabase } from "./supabase";

export interface Court {
  id: number;
  name: string;
  tier: "SC" | "HC" | "DISTRICT";
  state: string | null;
  district: string | null;
  lat: number | null;
  lon: number | null;
  establishment_code: string | null;
  is_bench?: boolean;
  total?: number;
  civil?: number;
  criminal?: number;
  judge_strength?: {
    sanctioned: number;
    working: number;
    vacancy: number;
    vacancy_rate: number;
  };
  case_clearance_rate?: number;
  disposal_velocity?: {
    avg_trial_months: number;
    bail_turnaround_days: number;
  };
  police_intelligence?: {
    pending_warrants: number;
    chargesheet_to_trial_days: number;
    undertrial_prisoners: number;
  };
  special_courts?: {
    pocso: number;
    ndps: number;
    mact: number;
    sec_138: number;
    commercial: number;
  };
  citizen_aid?: {
    dlsa_contact: string;
    ecourts_cause_list_url: string;
    free_legal_aid: boolean;
  };
  historical_trends?: Array<{
    year: number;
    instituted: number;
    disposed: number;
    pending: number;
  }>;
  age_bucket?: Record<string, number>;
}

export interface Snapshot {
  id: number;
  as_of: string;
  source: string;
  status: "approved" | "quarantined";
  notes?: string;
}

export interface PendencyRecord {
  snapshot_id: number;
  court_id: number;
  total: number;
  civil: number | null;
  criminal: number | null;
  age_bucket: Record<string, number> | null;
  court?: Court;
}

export interface PopulationRecord {
  region: string;
  population_2011: number;
}

const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-anon-key"
  );
};

export async function getCourts(filter?: { tier?: string; state?: string }): Promise<Court[]> {
  if (isSupabaseConfigured()) {
    let query = supabase.from("courts").select("*");
    if (filter?.tier && filter.tier !== "ALL") query = query.eq("tier", filter.tier);
    if (filter?.state) query = query.ilike("state", `%${filter.state}%`);
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as unknown as Court[];
    }
  }

  // Combined fallback: SC + 25 HCs + Subordinate District Courts
  const allCourts: Court[] = [
    ...(courtsSeed as unknown as Court[]),
    ...(districtCourtsSeed as unknown as Court[]),
  ];

  let result = allCourts;
  if (filter?.tier && filter.tier !== "ALL") {
    result = result.filter((c) => c.tier.toLowerCase() === filter.tier?.toLowerCase());
  }
  if (filter?.state && filter.state !== "ALL") {
    result = result.filter((c) => c.state?.toLowerCase().includes(filter.state!.toLowerCase()));
  }

  return result;
}

export async function getCourtById(id: number): Promise<Court | null> {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from("courts").select("*").eq("id", id).single();
    if (!error && data) {
      return data as unknown as Court;
    }
  }

  const allCourts: Court[] = [
    ...(courtsSeed as unknown as Court[]),
    ...(districtCourtsSeed as unknown as Court[]),
  ];
  return allCourts.find((c) => c.id === id) || null;
}

export async function getPopulations(): Promise<Record<string, number>> {
  const result: Record<string, number> = {};
  populationsSeed.forEach((p) => {
    result[p.region] = p.population_2011;
  });
  return result;
}
