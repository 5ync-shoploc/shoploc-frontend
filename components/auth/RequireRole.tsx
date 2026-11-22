'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useCurrentUser } from '@/lib/auth/CurrentUserContext';
import type { Role } from '@/lib/auth/session';

interface RequireRoleProps {
    /** Rôle exigé pour voir la page. Omis = être connecté suffit, n'importe quel rôle. */
    role?: Role;
    children: React.ReactNode;
}

/**
 * Protège une page (SCRUM-64) : renvoie vers la connexion si personne n'est
 * connecté, ou vers la page d'accès refusé si le rôle ne correspond pas.
 */
export default function RequireRole({ role, children }: RequireRoleProps) {
    const { user, ready } = useCurrentUser();
    const router = useRouter();

    useEffect(() => {
        if (!ready) {
            return;
        }
        if (!user) {
            router.replace('/auth/login');
        } else if (role && user.role !== role) {
            router.replace('/auth/access');
        }
    }, [ready, user, role, router]);

    if (!ready || !user || (role && user.role !== role)) {
        return null;
    }
    return <>{children}</>;
}
