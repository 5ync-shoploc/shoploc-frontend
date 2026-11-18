'use client';

import React, { useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Message } from 'primereact/message';
import OrderStatusTag from '@/components/order/OrderStatusTag';
import { useCurrentUser } from '@/lib/auth/CurrentUserContext';
import { ApiError, formatDate, formatPrice } from '@/lib/api/http';
import { listMerchantOrderItems, type MerchantOrderItem } from '@/lib/api/orders';

/** US3 : un commerçant consulte les lignes de commande qui concernent ses articles, pour les préparer. */
export default function MerchantOrdersPage() {
    const { user, ready } = useCurrentUser();
    const [items, setItems] = useState<MerchantOrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!ready) return;
        let cancelled = false;
        setLoading(true);
        setError(null);
        listMerchantOrderItems(user)
            .then((data) => !cancelled && setItems(data))
            .catch((e) => !cancelled && setError(e instanceof ApiError ? e.message : 'Erreur inattendue.'))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [user, ready]);

    return (
        <div className="card">
            <h5>Commandes à préparer</h5>
            <p className="text-500">Seules les lignes qui concernent vos articles sont affichées.</p>

            {error && <Message severity="error" className="mb-3 w-full justify-content-start" text={error} />}

            <DataTable
                value={items}
                loading={loading}
                emptyMessage="Aucune commande ne contient vos articles pour l'instant."
                rowGroupMode="subheader"
                groupRowsBy="orderId"
                sortField="orderId"
                sortOrder={-1}
                rowGroupHeaderTemplate={(item: MerchantOrderItem) => (
                    <span className="font-bold">
                        Commande n° {item.orderId} — {formatDate(item.orderedAt)} <OrderStatusTag status={item.orderStatus} />
                    </span>
                )}
                responsiveLayout="scroll"
            >
                <Column field="productName" header="Article" />
                <Column field="quantity" header="Quantité" />
                <Column header="Prix unitaire" body={(i: MerchantOrderItem) => formatPrice(i.unitPrice)} />
                <Column header="Total" body={(i: MerchantOrderItem) => formatPrice(i.lineTotal)} />
            </DataTable>
        </div>
    );
}
