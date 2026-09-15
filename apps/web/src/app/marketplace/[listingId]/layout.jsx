import RequireAuth from '@/features/auth/components/RequireAuth/RequireAuth'

export default function MarketplaceDetailLayout({ children }) {
  return <RequireAuth>{children}</RequireAuth>
}
