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
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

const OAUTH_ERROR_MESSAGES = {
  GOOGLE_EMAIL_REQUIRED: 'Google 계정에서 확인된 이메일을 가져올 수 없습니다.',
  GOOGLE_ACCOUNT_CONFLICT: '이미 다른 Google 계정과 연결된 이메일입니다.',
  NICKNAME_GENERATION_FAILED:
    'Google 계정 정보를 처리하는 중 오류가 발생했습니다.',
  OAUTH_FAILED: 'Google 로그인에 실패했습니다. 다시 시도해 주세요.',
}

export default function LoginPageClient({ oauthError }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(Boolean(oauthError))

  const [errorMessage, setErrorMessage] = useState(
    oauthError
      ? (OAUTH_ERROR_MESSAGES[oauthError] ??
          'Google 로그인에 실패했습니다. 다시 시도해 주세요.')
      : '',
  )

  useEffect(() => {
    if (!oauthError) {
      return
    }

    const url = new URL(window.location.href)
    url.searchParams.delete('oauthError')
    window.history.replaceState({}, '', url.toString())
  }, [oauthError])

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

      if (
        serverError?.code === 'INVALID_CREDENTIALS' ||
        serverError?.code === 'GOOGLE_ACCOUNT_ONLY'
      ) {
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
