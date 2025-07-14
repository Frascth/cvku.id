import React, { createContext } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import type { _SERVICE } from '../../../declarations/auth_service/auth_service.did.js';
import { ActorSubclass } from '@dfinity/agent';

interface AuthContextProps {
  actor: ActorSubclass<_SERVICE> | null;
  authClient: AuthClient | null;
  isAuthenticated: boolean;
  principal: string;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);
