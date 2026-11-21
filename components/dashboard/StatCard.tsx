import Link from 'next/link';
import React from 'react';

interface StatCardProps {
    title: string;
    value: React.ReactNode;
    icon: string;
    /** Couleur PrimeFlex : blue, orange, green, cyan, purple, red... */
    color: string;
    href?: string;
}

/** Carte de chiffre clé du tableau de bord : icône douce à gauche, grand chiffre à droite. */
export default function StatCard({ title, value, icon, color, href }: StatCardProps) {
    const card = (
        <div className="card mb-0 h-full flex align-items-center gap-3">
            <div className={`flex align-items-center justify-content-center flex-shrink-0 bg-${color}-50 border-round-xl`} style={{ width: '3.5rem', height: '3.5rem' }}>
                <i className={`pi ${icon} text-${color}-400`} style={{ fontSize: '1.5rem' }} />
            </div>
            <div className="min-w-0">
                <div className="text-500 font-medium text-sm mb-1">{title}</div>
                <div className="text-900 font-bold white-space-nowrap" style={{ fontSize: '2rem', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
                    {value}
                </div>
            </div>
        </div>
    );
    return (
        <div className="col-12 md:col-6 xl:col-3">
            {href ? (
                <Link href={href} className="text-color">
                    {card}
                </Link>
            ) : (
                card
            )}
        </div>
    );
}
