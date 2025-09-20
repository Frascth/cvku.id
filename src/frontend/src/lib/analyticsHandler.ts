// src/frontend/src/lib/analyticsHandler.ts
import {
  createActor,
  canisterId as analyticsServiceId,
} from "../../../declarations/analytics_service";
import type { _SERVICE } from "../../../declarations/analytics_service/analytics_service.did";
import type { ActorSubclass, HttpAgentOptions } from "@dfinity/agent";
import type { AuthClient } from "@dfinity/auth-client";

// ==== Range UI (yang dipakai FE) ====
export type TimeRangeUI = "24h" | "7d" | "30d" | "90d";
// Simpel alias supaya store bisa import sebagai `TimeRange`
export type TimeRange = TimeRangeUI;

// ==== Union untuk dikirim ke canister (Candid) ====
type CanisterTimeRange =
  | { H24: null }
  | { D7: null }
  | { D30: null }
  | { D90: null };

const toRange = (r: TimeRangeUI): CanisterTimeRange =>
  r === "24h" ? { H24: null } :
  r === "7d"  ? { D7:  null } :
  r === "30d" ? { D30: null } :
                { D90: null };

// ==== Tipe UI (semua number/string) ====
export type Overview = {
  totalViews: number;
  uniqueVisitors: number;
  avgViewDurationMs: number;
  bounceRatePct: number;
  shareCount: number;
  downloadCount: number;
};
export type ViewsPoint = { date: string; views: number; visitors: number; durationSecAvg: number };
export type DeviceItem = { name: string; value: number; color?: string | null };
export type LocationItem = { country: string; views: number; percentage: number };
export type TrafficSourceItem = { source: string; views: number; percentage: number };
export type SectionPerfItem = { section: string; viewTime: string; engagement: number };
export type ActivityItem = { action: string; location: string; timeAgo: string; device: string };

// util
const n = (x: bigint | number) => Number(x);
const opt = <T>(v: T | null | undefined): [] | [T] => (v == null ? [] : [v]);

async function unwrap<T>(p: Promise<any>): Promise<T> {
  const res = await p;
  if ("ok" in res) return res.ok.data as T;
  throw new Error(res.err?.message ?? "Analytics service error");
}

// default actor (anon)
const defaultActor: ActorSubclass<_SERVICE> = createActor(analyticsServiceId);

// === wrapper ===
function makeHandler(a: ActorSubclass<_SERVICE>) {
  return {
    // FE cukup kirim payload ringan; handler yang konversi ke candid
    track: (p: {
      resumeId: string;
      type: "VIEW" | "SHARE" | "DOWNLOAD" | "SECTION_VIEW";
      visitor: string;
      ts?: number;          // detik (unix)
      durationMs?: number;  // ms
      device?: string;
      country?: string;
      source?: string;
      section?: string;
    }) => {
      const nowSec = Math.floor(Date.now() / 1000);
      const input = {
        resumeId: p.resumeId,
        event: { [p.type]: null } as any,
        visitor: p.visitor,
        ts: BigInt(p.ts ?? nowSec),
        durationMs: BigInt(p.durationMs ?? 0),
        device: p.device ?? "Web",
        country: opt(p.country),
        source: opt(p.source),
        section: opt(p.section),
      };
      return a.clientTrack(input);
    },

    // === Getter: convert bigint → number di sini, return tipe UI ===
    getOverview: async (id: string, r: TimeRangeUI): Promise<Overview> => {
      const raw = await unwrap<import("../../../declarations/analytics_service/analytics_service.did").OverviewStats>(
        a.clientGetOverview(id, toRange(r))
      );
      return {
        totalViews: n(raw.totalViews),
        uniqueVisitors: n(raw.uniqueVisitors),
        avgViewDurationMs: n(raw.avgViewDurationMs),
        bounceRatePct: n(raw.bounceRatePct),
        shareCount: n(raw.shareCount),
        downloadCount: n(raw.downloadCount),
      };
    },

    getViews: async (id: string, r: TimeRangeUI): Promise<ViewsPoint[]> => {
      const raw = await unwrap<import("../../../declarations/analytics_service/analytics_service.did").ViewsPoint[]>(
        a.clientGetViews(id, toRange(r))
      );
      return raw.map(p => ({
        date: p.date,
        views: n(p.views),
        visitors: n(p.visitors),
        durationSecAvg: n(p.durationSecAvg),
      }));
    },

    getDevices: async (id: string, r: TimeRangeUI): Promise<DeviceItem[]> => {
      const raw = await unwrap<import("../../../declarations/analytics_service/analytics_service.did").DeviceItem[]>(
        a.clientGetDevices(id, toRange(r))
      );
      return raw.map(d => ({
        name: d.name,
        value: n(d.value),
        color: Array.isArray(d.color) && d.color.length > 0 ? d.color[0] : null
      }));
    },

    getLocations: async (id: string, r: TimeRangeUI): Promise<LocationItem[]> => {
      const raw = await unwrap<import("../../../declarations/analytics_service/analytics_service.did").LocationItem[]>(
        a.clientGetLocations(id, toRange(r))
      );
      return raw.map(l => ({ country: l.country, views: n(l.views), percentage: n(l.percentage) }));
    },

    getSources: async (id: string, r: TimeRangeUI): Promise<TrafficSourceItem[]> => {
      const raw = await unwrap<import("../../../declarations/analytics_service/analytics_service.did").TrafficSourceItem[]>(
        a.clientGetSources(id, toRange(r))
      );
      return raw.map(s => ({ source: s.source, views: n(s.views), percentage: n(s.percentage) }));
    },

    getSections: async (id: string, r: TimeRangeUI): Promise<SectionPerfItem[]> =>
      unwrap(a.clientGetSections(id, toRange(r))),

    getActivity: async (id: string, limit = 20): Promise<ActivityItem[]> =>
      unwrap(a.clientGetActivity(id, BigInt(limit))),

    _actor: a,
    _canisterId: analyticsServiceId,
  };
}

// anon
export function createAnalyticsHandler(authClient: AuthClient) {
  return makeHandler(defaultActor);
}

// with identity
export async function createAnalyticsHandlerWithAuth(authClient: AuthClient) {
  const identity = await authClient.getIdentity();
  const actor = createActor(analyticsServiceId, {
    agentOptions: { identity } as HttpAgentOptions,
  });
  return makeHandler(actor);
}

export const analyticsService = defaultActor;
export const canisterId = analyticsServiceId;