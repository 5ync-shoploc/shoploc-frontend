'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

/** Rôles des utilisateurs ShopLoc (MCD : CLIENT / COMMERCANT / COLLECTIVITE / ADMIN). */
export type Role = 'CLIENT' | 'COMMERCANT' | 'COLLECTIVITE' | 'ADMIN';

export interface CurrentUser {
    id: string;
    role: Role;
    label: string;
}

/**
 * IDENTITÉ SIMULÉE, en attendant Keycloak.
 * Ces utilisateurs de démonstration correspondent à ceux reconnus par les services (en-têtes X-User-Id / X-User-Role).
 * Quand Keycloak sera branché, ce contexte sera alimenté par la vraie connexion.
 */
export const DEMO_USERS: CurrentUser[] = [
    { id: 'client-1', role: 'CLIENT', label: 'client-1 (client)' },
    { id: 'client-2', role: 'CLIENT', label: 'client-2 (client)' },
    { id: 'merchant-1', role: 'COMMERCANT', label: 'merchant-1 (commerçant)' },
    { id: 'merchant-2', role: 'COMMERCANT', label: 'merchant-2 (commerçant)' }
];

const STORAGE_KEY = 'shoploc.demoUserId';

interface CurrentUserContextValue {
    user: CurrentUser | null;
    setUser: (user: CurrentUser | null) => void;
    /** false tant que l'utilisateur mémorisé n'est pas encore relu : attendre avant d'appeler l'API. */
    ready: boolean;
}

const CurrentUserContext = createContext<CurrentUserContextValue>({ user: null, setUser: () => {}, ready: false });

export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUserState] = useState<CurrentUser | null>(DEMO_USERS[0]);
    const [ready, setReady] = useState(false);

    // On retrouve l'utilisateur choisi lors de la dernière visite (si le navigateur le permet).
    useEffect(() => {
        try {
            const savedId = window.localStorage.getItem(STORAGE_KEY);
            if (savedId !== null) {
                setUserState(DEMO_USERS.find((u) => u.id === savedId) ?? null);
            }
        } catch {
            // stockage indisponible : on garde l'utilisateur par défaut
        }
        setReady(true);
    }, []);

    const setUser = (next: CurrentUser | null) => {
        setUserState(next);
        try {
            window.localStorage.setItem(STORAGE_KEY, next ? next.id : '');
        } catch {
            // stockage indisponible : le choix vaut seulement pour cette page
        }
    };

    return <CurrentUserContext.Provider value={{ user, setUser, ready }}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser() {
    return useContext(CurrentUserContext);
}
