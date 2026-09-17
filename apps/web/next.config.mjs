const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '[::1]']

function apiUrl() {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return null
  }

  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL)
  } catch {
    throw new Error('NEXT_PUBLIC_API_URL은 절대 URL이어야 합니다.')
  }
}

const api = apiUrl()
const isLocalApi = api !== null && LOCAL_HOSTNAMES.includes(api.hostname)

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    dangerouslyAllowLocalIP: isLocalApi,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      ...(api
        ? [
            {
              protocol: api.protocol.replace(':', ''),
              hostname: api.hostname,
              port: api.port,
              pathname: '/uploads/**',
            },
          ]
        : []),
    ],
  },
}

export default nextConfig
