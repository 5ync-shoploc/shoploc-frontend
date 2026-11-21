'use client';

import React from 'react';

interface QuantityStepperProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    disabled?: boolean;
    label: string;
}

const buttonStyle: React.CSSProperties = { width: '1.75rem', height: '1.75rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-color-secondary)' };

/** Sélecteur de quantité discret : − 2 + dans une petite pastille. */
export default function QuantityStepper({ value, onChange, min = 1, disabled = false, label }: QuantityStepperProps) {
    return (
        <div className="inline-flex align-items-center border-1 surface-border border-round" role="group" aria-label={label}>
            <button
                type="button"
                style={{ ...buttonStyle, opacity: disabled || value <= min ? 0.35 : 1 }}
                className="flex align-items-center justify-content-center"
                aria-label="Diminuer la quantité"
                disabled={disabled || value <= min}
                onClick={() => onChange(value - 1)}
            >
                <i className="pi pi-minus" style={{ fontSize: '0.7rem' }} />
            </button>
            <span className="text-center font-medium" style={{ minWidth: '1.75rem', fontVariantNumeric: 'tabular-nums' }} aria-live="polite">
                {value}
            </span>
            <button type="button" style={{ ...buttonStyle, opacity: disabled ? 0.35 : 1 }} className="flex align-items-center justify-content-center" aria-label="Augmenter la quantité" disabled={disabled} onClick={() => onChange(value + 1)}>
                <i className="pi pi-plus" style={{ fontSize: '0.7rem' }} />
            </button>
        </div>
    );
}
