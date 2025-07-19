// lib/workExperienceHandler.ts
import { createActor, canisterId } from "../../../declarations/personal_info_service";
import type { AuthClient } from "@dfinity/auth-client";
import { PersonalInfo } from "@/store/useResumeStore";
import { toOptionalMo, toOptionalTs } from "./moUtils";

export function createPersonalInfoHandler(authClient: AuthClient) {
  const actor = createActor(canisterId, {
    agentOptions: {
      identity: authClient.getIdentity(),
    },
  });

  return {

    clientGet: async (): Promise<null | PersonalInfo> => {
      const result = toOptionalTs(await actor.clientGet());

      if (!result) {
        return null;
      }

      return {
        fullName: result.fullName,
        email: result.email,
        phone: result.phone,
        location: result.location,
        website: result.website,
        bio: result.bio,
        photoUrl: toOptionalTs(result.photoUrl),
      };
    },

    clientSave: async (request: PersonalInfo): Promise<PersonalInfo> => {
      const moRequest = {
        fullName: request.fullName,
        email: request.email,
        phone: request.phone,
        location: request.location,
        website: request.website,
        bio: request.bio,
        photoUrl: toOptionalMo(request.photoUrl),
      };

      const result = await actor.clientUpdateOrCreate(moRequest);

      return {
        fullName: result.fullName,
        email: result.email,
        phone: result.phone,
        location: result.location,
        website: result.website,
        bio: result.bio,
        photoUrl: toOptionalTs(result.photoUrl),
      };
    },

  };
}
