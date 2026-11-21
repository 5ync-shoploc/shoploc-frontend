/** Numéro de commande lisible : 12 -> "CMD-00012". */
export function formatOrderNumber(id: number | null | undefined): string {
    return id == null ? '—' : `CMD-${String(id).padStart(5, '0')}`;
}

/**
 * Nom du client affiché au commerçant.
 * Pour l'instant l'order-service ne connaît que l'identifiant du client : le vrai nom viendra de l'identity-service.
 */
export function clientName(clientId: string): string {
    return clientId;
}
