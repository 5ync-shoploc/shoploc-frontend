import type { CurrentUser } from '@/lib/auth/CurrentUserContext';
import { currentAccessToken } from '@/lib/auth/session';

/** Erreur renvoyée par l'API (format Problem Details, RFC 9457). */
export class ApiError extends Error {
    constructor(public readonly status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

/** Messages par défaut quand l'API ne donne pas de détail. */
const DEFAULT_MESSAGES: Record<number, string> = {
    400: 'Données invalides.',
    401: 'Vous devez être connecté.',
    403: "Vous n'avez pas les droits pour cette action.",
    404: 'Élément introuvable.',
    409: 'Conflit : stock insuffisant.',
    422: 'Article inconnu ou indisponible.',
    500: 'Erreur du serveur.',
    503: 'Service indisponible.'
};

/**
 * Appel HTTP vers l'API (via le proxy Next.js puis l'API Gateway).
 * Ajoute l'identité de l'utilisateur dans les en-têtes, en attendant le jeton Keycloak.
 */
export async function apiFetch<T>(path: string, user: CurrentUser | null, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    if (init.body !== undefined) {
        headers.set('Content-Type', 'application/json');
    }
    if (user) {
        // catalog-service et order-service ne lisent pas encore le token : on leur envoie aussi ces en-têtes.
        headers.set('X-User-Id', user.id);
        headers.set('X-User-Role', user.role);
    }
    const token = currentAccessToken();
    if (token) {
        // identity-service (/users/me) vérifie ce token.
        headers.set('Authorization', `Bearer ${token}`);
    }

    let response: Response;
    try {
        response = await fetch(path, { ...init, headers });
    } catch {
        throw new ApiError(0, "Impossible de joindre l'API. Vérifiez que la Gateway et les services sont démarrés.");
    }

    const text = await response.text();
    const body = text ? safeParse(text) : null;

    if (!response.ok) {
        const detail = body && typeof body === 'object' && 'detail' in body ? String((body as { detail: unknown }).detail) : undefined;
        throw new ApiError(response.status, detail || DEFAULT_MESSAGES[response.status] || `Erreur ${response.status}`);
    }
    return body as T;
}

function safeParse(text: string): unknown {
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

/** Formate un montant en euros, ex. 13.8 -> "13,80 €". */
export function formatPrice(value: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
}

/** Formate une date ISO pour l'affichage, ex. "18/11/2026 19:10". */
export function formatDate(value: string | null | undefined): string {
    if (!value) {
        return '—';
    }
    return new Date(value).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}
