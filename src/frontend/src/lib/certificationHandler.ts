// lib/certificationHandler.ts

import { createActor, canisterId } from "../../../declarations/certification_service";
import type { AuthClient } from "@dfinity/auth-client";

// Import tipe Backend "mentah" dari deklarasi DFX. BERI ALIAS!
import type { Certification as BackendCertificationRaw } from "../../../declarations/certification_service/certification_service.did";

// Import tipe Frontend dari useResumeStore.ts
import type { Certification } from "@/store/useResumeStore"; // Pastikan path ini benar

// Tipe untuk argumen `clientAdd` di backend (tanpa 'id' yang dihasilkan backend)
// Ini harus sesuai dengan Record yang diterima oleh fungsi `clientAdd` di Motoko.
// Asumsi backend Certification.mo clientAdd menerima {name: Text; issuer: Text; date: Text; credentialId: ?Text}
type AddCertificationBackendRequest = {
    name: string;
    issuer: string;
    date: string;
    credentialId: [] | [string]; // Ini harus `[] | [string]` sesuai backend
};


export function createCertificationHandler(authClient: AuthClient) {
  const actor = createActor(canisterId, {
    agentOptions: {
      identity: authClient.getIdentity(),
    },
  });

  // Helper: Mengonversi tipe dari Backend (raw) ke Frontend
  const toFrontendCertification = (backendCert: BackendCertificationRaw): Certification => ({
    id: backendCert.id,
    name: backendCert.name,
    issuer: backendCert.issuer,
    date: backendCert.date,
    // Konversi `[] | [string]` ke `string | undefined`
    credentialId: backendCert.credentialId.length > 0 ? backendCert.credentialId[0] : undefined,
  });

  // Helper: Mengonversi tipe dari Frontend ke Backend (raw)
  const toBackendCertificationRaw = (frontendCert: Certification): BackendCertificationRaw => ({
    id: frontendCert.id,
    name: frontendCert.name,
    issuer: frontendCert.issuer,
    date: frontendCert.date,
    // Konversi `string | undefined` ke `[] | [string]`
    credentialId: frontendCert.credentialId ? [frontendCert.credentialId] : [],
  });

  // Helper: Mengonversi tipe dari Frontend untuk request Add ke Backend
  const toBackendAddRequest = (frontendCertData: Omit<Certification, 'id'>): AddCertificationBackendRequest => ({
    name: frontendCertData.name,
    issuer: frontendCertData.issuer,
    date: frontendCertData.date,
    credentialId: frontendCertData.credentialId ? [frontendCertData.credentialId] : [],
  });


  return {
    // Fungsi untuk mengambil semua sertifikasi dari backend
    // Mengembalikan Promise<Certification[]> (tipe frontend)
    clientGetAll: async (): Promise<Certification[]> => {
      const backendCertsRaw = await actor.clientGetAll(); // Menerima BackendCertificationRaw[]
      return backendCertsRaw.map(toFrontendCertification); // Mengonversi ke Frontend Certification[]
    },

    // Fungsi untuk menambahkan sertifikasi baru
    // Menerima Omit<Certification, 'id'> (tipe frontend), Mengembalikan Promise<Certification> (tipe frontend)
    clientAdd: async (data: Omit<Certification, "id">): Promise<Certification> => {
        const backendRequest = toBackendAddRequest(data); // Konversi data frontend ke request backend
        const addedBackendCertRaw = await actor.clientAdd(backendRequest); // Menerima BackendCertificationRaw
        return toFrontendCertification(addedBackendCertRaw); // Konversi ke Frontend Certification
    },

    // Fungsi untuk menyimpan semua sertifikasi (batch update)
    // Menerima Certification[] (tipe frontend), Mengembalikan Promise<Certification[]> (tipe frontend)
    clientSave: async (certifications: Certification[]): Promise<Certification[]> => {
      if (certifications.length <= 0) {
        return [];
      }
      const backendCertsRaw = certifications.map(toBackendCertificationRaw); // Konversi ke BackendCertificationRaw[]
      const resultBackendCertsRaw = await actor.clientBatchUpdate(backendCertsRaw); // Menerima BackendCertificationRaw[]
      return resultBackendCertsRaw.map(toFrontendCertification); // Konversi kembali ke Frontend Certification[]
    },

    // Fungsi untuk menghapus sertifikasi
    clientDeleteById: async (id: string): Promise<boolean> => {
      return await actor.clientDeleteById(id);
    },
  };
}