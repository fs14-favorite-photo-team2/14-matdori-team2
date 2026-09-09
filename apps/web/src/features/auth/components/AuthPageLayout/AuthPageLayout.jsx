import Button from '@/components/common/Button/Button'
import styles from '@/features/auth/AuthPage.module.css'
import Image from 'next/image'
import Link from 'next/link'

export default function AuthPageLayout({
  children,
  guideText,
  guideHref,
  guideLinkText,
}) {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link href="/">
          <Image
            src="/logos/matdori-logo.svg"
            alt="맛도리 마켓"
            width={320}
            height={71}
            className={styles.logo}
            priority
          />
        </Link>

        {children}

        <Button type="button" className={styles.googleButton}>
          <Image src="/logos/google-logo.svg" alt="" width={22} height={22} />
          Google로 시작하기
        </Button>

        <p className={styles.guide}>
          {guideText}
          <Link href={guideHref} className={styles.guideLink}>
            {guideLinkText}
          </Link>
        </p>
      </div>
    </main>
  )
}
