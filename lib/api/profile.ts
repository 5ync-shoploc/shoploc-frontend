import type { CurrentUser, Role } from '@/lib/auth/CurrentUserContext';
import { apiFetch } from './http';

export interface ProfileResponse {
    id: string;
    lastName: string;
    firstName: string;
    email: string;
    phone: string | null;
    role: Role;
}

/** US 1.3 : mon profil (nom, prénom, e-mail, téléphone). */
export function getMyProfile(user: CurrentUser | null): Promise<ProfileResponse> {
    return apiFetch<ProfileResponse>('/api/identity/users/me', user);
}
