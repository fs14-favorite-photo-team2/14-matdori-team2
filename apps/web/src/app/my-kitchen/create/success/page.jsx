'use client'

import { useSearchParams } from 'next/navigation'
import ActionResult from '@/components/common/ActionResult/ActionResult'

export default function CreateRecipeSuccessPage() {
  const searchParams = useSearchParams()
  const difficultyLabel = searchParams.get('difficultyLabel') ?? ''
  const recipeTitle = searchParams.get('title') ?? ''

  return (
    <ActionResult
      status="success"
      actionName="레시피 생성"
      descriptionInfo={`[${difficultyLabel} | ${recipeTitle}]`}
      descriptionMessage="레시피 생성에 성공했습니다!"
      buttonLabel="마이 키친에서 확인하기"
      redirectTo="/my-kitchen"
      redirectPageName="마이 키친"
    />
  )
}
