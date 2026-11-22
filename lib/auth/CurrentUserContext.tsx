'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { clearSession, loadSession, saveSession } from './session';
import type { CurrentUser, Role, TokenResponse } from './session';

export type { CurrentUser, Role };

interface CurrentUserContextValue {
    user: CurrentUser | null;
    /** false tant que la session mémorisée n'est pas encore relue : attendre avant d'appeler l'API ou de rediriger. */
    ready: boolean;
    /** Enregistre la session après une connexion réussie (voir lib/api/auth.ts). */
    login: (tokens: TokenResponse) => void;
    /** Déconnexion : efface la session et renvoie vers la page de connexion. */
    logout: () => void;
}

const CurrentUserContext = createContext<CurrentUserContextValue>({
    user: null,
    ready: false,
    login: () => {},
    logout: () => {}
});

export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [ready, setReady] = useState(false);

    // Au chargement de la page, on relit la session mémorisée par le navigateur (si elle n'a pas expiré).
    useEffect(() => {
        setUser(loadSession());
        setReady(true);
    }, []);

    const login = (tokens: TokenResponse) => setUser(saveSession(tokens));

    const logout = () => {
        clearSession();
        setUser(null);
    };

    return <CurrentUserContext.Provider value={{ user, ready, login, logout }}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser() {
    return useContext(CurrentUserContext);
}
