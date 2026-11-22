import Link from 'next/link';
import React from 'react';

interface StatCardProps {
    title: string;
    value: React.ReactNode;
    icon: string;
    /** Couleur PrimeFlex de l'icône : blue, orange, green, cyan, purple, red... */
    color: string;
    hint?: React.ReactNode;
    href?: string;
}

/** Carte de chiffre clé du tableau de bord. */
export default function StatCard({ title, value, icon, color, hint, href }: StatCardProps) {
    const card = (
        <div className="card mb-0 h-full">
            <div className="flex justify-content-between mb-3">
                <div>
                    <span className="block text-500 font-medium mb-3">{title}</span>
                    <div className="text-900 font-medium text-xl">{value}</div>
                </div>
                <div className={`flex align-items-center justify-content-center bg-${color}-100 border-round`} style={{ width: '2.5rem', height: '2.5rem' }}>
                    <i className={`pi ${icon} text-${color}-500 text-xl`} />
                </div>
            </div>
            {hint && <span className="text-500">{hint}</span>}
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
