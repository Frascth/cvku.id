import { createActor, canisterId } from "../../../declarations/social_service";
import type { AuthClient } from "@dfinity/auth-client";
import { SocialLink } from "@/store/useResumeStore";
import { isValidUrl } from "./utils";

export function createSocialHandler(authClient: AuthClient) {
  const actor = createActor(canisterId, {
    agentOptions: {
      identity: authClient.getIdentity(),
    },
  });

  return {

    clientGetAll: async (): Promise<SocialLink[]> => {
      const response = await actor.clientGetAll();

      if ('err' in response) {
        throw new Error(response.err.message ?? "Something went wrong with social link service");
      }

      return response.ok.data.map((socialLink) => {
        return {
          ...socialLink,
          id: socialLink.id.toString(),
        };
      });
    },

    clientAdd: async ({ lid, socialLink }: { lid: string, socialLink: Omit<SocialLink, 'id'> }): Promise<SocialLink> => {
      if (!isValidUrl(socialLink.url)) {
        throw new Error(`Please provide a valid URL.`);
      }

      const response = await actor.clientAdd({
        lid: lid,
        platform: socialLink.platform,
        url: socialLink.url,
      });

      if ('err' in response) {
        throw new Error(response.err.message ?? "Something went wrong with social link service");
      }

      return {
        ...socialLink,
        lid: lid,
        id: response.ok.data.id.toString(),
      };
    },

    clientUpdate: async ({ socialLink }: { socialLink:SocialLink }): Promise<void> => {
      const newSocialLink = {
        ...socialLink,
        id: BigInt(socialLink.id),
      };

      const response = await actor.clientUpdate({ newSocialLink });

      if ('err' in response) {
        throw new Error(response.err.message ?? "Something went wrong with social link service");
      }
    },

    clientDelete: async ({ id }: { id: string }): Promise<string> => {
      const response = await actor.clientDelete({
        id: BigInt(id),
      });

      if ('err' in response) {
        throw new Error(response.err.message ?? "Something went wrong with social link service");
      }

      return response.ok.data.id.toString();
    },

  };
}
