/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useContext } from 'react';
import { classNames } from 'primereact/utils';
import { LayoutContext } from '../../layout/context/layoutcontext';

interface AuthCardLayoutProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

const AuthCardLayout = ({ title, subtitle, children }: AuthCardLayoutProps) => {
    const { layoutConfig } = useContext(LayoutContext);
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <img src={`/layout/images/logo-${layoutConfig.colorScheme === 'light' ? 'dark' : 'white'}.svg`} alt="ShopLoc" className="mb-5 w-6rem flex-shrink-0" />
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
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
};

export default AuthCardLayout;
