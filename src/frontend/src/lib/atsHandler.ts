// lib/atsHandler.ts
import type { AuthClient } from "@dfinity/auth-client";
import { buildAtsPayload } from "./atsPayload";
import { createAtsService } from "./atsService";
import type { ResumeData } from "@/store/useResumeStore";
import type {
  ATSReport as BEReport,
} from "../../../declarations/ats_service/ats_service.did";

type FEReport = {
  score: number;
  categories: Array<{
    category: string;
    checks: Array<{ name: string; passed: boolean; tip: string }>;
  }>;
};

export function createAtsHandler(authClient: AuthClient) {
  const svc = createAtsService(authClient);

  const normalize = (r: BEReport): FEReport => ({
    score: Number(r.score),
    categories: r.categories.map((c) => ({
      category: c.category,
      checks: c.checks.map((k) => ({
        name: k.name,
        passed: k.passed,
        tip: k.tip,
      })),
    })),
  });

  return {
    analyze: async (resumeData: ResumeData): Promise<FEReport> => {
      const payload = buildAtsPayload(resumeData); // FE -> BE
      const res = await svc.analyze(payload);      // call canister
      return normalize(res);                       // BE -> FE
    },
  };
}
