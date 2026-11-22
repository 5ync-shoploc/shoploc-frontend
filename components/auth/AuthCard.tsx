'use client';

import React, { useContext } from 'react';
import { classNames } from 'primereact/utils';
import { LayoutContext } from '@/layout/context/layoutcontext';

interface AuthCardProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    /** Lien ou texte affiché sous la carte (ex. « Pas encore de compte ? »). */
    footer?: React.ReactNode;
}

/** Cadre commun des pages de connexion et d'inscription : marque SHOPLOC et carte blanche sobre. */
export default function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
    const { layoutConfig } = useContext(LayoutContext);
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden p-3', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    return (
        <div className={containerClassName}>
            <div className="w-full" style={{ maxWidth: '26rem' }}>
                <div className="text-center mb-4 text-900 text-2xl font-bold" style={{ letterSpacing: '0.14em' }}>
                    SHOPLOC
                </div>
                <div className="surface-card border-1 surface-border border-round-xl shadow-1 p-5">
                    <div className="mb-4">
                        <div className="text-900 text-xl font-semibold mb-1">{title}</div>
                        <span className="text-500">{subtitle}</span>
                    </div>
                    {children}
                </div>
                {footer && <div className="text-center text-600 mt-4">{footer}</div>}
            </div>
        </div>
    );
}
