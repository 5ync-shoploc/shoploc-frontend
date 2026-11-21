'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Message } from 'primereact/message';
import OrderNumber from '@/components/order/OrderNumber';
import OrderStatusTag from '@/components/order/OrderStatusTag';
import { useCurrentUser } from '@/lib/auth/CurrentUserContext';
import { ApiError, formatDate, formatPrice } from '@/lib/api/http';
import { listMerchantOrders, type MerchantOrderSummary } from '@/lib/api/orders';
import { clientName } from '@/lib/order/format';

/** US3 : un commerçant voit la liste des commandes qui contiennent ses articles. */
export default function MerchantOrdersPage() {
    const { user, ready } = useCurrentUser();
    const router = useRouter();
    const [orders, setOrders] = useState<MerchantOrderSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!ready) return;
        let cancelled = false;
        setLoading(true);
        setError(null);
        listMerchantOrders(user)
            .then((data) => !cancelled && setOrders(data))
            .catch((e) => !cancelled && setError(e instanceof ApiError ? e.message : 'Erreur inattendue.'))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [user, ready]);

    const open = (o: MerchantOrderSummary) => router.push(`/commercant/commandes/${o.orderId}`);

    return (
        <div className="card">
            <h5>Commandes à préparer</h5>
            <p className="text-500">Les articles et le total ne concernent que vos produits.</p>

            {error && <Message severity="error" className="mb-3 w-full justify-content-start" text={error} />}

            <DataTable
                value={orders}
                dataKey="orderId"
                loading={loading}
                emptyMessage="Aucune commande ne contient vos articles pour l'instant."
                selectionMode="single"
                onRowClick={(e) => open(e.data as MerchantOrderSummary)}
                rowHover
                responsiveLayout="scroll"
            >
                <Column header="Commande" body={(o: MerchantOrderSummary) => <OrderNumber id={o.orderId} />} />
                <Column header="Date" body={(o: MerchantOrderSummary) => formatDate(o.orderDate)} />
                <Column header="Client" body={(o: MerchantOrderSummary) => clientName(o.clientId)} />
                <Column field="itemCount" header="Articles" />
                <Column header="Total" body={(o: MerchantOrderSummary) => formatPrice(o.totalAmount)} />
                <Column header="Statut" body={(o: MerchantOrderSummary) => <OrderStatusTag status={o.status} />} />
                <Column body={(o: MerchantOrderSummary) => <Button icon="pi pi-eye" rounded text aria-label={`Voir la commande ${o.orderId}`} onClick={() => open(o)} />} style={{ width: '4rem' }} />
            </DataTable>
        </div>
    );
}
