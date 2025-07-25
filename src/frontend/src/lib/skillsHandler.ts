// src/lib/skillsHandler.ts

// Pastikan path impor ini benar relatif dari `src/lib/` ke folder `declarations`
// Anda perlu menyesuaikan `../` jika struktur folder Anda berbeda.
// Contoh: jika `src/frontend/src/lib` dan deklarasi di `src/frontend/src/declarations`,
// maka path yang benar adalah `../declarations/skills_service`.
import { createActor, canisterId } from "../../../declarations/skills_service"; // <-- Path relatif tanpa `../../../`

import type { AuthClient } from "@dfinity/auth-client";

// Import tipe Backend "mentah" dari deklarasi DFX.
// Path ini juga harus relatif dari `src/lib/` ke file `.did.ts`
import type { Skill as BackendSkillRaw, SkillLevel as BackendSkillLevelRaw } from "../../../declarations/skills_service/skills_service.did";

import type { Skill, SkillLevel } from "../store/useResumeStore";

// Tipe untuk argumen `clientAddSkill` di backend (tanpa 'id' yang dihasilkan backend)
// Ini harus sesuai dengan Record yang diterima oleh fungsi `clientAddSkill` di Motoko.
type AddSkillBackendRequest = {
    name: string;
    level: BackendSkillLevelRaw; // Ini akan menjadi { 'Beginner': null } dll.
};

export function createSkillsHandler(authClient: AuthClient) {
  // Membuat actor tanpa konfigurasi host eksplisit,
  // seragam dengan cara certificationHandler Anda.
  const actor = createActor(canisterId, {
    agentOptions: {
      identity: authClient.getIdentity(),
    },
  });

  // --- Helper Converters ---

  // Helper: Mengonversi tipe dari Backend (raw) ke Frontend
  const toFrontendSkill = (backendSkill: BackendSkillRaw): Skill => ({
    id: backendSkill.id,
    name: backendSkill.name,
    level: backendSkill.level as SkillLevel, // Type assertion agar cocok
  });

  // Helper: Mengonversi tipe dari Frontend ke Backend (raw)
  const toBackendSkillRaw = (frontendSkill: Skill): BackendSkillRaw => ({
    id: frontendSkill.id,
    name: frontendSkill.name,
    level: frontendSkill.level as BackendSkillLevelRaw, // Type assertion
  });

  // Helper: Mengonversi tipe dari Frontend untuk request Add ke Backend
  const toBackendAddRequest = (frontendSkillData: Omit<Skill, 'id'>): AddSkillBackendRequest => ({
    name: frontendSkillData.name,
    level: frontendSkillData.level as BackendSkillLevelRaw, // Type assertion
  });

  // --- Public Functions ---

  return {
    /**
     * Mengambil semua skill untuk pengguna yang terautentikasi dari backend.
     * Mengembalikan Promise<Skill[]> (tipe frontend).
     */
    clientGetAllSkills: async (): Promise<Skill[]> => {
      const backendSkillsRaw = await actor.clientGetAllSkills(); // Menerima BackendSkillRaw[]
      return backendSkillsRaw.map(toFrontendSkill); // Mengonversi ke Frontend Skill[]
    },

    /**
     * Menambahkan skill baru ke backend.
     * Menerima Omit<Skill, 'id'> (tipe frontend), Mengembalikan Promise<Skill> (tipe frontend).
     */
    clientAddSkill: async (data: Omit<Skill, "id">): Promise<Skill> => {
      const backendRequest = toBackendAddRequest(data); // Konversi data frontend ke request backend
      const addedBackendSkillRaw = await actor.clientAddSkill(backendRequest); // Menerima BackendSkillRaw
      return toFrontendSkill(addedBackendSkillRaw); // Konversi ke Frontend Skill
    },

    /**
     * Memperbarui daftar skill di backend secara batch.
     * Menerima Skill[] (tipe frontend), Mengembalikan Promise<Skill[]> (tipe frontend).
     */
    clientBatchUpdateSkills: async (skills: Skill[]): Promise<Skill[]> => {
      if (skills.length <= 0) {
        return [];
      }
      const backendSkillsRaw = skills.map(toBackendSkillRaw); // Konversi ke BackendSkillRaw[]
      const resultBackendSkillsRaw = await actor.clientBatchUpdateSkills(backendSkillsRaw); // Menerima BackendSkillRaw[]
      return resultBackendSkillsRaw.map(toFrontendSkill); // Konversi kembali ke Frontend Skill[]
    },

    /**
     * Menghapus skill berdasarkan ID dari backend.
     * @param {string} id - ID skill yang ingin dihapus.
     * @returns {Promise<boolean>} True jika berhasil dihapus, false jika gagal.
     */
    clientDeleteById: async (id: string): Promise<boolean> => {
      return await actor.clientDeleteSkillById(id);
    },

    // Jika Anda punya getAllSkillsByClient (misalnya untuk admin), tambahkan di sini
    // getAllSkillsByClient: async (clientPrincipal: Principal): Promise<Skill[]> => {
    //     const backendSkillsRaw = await actor.getAllSkillsByClient(clientPrincipal);
    //     return backendSkillsRaw.map(toFrontendSkill);
    // }
  };
}