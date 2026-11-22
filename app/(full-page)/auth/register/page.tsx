'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import AuthCardLayout from '@/components/auth/AuthCardLayout';
import { register } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/http';
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
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setBusy(true);
        try {
            await register({ lastName, firstName, email, password, role });
            router.push('/auth/login?inscrit=1');
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Erreur inattendue.');
            setBusy(false);
        }
    };

    return (
        <AuthCardLayout title="Créer un compte" subtitle="Rejoignez ShopLoc">
            <form onSubmit={submit}>
                {error && <Message severity="error" className="mb-4 w-full justify-content-start" text={error} />}

                <div className="grid">
                    <div className="col-12 md:col-6">
                        <label htmlFor="lastName" className="block text-900 font-medium mb-2">
                            Nom
                        </label>
                        <InputText id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full mb-4" />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="firstName" className="block text-900 font-medium mb-2">
                            Prénom
                        </label>
                        <InputText id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full mb-4" />
                    </div>
                </div>

                <label htmlFor="email" className="block text-900 font-medium mb-2">
                    E-mail
                </label>
                <InputText id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full mb-4" />

                <label htmlFor="password" className="block text-900 font-medium mb-2">
                    Mot de passe
                </label>
                <Password inputId="password" value={password} onChange={(e) => setPassword(e.target.value)} toggleMask minLength={8} required className="w-full mb-4" inputClassName="w-full" />

                <label htmlFor="role" className="block text-900 font-medium mb-2">
                    Je suis…
                </label>
                <Dropdown id="role" value={role} options={ROLE_OPTIONS} onChange={(e) => setRole(e.value)} className="w-full mb-5" />

                <Button type="submit" label="Créer mon compte" className="w-full p-3 text-xl" loading={busy} />
            </form>
        </AuthCardLayout>
    );
};

export default RegisterPage;
