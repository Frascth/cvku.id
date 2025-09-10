// src/frontend/src/lib/assessment/assessmentHandler.ts
import { createActor, canisterId } from "../../../../declarations/assessment_service";
import type { AuthClient } from "@dfinity/auth-client";
import { useResumeStore } from "@/store/useResumeStore";
import type { AssessmentResult, AssessmentLevel } from "@/store/useResumeStore";
import type { AssessmentLevel as BELevel } from "../../../../declarations/assessment_service/assessment_service.did";

// FE -> BE
function toBackendLevel(level: AssessmentLevel): BELevel {
  switch (level) {
    case "Beginner": return { Beginner: null };
    case "Intermediate": return { Intermediate: null };
    case "Advanced": return { Advanced: null };
    case "Expert": return { Expert: null };
  }
}
// BE -> FE
function toFrontendLevel(v: BELevel): AssessmentLevel {
  if ("Beginner" in v) return "Beginner";
  if ("Intermediate" in v) return "Intermediate";
  if ("Advanced" in v) return "Advanced";
  return "Expert";
}

// composite key
const makeKey = (skillId: string, level: AssessmentLevel) => `${skillId}::${level}`;
const splitKey = (k: string): { skillId: string; testLevel?: AssessmentLevel } => {
  const [id, lv] = k.split("::");
  if (lv === "Beginner" || lv === "Intermediate" || lv === "Advanced" || lv === "Expert") {
    return { skillId: id, testLevel: lv };
  }
  return { skillId: k };
};

export function createAssessmentHandler(authClient: AuthClient) {
  const actor = createActor(canisterId, {
    agentOptions: { identity: authClient.getIdentity() },
  });

  return {
    // save r, tapi key BE = "<skillId>::<testLevel>"
    save: async (r: AssessmentResult, testLevel: AssessmentLevel) => {
      const key = makeKey(r.skillId, testLevel);
      const res = await actor.clientUpsertResult({
        skillId: key,
        score: BigInt(r.score),
        level: toBackendLevel(r.level),   // level hasil (boleh beda dari testLevel)
        dateISO: [r.dateISO],
      });
      if ("err" in res) throw new Error(res.err.message);
      return true;
    },

    hydrateForUser: async () => {
      const res = await actor.clientGetAll();
      if ("err" in res) throw new Error(res.err.message);

      const setResult = useResumeStore.getState().setAssessmentResult;

      res.ok.data.forEach((it) => {
        const { skillId, testLevel } = splitKey(it.skillId);
        setResult({
          skillId,
          skillName: skillId,
          score: Number(it.score),
          total: 10,               // adjust kalau kamu simpan total di BE
          correct: 0,              // adjust kalau kamu simpan correct di BE
          level: toFrontendLevel(it.level),
          dateISO: it.dateISO[0] ?? new Date().toISOString(),
          // testLevel, // kalau kamu sudah bikin optional di store, boleh aktifkan.
        });
      });
    },

    hasCompleted: async (skillId: string, testLevel: AssessmentLevel): Promise<boolean> => {
      const key = makeKey(skillId, testLevel);
      const res = await actor.clientHasCompleted({ skillId: key });
      if ("err" in res) throw new Error(res.err.message);
      return !!res.ok.data.completed;
    },

    deleteOne: async (skillId: string, testLevel: AssessmentLevel) => {
      const key = makeKey(skillId, testLevel);
      const res = await actor.clientDeleteBySkillId({ skillId: key });
      if ("err" in res) throw new Error(res.err.message);
      return true;
    },
  };
}
