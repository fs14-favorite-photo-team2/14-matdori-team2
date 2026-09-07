'use client'

import Button from '@/components/common/Button/Button'
import AuthInput from '@/features/auth/components/AuthInput/AuthInput'
import Image from 'next/image'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import styles from './page.module.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_MIN_LENGTH = 8

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields, isSubmitted },
  } = useForm({ mode: 'onChange' })

  function onSubmit() {}

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
            disabled={!isValid}
          >
            로그인
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
    </main>
  )
}
