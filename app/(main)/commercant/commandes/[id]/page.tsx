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
import { getMerchantOrder, type MerchantOrderDetail, type OrderItem } from '@/lib/api/orders';
import { clientName, formatOrderNumber } from '@/lib/order/format';

/** US3 : un commerçant voit le contenu d'une commande (uniquement ses articles). */
export default function MerchantOrderDetailPage() {
    const params = useParams();
    const orderId = Number(params.id);
    const { user, ready } = useCurrentUser();
    const [order, setOrder] = useState<MerchantOrderDetail | null>(null);
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
        getMerchantOrder(user, orderId)
            .then((data) => !cancelled && setOrder(data))
            .catch((e) => {
                if (cancelled) return;
                // 404 : la commande n'existe pas, ou ne contient aucun de vos articles
                setError(e instanceof ApiError && e.status === 404 ? `La commande ${formatOrderNumber(orderId)} est introuvable.` : e instanceof ApiError ? e.message : 'Erreur inattendue.');
            });
        return () => {
            cancelled = true;
        };
    }, [user, ready, orderId]);

    return (
        <div className="card">
            <Link href="/commercant/commandes">
                <i className="pi pi-arrow-left mr-2" />
                Commandes à préparer
            </Link>

            {error && <Message severity="error" className="mt-3 w-full justify-content-start" text={error} />}
            {!order && !error && <ProgressSpinner style={{ width: '40px', height: '40px' }} />}

            {order && (
                <>
                    <h5 className="mt-3 flex align-items-center gap-2">
                        Commande <OrderNumber id={order.orderId} /> <OrderStatusTag status={order.status} />
                    </h5>
                    {order.status === 'ANNULEE' && <Message severity="warn" className="mb-3 w-full justify-content-start" text="Le client a annulé cette commande : rien à préparer." />}
                    <div className="grid mb-3">
                        <div className="col-12 md:col-6">
                            <span className="text-500">Client</span>
                            <div>{clientName(order.clientId)}</div>
                        </div>
                        <div className="col-12 md:col-6">
                            <span className="text-500">Passée le</span>
                            <div>{formatDate(order.orderDate)}</div>
                        </div>
                    </div>
                    <DataTable value={order.items} dataKey="productId" responsiveLayout="scroll">
                        <Column field="productName" header="Article" />
                        <Column field="quantity" header="Quantité" />
                        <Column header="Prix unitaire" body={(i: OrderItem) => formatPrice(i.unitPrice)} />
                        <Column header="Total" body={(i: OrderItem) => formatPrice(i.lineTotal)} />
                    </DataTable>
                    <div className="text-right text-xl mt-3">
                        Total de vos articles : <strong>{formatPrice(order.totalAmount)}</strong>
                    </div>
                </>
            )}
        </div>
    );
}
