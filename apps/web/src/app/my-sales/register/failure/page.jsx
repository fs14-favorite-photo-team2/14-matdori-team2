import ActionResult from '@/components/common/ActionResult/ActionResult'

export default function SaleRegistrationFailurePage() {
  return (
    <ActionResult
      status="failure"
      actionName="판매 등록"
      buttonLabel="마켓플레이스로 돌아가기"
      redirectTo="/marketplace"
    />
  )
}
