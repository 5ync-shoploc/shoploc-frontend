'use client';

import React from 'react';
import { InputText } from 'primereact/inputtext';

/** Petite barre de recherche à placer au-dessus d'un tableau. */
export default function TableSearch({ value, onChange, placeholder = 'Rechercher…' }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
    return (
        <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="p-inputtext-sm" style={{ width: '16rem' }} aria-label={placeholder} />
        </span>
    );
}

/** Texte sans accents ni majuscules, pour comparer "Annulée" et "annulee". */
const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Vrai si tous les mots de la recherche se trouvent dans l'une des valeurs. */
export function matchesSearch(query: string, values: Array<string | number | null | undefined>): boolean {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    if (words.length === 0) return true;
    const haystack = normalize(values.filter((v) => v != null).join(' '));
    return words.every((w) => haystack.includes(w));
}
