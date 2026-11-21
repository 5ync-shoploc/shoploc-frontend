import React, { useState } from 'react';
import type { Product } from '@/lib/api/products';

interface ProductImageProps {
    product: Pick<Product, 'name' | 'imageUrl' | 'available'>;
    height: string;
    children?: React.ReactNode;
}

export default function ProductImage({ product, height, children }: ProductImageProps) {
    const [imageFailed, setImageFailed] = useState(false);
    const showImage = !!product.imageUrl && !imageFailed;

    return (
        <div className="relative surface-100 flex align-items-center justify-content-center overflow-hidden" style={{ height }}>
            {showImage ? (
                <img src={product.imageUrl as string} alt={product.name} className="w-full h-full" style={{ objectFit: 'cover', opacity: product.available ? 1 : 0.5 }} onError={() => setImageFailed(true)} />
            ) : (
                <i className="pi pi-image text-4xl text-500" aria-hidden="true" />
            )}
            {children}
        </div>
    );
}