import React, { useEffect, useState, ReactNode } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { createActor } from '../../../declarations/auth_service/index.js';
import { canisterId } from '../../../declarations/auth_service/index.js';
import { ActorSubclass } from '@dfinity/agent';
import { _SERVICE } from '../../../declarations/auth_service/auth_service.did.js';
import { AuthContext } from '@/contexts/AuthContext.js';

const network = import.meta.env.DFX_NETWORK || 'local';

const identityProvider =
  network === 'ic'
    ? 'https://identity.ic0.app'
    : 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943';

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
        principal,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};