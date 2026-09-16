'use client'

import { Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import ActionResult from '@/components/common/ActionResult/ActionResult'

function ExchangeSuccessContent() {
  const searchParams = useSearchParams()
  const difficultyLabel = searchParams.get('difficultyLabel') ?? ''
  const recipeTitle = searchParams.get('title') ?? ''
  const params = useParams()
  const listingId = params.listingId

  return (
    <ActionResult
      status="success"
      actionName="교환 제시"
      descriptionInfo={`[${difficultyLabel} | ${recipeTitle}]`}
      descriptionMessage="교환 제시에 성공했습니다!"
      buttonLabel="교환 제시한 레시피에서 확인하기"
      redirectTo={`/marketplace/${listingId}`}
      redirectPageName="레시피 상세 페이지"
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
