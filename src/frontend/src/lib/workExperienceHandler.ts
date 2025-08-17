// lib/workExperienceHandler.ts
import { createActor, canisterId } from "../../../declarations/work_experience_service";
import type { AuthClient } from "@dfinity/auth-client";
import { WorkExperience } from "@/store/useResumeStore";

export function createWorkExperienceHandler(authClient: AuthClient) {
  const actor = createActor(canisterId, {
    agentOptions: {
      identity: authClient.getIdentity(),
    },
  });

  return {

    clientGetAll: async (): Promise<WorkExperience[]> => {
      const response = await actor.clientGetAll();

      if ('err' in response) {
        throw new Error(response.err.message ?? "Something went wrong with work experience service");
      }

      return response.ok.data.map(exp => ({
        ...exp,
        id: exp.id.toString(),
      }));
    },

    clientAdd: async (lid: string, data: Omit<WorkExperience, "id">): Promise<WorkExperience> => {
      const request = {
        lid: lid,
        ...data,
      };

      const response = await actor.clientAdd(request);

      if ('err' in response) {
        throw new Error(response.err.message ?? "Something went wrong with work experience service");
      }

      return {
        ...data,
        id: response.ok.data.id.toString(),
      };
    },

    clientSave: async (workExps: WorkExperience[]): Promise<void> => {
      if (workExps.length <= 0) {
        return;
      }

      const newExps = workExps.map(exp => ({
        ...exp,
        id: BigInt(exp.id)
      }));

      const response = await actor.clientBatchUpdate(newExps);

      if ('err' in response) {
        throw new Error(response.err.message ?? "Something went wrong with work experience service");
      }

      return;
    },

    clientDeleteById: async (id: string): Promise<string> => {
      const response = await actor.clientDeleteById(BigInt(id));

      if ('err' in response) {
        throw new Error(response.err.message ?? "Something went wrong with work experience service");
      }

      return response.ok.data.id.toString();
    },

    clientGenerateAiDesc: async (jobTitle: string): Promise<string[]> => {
      const response = await actor.clientGenerateAiDescription({ jobTitle });

      if ('err' in response) {
        throw new Error(response.err.message ?? "Something went wrong with work experience service");
      }

      return response.ok.data;
    }

  };
}
