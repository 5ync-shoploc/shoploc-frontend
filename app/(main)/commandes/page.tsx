'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import OrderNumber from '@/components/order/OrderNumber';
import OrderStatusTag from '@/components/order/OrderStatusTag';
import { useCurrentUser } from '@/lib/auth/CurrentUserContext';
import { ApiError, formatDate, formatPrice } from '@/lib/api/http';
import { cancelMyOrder, listMyOrders, type Order } from '@/lib/api/orders';
import { formatOrderNumber } from '@/lib/order/format';

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

    /** Supprime la commande de la liste (elle est annulée ; le commerçant la voit annulée). */
    const askCancel = (order: Order) => {
        confirmDialog({
            header: 'Supprimer la commande',
            message: `Supprimer la commande ${formatOrderNumber(order.id)} ? Elle sera annulée.`,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Supprimer',
            rejectLabel: 'Garder',
            acceptClassName: 'p-button-danger',
            accept: async () => {
                try {
                    await cancelMyOrder(user, order.id as number);
                    setOrders((current) => current.filter((o) => o.id !== order.id));
                    toast.current?.show({ severity: 'success', summary: 'Commande supprimée', detail: `${formatOrderNumber(order.id)} a été annulée.` });
                } catch (e) {
                    const detail = e instanceof ApiError && e.status === 409 ? 'Cette commande est déjà prise en charge : elle ne peut plus être supprimée.' : e instanceof ApiError ? e.message : 'Erreur inattendue.';
                    toast.current?.show({ severity: 'error', summary: 'Suppression impossible', detail, life: 6000 });
                }
            }
        });
    };

    const actionsTemplate = (o: Order) => (
        <div className="flex justify-content-end gap-1">
            <Button icon="pi pi-eye" rounded text aria-label="Voir le détail" onClick={() => router.push(`/commandes/${o.id}`)} />
            {o.status === 'EN_ATTENTE' && (
                <Button
                    icon="pi pi-trash"
                    rounded
                    text
                    severity="danger"
                    aria-label={`Supprimer la commande ${formatOrderNumber(o.id)}`}
                    tooltip="Supprimer"
                    tooltipOptions={{ position: 'left' }}
                    onClick={(e) => {
                        e.stopPropagation(); // ne pas ouvrir le détail
                        askCancel(o);
                    }}
                />
            )}
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />
            <div className="flex justify-content-between align-items-center mb-3">
                <h5 className="m-0">Mes commandes</h5>
                <Button label="Mon panier" icon="pi pi-shopping-cart" outlined onClick={() => router.push('/panier')} />
            </div>

            {error && <Message severity="error" className="mb-3 w-full justify-content-start" text={error} />}

            <DataTable value={orders} dataKey="id" loading={loading} emptyMessage="Aucune commande pour l'instant." selectionMode="single" onRowClick={(e) => router.push(`/commandes/${(e.data as Order).id}`)} rowHover responsiveLayout="scroll">
                <Column header="Commande" body={(o: Order) => <OrderNumber id={o.id} />} />
                <Column header="Date" body={(o: Order) => formatDate(o.orderDate)} />
                <Column header="Statut" body={(o: Order) => <OrderStatusTag status={o.status} />} />
                <Column header="Articles" body={(o: Order) => o.items.reduce((n, i) => n + i.quantity, 0)} />
                <Column header="Total" body={(o: Order) => formatPrice(o.totalAmount)} />
                <Column body={actionsTemplate} style={{ width: '7rem' }} />
            </DataTable>
        </div>
    );
}
