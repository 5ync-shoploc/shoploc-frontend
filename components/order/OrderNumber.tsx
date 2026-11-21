import { formatOrderNumber } from '@/lib/order/format';

/** Numéro de commande affiché de façon homogène : "CMD-00012", chiffres alignés. */
export default function OrderNumber({ id, className = '' }: { id: number | null | undefined; className?: string }) {
    return (
        <span className={`font-semibold white-space-nowrap ${className}`} style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.03em' }}>
            {formatOrderNumber(id)}
        </span>
    );
}
