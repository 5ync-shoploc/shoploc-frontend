import { apiFetch } from './http';

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string | null;
    available: boolean;
    commerceId: number | null;
    categoryId: number | null;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}


export function listProducts(page: number, size: number): Promise<PageResponse<Product>> {
    return apiFetch<PageResponse<Product>>(`/api/products?page=${page}&size=${size}&sort=name,asc`, null);
}

export function getProduct(id: number): Promise<Product> {
    return apiFetch<Product>(`/api/products/${id}`, null);
}