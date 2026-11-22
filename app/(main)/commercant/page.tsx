'use client';

import Link from 'next/link';
import React from 'react';
import RequireRole from '@/components/auth/RequireRole';

/** Espace commerçant : gestion de ses articles (SCRUM-64). Page en attente du vrai écran. */
export default function MerchantPage() {
    return (
        <RequireRole role="COMMERCANT">
            <div className="card">
                <h5>Gestion de mes articles</h5>
                <p>
                    Cette page n&apos;est pas encore disponible : la gestion de vos articles (ajout, modification, stock) arrive bientôt. En attendant, vous pouvez consulter vos <Link href="/commercant/commandes">commandes</Link>.
                </p>
            </div>
        </RequireRole>
    );
}
