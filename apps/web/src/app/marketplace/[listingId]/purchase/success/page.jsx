'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ActionResult from '@/components/common/ActionResult/ActionResult'

function PurchaseSuccessContent() {
  const searchParams = useSearchParams()
  const difficultyLabel = searchParams.get('difficultyLabel') ?? ''
  const recipeTitle = searchParams.get('title') ?? ''
  const quantity = searchParams.get('quantity') ?? ''

  return (
    <ActionResult
      status="success"
      actionName="구매"
      descriptionInfo={`[${difficultyLabel} | ${recipeTitle}]`}
      descriptionMessage={`${quantity}장 구매에 성공했습니다!`}
      buttonLabel="마이 키친에서 확인하기"
      redirectTo="/my-kitchen"
      redirectPageName="마이 키친"
    />
  )
}

export default function PurchaseSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PurchaseSuccessContent />
    </Suspense>
  )
}
