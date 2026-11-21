'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Message } from 'primereact/message';
import OrderNumber from '@/components/order/OrderNumber';
import OrderStatusTag from '@/components/order/OrderStatusTag';
import StatCard from '@/components/dashboard/StatCard';
import type { CurrentUser } from '@/lib/auth/CurrentUserContext';
import { ApiError, formatDate, formatPrice } from '@/lib/api/http';
import { listMerchantOrders, type MerchantOrderSummary } from '@/lib/api/orders';
import { clientName } from '@/lib/order/format';

const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

/** Tableau de bord du commerçant : commandes à préparer, activité du jour, chiffre d'affaires. */
export default function MerchantDashboard({ user, catalogCount }: { user: CurrentUser; catalogCount: React.ReactNode }) {
    const router = useRouter();
    const [orders, setOrders] = useState<MerchantOrderSummary[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setOrders(null);
        setError(null);
        listMerchantOrders(user)
            .then((data) => !cancelled && setOrders(data))
            .catch((e) => !cancelled && setError(e instanceof ApiError ? e.message : 'Erreur inattendue.'));
        return () => {
            cancelled = true;
        };
    }, [user]);

    const all = orders ?? [];
    const active = all.filter((o) => o.status !== 'ANNULEE');
    const toPrepare = all.filter((o) => o.status === 'EN_ATTENTE' || o.status === 'VALIDEE');
    const today = active.filter((o) => isToday(o.orderDate));
    const cancelledCount = all.length - active.length;
    const revenue = active.reduce((sum, o) => sum + o.totalAmount, 0);
    const loading = orders === null && !error;
    const show = (v: React.ReactNode) => (loading ? '…' : error ? '—' : v);

    return (
        <>
            {error && <Message severity="error" className="mb-3 w-full justify-content-start" text={error} />}
            <div className="grid">
                <StatCard title="À préparer" value={show(toPrepare.length)} icon="pi-inbox" color="orange" hint="Commandes en attente" href="/commercant/commandes" />
                <StatCard title="Commandes du jour" value={show(today.length)} icon="pi-calendar" color="blue" hint={`${formatPrice(today.reduce((s, o) => s + o.totalAmount, 0))} aujourd'hui`} />
                <StatCard
                    title="Chiffre d'affaires"
                    value={show(formatPrice(revenue))}
                    icon="pi-euro"
                    color="green"
                    hint={cancelledCount ? `${cancelledCount} commande${cancelledCount > 1 ? 's' : ''} annulée${cancelledCount > 1 ? 's' : ''} non comptée${cancelledCount > 1 ? 's' : ''}` : 'Hors commandes annulées'}
                />
                <StatCard title="Articles au catalogue" value={catalogCount} icon="pi-shopping-bag" color="purple" hint="Tous commerces confondus" href="/catalogue" />

                <div className="col-12">
                    <div className="card">
                        <div className="flex justify-content-between align-items-center mb-3">
                            <h5 className="m-0">Dernières commandes reçues</h5>
                            <Button label="Toutes les commandes" text onClick={() => router.push('/commercant/commandes')} />
                        </div>
                        <DataTable
                            value={all.slice(0, 5)}
                            dataKey="orderId"
                            loading={loading}
                            emptyMessage="Aucune commande ne contient vos articles pour l'instant."
                            selectionMode="single"
                            onRowClick={(e) => router.push(`/commercant/commandes/${(e.data as MerchantOrderSummary).orderId}`)}
                            rowHover
                            responsiveLayout="scroll"
                        >
                            <Column header="Commande" body={(o: MerchantOrderSummary) => <OrderNumber id={o.orderId} />} />
                            <Column header="Date" body={(o: MerchantOrderSummary) => formatDate(o.orderDate)} />
                            <Column header="Client" body={(o: MerchantOrderSummary) => clientName(o.clientId)} />
                            <Column header="Total" body={(o: MerchantOrderSummary) => formatPrice(o.totalAmount)} />
                            <Column header="Statut" body={(o: MerchantOrderSummary) => <OrderStatusTag status={o.status} />} />
                        </DataTable>
                    </div>
                </div>
            </div>
        </>
    );
}
