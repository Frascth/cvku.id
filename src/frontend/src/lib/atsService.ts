// lib/atsService.ts
import { createActor, canisterId } from "../../../declarations/ats_service";
import type { AuthClient } from "@dfinity/auth-client";
import type {
  Resume as BEResume,
  ATSReport as BEReport,
} from "../../../declarations/ats_service/ats_service.did";

export function createAtsService(authClient: AuthClient) {
  const actor = createActor(canisterId, {
    agentOptions: { identity: authClient.getIdentity() },
  });

  return {
    analyze: async (payload: BEResume): Promise<BEReport> => {
      return await actor.analyzeResume(payload);
    },
  };
}
