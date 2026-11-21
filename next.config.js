/** @type {import('next').NextConfig} */

// Adresse de l'API Gateway (tous les microservices passent par elle).
// En local : http://localhost:8080. Modifiable avec la variable d'environnement API_GATEWAY_URL.
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8080';

const nextConfig = {
    // Le navigateur appelle /api/... sur le même serveur que le front (pas de problème de CORS),
    // et Next.js redirige ces appels vers l'API Gateway.
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${API_GATEWAY_URL}/api/:path*`
            }
        ];
    }
};

module.exports = nextConfig;
