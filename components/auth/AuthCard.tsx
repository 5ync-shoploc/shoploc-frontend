'use client';

import React, { useContext } from 'react';
import { classNames } from 'primereact/utils';
import { LayoutContext } from '@/layout/context/layoutcontext';

interface AuthCardProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

/** Cadre commun des pages de connexion et d'inscription : marque SHOPLOC, carte centrée, titre. */
export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
    const { layoutConfig } = useContext(LayoutContext);
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <div className="mb-5 text-900 text-3xl font-bold" style={{ letterSpacing: '0.12em' }}>
                    SHOPLOC
                </div>
                <div style={{ borderRadius: '56px', padding: '0.3rem', background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)' }}>
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            <div className="text-900 text-3xl font-medium mb-3">{title}</div>
                            <span className="text-600 font-medium">{subtitle}</span>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
