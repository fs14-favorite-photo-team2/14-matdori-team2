'use client'

import Button from '@/components/common/Button/Button'
import Modal from '@/components/common/Modal/Modal'
import { login } from '@/features/auth/api'
import styles from '@/features/auth/AuthPage.module.css'
import AuthInput from '@/features/auth/components/AuthInput/AuthInput'
import AuthPageLayout from '@/features/auth/components/AuthPageLayout/AuthPageLayout'
import GuestOnlyGuard from '@/features/auth/components/GuestOnlyGuard/GuestOnlyGuard'
import { CURRENT_USER_QUERY_KEY } from '@/features/auth/useCurrentUser'
import {
  EMAIL_VALIDATION_RULES,
  PASSWORD_VALIDATION_RULES,
} from '@/features/auth/validation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export default function LoginPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields, isSubmitted },
  } = useForm({ mode: 'onChange' })

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: CURRENT_USER_QUERY_KEY,
      })
      router.replace('/marketplace')
    },
    onError: (error) => {
      const serverError = error.response?.data?.error

      if (serverError?.code === 'INVALID_CREDENTIALS') {
        setErrorMessage(serverError.message)
      } else {
        setErrorMessage(
          '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        )
      }

      setIsErrorModalOpen(true)
    },
  })

  function onSubmit(data) {
    loginMutation.mutate(data)
  }

  return (
    <GuestOnlyGuard>
      <>
        <AuthPageLayout
          guideText="맛도리 마켓이 처음이신가요?"
          guideHref="/signup"
          guideLinkText="회원가입하기"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={styles.inputs}>
              <AuthInput
                {...register('email', EMAIL_VALIDATION_RULES)}
                label="이메일"
                type="email"
                placeholder="이메일을 입력해 주세요"
                autoComplete="email"
                error={
                  touchedFields.email || isSubmitted
                    ? errors.email?.message
                    : ''
                }
              />

              <AuthInput
                {...register('password', PASSWORD_VALIDATION_RULES)}
                label="비밀번호"
                type="password"
                placeholder="비밀번호를 입력해 주세요"
                autoComplete="current-password"
                error={
                  touchedFields.password || isSubmitted
                    ? errors.password?.message
                    : ''
                }
              />
            </div>

            <Button
              type="submit"
              className={styles.submitButton}
              disabled={!isValid || loginMutation.isPending}
            >
              {loginMutation.isPending ? '로그인 중...' : '로그인'}
            </Button>
          </form>
        </AuthPageLayout>

        <Modal
          isOpen={isErrorModalOpen}
          onClose={() => setIsErrorModalOpen(false)}
          title={'로그인 실패'}
        >
          <p>{errorMessage}</p>
        </Modal>
      </>
    </GuestOnlyGuard>
  )
}
