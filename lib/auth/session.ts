/**
 * Session de connexion : garde le JWT reçu de l'identity-service dans le
 * navigateur, et en tire les informations utilisées partout dans le front
 * (identifiant, rôle). Le serveur vérifie la signature à chaque appel API ;
 * ici on ne fait que lire le contenu du token.
 */

export type Role = 'CLIENT' | 'COMMERCANT' | 'COLLECTIVITE' | 'ADMIN';

export interface CurrentUser {
    id: string;
    role: Role;
    label: string;
    /** Prénom et nom lus dans le token (claims Keycloak name / given_name / family_name), si présents. */
    name?: string;
}

/** Réponse de POST /api/identity/auth/login. */
export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
}

interface StoredSession {
    accessToken: string;
    refreshToken: string;
    /** Date d'expiration de l'accessToken, en millisecondes (Date.now()). */
    expiresAt: number;
}

const STORAGE_KEY = 'shoploc.session';
const ROLES: readonly Role[] = ['CLIENT', 'COMMERCANT', 'COLLECTIVITE', 'ADMIN'];

/** Décode le payload (2ᵉ partie) d'un JWT. La signature n'est pas vérifiée ici : c'est le rôle du serveur. */
function decodePayload(token: string): Record<string, unknown> {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
        atob(base64)
            .split('')
            .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
            .join('')
    );
    return JSON.parse(json);
}

/** Rôle ShopLoc porté par le token (claim realm_access.roles, voir identity-service). */
function roleOf(payload: Record<string, unknown>): Role | null {
    const realmAccess = payload.realm_access as { roles?: string[] } | undefined;
    const roles = realmAccess?.roles ?? [];
    return ROLES.find((role) => roles.includes(role)) ?? null;
}

/** « Prénom Nom » depuis le token, ou undefined si Keycloak ne l'a pas mis. */
function nameOf(payload: Record<string, unknown>): string | undefined {
    const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
    const full = text(payload.name) || [text(payload.given_name), text(payload.family_name)].filter(Boolean).join(' ');
    return full || undefined;
}

function userOf(stored: StoredSession): CurrentUser | null {
    try {
        const payload = decodePayload(stored.accessToken);
        const role = roleOf(payload);
        if (!role || typeof payload.sub !== 'string') {
            return null;
        }
        return { id: payload.sub, role, label: typeof payload.email === 'string' ? payload.email : payload.sub, name: nameOf(payload) };
    } catch {
        return null;
    }
}

function readStoredSession(): StoredSession | null {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as StoredSession) : null;
    } catch {
        return null;
    }
}

/** Enregistre la session après une connexion réussie, et renvoie l'utilisateur qu'elle décrit. */
export function saveSession(tokens: TokenResponse): CurrentUser | null {
    const stored: StoredSession = {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: Date.now() + tokens.expiresIn * 1000
    };
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
        // stockage indisponible : la session ne survivra pas à un rechargement de la page
    }
    return userOf(stored);
}

/** Déconnexion : efface la session mémorisée. */
export function clearSession(): void {
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch {
        // rien à faire : il n'y avait rien à effacer
    }
}

/** Relit la session mémorisée (ex. après un rechargement de page), ou null si absente/expirée. */
export function loadSession(): CurrentUser | null {
    const stored = readStoredSession();
    if (!stored) {
        return null;
    }
    if (stored.expiresAt <= Date.now()) {
        clearSession();
        return null;
    }
    return userOf(stored);
}

/** Le token à envoyer dans l'en-tête Authorization, ou null si personne n'est connecté. */
export function currentAccessToken(): string | null {
    const stored = readStoredSession();
    return stored && stored.expiresAt > Date.now() ? stored.accessToken : null;
}
