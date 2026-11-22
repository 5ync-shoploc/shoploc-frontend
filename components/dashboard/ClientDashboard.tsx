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
import { listMyOrders, type Order } from '@/lib/api/orders';

const IN_PROGRESS = ['EN_ATTENTE', 'VALIDEE', 'PRETE'];

/** Tableau de bord du client : son panier, ses commandes en cours, ses dernières commandes. */
export default function ClientDashboard({ user, catalogCount }: { user: CurrentUser; catalogCount: React.ReactNode }) {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[] | null>(null);
    const [error, setError] = useState<string | null>(null);

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
    const ready = placed.filter((o) => o.status === 'PRETE');
    const cartCount = cart?.items.reduce((n, i) => n + i.quantity, 0) ?? 0;
    const spent = placed.reduce((sum, o) => sum + o.totalAmount, 0);
    const loading = orders === null && !error;
    const show = (v: React.ReactNode) => (loading ? '…' : error ? '—' : v);

    return (
        <>
            {error && <Message severity="error" className="mb-3 w-full justify-content-start" text={error} />}
            <div className="grid">
                <StatCard title="Mon panier" value={show(`${cartCount} article${cartCount > 1 ? 's' : ''}`)} icon="pi-shopping-cart" color="blue" hint={cart ? `${formatPrice(cart.totalAmount)} à valider` : 'Panier vide'} href="/panier" />
                <StatCard title="Commandes en cours" value={show(inProgress.length)} icon="pi-clock" color="orange" hint={ready.length ? `${ready.length} prête${ready.length > 1 ? 's' : ''} à retirer` : 'Aucune prête à retirer'} href="/commandes" />
                <StatCard title="Total commandé" value={show(formatPrice(spent))} icon="pi-wallet" color="green" hint={`${placed.length} commande${placed.length > 1 ? 's' : ''}`} />
                <StatCard title="Articles au catalogue" value={catalogCount} icon="pi-shopping-bag" color="purple" hint="Découvrir les commerces" href="/catalogue" />

                <div className="col-12">
                    <div className="card">
                        <div className="flex justify-content-between align-items-center mb-3">
                            <h5 className="m-0">Mes dernières commandes</h5>
                            <Button label="Toutes mes commandes" text onClick={() => router.push('/commandes')} />
                        </div>
                        <DataTable
                            value={placed.slice(0, 5)}
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
