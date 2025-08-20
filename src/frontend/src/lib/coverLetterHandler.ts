import { createActor, canisterId } from "../../../declarations/cover_letter_service";
import type { AuthClient } from "@dfinity/auth-client";
import { CoverLetterBuilder, CoverLetterEditor } from "@/store/useResumeStore";
import { toOptionalTs } from "./moUtils";

export function createCoverLetterHandler(authClient: AuthClient) {
  const actor = createActor(canisterId, {
    agentOptions: {
      identity: authClient.getIdentity(),
    },
  });

  return {

    clientGetBuilder: async (): Promise<CoverLetterBuilder|null> => {
      const response = await actor.clientGetBuilder();

      if ('err' in response) {
        throw new Error(response.err.message ?? "Something went wrong with cover letter service");
      }

      const builder = toOptionalTs(response.ok.data);

      if (! builder) {
        return null;
      }

      return {
        ...builder,
        id: builder.id.toString(),
      };
    },

    clientGenerateAiCoverLetter: async (builder: Omit<CoverLetterBuilder, "id">): Promise<CoverLetterEditor> => {
      const response = await actor.clientGenerateAiCoverLetter(builder);

      if ('err' in response) {
        throw new Error(response.err.message ?? "Something went wrong with cover letter service");
      }

      const editor = response.ok.data;

      return {
        ...editor,
        id: editor.id.toString(),
      };
    },

  };
}
