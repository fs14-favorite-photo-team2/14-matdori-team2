'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ActionResult from '@/components/common/ActionResult/ActionResult'

function SellRegisterSuccessContent() {
  const searchParams = useSearchParams()
  const difficultyLabel = searchParams.get('difficultyLabel') ?? ''
  const recipeTitle = searchParams.get('title') ?? ''

  return (
    <ActionResult
      status="success"
      actionName="판매 등록"
      descriptionInfo={`[${difficultyLabel} | ${recipeTitle}]`}
      descriptionMessage="판매 등록에 성공했습니다!"
      buttonLabel="나의 판매 레시피에서 확인하기"
      redirectTo="/my-kitchen/sales"
      redirectPageName="나의 판매 레시피"
    />
  )
}

export default function RegisterSaleSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SellRegisterSuccessContent />
    </Suspense>
  )
}
