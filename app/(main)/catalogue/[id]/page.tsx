'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Skeleton } from 'primereact/skeleton';
import { Tag } from 'primereact/tag';
import AddToCartButton from '@/components/catalog/AddToCartButton';
import ProductImage from '@/components/catalog/ProductImage';
import ProductNotFound from '@/components/catalog/ProductNotFound';
import { ApiError, formatPrice } from '@/lib/api/http';
import { getProduct, type Product } from '@/lib/api/products';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const validId = /^\d+$/.test(params.id);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(validId);
    const [notFound, setNotFound] = useState(!validId);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (!validId) return;
        let cancelled = false;
        setLoading(true);
        setError(null);
        setNotFound(false);
        getProduct(Number(params.id))
            .then((result) => {
                if (cancelled) return;
                setProduct(result);
                setLoading(false);
            })
            .catch((e) => {
                if (cancelled) return;
                if (e instanceof ApiError && (e.status === 404 || e.status === 400)) {
                    setNotFound(true);
                } else {
                    setError(e instanceof ApiError ? e.message : 'Erreur inattendue.');
                }
                setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [params.id, validId, reloadKey]);

    return (
        <div className="card">
            <Button label="Retour au catalogue" icon="pi pi-arrow-left" text className="mb-3 px-0" onClick={() => router.push('/catalogue')} />

            {loading && (
                <div className="grid" aria-busy="true" aria-label="Chargement de l'article">
                    <div className="col-12 md:col-5">
                        <Skeleton height="24rem" />
                    </div>
                    <div className="col-12 md:col-7">
                        <Skeleton width="60%" height="2rem" className="mb-3" />
                        <Skeleton width="30%" height="2rem" className="mb-3" />
                        <Skeleton height="6rem" />
                    </div>
                </div>
            )}

            {!loading && notFound && <ProductNotFound />}

            {!loading && !notFound && error && (
                <div className="flex flex-column align-items-start gap-3">
                    <Message severity="error" className="w-full justify-content-start" text={error} />
                    <Button label="Réessayer" icon="pi pi-refresh" outlined onClick={() => setReloadKey((k) => k + 1)} />
                </div>
            )}

            {!loading && !notFound && !error && product && (
                <div className="grid">
                    <div className="col-12 md:col-5">
                        <ProductImage product={product} height="24rem" />
                    </div>
                    <div className="col-12 md:col-7 flex flex-column gap-3">
                        <h2 className="m-0">{product.name}</h2>
                        <div>{product.available ? <Tag value="Disponible" severity="success" /> : <Tag value="Indisponible" severity="danger" icon="pi pi-ban" />}</div>
                        <div className="text-3xl font-bold">{formatPrice(product.price)}</div>
                        <p className="text-700 line-height-3 m-0" style={{ whiteSpace: 'pre-line' }}>
                            {product.description}
                        </p>
                        {!product.available && <Message severity="warn" className="justify-content-start" text="Cet article est actuellement indisponible." />}
                        <AddToCartButton product={product} />
                    </div>
                </div>
            )}
        </div>
    );
}