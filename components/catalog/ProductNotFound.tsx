import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';

export default function ProductNotFound() {
    const router = useRouter();

    return (
        <div className="flex flex-column align-items-center text-center py-6">
            <i className="pi pi-search text-5xl text-500 mb-3" aria-hidden="true" />
            <h2 className="mt-0 mb-2">Article introuvable</h2>
            <p className="text-600 mt-0 mb-4">Cet article n'existe pas ou n'est plus disponible dans le catalogue.</p>
            <Button label="Retour au catalogue" icon="pi pi-arrow-left" onClick={() => router.push('/catalogue')} />
        </div>
    );
}