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
    id: number;
    clientId: string;
    status: OrderStatus;
    totalAmount: number;
    orderDate: string;
    pickupSlot: string | null;
    paymentId: number | null;
    items: OrderItem[];
}

export interface CreateOrderRequest {
    items: { productId: number; quantity: number }[];
    /** Date et heure locales au format "AAAA-MM-JJTHH:mm:ss", ou null. */
    pickupSlot: string | null;
}

/** US1 : passer une commande (rôle CLIENT). */
export function createOrder(user: CurrentUser | null, request: CreateOrderRequest): Promise<Order> {
    return apiFetch<Order>('/api/order', user, { method: 'POST', body: JSON.stringify(request) });
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
