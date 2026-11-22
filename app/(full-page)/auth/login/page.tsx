/* eslint-disable @next/next/no-img-element */
'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useContext, useState } from 'react';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { useCurrentUser } from '@/lib/auth/CurrentUserContext';
import { login } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/http';
import type { Role } from '@/lib/auth/session';

/** SCRUM-64 : après la connexion, chaque rôle va directement sur son espace. */
function homeFor(role: Role): string {
    if (role === 'CLIENT') return '/catalogue';
    if (role === 'COMMERCANT') return '/commercant';
    return '/';
}

const LoginPage = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const { login: rememberSession } = useCurrentUser();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setBusy(true);
        try {
            const tokens = await login({ email, password });
            const user = rememberSession(tokens);
            router.push(user ? homeFor(user.role) : '/');
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Erreur inattendue.');
            setBusy(false);
        }
    };

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
                            <div className="text-900 text-3xl font-medium mb-3">Se connecter</div>
                            <span className="text-600 font-medium">Accédez à votre espace ShopLoc</span>
                        </div>

                        <form onSubmit={submit}>
                            {searchParams.get('inscrit') && <Message severity="success" className="mb-4 w-full justify-content-start" text="Compte créé : vous pouvez vous connecter." />}
                            {error && <Message severity="error" className="mb-4 w-full justify-content-start" text={error} />}

                            <label htmlFor="email" className="block text-900 text-xl font-medium mb-2">
                                E-mail
                            </label>
                            <InputText id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full md:w-30rem mb-5" style={{ padding: '1rem' }} />

                            <label htmlFor="password" className="block text-900 font-medium text-xl mb-2">
                                Mot de passe
                            </label>
                            <Password inputId="password" value={password} onChange={(e) => setPassword(e.target.value)} feedback={false} toggleMask required className="w-full mb-5" inputClassName="w-full p-3 md:w-30rem" />

                            <Button type="submit" label="Se connecter" className="w-full p-3 text-xl" loading={busy} />
                        </form>

                        <div className="text-center mt-4">
                            Pas encore de compte ? <Link href="/auth/register">S&apos;inscrire</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
