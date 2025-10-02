/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disabilita SSR per i moduli che usano WASM
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Esclude Walrus dal bundle server
      config.externals = [...(config.externals || []), "@mysten/walrus"];
    }

    // Gestisce i file WASM
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  },

  images: {
    unoptimized: true, // Disabilita l'ottimizzazione per permettere domini esterni
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Accetta qualsiasi hostname HTTPS
      },
      {
        protocol: "http",
        hostname: "**", // Accetta qualsiasi hostname HTTP (per sviluppo)
      },
    ],
    // Alternativa più specifica (se preferisci essere più sicuro):
    // domains: ['example.com', 'another-domain.com'], // Lista domini specifici

    // Per accettare TUTTI i domini (meno sicuro ma più flessibile)
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Configura le pagine che non devono essere pre-renderizzate
  experimental: {
    esmExternals: "loose",
  },
};

export default nextConfig;
