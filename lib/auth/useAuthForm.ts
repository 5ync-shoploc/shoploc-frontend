'use client';

import React, { useState } from 'react';
import { ApiError } from '@/lib/api/http';

/**
 * Logique commune des formulaires de connexion et d'inscription :
 * empêche le rechargement de la page, gère le chargement et le message d'erreur.
 */
export function useAuthForm(action: () => Promise<void>) {
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setBusy(true);
        try {
            await action();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Erreur inattendue.');
            setBusy(false);
        }
    };

    return { error, busy, submit };
}
