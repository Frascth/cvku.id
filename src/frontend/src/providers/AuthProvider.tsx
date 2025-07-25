import React, { useEffect, useState, ReactNode } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { createActor } from '../../../declarations/auth_service/index.js';
import { canisterId } from '../../../declarations/auth_service/index.js';
import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../declarations/auth_service/auth_service.did.js';
import { AuthContext } from '@/contexts/AuthContext.js';

const network = process.env.DFX_NETWORK || 'local';

let identityProvider = 'https://identity.ic0.app'; // Mainnet

if (network === 'playground') {
  identityProvider = 'https://identity.internetcomputer.org' // Playground (DFINITY's testnet)
}

if (network === 'local') {
  const iiCanisterId = process.env.CANISTER_ID_INTERNET_IDENTITY_SERVICE;
  identityProvider = `http://${iiCanisterId}.localhost:4943`; // Local
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [actor, setActor] = useState<ActorSubclass<_SERVICE> | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState("");

  const updateAuth = async () => {
    const client = await AuthClient.create();
    setAuthClient(client);

    const isAuthed = await client.isAuthenticated();
    setIsAuthenticated(isAuthed);

    const identity = client.getIdentity();
    const actor = createActor(canisterId, { agentOptions: { identity } });
    setActor(actor);

    const principalResponse = await actor.whoami();
    setPrincipal(principalResponse.toString());
  };

  const login = async () => {
    if (!authClient) return;
    await authClient.login({
      identityProvider,
      onSuccess: updateAuth,
    });
  };

  const logout = async () => {
    if (!authClient) return;
    await authClient.logout();
    await updateAuth();
  };

  useEffect(() => {
    updateAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        actor,
        authClient,
        isAuthenticated,
        isLoading: !authClient, // Assuming loading state is true until authClient is initialized
        principal,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};