'use client'

import { useParams } from 'next/navigation'
import ActionResult from '@/components/common/ActionResult/ActionResult'

export default function ExchangeFailurePage() {
  const { listingId } = useParams()

  return (
    <ActionResult
      status="failure"
      actionName="교환 제시"
      buttonLabel="다시 시도하기"
      redirectTo={`/marketplace/${listingId}`}
    />
  )
}
