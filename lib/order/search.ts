import { statusLabel } from '@/components/order/OrderStatusTag';
import { formatDate, formatPrice } from '@/lib/api/http';
import type { OrderStatus } from '@/lib/api/orders';
import { formatOrderNumber } from './format';

/** Valeurs d'une commande sur lesquelles porte la barre de recherche. */
export function orderSearchValues(o: { id: number | null; orderDate: string | null; status: OrderStatus; totalAmount: number; clientId?: string }) {
    return [formatOrderNumber(o.id), o.id, formatDate(o.orderDate), statusLabel(o.status), formatPrice(o.totalAmount), o.clientId];
}
