'use client'

import Button from '@/components/common/Button/Button'
import Modal from '@/components/common/Modal/Modal'
import { login } from '@/features/auth/api'
import AuthInput from '@/features/auth/components/AuthInput/AuthInput'
import { useMutation } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import styles from './page.module.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EMAIL_MAX_LENGTH = 254

const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 24

export default function LoginPage() {
  const router = useRouter()

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields, isSubmitted },
  } = useForm({ mode: 'onChange' })

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
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
    <main className={styles.page}>
      <div className={styles.container}>
        <Link href="/">
          <Image
            src={'/logos/matdori-logo.svg'}
            alt="맛도리 마켓"
            width={320}
            height={71}
            className={styles.logo}
            priority
          />
        </Link>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.inputs}>
            <AuthInput
              {...register('email', {
                setValueAs: (value) => value.trim(),
                required: '이메일을 입력해 주세요.',
                maxLength: {
                  value: EMAIL_MAX_LENGTH,
                  message: '이메일은 254자 이하로 입력해 주세요.',
                },
                pattern: {
                  value: EMAIL_PATTERN,
                  message: '올바른 이메일 형식이 아닙니다.',
                },
              })}
              label="이메일"
              type="email"
              placeholder="이메일을 입력해 주세요"
              autoComplete="email"
              error={
                touchedFields.email || isSubmitted ? errors.email?.message : ''
              }
            />

            <AuthInput
              {...register('password', {
                required: '비밀번호를 입력해 주세요.',
                minLength: {
                  value: PASSWORD_MIN_LENGTH,
                  message: '비밀번호를 8자 이상 입력해 주세요.',
                },
                maxLength: {
                  value: PASSWORD_MAX_LENGTH,
                  message: '비밀번호를 24자 이하로 입력해 주세요.',
                },
              })}
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
            className={styles.loginButton}
            disabled={!isValid || loginMutation.isPending}
          >
            {loginMutation.isPending ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <Button type="button" className={styles.googleButton}>
          <Image src="/logos/google-logo.svg" alt="" width={22} height={22} />
          Google로 시작하기
        </Button>

        <p className={styles.signupGuide}>
          맛도리 마켓이 처음이신가요?
          <Link href="/signup" className={styles.signupLink}>
            회원가입하기
          </Link>
        </p>
      </div>

      <Modal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title={'로그인 실패'}
      >
        <p>{errorMessage}</p>
      </Modal>
    </main>
  )
}
