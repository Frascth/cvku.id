import { createActor, canisterId } from "../../../declarations/education_service";
import type { AuthClient } from "@dfinity/auth-client";
import { Education } from "@/store/useResumeStore";
import { toOptionalMo, toOptionalTs } from "./moUtils";

export function createEducationHandler(authClient: AuthClient) {
  const actor = createActor(canisterId, {
    agentOptions: { identity: authClient.getIdentity() },
  });

  return {
    // --- GET ALL (v2) ---
    clientGetAll: async (): Promise<Education[]> => {
      // v2: Response<{ data: Education[] }>
      const res = await (actor as any).clientGetAll_v2();
      if ('err' in res) {
        throw new Error(res.err?.message || "Education service error");
      }
      return res.ok.data.map((edu: any) => ({
        ...edu,
        id: edu.id.toString(),
        gpa: toOptionalTs(edu.gpa),
      }));
    },

    // --- ADD (v2) ---
    clientAdd: async (lid: string, data: Omit<Education, "id">): Promise<Education> => {
      const request = {
        ...data,
        lid,
        gpa: toOptionalMo(data.gpa),
      };
      // v2: Response<{ id: nat; lid: text }>
      const res = await (actor as any).clientAdd_v2(request);
      if ('err' in res) {
        throw new Error(res.err?.message || "Education service error");
      }
      return {
        ...data,
        // kalau tipe Education kamu tidak punya lid, hapus baris berikut
        lid,
        id: res.ok.data.id.toString(),
      } as Education;
    },

    // --- SAVE / BATCH UPDATE (v2) ---
    clientSave: async (edus: Education[]): Promise<void> => {
      if (edus.length === 0) return;
      const newEdus = edus.map((edu) => ({
        ...edu,
        id: BigInt(edu.id),
        gpa: toOptionalMo(edu.gpa),
      }));
      // v2: Response<()>
      const res = await (actor as any).clientBatchUpdate_v2(newEdus);
      if ('err' in res) {
        throw new Error(res.err?.message || "Education service error");
      }
    },

    // --- DELETE (v2) ---
    clientDeleteById: async (id: string): Promise<string> => {
      // v2 menerima record { id }
      const res = await (actor as any).clientDeleteById_v2({ id: BigInt(id) });
      if ('err' in res) {
        throw new Error(res.err?.message || "Education service error");
      }
      return res.ok.data.id.toString();
    },

    // --- AI DESC (v2) ---
    clientGenerateAiDesc: async (degree: string): Promise<string[]> => {
      const res = await (actor as any).clientGenerateAiDescription_v2({ degree });
      if ('err' in res) {
        throw new Error(res.err?.message || "Education service error");
      }
      return res.ok.data;
    },
  };
}
