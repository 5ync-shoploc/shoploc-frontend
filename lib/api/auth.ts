import { apiFetch } from './http';
import type { Role, TokenResponse } from '@/lib/auth/session';

export type { TokenResponse };

export interface RegisterRequest {
    lastName: string;
    firstName: string;
    email: string;
    password: string;
    role: Role;
}

export interface RegisterResponse {
    id: string;
    lastName: string;
    firstName: string;
    email: string;
    role: Role;
}

export interface LoginRequest {
    email: string;
    password: string;
}

/** US 1.1 : créer un compte (accès public). 409 si l'e-mail existe déjà. */
export function register(request: RegisterRequest): Promise<RegisterResponse> {
    return apiFetch<RegisterResponse>('/api/identity/auth/register', null, { method: 'POST', body: JSON.stringify(request) });
}

/** US 1.2 : se connecter (accès public). 401 si les identifiants sont invalides. */
export function login(request: LoginRequest): Promise<TokenResponse> {
    return apiFetch<TokenResponse>('/api/identity/auth/login', null, { method: 'POST', body: JSON.stringify(request) });
}
