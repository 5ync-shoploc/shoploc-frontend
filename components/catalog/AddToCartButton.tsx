import React, { useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import type { Product } from '@/lib/api/products';

export default function AddToCartButton({ product }: { product: Product }) {
    const toast = useRef<Toast>(null);

    const onClick = () => {
        toast.current?.show({ severity: 'info', summary: 'Panier', detail: `« ${product.name} » : le panier arrive bientôt.` });
    };

    return (
        <>
            <Toast ref={toast} />
            <Button label={product.available ? 'Ajouter au panier' : 'Indisponible'} icon="pi pi-shopping-cart" disabled={!product.available} onClick={onClick} className="align-self-start" />
        </>
    );
}