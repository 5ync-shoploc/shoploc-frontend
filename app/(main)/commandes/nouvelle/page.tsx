'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputNumber } from 'primereact/inputnumber';
import { Message } from 'primereact/message';
import { Skeleton } from 'primereact/skeleton';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import OrderStatusTag from '@/components/order/OrderStatusTag';
import { useCurrentUser } from '@/lib/auth/CurrentUserContext';
import { ApiError, formatDate, formatPrice } from '@/lib/api/http';
import { createOrder, type Order } from '@/lib/api/orders';
import { listProducts, type Product } from '@/lib/api/products';

/** Date locale -> "AAAA-MM-JJTHH:mm:00" (format attendu par l'API, sans fuseau horaire). */
function toLocalDateTime(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

/** Nombre maximum d'articles affichés dans le formulaire de commande. */
const PRODUCTS_PAGE_SIZE = 100;

/** US1 : un client commande un ou plusieurs articles avec leur quantité. */
export default function NewOrderPage() {
    const { user } = useCurrentUser();
    const toast = useRef<Toast>(null);
    const [quantities, setQuantities] = useState<Record<number, number>>({});
    const [pickupSlot, setPickupSlot] = useState<Date | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [productsError, setProductsError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    // Les articles viennent du service catalogue (via la Gateway)
    useEffect(() => {
        let cancelled = false;
        setLoadingProducts(true);
        setProductsError(null);
        listProducts(0, PRODUCTS_PAGE_SIZE)
            .then((page) => !cancelled && setProducts(page.content))
            .catch((e) => !cancelled && setProductsError(e instanceof ApiError ? e.message : 'Erreur inattendue.'))
            .finally(() => !cancelled && setLoadingProducts(false));
        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const selectedItems = products.filter((p) => (quantities[p.id] ?? 0) > 0).map((p) => ({ productId: p.id, quantity: quantities[p.id] }));
    const estimatedTotal = products.reduce((sum, p) => sum + p.price * (quantities[p.id] ?? 0), 0);

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
            setReloadKey((k) => k + 1);
            toast.current?.show({ severity: 'success', summary: 'Commande passée', detail: `Commande n° ${order.id} enregistrée.` });
        } catch (e) {
            const message = e instanceof ApiError ? e.message : 'Erreur inattendue.';
            toast.current?.show({ severity: 'error', summary: 'Commande refusée', detail: message, life: 6000 });
        } finally {
            setSubmitting(false);
        }
    };

    const quantityTemplate = (product: Product) => (
        <InputNumber
            value={quantities[product.id] ?? 0}
            onValueChange={(e) => setQuantities((q) => ({ ...q, [product.id]: e.value ?? 0 }))}
            min={0}
            disabled={!product.available}
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

                    {productsError && (
                        <div className="flex flex-column align-items-start gap-3 mb-3">
                            <Message severity="error" className="w-full justify-content-start" text={`Catalogue indisponible : ${productsError}`} />
                            <Button label="Réessayer" icon="pi pi-refresh" outlined onClick={() => setReloadKey((k) => k + 1)} />
                        </div>
                    )}

                    {loadingProducts ? (
                        <Skeleton height="12rem" />
                    ) : (
                        <DataTable value={products} dataKey="id" emptyMessage="Aucun article dans le catalogue." responsiveLayout="scroll">
                            <Column field="name" header="Article" />
                            <Column header="Prix" body={(p: Product) => formatPrice(p.price)} />
                            <Column header="Disponibilité" body={(p: Product) => (p.available ? <Tag value="Disponible" severity="success" /> : <Tag value="Rupture" severity="danger" />)} />
                            <Column header="Quantité" body={quantityTemplate} />
                        </DataTable>
                    )}

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
