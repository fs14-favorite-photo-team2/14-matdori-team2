'use client'

import Button from '@/components/common/Button/Button'
import Modal from '@/components/common/Modal/Modal'
import { signup } from '@/features/auth/api'
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

const NICKNAME_MIN_LENGTH = 2
const NICKNAME_MAX_LENGTH = 20
const NICKNAME_PATTERN = /^[A-Za-z0-9가-힣_-]+$/

export default function SignupPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    setError,
    formState: { errors, isValid, touchedFields, isSubmitted },
  } = useForm({ mode: 'onChange' })

  const signupMutation = useMutation({
    mutationFn: signup,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: CURRENT_USER_QUERY_KEY,
      })
      router.replace('/marketplace')
    },
    onError: (error) => {
      const serverError = error.response?.data?.error

      if (serverError?.code === 'EMAIL_ALREADY_EXISTS') {
        setError('email', {
          type: 'server',
          message: serverError.message,
        })

        return
      }

      if (serverError?.code === 'NICKNAME_ALREADY_EXISTS') {
        setError('nickname', {
          type: 'server',
          message: serverError.message,
        })

        return
      }

      if (
        serverError?.code === 'VALIDATION_ERROR' &&
        Array.isArray(serverError.details)
      ) {
        const formFields = [
          'email',
          'nickname',
          'password',
          'passwordConfirmation',
        ]

        let hasFieldError = false

        serverError.details.forEach(({ field, reason }) => {
          if (formFields.includes(field)) {
            setError(field, {
              type: 'server',
              message: reason,
            })

            hasFieldError = true
          }
        })

        if (hasFieldError) return
      }

      setIsErrorModalOpen(true)
    },
  })

  function onSubmit(data) {
    signupMutation.mutate(data)
  }

  return (
    <GuestOnlyGuard>
      <>
        <AuthPageLayout
          guideText="이미 맛도리 마켓 회원이신가요?"
          guideHref="/login"
          guideLinkText="로그인하기"
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
                {...register('nickname', {
                  required: '닉네임을 입력해 주세요.',
                  minLength: {
                    value: NICKNAME_MIN_LENGTH,
                    message: '닉네임은 2자 이상 입력해 주세요.',
                  },
                  maxLength: {
                    value: NICKNAME_MAX_LENGTH,
                    message: '닉네임은 20자 이하로 입력해 주세요.',
                  },
                  pattern: {
                    value: NICKNAME_PATTERN,
                    message:
                      '닉네임은 한글, 영문, 숫자와 _, -만 사용할 수 있습니다.',
                  },
                })}
                label="닉네임"
                type="text"
                placeholder="닉네임을 입력해 주세요"
                autoComplete="nickname"
                error={
                  touchedFields.nickname || isSubmitted
                    ? errors.nickname?.message
                    : ''
                }
              />

              <AuthInput
                {...register('password', {
                  ...PASSWORD_VALIDATION_RULES,
                  onChange: () => {
                    if (getValues('passwordConfirmation')) {
                      trigger('passwordConfirmation')
                    }
                  },
                })}
                label="비밀번호"
                type="password"
                placeholder="비밀번호를 입력해 주세요"
                autoComplete="new-password"
                error={
                  touchedFields.password || isSubmitted
                    ? errors.password?.message
                    : ''
                }
              />

              <AuthInput
                {...register('passwordConfirmation', {
                  required: '비밀번호를 한 번 더 입력해 주세요.',
                  validate: (value) =>
                    value === getValues('password') ||
                    '비밀번호가 일치하지 않습니다.',
                })}
                label="비밀번호 확인"
                type="password"
                placeholder="비밀번호를 한 번 더 입력해 주세요"
                autoComplete="new-password"
                error={
                  touchedFields.passwordConfirmation || isSubmitted
                    ? errors.passwordConfirmation?.message
                    : ''
                }
              />
            </div>

            <Button
              type="submit"
              className={styles.submitButton}
              disabled={!isValid || signupMutation.isPending}
            >
              {signupMutation.isPending ? '가입 중...' : '가입하기'}
            </Button>
          </form>
        </AuthPageLayout>

        <Modal
          isOpen={isErrorModalOpen}
          onClose={() => setIsErrorModalOpen(false)}
          title={'회원가입 실패'}
        >
          <p>일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.</p>
        </Modal>
      </>
    </GuestOnlyGuard>
  )
}
