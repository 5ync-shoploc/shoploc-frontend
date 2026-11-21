'use client';

import Link from 'next/link';
import React, { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useCurrentUser } from '@/lib/auth/CurrentUserContext';
import { ApiError } from '@/lib/api/http';
import { addToCart } from '@/lib/api/orders';
import type { Product } from '@/lib/api/products';

/** Ajoute l'article au panier du client connecté (order-service : POST /api/order/cart/items). */
export default function AddToCartButton({ product }: { product: Product }) {
    const toast = useRef<Toast>(null);
    const { user } = useCurrentUser();
    const [adding, setAdding] = useState(false);

    const onClick = async () => {
        if (user?.role !== 'CLIENT') {
            toast.current?.show({ severity: 'warn', summary: 'Panier', detail: 'Connectez-vous en tant que client pour ajouter des articles au panier.' });
            return;
        }
        setAdding(true);
        try {
            const cart = await addToCart(user, product.id, 1);
            const quantity = cart.items.find((i) => i.productId === product.id)?.quantity ?? 1;
            toast.current?.show({
                severity: 'success',
                summary: 'Ajouté au panier',
                content: (
                    <div className="flex flex-column gap-2">
                        <span className="font-bold">Ajouté au panier</span>
                        <span>
                            « {product.name} » ({quantity} dans le panier)
                        </span>
                        <Link href="/panier">Voir mon panier</Link>
                    </div>
                )
            });
        } catch (e) {
            toast.current?.show({ severity: 'error', summary: 'Panier', detail: e instanceof ApiError ? e.message : 'Erreur inattendue.', life: 6000 });
        } finally {
            setAdding(false);
        }
    };

    return (
        <>
            <Toast ref={toast} />
            <Button label={product.available ? 'Ajouter au panier' : 'Indisponible'} icon="pi pi-shopping-cart" disabled={!product.available} loading={adding} onClick={onClick} className="align-self-start" />
        </>
    );
}
