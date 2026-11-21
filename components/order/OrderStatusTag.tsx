import type { OrderStatus } from '@/lib/api/orders';

/** Libellé et couleur douce (fond clair, texte foncé) de chaque statut. */
const LABELS: Record<OrderStatus, { label: string; color: string }> = {
    PANIER: { label: 'Panier', color: 'gray' },
    EN_ATTENTE: { label: 'En attente', color: 'orange' },
    VALIDEE: { label: 'Validée', color: 'blue' },
    PRETE: { label: 'Prête', color: 'green' },
    RETIREE: { label: 'Retirée', color: 'teal' },
    ANNULEE: { label: 'Annulée', color: 'red' }
};

/** Libellé français d'un statut ("En attente", "Annulée"...). */
export function statusLabel(status: OrderStatus): string {
    return LABELS[status]?.label ?? status;
}

/** Statut d'une commande : pastille aux couleurs légères. */
export default function OrderStatusTag({ status }: { status: OrderStatus }) {
    const { label, color } = LABELS[status] ?? { label: status, color: 'gray' };
    return (
        <span className={`inline-flex align-items-center gap-2 px-2 py-1 border-round-2xl text-sm font-medium white-space-nowrap bg-${color}-50 text-${color}-700`}>
            <span className={`bg-${color}-400 border-circle`} style={{ width: '0.4rem', height: '0.4rem' }} />
            {label}
        </span>
    );
}
