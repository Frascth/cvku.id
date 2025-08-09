// lib/workExperienceHandler.ts
import { createActor, canisterId } from "../../../declarations/custom_section_service";
import type { AuthClient } from "@dfinity/auth-client";
import { CustomSection, CustomSectionItem } from "@/store/useResumeStore";
import { toOptionalMo, toOptionalTs } from "./moUtils";

export function createCustomSectionHandler(authClient: AuthClient) {
  const actor = createActor(canisterId, {
    agentOptions: {
      identity: authClient.getIdentity(),
    },
  });

  return {

    clientGetAll: async ():Promise<CustomSection[]> => {
      const response = await actor.clientGetAll();

      if ('err' in response) {
        throw new Error(response.err.message ?? "Something went wrong with custom section service");
      }

      return response.ok.data.map((customSection) => {
        const section = {
          ...customSection,
          id: customSection.id.toString()
        };

        const items = section.items.map(item => ({
          ...item,
          sectionId: item.sectionId.toString(),
          id: item.id.toString(),
          subtitle: toOptionalTs(item.subtitle),
          date: toOptionalTs(item.date),
        }));

        return {
          ...section,
          items: items
        };
      });
    },

    clientAddCustomSection: async (params: {lid: string, name: string}): Promise<CustomSection> => {
        const response = await actor.clientAddCustomSection(params);

        if ('err' in response) {
          throw new Error(response.err.message ?? "Something went wrong with custom section service");
        }

        return {
            lid: response.ok.data.lid,
            id: response.ok.data.id.toString(),
            name: params.name,
            items: [],
        };
    },

    clientDeleteCustomSection: async ({ id } : { id: string }): Promise<string> => {
      const response = await actor.clientDeleteCustomSection({
        id : BigInt(id),
      });

      if ('err' in response) {
        throw new Error(response.err.message ?? "Something went wrong with custom section service");
      }

      return response.ok.data.id.toString();
    },

    clientAddItem: async ({ lid, item } : { lid: string, item: CustomSectionItem}): Promise<CustomSectionItem> => {
        const request = {
          lid : lid,
          sectionId : BigInt(item.sectionId),
          title : item.title,
          date : toOptionalMo(item.date),
          description : item.description,
          subtitle : toOptionalMo(item.subtitle),
        };

        const response = await actor.clientAddItem(request);

        if ('err' in response) {
          throw new Error(response.err.message ?? "Something went wrong with custom section service");
        }

        return {
            ...item,
            lid: response.ok.data.lid,
            id: response.ok.data.id.toString(),
        };
    },

    clientDeleteItem: async ({ sectionId, id } : { sectionId: string, id: string }): Promise<string> => {
      const response = await actor.clientDeleteItem({
        sectionId : BigInt(sectionId),
        id : BigInt(id),
      });

      if ('err' in response) {
        throw new Error(response.err.message ?? "Something went wrong with custom section service");
      }

      return response.ok.data.id.toString();
    },

    clientBatchUpdateItem: async ({ sectionId, items } : { sectionId:string, items:CustomSectionItem[] }):Promise<void> => {
        if (items.length <= 0) {
            return;
        }

        const newItems = items.map(item => ({
          sectionId: BigInt(item.sectionId),
          id: BigInt(item.id),
          title: item.title,
          description: item.description,
          subtitle: toOptionalMo(item.subtitle),
          date: toOptionalMo(item.date),
        }));

        const response = await actor.clientBatchUpdateItem({
          sectionId: BigInt(sectionId),
          newItems: newItems,
        });

        if ('err' in response) {
          throw new Error(response.err.message ?? "Something went wrong with custom section service");
        }
    },

  };
}
