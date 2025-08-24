import { createActor, canisterId } from "../../../declarations/education_service";
import type { AuthClient } from "@dfinity/auth-client";
import { Education } from "@/store/useResumeStore";
import { toOptionalMo, toOptionalTs } from "./moUtils";

export function createEducationHandler(authClient: AuthClient) {
  const actor = createActor(canisterId, {
    agentOptions: {
      identity: authClient.getIdentity(),
    },
  });

  return {

    clientGetAll: async (): Promise<Education[]> => {
      const response = await actor.clientGetAll();

      if ('err' in response) {
        throw new Error(response.err.message || "Something went wrong with education service");
      }

      return response.ok.data.map(edu => ({
        ...edu,
        id: Number(edu.id),
        gpa: toOptionalTs(edu.gpa)
      }));
    },

    clientAdd: async (lid: string, data: Omit<Education, "id">): Promise<Education> => {
      const request = {
        ...data,
        lid: lid,
        gpa: toOptionalMo(data.gpa)
      };

      const response = await actor.clientAdd(request);

      if ('err' in response) {
        throw new Error(response.err.message || "Something went wrong with education service");
      }

      return {
        ...data,
        lid: lid,
        id: response.ok.data.id.toString(),
      };
    },

    clientSave: async (edus: Education[]): Promise<void> => {
      if (edus.length <= 0) {
        return;
      }

      const newEdus = edus.map(edu => ({
        ...edu,
        id: BigInt(edu.id),
        gpa: toOptionalMo(edu.gpa)
      }));

      const response = await actor.clientBatchUpdate(newEdus);

      if ('err' in response) {
        throw new Error(response.err.message || "Something went wrong with education service");
      }

    },

    clientDeleteById: async (id: string): Promise<string> => {
      const request = {
        id: BigInt(id),
      };
      const response = await actor.clientDeleteById(request);

      if ('err' in response) {
        throw new Error(response.err.message || "Something went wrong with education service");
      }

      return response.ok.data.id.toString();
    },


    clientGenerateAiDesc: async (degree: string): Promise<string[]> => {
      const response = await actor.clientGenerateAiDescription({ degree });

      if ('err' in response) {
        throw new Error(response.err.message ?? "Something went wrong with education service");
      }

      return response.ok.data;
    }

  };
}
