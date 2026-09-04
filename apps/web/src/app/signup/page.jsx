'use client'

import Button from '@/components/common/Button/Button'
import AuthInput from '@/features/auth/components/AuthInput/AuthInput'
import Image from 'next/image'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import styles from './page.module.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EMAIL_MAX_LENGTH = 254

const NICKNAME_MIN_LENGTH = 2
const NICKNAME_MAX_LENGTH = 20
const NICKNAME_PATTERN = /^[A-Za-z0-9가-힣_-]+$/

const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 24

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
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
                required: '비밀번호를 입력해 주세요.',
                minLength: {
                  value: PASSWORD_MIN_LENGTH,
                  message: '비밀번호를 8자 이상 입력해 주세요.',
                },
                maxLength: {
                  value: PASSWORD_MAX_LENGTH,
                  message: '비밀번호를 24자 이하로 입력해 주세요.',
                },
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
            className={styles.signupButton}
            disabled={!isValid}
          >
            가입하기
          </Button>
        </form>

        <Button type="button" className={styles.googleButton}>
          <Image src="/logos/google-logo.svg" alt="" width={22} height={22} />
          Google로 시작하기
        </Button>

        <p className={styles.loginGuide}>
          이미 맛도리 마켓 회원이신가요?
          <Link href="/login" className={styles.loginLink}>
            로그인하기
          </Link>
        </p>
      </div>
    </main>
  )
}
