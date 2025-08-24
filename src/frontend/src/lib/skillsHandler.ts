// lib/skillsHandler.ts
import { createActor, canisterId } from "../../../declarations/skills_service";
import type { AuthClient } from "@dfinity/auth-client";

// Tipe backend dari DFX
import type {
  Skill as BackendSkillRaw,
  SkillLevel as BackendSkillLevelRaw,
} from "../../../declarations/skills_service/skills_service.did";

// Tipe FE dari store
import type { Skill, SkillLevel } from "@/store/useResumeStore";

// --- Helpers konversi ---

// BE -> FE
const toFrontendSkill = (b: BackendSkillRaw): Skill => {
  // level di BE adalah variant, ambil key nya
  // contoh: { Beginner: null } => "Beginner"
  const level =
    ("Beginner" in b.level && "Beginner") ||
    ("Intermediate" in b.level && "Intermediate") ||
    ("Advanced" in b.level && "Advanced") ||
    ("Expert" in b.level && "Expert") ||
    ("Intermediate" as SkillLevel); // fallback aman

  return {
    id: b.id,           // BE: Text => FE: string
    name: b.name,
    level,              // FE union "Beginner" | ...
  };
};

// FE -> BE (untuk batch update)
const toBackendSkillRaw = (f: Skill): BackendSkillRaw => ({
  id: f.id,            // string
  name: f.name,
  level: { [f.level]: null } as BackendSkillLevelRaw, // build variant
});

// FE -> AddRequest (tanpa id)
type AddSkillBackendRequest = {
  name: string;
  level: BackendSkillLevelRaw;
};

const toBackendAddRequest = (f: Omit<Skill, "id">): AddSkillBackendRequest => ({
  name: f.name,
  level: { [f.level]: null } as BackendSkillLevelRaw,
});

export function createSkillsHandler(authClient: AuthClient) {
  const actor = createActor(canisterId, {
    agentOptions: { identity: authClient.getIdentity() },
  });

  return {
    // Ambil semua skills
    clientGetAll: async (): Promise<Skill[]> => {
      // NOTE: nama method BE berdasarkan file Motoko kamu: clientGetAllSkills
      const raw = await actor.clientGetAllSkills(); // BackendSkillRaw[]
      return raw.map(toFrontendSkill);
    },

    // Tambah 1 skill (langsung ke backend, lalu FE append)
    clientAdd: async (lid: string, data: Omit<Skill, "id">): Promise<Skill> => {
      const req = {
        lid: lid,
        ...toBackendAddRequest(data)
      };
      const response = await actor.clientAddSkill(req); // BackendSkillRaw

      if ('err' in response) {
        throw new Error(response.err.message || "Something went wrong with skills service");
      }

      return {
        ...data,
        id: response.ok.data.id.toString()
      };
    },

    // Batch update (save semua)
    clientSave: async (skills: Skill[]): Promise<void> => {
      if (skills.length === 0) return;

      const raw = skills.map(toBackendSkillRaw);

      const resonse = await actor.clientBatchUpdateSkills(raw); // BackendSkillRaw[]

      if ('err' in resonse) {
        throw new Error(resonse.err.message || "Something went wrong with skills service");
      }
    },

    // Hapus by id
    clientDeleteById: async (id: string): Promise<string> => {
      const response = await actor.clientDeleteSkillById(id);

      if ('err' in response) {
        throw new Error(response.err.message || "Something went wrong with skills service");
      }

      return response.ok.data.id.toString();
    },
  };
}
