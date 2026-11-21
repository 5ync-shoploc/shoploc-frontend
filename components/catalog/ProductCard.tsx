import React from 'react';
import Link from 'next/link';
import { Tag } from 'primereact/tag';
import { formatPrice } from '@/lib/api/http';
import type { Product } from '@/lib/api/products';
import ProductImage from './ProductImage';

export default function ProductCard({ product }: { product: Product }) {
    return (
        <Link href={`/catalogue/${product.id}`} className="no-underline text-color block h-full" aria-label={`Voir le détail : ${product.name}`}>
            <article className={`surface-card border-1 surface-border border-round h-full flex flex-column overflow-hidden ${product.available ? '' : 'surface-100'}`}>
                <ProductImage product={product} height="12rem">
                    <div className="absolute top-0 left-0 m-2">
                        {product.available ? <Tag value="Disponible" severity="success" /> : <Tag value="Indisponible" severity="danger" icon="pi pi-ban" />}
                    </div>
                </ProductImage>

                <div className="p-3 flex flex-column flex-grow-1">
                    <h3 className={`text-lg font-semibold mt-0 mb-2 ${product.available ? '' : 'text-500'}`}>{product.name}</h3>
                    <p className="text-600 mt-0 mb-3 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.description}
                    </p>
                    <div className={`text-xl font-bold ${product.available ? '' : 'text-500 line-through'}`}>{formatPrice(product.price)}</div>
                    <span className="text-primary font-medium mt-2">
                        Voir le détail <i className="pi pi-arrow-right text-sm" aria-hidden="true" />
                    </span>
                </div>
            </article>
        </Link>
    );
}