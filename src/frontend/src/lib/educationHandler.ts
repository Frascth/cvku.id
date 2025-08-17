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

    clientGetAll: async ():Promise<Education[]> => {
      const edus = await actor.clientGetAll();

      return edus.map(edu => ({
        ...edu,
        id: Number(edu.id),
        gpa: toOptionalTs(edu.gpa)
      }));
    },

    clientAdd: async (data: Omit<Education, "id">): Promise<Education> => {
        const request = {
          ...data,
          gpa: toOptionalMo(data.gpa)
        };

        const addedEdu = await actor.clientAdd(request);

        return {
            ...addedEdu,
            id: Number(addedEdu.id),
            gpa: toOptionalTs(addedEdu.gpa)
        };
    },

    clientSave: async (edus: Education[]):Promise<Education[]> => {
        if (edus.length <= 0) {
            return [];
        }

        const newEdus = edus.map(edu => ({
            ...edu,
            id: BigInt(edu.id),
            gpa: toOptionalMo(edu.gpa)
        }));

        console.log('request', newEdus);

        const result = await actor.clientBatchUpdate(newEdus);

        const updatedEdus = result.map(edu => ({
            ...edu,
            id: Number(edu.id),
            gpa: toOptionalTs(edu.gpa)
        }));

        console.log('response', updatedEdus);

        return updatedEdus;
    },

    clientDeleteById: async (id:number):Promise<boolean> => {
      return await actor.clientDeleteById(BigInt(id));
    },

  };
}
