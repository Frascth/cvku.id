import React, { useEffect, useState, ReactNode } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { createActor } from "../../../declarations/auth_service/index.js";
import { canisterId } from "../../../declarations/auth_service/index.js";
import { _SERVICE } from "../../../declarations/auth_service/auth_service.did.js";
import { AuthContext } from "@/contexts/AuthContext.js";
import { useResumeStore } from "@/store/useResumeStore.js";

// Penting: Pastikan DFX_NETWORK ini diakses dengan benar oleh bundler Anda (misalnya Vite, Webpack)
// Untuk Vite, gunakan import.meta.env.VITE_DFX_NETWORK
// Untuk Create React App/Webpack, gunakan process.env.DFX_NETWORK (atau REACT_APP_DFX_NETWORK)
const network = process.env.DFX_NETWORK || "local"; // Asumsi environment variable ada

// Dapatkan ID canister Internet Identity lokal dari environment variable.
// Variabel ini harus disetel saat Anda menjalankan frontend dev server (misalnya oleh dfx atau script kustom).
// Sebagai fallback, gunakan ID yang Anda dapatkan dari 'dfx deploy' untuk Internet Identity.
const LOCAL_INTERNET_IDENTITY_CANISTER_ID =
  process.env.CANISTER_ID_INTERNET_IDENTITY_SERVICE ||
  "ulvla-h7777-77774-qaacq-cai";

let identityProvider = "https://identity.ic0.app"; // Default: Mainnet Identity

if (network === "playground") {
  identityProvider = "https://identity.internetcomputer.org"; // Playground Identity (biasanya sama dengan mainnet atau spesifik)
} else if (network === "local") {
  // Gunakan ID Internet Identity lokal yang benar
  identityProvider = `http://${LOCAL_INTERNET_IDENTITY_CANISTER_ID}.localhost:4943`;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { initializeHandlers } = useResumeStore();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [state, setState] = useState({
    actor: undefined,
    authClient: undefined,
    isAuthenticated: false,
    principal: "",
  });

  // Initialize auth client
  useEffect(() => {
    updateActor();
  }, []);

  const updateActor = async () => {
    setIsLoading(true);

    const authClient = await AuthClient.create();
    const identity = authClient.getIdentity();
    const actor = createActor(canisterId, {
      agentOptions: {
        identity,
      },
    });
    const isAuthenticated = await authClient.isAuthenticated();

    setState((prev) => ({
      ...prev,
      actor,
      authClient,
      isAuthenticated,
    }));

    setIsLoading(false);
  };

  const login = async () => {
    const width = 700;
    const height = 640;

    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    await state.authClient.login({
      identityProvider,
      windowOpenerFeatures: `toolbar=0,location=0,menubar=0,width=${width},height=${height},left=${left},top=${top}`,
      maxTimeToLive: BigInt(7) * BigInt(24) * BigInt(3_600_000_000_000), // 1 week
      onSuccess: updateActor,
    });
  };

  const logout = async () => {
    await state.authClient.logout();
    updateActor();
  };

  useEffect(() => {
    if (state.authClient) {
      initializeHandlers(state.authClient);
    }
  }, [state.authClient]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
