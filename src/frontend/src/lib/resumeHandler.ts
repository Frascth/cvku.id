import { createActor, canisterId } from "../../../declarations/resume_service";
import type { AuthClient } from "@dfinity/auth-client";
import { ResumeLink } from "@/store/useResumeStore";
import { toOptionalTs } from "./moUtils";

export function createResumeHandler(authClient: AuthClient) {
  const actor = createActor(canisterId, {
    agentOptions: {
      identity: authClient.getIdentity(),
    },
  });

  const isValidResumeLinkPath = ({ path }: { path: string }): boolean => {
    if (path.length < 3 || path.length > 100) {
      throw new Error("Custom url must be 3-100 character");
    }
    return true;
  };

  return {
    isValidResumeLinkPath,

    clientGetResumeLink: async (): Promise<null | ResumeLink> => {
      const response = await actor.clientGetResumeLink();

      if ('err' in response) {
        throw new Error(response.err.message || "Something went wrong with resume service service");
      }

      const resumeLink = toOptionalTs(response.ok.data);

      if (!resumeLink) {
        return null;
      }

      return {
        ...resumeLink,
        id: resumeLink.id.toString(),
      };
    },

    clientAddResumeLink: async ({ lid, path, isPublic }: { lid: string, path: string, isPublic: boolean }): Promise<ResumeLink> => {
      isValidResumeLinkPath({ path: path });

      const response = await actor.clientAddResumeLink({
        lid: lid,
        path: path,
        isPublic: isPublic,
      });

      if ('err' in response) {
        throw new Error(response.err.message || "Something went wrong with resume service service");
      }

      const id = response.ok.data.id.toString();

      return {
        lid: lid,
        id: id,
        path: path,
        isPublic: isPublic
      };
    },

    clientUpdateResumeLink: async ({ resumeLink }: { resumeLink: ResumeLink }): Promise<ResumeLink> => {
      isValidResumeLinkPath({ path: resumeLink.path });

      const response = await actor.clientUpdateResumeLink({
        newResumeLink: {
          ...resumeLink,
          id: BigInt(resumeLink.id)
        }
      });

      if ('err' in response) {
        throw new Error(response.err.message || "Something went wrong with resume service service");
      }

      return resumeLink;
    },

    clientCheckIsResumePathExists: async ({ path }: { path: string }): Promise<boolean> => {
      const response = await actor.clientCheckIsPathExists({ path: path });

      if ('err' in response) {
        throw new Error(response.err.message || "Something went wrong with resume service service");
      }

      return response.ok.data;
    }

  };
}
