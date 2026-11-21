import { Tag } from 'primereact/tag';
import type { OrderStatus } from '@/lib/api/orders';

const LABELS: Record<OrderStatus, { label: string; severity: 'success' | 'info' | 'warning' | 'danger' | undefined }> = {
    PANIER: { label: 'Panier', severity: undefined },
    EN_ATTENTE: { label: 'En attente', severity: 'warning' },
    VALIDEE: { label: 'Validée', severity: 'info' },
    PRETE: { label: 'Prête', severity: 'success' },
    RETIREE: { label: 'Retirée', severity: 'success' },
    ANNULEE: { label: 'Annulée', severity: 'danger' }
};

/** Affiche le statut d'une commande sous forme d'étiquette colorée. */
export default function OrderStatusTag({ status }: { status: OrderStatus }) {
    const { label, severity } = LABELS[status] ?? { label: status, severity: undefined };
    return <Tag value={label} severity={severity} />;
}
