'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Message } from 'primereact/message';
import OrderStatusTag from '@/components/order/OrderStatusTag';
import { useCurrentUser } from '@/lib/auth/CurrentUserContext';
import { ApiError, formatDate, formatPrice } from '@/lib/api/http';
import { listMyOrders, type Order } from '@/lib/api/orders';

/** US2 : un client consulte la liste de ses commandes avec leur statut. */
export default function MyOrdersPage() {
    const { user, ready } = useCurrentUser();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!ready) return;
        let cancelled = false;
        setLoading(true);
        setError(null);
        listMyOrders(user)
            .then((data) => !cancelled && setOrders(data))
            .catch((e) => !cancelled && setError(e instanceof ApiError ? e.message : 'Erreur inattendue.'))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [user, ready]);

    return (
        <div className="card">
            <div className="flex justify-content-between align-items-center mb-3">
                <h5 className="m-0">Mes commandes</h5>
                <Button label="Nouvelle commande" icon="pi pi-plus" onClick={() => router.push('/commandes/nouvelle')} />
            </div>

            {error && <Message severity="error" className="mb-3 w-full justify-content-start" text={error} />}

            <DataTable value={orders} dataKey="id" loading={loading} emptyMessage="Aucune commande pour l'instant." selectionMode="single" onRowClick={(e) => router.push(`/commandes/${(e.data as Order).id}`)} rowHover responsiveLayout="scroll">
                <Column field="id" header="N°" />
                <Column header="Date" body={(o: Order) => formatDate(o.orderDate)} />
                <Column header="Statut" body={(o: Order) => <OrderStatusTag status={o.status} />} />
                <Column header="Articles" body={(o: Order) => o.items.reduce((n, i) => n + i.quantity, 0)} />
                <Column header="Total" body={(o: Order) => formatPrice(o.totalAmount)} />
                <Column header="Retrait" body={(o: Order) => formatDate(o.pickupSlot)} />
                <Column body={(o: Order) => <Button icon="pi pi-eye" rounded text aria-label="Voir le détail" onClick={() => router.push(`/commandes/${o.id}`)} />} />
            </DataTable>
        </div>
    );
}
