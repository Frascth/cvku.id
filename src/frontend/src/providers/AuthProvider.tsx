import React, { useEffect, useState, ReactNode } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { createActor } from '../../../declarations/auth_service/index.js';
import { canisterId } from '../../../declarations/auth_service/index.js';
import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../declarations/auth_service/auth_service.did.js';
import { AuthContext } from '@/contexts/AuthContext.js';

// Penting: Pastikan DFX_NETWORK ini diakses dengan benar oleh bundler Anda (misalnya Vite, Webpack)
// Untuk Vite, gunakan import.meta.env.VITE_DFX_NETWORK
// Untuk Create React App/Webpack, gunakan process.env.DFX_NETWORK (atau REACT_APP_DFX_NETWORK)
const network = process.env.DFX_NETWORK || 'local'; // Asumsi environment variable ada

// Dapatkan ID canister Internet Identity lokal dari environment variable.
// Variabel ini harus disetel saat Anda menjalankan frontend dev server (misalnya oleh dfx atau script kustom).
// Sebagai fallback, gunakan ID yang Anda dapatkan dari 'dfx deploy' untuk Internet Identity.
const LOCAL_INTERNET_IDENTITY_CANISTER_ID = process.env.CANISTER_ID_INTERNET_IDENTITY_SERVICE || 'ulvla-h7777-77774-qaacq-cai';

let identityProvider = 'https://identity.ic0.app'; // Default: Mainnet Identity

if (network === 'playground') {
  identityProvider = 'https://identity.internetcomputer.org'; // Playground Identity
}

if (network === 'local') {
  // Gunakan ID Internet Identity lokal yang benar
  identityProvider = `http://${LOCAL_INTERNET_IDENTITY_CANISTER_ID}.localhost:4943`;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [actor, setActor] = useState<ActorSubclass<_SERVICE> | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState("");

  const updateAuth = async () => {
    // AuthClient perlu dibuat dengan identityProvider yang benar dari awal
    // PENTING: Anda membuat AuthClient di sini tanpa identityProvider yang spesifik.
    // Ini akan menggunakan default (yang bisa jadi identity.ic0.app).
    // Kita perlu memastikan AuthClient dibuat dengan identityProvider yang sudah ditentukan di atas.
    // Jika AuthClient.create() dipanggil tanpa parameter, ia akan mencari default.
    // Kita akan memodifikasi panggilan login agar secara eksplisit menggunakan identityProvider.

    // Awalnya, buat AuthClient tanpa identityProvider, ini untuk cek isAuthenticated
    // Jika Anda ingin AuthClient selalu terikat dengan identityProvider tertentu,
    // Anda bisa memindahkan inisialisasi AuthClient ke dalam useEffect dengan identityProvider.
    const client = await AuthClient.create(); // <-- Ini harusnya tidak menerima parameter di sini jika sudah diset global
    setAuthClient(client);

    const isAuthed = await client.isAuthenticated();
    setIsAuthenticated(isAuthed);

    // Pastikan identity didapat setelah client berhasil di autentikasi
    const identity = client.getIdentity();
    const actorInstance = createActor(canisterId, { agentOptions: { identity } });
    setActor(actorInstance);

    // Hanya panggil whoami jika Principal valid (sudah login)
    if (identity.getPrincipal().toText() !== "2vxsx-fae") { // 2vxsx-fae adalah anonymous principal
      const principalResponse = await actorInstance.whoami();
      setPrincipal(principalResponse.toString());
    } else {
      setPrincipal(""); // Reset principal jika tidak authenticated
    }
  };

  const login = async () => {
    if (!authClient) {
      console.error("AuthClient not initialized.");
      return;
    }
    await authClient.login({
      identityProvider, // <-- DI SINI identityProvider global akan digunakan
      onSuccess: updateAuth,
      // Opsi tambahan untuk login pop-up, sesuaikan jika perlu
      // maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1_000_000_000), // 7 days
      // windowOpenerFeatures: `width=500,height=500,toolbar=0,location=0,menubar=0,status=0`,
    });
  };

  const logout = async () => {
    if (!authClient) return;
    await authClient.logout();
    // Setelah logout, panggil updateAuth untuk mereset status
    await updateAuth();
  };

  useEffect(() => {
    updateAuth();
  }, []); // Dependensi kosong agar hanya berjalan sekali saat komponen mount

  return (
    <AuthContext.Provider
      value={{
        actor,
        authClient,
        isAuthenticated,
        isLoading: !authClient, // Asumsi loading state is true until authClient is initialized
        principal,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};