'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import AuthCard from '@/components/auth/AuthCard';
import { useAuthForm } from '@/lib/auth/useAuthForm';
import { register } from '@/lib/api/auth';
import type { Role } from '@/lib/auth/session';

const ROLE_OPTIONS: { label: string; value: Role }[] = [
    { label: 'Client', value: 'CLIENT' },
    { label: 'Commerçant', value: 'COMMERCANT' },
    { label: 'Collectivité', value: 'COLLECTIVITE' }
];

const RegisterPage = () => {
    const router = useRouter();

    const [lastName, setLastName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>('CLIENT');

    const { error, busy, submit } = useAuthForm(async () => {
        await register({ lastName, firstName, email, password, role });
        router.push('/auth/login?inscrit=1');
    });

    return (
        <AuthCard
            title="Créer un compte"
            subtitle="Rejoignez les commerces de proximité."
            footer={
                <>
                    Déjà inscrit ?{' '}
                    <Link href="/auth/login" className="font-medium">
                        Se connecter
                    </Link>
                </>
            }
        >
            <form onSubmit={submit} className="flex flex-column gap-3">
                {error && <Message severity="error" className="w-full justify-content-start" text={error} />}

                <div className="flex gap-3">
                    <div className="flex-1">
                        <label htmlFor="lastName" className="block text-700 font-medium mb-2">
                            Nom
                        </label>
                        <InputText id="lastName" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full" />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="firstName" className="block text-700 font-medium mb-2">
                            Prénom
                        </label>
                        <InputText id="firstName" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full" />
                    </div>
                </div>

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
                    <Password inputId="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} toggleMask minLength={8} required className="w-full" inputClassName="w-full" />
                    <small className="text-500">8 caractères minimum.</small>
                </div>

                <div>
                    <label htmlFor="role" className="block text-700 font-medium mb-2">
                        Je suis
                    </label>
                    <Dropdown inputId="role" value={role} options={ROLE_OPTIONS} onChange={(e) => setRole(e.value)} className="w-full" />
                </div>

                <Button type="submit" label="Créer mon compte" className="w-full mt-2" loading={busy} />
            </form>
        </AuthCard>
    );
};

export default RegisterPage;
