'use client'

import ErrorState from '@/components/common/ErrorState/ErrorState'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import useCurrentUser from '../../useCurrentUser'

export default function RequireAuth({ children }) {
  const router = useRouter()
  const { isAuthenticated, isLoading, error, refetch } = useCurrentUser()

  useEffect(() => {
    if (!isLoading && !error && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, isLoading, error, router])

  if (isLoading) {
    return null
  }

  if (error) {
    return (
      <ErrorState
        title="사용자 정보를 불러오지 못했습니다."
        message="잠시 후 다시 시도해 주세요."
        onRetry={refetch}
      />
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return children
}
