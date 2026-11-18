'use client';

import Link from 'next/link';
import React, { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputNumber } from 'primereact/inputnumber';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import OrderStatusTag from '@/components/order/OrderStatusTag';
import { useCurrentUser } from '@/lib/auth/CurrentUserContext';
import { ApiError, formatDate, formatPrice } from '@/lib/api/http';
import { createOrder, type Order } from '@/lib/api/orders';
import { DEMO_PRODUCTS, type DemoProduct } from '@/lib/catalog/demoProducts';

/** Date locale -> "AAAA-MM-JJTHH:mm:00" (format attendu par l'API, sans fuseau horaire). */
function toLocalDateTime(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

/** US1 : un client commande un ou plusieurs articles avec leur quantité. */
export default function NewOrderPage() {
    const { user } = useCurrentUser();
    const toast = useRef<Toast>(null);
    const [quantities, setQuantities] = useState<Record<number, number>>({});
    const [pickupSlot, setPickupSlot] = useState<Date | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

    const selectedItems = DEMO_PRODUCTS.filter((p) => (quantities[p.id] ?? 0) > 0).map((p) => ({ productId: p.id, quantity: quantities[p.id] }));
    const estimatedTotal = DEMO_PRODUCTS.reduce((sum, p) => sum + p.price * (quantities[p.id] ?? 0), 0);

    const submit = async () => {
        setSubmitting(true);
        try {
            const order = await createOrder(user, {
                items: selectedItems,
                pickupSlot: pickupSlot ? toLocalDateTime(pickupSlot) : null
            });
            setCreatedOrder(order);
            setQuantities({});
            setPickupSlot(null);
            toast.current?.show({ severity: 'success', summary: 'Commande passée', detail: `Commande n° ${order.id} enregistrée.` });
        } catch (e) {
            const message = e instanceof ApiError ? e.message : 'Erreur inattendue.';
            toast.current?.show({ severity: 'error', summary: 'Commande refusée', detail: message, life: 6000 });
        } finally {
            setSubmitting(false);
        }
    };

    const quantityTemplate = (product: DemoProduct) => (
        <InputNumber
            value={quantities[product.id] ?? 0}
            onValueChange={(e) => setQuantities((q) => ({ ...q, [product.id]: e.value ?? 0 }))}
            min={0}
            showButtons
            buttonLayout="horizontal"
            decrementButtonIcon="pi pi-minus"
            incrementButtonIcon="pi pi-plus"
            inputStyle={{ width: '3.5rem', textAlign: 'center' }}
            aria-label={`Quantité de ${product.name}`}
        />
    );

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <div className="card">
                    <h5>Passer une commande</h5>

                    {user?.role !== 'CLIENT' && <Message severity="warn" className="mb-3 w-full justify-content-start" text="Seul un client peut passer une commande : choisissez un utilisateur « client » en haut à droite." />}

                    <DataTable value={DEMO_PRODUCTS} dataKey="id" responsiveLayout="scroll">
                        <Column field="name" header="Article" />
                        <Column header="Prix" body={(p: DemoProduct) => formatPrice(p.price)} />
                        <Column header="Disponibilité" body={(p: DemoProduct) => (p.active ? <span>{p.stock} en stock</span> : <Tag value="Indisponible" severity="danger" />)} />
                        <Column field="merchantId" header="Commerçant" />
                        <Column header="Quantité" body={quantityTemplate} />
                    </DataTable>

                    <div className="flex flex-wrap align-items-end gap-4 mt-4">
                        <div className="flex flex-column gap-2">
                            <label htmlFor="pickupSlot">Créneau de retrait (facultatif)</label>
                            <Calendar inputId="pickupSlot" value={pickupSlot} onChange={(e) => setPickupSlot((e.value as Date) ?? null)} showTime hourFormat="24" minDate={new Date()} showIcon dateFormat="dd/mm/yy" />
                        </div>
                        <div className="text-xl">
                            Total estimé : <strong>{formatPrice(estimatedTotal)}</strong>
                        </div>
                        <Button label="Commander" icon="pi pi-shopping-cart" onClick={submit} loading={submitting} disabled={selectedItems.length === 0} />
                    </div>
                </div>
            </div>

            {createdOrder && (
                <div className="col-12">
                    <div className="card">
                        <h5>
                            Commande n° {createdOrder.id} <OrderStatusTag status={createdOrder.status} />
                        </h5>
                        <p>
                            Total : <strong>{formatPrice(createdOrder.totalAmount)}</strong> — Retrait : {formatDate(createdOrder.pickupSlot)}
                        </p>
                        <DataTable value={createdOrder.items} dataKey="productId">
                            <Column field="productName" header="Article" />
                            <Column field="quantity" header="Quantité" />
                            <Column header="Prix unitaire" body={(i: Order['items'][number]) => formatPrice(i.unitPrice)} />
                            <Column header="Total" body={(i: Order['items'][number]) => formatPrice(i.lineTotal)} />
                        </DataTable>
                        <Link href={`/commandes/${createdOrder.id}`} className="inline-block mt-3">
                            Voir le détail de la commande
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
