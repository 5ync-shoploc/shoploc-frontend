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
        <AuthCard
            title="Connexion"
            subtitle="Accédez à votre espace."
            footer={
                <>
                    Pas encore de compte ?{' '}
                    <Link href="/auth/register" className="font-medium">
                        S&apos;inscrire
                    </Link>
                </>
            }
        >
            <form onSubmit={submit} className="flex flex-column gap-3">
                {searchParams.get('inscrit') && <Message severity="success" className="w-full justify-content-start" text="Compte créé : vous pouvez vous connecter." />}
                {error && <Message severity="error" className="w-full justify-content-start" text={error} />}

                <div>
                    <label htmlFor="email" className="block text-700 font-medium mb-2">
                        E-mail
                    </label>
                    <InputText id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full" />
                </div>

                <div>
                    <label htmlFor="password" className="block text-700 font-medium mb-2">
                        Mot de passe
                    </label>
                    <Password inputId="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} feedback={false} toggleMask required className="w-full" inputClassName="w-full" />
                </div>

                <Button type="submit" label="Se connecter" className="w-full mt-2" loading={busy} />
            </form>
        </AuthCard>
    );
};

export default LoginPage;
