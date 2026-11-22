'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import ClientDashboard from '@/components/dashboard/ClientDashboard';
import MerchantDashboard from '@/components/dashboard/MerchantDashboard';
import { useCurrentUser } from '@/lib/auth/CurrentUserContext';
import { listProducts } from '@/lib/api/products';
import { getMyProfile } from '@/lib/api/profile';

/** Tableau de bord : son contenu dépend du rôle de l'utilisateur connecté. */
export default function Dashboard() {
    const { user, ready } = useCurrentUser();
    const [catalogCount, setCatalogCount] = useState<React.ReactNode>('…');
    // prénom affiché en en-tête ; retombe sur l'e-mail (user.label) tant qu'il n'est pas chargé
    const [firstName, setFirstName] = useState<string | null>(null);

    // nombre d'articles au catalogue (public, identique pour tous les rôles)
    useEffect(() => {
        let cancelled = false;
        listProducts(0, 1)
            .then((page) => !cancelled && setCatalogCount(page.totalElements))
            .catch(() => !cancelled && setCatalogCount('—'));
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!user) {
            return;
        }
        let cancelled = false;
        getMyProfile(user)
            .then((profile) => !cancelled && setFirstName(profile.firstName))
            .catch(() => {
                // pas grave : l'en-tête retombe sur l'e-mail
            });
        return () => {
            cancelled = true;
        };
    }, [user]);

    if (!ready) return null;

    return (
        <>
            <div className="mb-4">
                <h4 className="mb-1">Bonjour {firstName ?? user?.label ?? ''}</h4>
                <span className="text-500">{user?.role === 'COMMERCANT' ? 'Voici l’activité de votre commerce.' : user?.role === 'CLIENT' ? 'Voici où en sont vos achats.' : 'Bienvenue sur ShopLoc.'}</span>
            </div>

            {user?.role === 'CLIENT' && <ClientDashboard user={user} catalogCount={catalogCount} />}
            {user?.role === 'COMMERCANT' && <MerchantDashboard user={user} catalogCount={catalogCount} />}
            {user?.role !== 'CLIENT' && user?.role !== 'COMMERCANT' && (
                <div className="card">
                    Aucun tableau de bord pour ce rôle pour l’instant. Parcourez le <Link href="/catalogue">catalogue</Link>.
                </div>
            )}
        </>
    );
}
