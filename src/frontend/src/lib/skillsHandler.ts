// src/frontend/src/lib/skillsHandler.ts
import { createActor, canisterId } from "../../../declarations/skills_service";
import type { AuthClient } from "@dfinity/auth-client";

// Tipe backend dari DFX (generated)
import type {
  Skill as BackendSkillRaw,
  SkillLevel as BackendSkillLevelRaw,
} from "../../../declarations/skills_service/skills_service.did";

// Tipe FE dari store
import type { Skill, SkillLevel } from "@/store/useResumeStore";

/* =========================
 * Helpers: progress & mapping (dipakai di Live Preview)
 * ========================= */
export function levelToPercent(level: SkillLevel): number {
  switch (level) {
    case "Expert": return 100;
    case "Advanced": return 80;
    case "Intermediate": return 60;
    default: return 40;
  }
}

export function progressFromSkill(skill: {
  level: SkillLevel;
  lastAssessmentScore?: number;
}): number {
  return typeof skill.lastAssessmentScore === "number"
    ? Math.max(0, Math.min(100, skill.lastAssessmentScore))
    : levelToPercent(skill.level);
}

/* =========================
 * Mapping BE <-> FE
 * ========================= */

// FE enum string -> BE variant
const toBackendLevel = (l: SkillLevel): BackendSkillLevelRaw =>
  ({ [l]: null } as unknown as BackendSkillLevelRaw);

// BE -> FE
const toFrontendSkill = (b: BackendSkillRaw): Skill => {
  const level =
    (("Beginner" in b.level) && "Beginner") ||
    (("Intermediate" in b.level) && "Intermediate") ||
    (("Advanced" in b.level) && "Advanced") ||
    (("Expert" in b.level) && "Expert") ||
    ("Intermediate" as SkillLevel);

  return {
    id: b.id,       // BE: Text -> FE: string
    name: b.name,
    level,
  };
};

// FE -> BE (batch update)
const toBackendSkillRaw = (f: Skill): BackendSkillRaw => ({
  id: f.id,
  name: f.name,
  level: toBackendLevel(f.level),
});

// FE -> AddRequest (tanpa id)
type AddSkillBackendRequest = {
  lid: string;                 // FE kirim numeric-string
  name: string;
  level: BackendSkillLevelRaw;
};

// generator lid numeric sementara (BE expect string angka)
let tempSkillLid = 0;
const nextTempLid = () => {
  tempSkillLid += 1;
  return String(tempSkillLid); // "1","2",...
};

/* =========================
 * Factory handler
 * ========================= */
export function createSkillsHandler(authClient: AuthClient) {
  const actor = createActor(canisterId, {
    agentOptions: { identity: authClient.getIdentity() },
  });

  return {
    // Ambil semua skills
    clientGetAll: async (): Promise<Skill[]> => {
      // ⚠️ Ganti nama method ini kalau di .did kamu beda
      const raw = await actor.clientGetAllSkills(); // -> BackendSkillRaw[]
      return raw.map(toFrontendSkill);
    },

    // Tambah 1 skill
    clientAdd: async (lid: string, data: Omit<Skill, "id">): Promise<Skill> => {
      // Abaikan lid FE random UUID, BE minta numeric-string
      const beLid = nextTempLid();

      const req: AddSkillBackendRequest = {
        lid: beLid,
        name: data.name,
        level: toBackendLevel(data.level), // <- variant valid untuk Motoko
      };

      // ⚠️ Samakan dengan nama method di .did (clientAddSkill / clientAdd)
      const response = await actor.clientAddSkill(req);

      if ("err" in response) {
        throw new Error(response.err.message || "Something went wrong with skills service");
      }

      return {
        ...data,
        lid: beLid,                           // simpan lid numeric di FE (optional)
        id: response.ok.data.id.toString(),   // BE id (Text) -> FE string
      };
    },

    // Batch update (save semua)
    clientSave: async (skills: Skill[]): Promise<void> => {
      if (skills.length === 0) return;

      const payload = skills.map(toBackendSkillRaw);

      // ⚠️ Samakan dengan nama method di .did (clientBatchUpdateSkills / clientBatchUpdate)
      const response = await actor.clientBatchUpdateSkills(payload);

      if ("err" in response) {
        throw new Error(response.err.message || "Something went wrong with skills service");
      }
    },

    // Hapus by id
    clientDeleteById: async (id: string): Promise<string> => {
      // ⚠️ Samakan dengan nama method di .did (clientDeleteSkillById / clientDeleteById)
      const response = await actor.clientDeleteSkillById(id);

      if ("err" in response) {
        throw new Error(response.err.message || "Something went wrong with skills service");
      }

      return response.ok.data.id.toString();
    },
  };
}