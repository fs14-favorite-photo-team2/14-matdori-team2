import ResponsiveLandingImage from '@/components/landing/ResponsiveLandingImage'
import GuestOnlyGuard from '@/features/auth/components/GuestOnlyGuard/GuestOnlyGuard'
import Image from 'next/image'
import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  return (
    <GuestOnlyGuard>
      <main className={styles.landing}>
        <section className={styles.hero}>
          <div className={styles.heroPanel}>
            <div className={styles.heroContent}>
              <Image
                src="/logos/matdori-logo.svg"
                alt="맛도리 마켓"
                width={136}
                height={30}
                className={styles.heroLogo}
              />

              <h1 className={styles.heroTitle}>
                소문으로만 전수되던
                <br />
                <span>맛도리 꿀팁</span>이 여기에!
              </h1>

              <Link
                href="/marketplace"
                className={`${styles.ctaLink} ${styles.heroCtaLink}`}
              >
                레시피 찾으러 가기
              </Link>
            </div>

            <div className={styles.heroVisual}>
              <Image
                src="/images/landing/landing1-desktop.png"
                alt=""
                width={3834}
                height={1530}
                className={`${styles.heroImage} ${styles.heroDesktopImage}`}
                loading="eager"
              />

              <Image
                src="/images/landing/landing1-tablet.png"
                alt=""
                width={1488}
                height={704}
                className={`${styles.heroImage} ${styles.heroTabletImage}`}
              />

              <Image
                src="/images/landing/landing1-mobile.png"
                alt=""
                width={750}
                height={398}
                className={`${styles.heroImage} ${styles.heroMobileImage}`}
              />
            </div>
          </div>
        </section>

        <section className={styles.featureSection}>
          <ResponsiveLandingImage
            desktop={{
              src: '/images/landing/landing2-desktop.png',
              width: 1920,
              height: 800,
            }}
            tablet={{
              src: '/images/landing/landing2-tablet.png',
              width: 744,
              height: 707,
            }}
            mobile={{
              src: '/images/landing/landing2-mobile.png',
              width: 375,
              height: 440,
            }}
            alt="맛도리 마켓의 포인트 거래 기능 소개"
            className={styles.featureImage}
            loading="eager"
          />
        </section>

        <section className={styles.featureSection}>
          <ResponsiveLandingImage
            desktop={{
              src: '/images/landing/landing3-desktop.png',
              width: 1920,
              height: 800,
            }}
            tablet={{
              src: '/images/landing/landing3-tablet.png',
              width: 744,
              height: 776,
            }}
            mobile={{
              src: '/images/landing/landing3-mobile.png',
              width: 375,
              height: 519,
            }}
            alt="맛도리 마켓의 알림 및 거래 기능 소개"
            className={styles.featureImage}
          />
        </section>

        <section className={styles.featureSection}>
          <ResponsiveLandingImage
            desktop={{
              src: '/images/landing/landing4-desktop.png',
              width: 1920,
              height: 900,
            }}
            tablet={{
              src: '/images/landing/landing4-tablet.png',
              width: 744,
              height: 667,
            }}
            mobile={{
              src: '/images/landing/landing4-mobile.png',
              width: 375,
              height: 390,
            }}
            alt="맛도리 마켓의 레시피 거래 기능 소개"
            className={styles.featureImage}
          />
        </section>

        <section className={styles.finalCta}>
          <Image
            src="/images/landing/landing5-desktop.png"
            alt=""
            width={150}
            height={176}
            className={styles.finalCtaDesktopImage}
          />

          <Image
            src="/images/landing/landing5-mobile.png"
            alt=""
            width={113}
            height={133}
            className={styles.finalCtaMobileImage}
          />

          <h2 className={styles.finalCtaTitle}>
            나의 레시피를 지금 찾아보세요!
          </h2>

          <Link href="/marketplace" className={styles.ctaLink}>
            레시피 찾으러 가기
          </Link>
        </section>
      </main>
    </GuestOnlyGuard>
  )
}
