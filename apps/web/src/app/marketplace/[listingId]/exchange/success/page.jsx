'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ActionResult from '@/components/common/ActionResult/ActionResult'

function ExchangeSuccessContent() {
  const searchParams = useSearchParams()
  const difficultyLabel = searchParams.get('difficultyLabel') ?? ''
  const recipeTitle = searchParams.get('title') ?? ''

  return (
    <ActionResult
      status="success"
      actionName="교환 제시"
      descriptionInfo={`[${difficultyLabel} | ${recipeTitle}]`}
      descriptionMessage="교환 제시에 성공했습니다!"
      buttonLabel="마이 키친에서 확인하기"
      redirectTo="/my-kitchen"
      redirectPageName="마이 키친"
    />
  )
}

export default function ExchangeSuccessPage() {
  return (
    <Suspense fallback={null}>
      <ExchangeSuccessContent />
    </Suspense>
  )
}
