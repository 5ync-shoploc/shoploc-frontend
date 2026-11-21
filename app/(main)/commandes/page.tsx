'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import OrderStatusTag from '@/components/order/OrderStatusTag';
import { useCurrentUser } from '@/lib/auth/CurrentUserContext';
import { ApiError, formatDate, formatPrice } from '@/lib/api/http';
import { listMyOrders, type Order } from '@/lib/api/orders';

/** US2 : un client consulte la liste de ses commandes avec leur statut (le panier est dans sa propre page). */
export default function MyOrdersPage() {
    const { user, ready } = useCurrentUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const toast = useRef<Toast>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // arrivée depuis le panier juste après la validation
    useEffect(() => {
        if (searchParams.get('validee')) {
            toast.current?.show({ severity: 'success', summary: 'Commande passée', detail: 'Votre panier a été validé.' });
            router.replace('/commandes');
        }
    }, [searchParams, router]);

    useEffect(() => {
        if (!ready) return;
        let cancelled = false;
        setLoading(true);
        setError(null);
        listMyOrders(user)
            // le panier (statut PANIER) n'est pas encore une commande : il est affiché dans Mon panier
            .then((data) => !cancelled && setOrders(data.filter((o) => o.status !== 'PANIER')))
            .catch((e) => !cancelled && setError(e instanceof ApiError ? e.message : 'Erreur inattendue.'))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [user, ready]);

    return (
        <div className="card">
            <Toast ref={toast} />
            <div className="flex justify-content-between align-items-center mb-3">
                <h5 className="m-0">Mes commandes</h5>
                <Button label="Mon panier" icon="pi pi-shopping-cart" outlined onClick={() => router.push('/panier')} />
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
