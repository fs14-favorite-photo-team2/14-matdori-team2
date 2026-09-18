import RequireAuth from '@/features/auth/components/RequireAuth/RequireAuth'

export default function MyKitchenLayout({ children }) {
  return <RequireAuth>{children}</RequireAuth>
}
