import { createActor, canisterId } from "../../../declarations/education_service";
import type { AuthClient } from "@dfinity/auth-client";
import type { Education } from "@/store/useResumeStore";
import { toOptionalMo, toOptionalTs } from "./moUtils";

// helper aman untuk konversi string/number -> bigint
const toNat = (v: string | number): bigint => {
  if (typeof v === "number") return BigInt(v);
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) throw new Error(`Invalid id "${v}"`);
  return BigInt(n);
};

export function createEducationHandler(authClient: AuthClient) {
  const actor = createActor(canisterId, {
    agentOptions: { identity: authClient.getIdentity() },
  });

  return {
    // GET all -> id: number
    clientGetAll: async (): Promise<Education[]> => {
      const response = await actor.clientGetAll();
      if ("err" in response) {
        throw new Error(response.err.message || "Something went wrong with education service");
      }
      return response.ok.data.map((edu) => ({
        id: Number(edu.id),                 // Nat -> number
        degree: edu.degree,
        institution: edu.institution,
        graduationDate: edu.graduationDate,
        gpa: toOptionalTs(edu.gpa),         // ?Text -> string | undefined/null (sesuai util)
        description: edu.description,
        // kalau Education punya lid? biarkan undefined (server tidak kirim)
      })) as Education[];
    },

    // ADD -> kembalikan id: number (bukan string)
    clientAdd: async (lid: string, data: Omit<Education, "id">): Promise<Education> => {
      const request = {
        lid,
        degree: data.degree,
        institution: data.institution,
        graduationDate: data.graduationDate,
        gpa: toOptionalMo(data.gpa),        // string?|null -> [] | [Text]
        description: data.description,
      };

      const response = await actor.clientAdd(request);
      if ("err" in response) {
        throw new Error(response.err.message || "Something went wrong with education service");
      }

      return {
        ...data,
        lid,
        id: Number(response.ok.data.id),    // ✅ Nat -> number
      } as Education;
    },

    // SAVE batch -> FE number -> BE Nat
    clientSave: async (edus: Education[]): Promise<void> => {
      if (edus.length === 0) return;

      const newEdus = edus.map((edu) => ({
        id: toNat(edu.id),                  // number -> bigint
        degree: edu.degree,
        institution: edu.institution,
        graduationDate: edu.graduationDate,
        gpa: toOptionalMo(edu.gpa),
        description: edu.description,
      }));

      const response = await actor.clientBatchUpdate(newEdus);
      if ("err" in response) {
        throw new Error(response.err.message || "Something went wrong with education service");
      }
    },

    // DELETE by id -> terima number, balikan number
    clientDeleteById: async (id: number): Promise<number> => {
      const response = await actor.clientDeleteById({ id: toNat(id) });
      if ("err" in response) {
        throw new Error(response.err.message || "Something went wrong with education service");
      }
      return Number(response.ok.data.id);
    },

    clientGenerateAiDesc: async (degree: string): Promise<string[]> => {
      const response = await actor.clientGenerateAiDescription({ degree });
      if ("err" in response) {
        throw new Error(response.err.message ?? "Something went wrong with education service");
      }
      return response.ok.data;
    },
  };
}
