'use client'

import { useParams } from 'next/navigation'
import ActionResult from '@/components/common/ActionResult/ActionResult'

export default function PurchaseFailurePage() {
  const { listingId } = useParams()

  return (
    <ActionResult
      status="failure"
      actionName="구매"
      buttonLabel="다시 시도하기"
      redirectTo={`/marketplace/${listingId}`}
    />
  )
}
