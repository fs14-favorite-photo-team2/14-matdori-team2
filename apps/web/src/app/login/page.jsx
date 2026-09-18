import LoginPageClient from './LoginPageClient'

export default async function LoginPage({ searchParams }) {
  const params = await searchParams

  const oauthError = Array.isArray(params.oauthError)
    ? params.oauthError[0]
    : params.oauthError

  return <LoginPageClient oauthError={oauthError} />
}
