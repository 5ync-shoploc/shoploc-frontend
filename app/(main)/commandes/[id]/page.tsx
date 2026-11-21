'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import OrderNumber from '@/components/order/OrderNumber';
import OrderStatusTag from '@/components/order/OrderStatusTag';
import { useCurrentUser } from '@/lib/auth/CurrentUserContext';
import { ApiError, formatDate, formatPrice } from '@/lib/api/http';
import { getMyOrder, type Order, type OrderItem } from '@/lib/api/orders';
import { formatOrderNumber } from '@/lib/order/format';

/** US2 : un client consulte le détail d'une de ses commandes. */
export default function OrderDetailPage() {
    const params = useParams();
    const orderId = Number(params.id);
    const { user, ready } = useCurrentUser();
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!ready) return;
        let cancelled = false;
        setOrder(null);
        setError(null);
        if (!Number.isInteger(orderId) || orderId <= 0) {
            setError('Commande introuvable.');
            return;
        }
        getMyOrder(user, orderId)
            .then((data) => !cancelled && setOrder(data))
            .catch((e) => {
                if (cancelled) return;
                // 404 : la commande n'existe pas, ou elle appartient à un autre client
                setError(e instanceof ApiError && e.status === 404 ? `La commande ${formatOrderNumber(orderId)} est introuvable.` : e instanceof ApiError ? e.message : 'Erreur inattendue.');
            });
        return () => {
            cancelled = true;
        };
    }, [user, ready, orderId]);

    return (
        <div className="card">
            <Link href="/commandes">
                <i className="pi pi-arrow-left mr-2" />
                Mes commandes
            </Link>

            {error && <Message severity="error" className="mt-3 w-full justify-content-start" text={error} />}
            {!order && !error && <ProgressSpinner style={{ width: '40px', height: '40px' }} />}

            {order && (
                <>
                    <h5 className="mt-3 flex align-items-center gap-2">
                        Commande <OrderNumber id={order.id} /> <OrderStatusTag status={order.status} />
                    </h5>
                    <div className="grid mb-3">
                        <div className="col-12 md:col-6">
                            <span className="text-500">Passée le</span>
                            <div>{formatDate(order.orderDate)}</div>
                        </div>
                        <div className="col-12 md:col-6">
                            <span className="text-500">Paiement</span>
                            <div>{order.paymentId ? `n° ${order.paymentId}` : 'Non payée'}</div>
                        </div>
                    </div>
                    <DataTable value={order.items} dataKey="productId" responsiveLayout="scroll">
                        <Column field="productName" header="Article" />
                        <Column field="merchantId" header="Commerçant" />
                        <Column field="quantity" header="Quantité" />
                        <Column header="Prix unitaire" body={(i: OrderItem) => formatPrice(i.unitPrice)} />
                        <Column header="Total" body={(i: OrderItem) => formatPrice(i.lineTotal)} />
                    </DataTable>
                    <div className="text-right text-xl mt-3">
                        Total : <strong>{formatPrice(order.totalAmount)}</strong>
                    </div>
                </>
            )}
        </div>
    );
}
