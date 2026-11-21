'use client';

import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Paginator, type PaginatorPageChangeEvent } from 'primereact/paginator';
import { Skeleton } from 'primereact/skeleton';
import ProductCard from '@/components/catalog/ProductCard';
import { ApiError } from '@/lib/api/http';
import { listProducts, type PageResponse, type Product } from '@/lib/api/products';

const PAGE_SIZE = 12;

const COLUMN_CLASSES = 'col-12 sm:col-6 lg:col-4 xl:col-3';

export default function CataloguePage() {
    const [page, setPage] = useState(0);
    const [data, setData] = useState<PageResponse<Product> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        listProducts(page, PAGE_SIZE)
            .then((result) => {
                if (cancelled) return;
                if (result.empty && page > 0) {
                    setPage(Math.max(result.totalPages - 1, 0));
                    return;
                }
                setData(result);
                setLoading(false);
            })
            .catch((e) => {
                if (cancelled) return;
                setError(e instanceof ApiError ? e.message : 'Erreur inattendue.');
                setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [page, reloadKey]);

    const onPageChange = (e: PaginatorPageChangeEvent) => {
        setPage(e.page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const products = data?.content ?? [];

    return (
        <div className="card">
            <h5>Catalogue</h5>

            {loading && (
                <div className="grid" aria-busy="true" aria-label="Chargement du catalogue">
                    {Array.from({ length: PAGE_SIZE }, (_, i) => (
                        <div key={i} className={COLUMN_CLASSES}>
                            <Skeleton height="20rem" />
                        </div>
                    ))}
                </div>
            )}

            {!loading && error && (
                <div className="flex flex-column align-items-start gap-3">
                    <Message severity="error" className="w-full justify-content-start" text={error} />
                    <Button label="Réessayer" icon="pi pi-refresh" outlined onClick={() => setReloadKey((k) => k + 1)} />
                </div>
            )}

            {!loading && !error && products.length === 0 && (
                <div className="flex flex-column align-items-center text-500 py-6">
                    <i className="pi pi-shopping-bag text-5xl mb-3" aria-hidden="true" />
                    <span className="text-lg">Aucun article dans le catalogue pour le moment.</span>
                </div>
            )}

            {!loading && !error && products.length > 0 && data && (
                <>
                    <div className="grid">
                        {products.map((product) => (
                            <div key={product.id} className={COLUMN_CLASSES}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                    {data.totalElements > PAGE_SIZE && <Paginator first={page * PAGE_SIZE} rows={PAGE_SIZE} totalRecords={data.totalElements} onPageChange={onPageChange} template="PrevPageLink PageLinks NextPageLink" className="mt-3" />}
                </>
            )}
        </div>
    );
}