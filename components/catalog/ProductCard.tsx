import React, { useState } from 'react';
import { Tag } from 'primereact/tag';
import { formatPrice } from '@/lib/api/http';
import type { Product } from '@/lib/api/products';

/** Carte d'un article : image, nom, description, prix et disponibilité. */
export default function ProductCard({ product }: { product: Product }) {
    const [imageFailed, setImageFailed] = useState(false);
    const showImage = !!product.imageUrl && !imageFailed;

    return (
        <article className={`surface-card border-1 surface-border border-round h-full flex flex-column overflow-hidden ${product.available ? '' : 'surface-100'}`} aria-label={product.name}>
            <div className="relative surface-100 flex align-items-center justify-content-center" style={{ height: '12rem' }}>
                {showImage ? (
                    <img src={product.imageUrl as string} alt={product.name} className="w-full h-full" style={{ objectFit: 'cover', opacity: product.available ? 1 : 0.5 }} onError={() => setImageFailed(true)} />
                ) : (
                    <i className="pi pi-image text-4xl text-500" aria-hidden="true" />
                )}
                <div className="absolute top-0 left-0 m-2">
                    {product.available ? <Tag value="Disponible" severity="success" /> : <Tag value="Indisponible" severity="danger" icon="pi pi-ban" />}
                </div>
            </div>

            <div className="p-3 flex flex-column flex-grow-1">
                <h3 className={`text-lg font-semibold mt-0 mb-2 ${product.available ? '' : 'text-500'}`}>{product.name}</h3>
                <p className="text-600 mt-0 mb-3 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.description}
                </p>
                <div className={`text-xl font-bold ${product.available ? '' : 'text-500 line-through'}`}>{formatPrice(product.price)}</div>
            </div>
        </article>
    );
}