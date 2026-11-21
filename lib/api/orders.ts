import type { CurrentUser } from '@/lib/auth/CurrentUserContext';
import { apiFetch } from './http';

/** Statuts d'une commande (MCD). */
export type OrderStatus = 'PANIER' | 'EN_ATTENTE' | 'VALIDEE' | 'PRETE' | 'RETIREE' | 'ANNULEE';

export interface OrderItem {
    productId: number;
    productName: string;
    merchantId: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}

export interface Order {
    /** null pour un panier vide pas encore créé. */
    id: number | null;
    clientId: string;
    status: OrderStatus;
    totalAmount: number;
    orderDate: string | null;
    pickupSlot: string | null;
    paymentId: number | null;
    items: OrderItem[];
}

// ---------- Panier (commande au statut PANIER) ----------

/** Mon panier (vide s'il n'existe pas encore). */
export function getCart(user: CurrentUser | null): Promise<Order> {
    return apiFetch<Order>('/api/order/cart', user);
}

/** Ajouter un article au panier (les quantités s'additionnent si l'article y est déjà). */
export function addToCart(user: CurrentUser | null, productId: number, quantity = 1): Promise<Order> {
    return apiFetch<Order>('/api/order/cart/items', user, { method: 'POST', body: JSON.stringify({ productId, quantity }) });
}

/** Changer la quantité d'un article du panier. */
export function updateCartItem(user: CurrentUser | null, productId: number, quantity: number): Promise<Order> {
    return apiFetch<Order>(`/api/order/cart/items/${productId}`, user, { method: 'PUT', body: JSON.stringify({ quantity }) });
}

/** Retirer un article du panier. */
export function removeCartItem(user: CurrentUser | null, productId: number): Promise<Order> {
    return apiFetch<Order>(`/api/order/cart/items/${productId}`, user, { method: 'DELETE' });
}

/**
 * Valider le panier : il devient une commande EN_ATTENTE (prix figés, stock décrémenté).
 * @param pickupSlot date et heure locales au format "AAAA-MM-JJTHH:mm:ss", ou null
 */
export function validateCart(user: CurrentUser | null, pickupSlot: string | null): Promise<Order> {
    return apiFetch<Order>('/api/order/cart/validate', user, { method: 'POST', body: JSON.stringify({ pickupSlot }) });
}

/** US2 : liste de mes commandes (rôle CLIENT). */
export function listMyOrders(user: CurrentUser | null): Promise<Order[]> {
    return apiFetch<Order[]>('/api/order', user);
}

/** US2 : détail d'une de mes commandes (rôle CLIENT). 404 si elle appartient à un autre client. */
export function getMyOrder(user: CurrentUser | null, orderId: number): Promise<Order> {
    return apiFetch<Order>(`/api/order/${orderId}`, user);
}

/** Une ligne de commande vue par le commerçant (uniquement ses articles). */
export interface MerchantOrderItem {
    orderId: number;
    orderStatus: OrderStatus;
    orderedAt: string;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}

/** US3 : lignes de commande contenant mes articles (rôle COMMERCANT). */
export function listMerchantOrderItems(user: CurrentUser | null): Promise<MerchantOrderItem[]> {
    return apiFetch<MerchantOrderItem[]>('/api/order/merchant/items', user);
}
