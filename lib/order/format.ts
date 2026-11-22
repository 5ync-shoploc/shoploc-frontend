/** Numéro de commande lisible : 12 -> "CMD-00012". */
export function formatOrderNumber(id: number | null | undefined): string {
    return id == null ? '—' : `CMD-${String(id).padStart(5, '0')}`;
}

/**
 * Nom du client affiché au commerçant : le nom enregistré dans la commande,
 * sinon (anciennes commandes) un identifiant raccourci.
 */
export function clientName(order: { clientId: string; clientName?: string | null }): string {
    if (order.clientName) return order.clientName;
    return order.clientId.length > 20 ? `Client ${order.clientId.slice(0, 8)}` : order.clientId;
}
