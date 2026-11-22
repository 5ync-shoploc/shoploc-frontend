'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import AuthCard from '@/components/auth/AuthCard';
import { useCurrentUser } from '@/lib/auth/CurrentUserContext';
import { useAuthForm } from '@/lib/auth/useAuthForm';
import { login } from '@/lib/api/auth';
import type { Role } from '@/lib/auth/session';

/** SCRUM-64 : après la connexion, chaque rôle va directement sur son espace. */
function homeFor(role: Role): string {
    if (role === 'CLIENT') return '/catalogue';
    if (role === 'COMMERCANT') return '/commercant';
    return '/';
}

const LoginPage = () => {
    const { login: rememberSession } = useCurrentUser();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { error, busy, submit } = useAuthForm(async () => {
        const tokens = await login({ email, password });
        const user = rememberSession(tokens);
        router.push(user ? homeFor(user.role) : '/');
    });

    return (
        <AuthCard title="Se connecter" subtitle="Accédez à votre espace ShopLoc">
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
        </AuthCard>
    );
};

export default LoginPage;
