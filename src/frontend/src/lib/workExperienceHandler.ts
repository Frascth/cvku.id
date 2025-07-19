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

    clientGetAll: async ():Promise<WorkExperience[]> => {
      const exps = await actor.clientGetAll();

      return exps.map(exp => ({
        ...exp,
        id: exp.id.toString(),
      }));
    },

    clientAdd: async (data: Omit<WorkExperience, "id">): Promise<WorkExperience> => {
        const addedExperience = await actor.clientAdd(data);

        return {
            ...addedExperience,
            id: addedExperience.id.toString(),
        };
    },

    clientSave: async (workExps: WorkExperience[]):Promise<WorkExperience[]> => {
        if (workExps.length <= 0) {
            return [];
        }

        const newExps = workExps.map(exp => ({
            ...exp,
            id: BigInt(exp.id)
        }));

        const result = await actor.clientBatchUpdate(newExps);

        const updatedExps = result.map(exp => ({
            ...exp,
            id: exp.id.toString()
        }));

        return updatedExps;
    },

    clientDeleteById: async (id:string):Promise<boolean> => {
      return await actor.clientDeleteById(BigInt(id));
    },

    clientGenerateAiDesc: async (jobTitle:string):Promise<string[]> => {
      return await actor.clientGenerateAiDescription({jobTitle});
    }

  };
}
