'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import TableSearch, { matchesSearch } from '@/components/common/TableSearch';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Message } from 'primereact/message';
import OrderNumber from '@/components/order/OrderNumber';
import OrderStatusTag from '@/components/order/OrderStatusTag';
import StatCard from '@/components/dashboard/StatCard';
import type { CurrentUser } from '@/lib/auth/CurrentUserContext';
import { orderSearchValues } from '@/lib/order/search';
import { ApiError, formatDate, formatPrice } from '@/lib/api/http';
import { listMyOrders, type Order } from '@/lib/api/orders';

const IN_PROGRESS = ['EN_ATTENTE', 'VALIDEE', 'PRETE'];

/** Tableau de bord du client : son panier, ses commandes en cours, ses dernières commandes. */
export default function ClientDashboard({ user, catalogCount }: { user: CurrentUser; catalogCount: React.ReactNode }) {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        let cancelled = false;
        setOrders(null);
        setError(null);
        listMyOrders(user)
            .then((data) => !cancelled && setOrders(data))
            .catch((e) => !cancelled && setError(e instanceof ApiError ? e.message : 'Erreur inattendue.'));
        return () => {
            cancelled = true;
        };
    }, [user]);

    const all = orders ?? [];
    const cart = all.find((o) => o.status === 'PANIER');
    const placed = all.filter((o) => o.status !== 'PANIER');
    const inProgress = placed.filter((o) => IN_PROGRESS.includes(o.status));
    const cartCount = cart?.items.reduce((n, i) => n + i.quantity, 0) ?? 0;
    const spent = placed.reduce((sum, o) => sum + o.totalAmount, 0);
    const loading = orders === null && !error;
    const show = (v: React.ReactNode) => (loading ? '…' : error ? '—' : v);

    return (
        <>
            {error && <Message severity="error" className="mb-3 w-full justify-content-start" text={error} />}
            <div className="grid">
                <StatCard title="Dans mon panier" value={show(cartCount)} icon="pi-shopping-cart" color="blue" href="/panier" />
                <StatCard title="Commandes en cours" value={show(inProgress.length)} icon="pi-clock" color="orange" href="/commandes" />
                <StatCard title="Total commandé" value={show(formatPrice(spent))} icon="pi-wallet" color="green" />
                <StatCard title="Articles en vente" value={catalogCount} icon="pi-shopping-bag" color="purple" href="/catalogue" />

                <div className="col-12">
                    <div className="card">
                        <div className="flex justify-content-between align-items-center mb-3">
                            <h5 className="m-0">Mes dernières commandes</h5>
                            <TableSearch value={search} onChange={setSearch} />
                        </div>
                        <DataTable
                            value={search ? placed.filter((o) => matchesSearch(search, orderSearchValues(o))) : placed.slice(0, 5)}
                            dataKey="id"
                            loading={loading}
                            emptyMessage="Aucune commande pour l'instant."
                            selectionMode="single"
                            onRowClick={(e) => router.push(`/commandes/${(e.data as Order).id}`)}
                            rowHover
                            responsiveLayout="scroll"
                        >
                            <Column header="Commande" body={(o: Order) => <OrderNumber id={o.id} />} />
                            <Column header="Date" body={(o: Order) => formatDate(o.orderDate)} />
                            <Column header="Statut" body={(o: Order) => <OrderStatusTag status={o.status} />} />
                            <Column header="Total" body={(o: Order) => formatPrice(o.totalAmount)} />
                        </DataTable>
                    </div>
                </div>
            </div>
        </>
    );
}
