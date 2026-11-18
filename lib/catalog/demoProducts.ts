/**
 * PRODUITS DE DÉMONSTRATION, en attendant le branchement de l'order-service au catalogue.
 * Ce sont les produits connus du catalogue simulé de l'order-service (InMemoryProductCatalogClient).
 * Quand l'order-service sera branché au vrai catalogue, cette liste sera remplacée par un appel à l'API du catalogue.
 */
export interface DemoProduct {
    id: number;
    name: string;
    price: number;
    active: boolean;
    stock: number;
    merchantId: string;
}

export const DEMO_PRODUCTS: DemoProduct[] = [
    { id: 1, name: 'Pain de campagne', price: 3.5, active: true, stock: 100, merchantId: 'merchant-1' },
    { id: 2, name: 'Croissant', price: 1.2, active: true, stock: 5, merchantId: 'merchant-1' },
    { id: 3, name: 'Fromage de chèvre', price: 6.8, active: true, stock: 20, merchantId: 'merchant-2' },
    { id: 4, name: 'Confiture', price: 4.0, active: false, stock: 50, merchantId: 'merchant-2' }
];
