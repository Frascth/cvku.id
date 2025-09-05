import { createActor, canisterId } from "../../../declarations/social_service";
import type { AuthClient } from "@dfinity/auth-client";
import type { SocialLink } from "@/store/useResumeStore";
import { isValidUrl } from "./utils";

export function createSocialHandler(authClient: AuthClient) {
  const actor = createActor(canisterId, {
    agentOptions: { identity: authClient.getIdentity() },
  });

  const toFrontend = (b: any): SocialLink => ({
    id: Number(b.id),
    platform: b.platform,
    url: b.url,
  });

  return {
    // GET ALL
    clientGetAll: async (): Promise<SocialLink[]> => {
      const response = await actor.clientGetAll();
      if ("err" in response) {
        throw new Error(response.err.message ?? "Something went wrong with social link service");
      }
      const ok: any = (response as any).ok;
      const rows = ok?.data ?? ok ?? [];
      return (rows as any[]).map(toFrontend);
    },

    // ADD
    // src/lib/socialHandler.ts
    clientAdd: async ({
      lid,
      socialLink,
    }: { lid: number; socialLink: Omit<SocialLink, "id"> }): Promise<SocialLink> => {
      if (!isValidUrl(socialLink.url)) throw new Error("Please provide a valid URL.");

      // kirim Nat -> BigInt
      const resp = await actor.clientAdd({
        lid: BigInt(lid),
        platform: socialLink.platform,
        url: socialLink.url,
      });

      if ("err" in resp) {
        throw new Error(resp.err.message ?? "Something went wrong with social link service");
      }

      // resp.ok.data biasanya { id: bigint, lid: bigint } (tergantung did-mu)
      const ok: any = (resp as any).ok;
      const saved = ok?.data ?? ok;

      return {
        id: Number(saved.id),        // backend Nat -> number FE
        platform: socialLink.platform,
        url: socialLink.url,
        lid,                         // ⬅️ tetap number (jangan String)
      };
    },



    // UPDATE
    clientUpdate: async ({ socialLink }: { socialLink: SocialLink }): Promise<void> => {
      const payload = {
        id: BigInt(socialLink.id),
        platform: socialLink.platform,
        url: socialLink.url,
      };

      // dari error TS kamu, candid expect { newSocialLink: ... }
      const resp = await actor.clientUpdate({ newSocialLink: payload });

      if ("err" in resp) {
        throw new Error(resp.err.message ?? "Something went wrong with social link service");
      }
    },

    // DELETE
    clientDelete: async ({ id }: { id: number }): Promise<boolean> => {
      const resp = await actor.clientDelete({ id: BigInt(id) });
      if ("err" in resp) {
        throw new Error(resp.err.message ?? "Something went wrong with social link service");
      }
      return true;
    },
  };
}
