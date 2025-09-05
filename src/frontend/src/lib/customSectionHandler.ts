// src/lib/customSectionHandler.ts
import { createActor, canisterId } from "../../../declarations/custom_section_service";
import type { AuthClient } from "@dfinity/auth-client";
import type { CustomSection, CustomSectionItem } from "@/store/useResumeStore";
import { toOptionalMo, toOptionalTs } from "./moUtils";

export function createCustomSectionHandler(authClient: AuthClient) {
  const actor = createActor(canisterId, {
    agentOptions: { identity: authClient.getIdentity() },
  });

  return {
    /** Ambil semua section (BE bigint -> FE number) */
    clientGetAll: async (): Promise<CustomSection[]> => {
      const resp = await actor.clientGetAll(); // sesuaikan dgn .did-mu
      if ("err" in resp) throw new Error(resp.err.message ?? "Something went wrong with custom section service");

      return resp.ok.data.map((s) => ({
        id: Number(s.id),
        name: s.name,
        items: (s.items ?? []).map((it) => ({
          id: Number(it.id),
          sectionId: Number(it.sectionId),
          title: it.title,
          description: it.description,
          subtitle: toOptionalTs(it.subtitle),
          date: toOptionalTs(it.date),
        })),
      }));
    },

    /** Tambah section baru (FE number -> BE bigint) */
    clientAddCustomSection: async ({
      lid,
      name,
    }: {
      lid: number; // FE lokal id sementara
      name: string;
    }): Promise<CustomSection> => {
      const resp = await actor.clientAddCustomSection({
        lid: BigInt(lid), // wajib bigint utk .did
        name,
      });
      if ("err" in resp) throw new Error(resp.err.message ?? "Something went wrong with custom section service");

      // BE balikin { lid: Nat?, id: Nat } — kita simpan id sebagai number
      return {
        id: Number(resp.ok.data.id),
        name,
        items: [],
      };
    },

    /** Hapus section */
    clientDeleteCustomSection: async ({ id }: { id: number }): Promise<number> => {
      const resp = await actor.clientDeleteCustomSection({ id: BigInt(id) });
      if ("err" in resp) throw new Error(resp.err.message ?? "Something went wrong with custom section service");
      return Number(resp.ok.data.id);
    },

    /** Tambah item ke section tertentu */
    clientAddItem: async ({
      lid,
      item,
    }: {
      lid: number; // kalau .did memang butuh lid, kirim sebagai Nat
      item: Omit<CustomSectionItem, "id">; // id dibuat di BE
    }): Promise<CustomSectionItem> => {
      const req = {
        lid: BigInt(lid),
        sectionId: BigInt(item.sectionId),
        title: item.title,
        date: toOptionalMo(item.date),
        description: item.description,
        subtitle: toOptionalMo(item.subtitle),
      };
      const resp = await actor.clientAddItem(req);
      if ("err" in resp) throw new Error(resp.err.message ?? "Something went wrong with custom section service");

      return {
        ...item,
        id: Number(resp.ok.data.id),
      };
    },

    /** Hapus item tertentu */
    clientDeleteItem: async ({ sectionId, id }: { sectionId: number; id: number }): Promise<number> => {
      const resp = await actor.clientDeleteItem({
        sectionId: BigInt(sectionId),
        id: BigInt(id),
      });
      if ("err" in resp) throw new Error(resp.err.message ?? "Something went wrong with custom section service");
      return Number(resp.ok.data.id);
    },

    /** Batch update items pada satu section */
    clientBatchUpdateItem: async ({
      sectionId,
      items,
    }: {
      sectionId: number;
      items: CustomSectionItem[];
    }): Promise<void> => {
      if (!items.length) return;

      const newItems = items.map((it) => ({
        id: BigInt(it.id),
        sectionId: BigInt(it.sectionId),
        title: it.title,
        description: it.description,
        subtitle: toOptionalMo(it.subtitle),
        date: toOptionalMo(it.date),
      }));

      const resp = await actor.clientBatchUpdateItem({
        sectionId: BigInt(sectionId),
        newItems,
      });
      if ("err" in resp) throw new Error(resp.err.message ?? "Something went wrong with custom section service");
    },
  };
}
