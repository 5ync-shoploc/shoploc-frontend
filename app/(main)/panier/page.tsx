'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputNumber } from 'primereact/inputnumber';
import { Message } from 'primereact/message';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { useCurrentUser } from '@/lib/auth/CurrentUserContext';
import { ApiError, formatPrice } from '@/lib/api/http';
import { getCart, removeCartItem, updateCartItem, validateCart, type Order, type OrderItem } from '@/lib/api/orders';

/** Date locale -> "AAAA-MM-JJTHH:mm:00" (format attendu par l'API, sans fuseau horaire). */
function toLocalDateTime(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

const errorMessage = (e: unknown) => (e instanceof ApiError ? e.message : 'Erreur inattendue.');

/** Mon panier : modifier les quantités, retirer des articles, choisir un créneau et valider. */
export default function CartPage() {
    const { user, ready } = useCurrentUser();
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const [cart, setCart] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pickupSlot, setPickupSlot] = useState<Date | null>(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setCart(await getCart(user));
        } catch (e) {
            setError(errorMessage(e));
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (ready) {
            load();
        }
    }, [ready, load]);

    /** Lance une action sur le panier, puis affiche le panier renvoyé par l'API. */
    const runCartAction = async (action: () => Promise<Order>) => {
        setBusy(true);
        try {
            setCart(await action());
        } catch (e) {
            toast.current?.show({ severity: 'error', summary: 'Panier', detail: errorMessage(e), life: 6000 });
        } finally {
            setBusy(false);
        }
    };

    const validate = async () => {
        setBusy(true);
        try {
            await validateCart(user, pickupSlot ? toLocalDateTime(pickupSlot) : null);
            // la commande est passée : on l'affiche dans Mes commandes
            router.push('/commandes?validee=1');
        } catch (e) {
            toast.current?.show({ severity: 'error', summary: 'Commande refusée', detail: errorMessage(e), life: 6000 });
            setBusy(false);
        }
    };

    const quantityTemplate = (item: OrderItem) => (
        <InputNumber
            value={item.quantity}
            onValueChange={(e) => {
                if (e.value && e.value !== item.quantity) {
                    runCartAction(() => updateCartItem(user, item.productId, e.value as number));
                }
            }}
            min={1}
            showButtons
            buttonLayout="horizontal"
            decrementButtonIcon="pi pi-minus"
            incrementButtonIcon="pi pi-plus"
            inputStyle={{ width: '3.5rem', textAlign: 'center' }}
            disabled={busy}
            aria-label={`Quantité de ${item.productName}`}
        />
    );

    const removeTemplate = (item: OrderItem) => <Button icon="pi pi-trash" rounded text severity="danger" aria-label={`Retirer ${item.productName}`} disabled={busy} onClick={() => runCartAction(() => removeCartItem(user, item.productId))} />;

    const items = cart?.items ?? [];

    return (
        <div className="card">
            <Toast ref={toast} />
            <div className="flex justify-content-between align-items-center mb-3">
                <h5 className="m-0">Mon panier</h5>
                <Button label="Continuer mes achats" icon="pi pi-shopping-bag" outlined onClick={() => router.push('/catalogue')} />
            </div>

            {error && <Message severity="error" className="mb-3 w-full justify-content-start" text={error} />}

            {loading ? (
                <Skeleton height="8rem" />
            ) : items.length === 0 ? (
                !error && (
                    <div className="flex flex-column align-items-center text-500 py-6">
                        <i className="pi pi-shopping-cart text-5xl mb-3" aria-hidden="true" />
                        <span className="text-lg">
                            Votre panier est vide. Ajoutez des articles depuis le <Link href="/catalogue">catalogue</Link>.
                        </span>
                    </div>
                )
            ) : (
                <>
                    <DataTable value={items} dataKey="productId" responsiveLayout="scroll">
                        <Column field="productName" header="Article" />
                        <Column header="Prix" body={(i: OrderItem) => formatPrice(i.unitPrice)} />
                        <Column header="Quantité" body={quantityTemplate} />
                        <Column header="Total" body={(i: OrderItem) => formatPrice(i.lineTotal)} />
                        <Column body={removeTemplate} />
                    </DataTable>

                    <div className="flex flex-wrap align-items-end gap-4 mt-4">
                        <div className="flex flex-column gap-2">
                            <label htmlFor="pickupSlot">Créneau de retrait (facultatif)</label>
                            <Calendar inputId="pickupSlot" value={pickupSlot} onChange={(e) => setPickupSlot((e.value as Date) ?? null)} showTime hourFormat="24" minDate={new Date()} showIcon dateFormat="dd/mm/yy" />
                        </div>
                        <div className="text-xl">
                            Total : <strong>{formatPrice(cart?.totalAmount ?? 0)}</strong>
                        </div>
                        <Button label="Valider le panier" icon="pi pi-check" onClick={validate} loading={busy} />
                    </div>
                    <p className="text-500 mt-3 mb-0">Les prix et le stock sont vérifiés auprès des commerçants au moment de la validation.</p>
                </>
            )}
        </div>
    );
}
